"""
1xBet Website Cloner v3 — Full Site Static Mirror
Scrapes 1xbetpk.mobi using Playwright with network interception
and saves all pages and assets for static hosting (GitHub Pages ready).
"""
import sys, io, os, re, time, json, urllib.parse, hashlib, threading, shutil
from pathlib import Path
from collections import deque

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ---- CONFIG ----------------------------------------------------------------
BASE_DOMAIN  = "1xbetpk.mobi"
BASE_URL     = "https://1xbetpk.mobi"
XBET_IP      = "185.174.42.40"

OUTPUT_DIR   = Path(r"c:\Users\Mashariq Ali\Desktop\1XBET TEMPLATE\site")
LOG_FILE     = Path(r"c:\Users\Mashariq Ali\Desktop\1XBET TEMPLATE\scraper.log")
MAX_PAGES    = 40
PAGE_TIMEOUT = 40000   # ms
WAIT_AFTER   = 3.0     # seconds after domcontentloaded

PRIORITY_PATHS = [
    "/en",
    "/en/line",
    "/en/line/football",
    "/en/line/cricket",
    "/en/line/basketball",
    "/en/line/tennis",
    "/en/live",
    "/en/live/football",
    "/en/live/cricket",
    "/en/casino",
    "/en/slots",
    "/en/games",
    "/en/poker",
    "/en/bingo",
    "/en/esports/real",
    "/en/desktop",
    "/en/bonus/rules",
    "/en/information/about",
    "/en/information/contacts",
    "/en/information/payment",
    "/en/information/rules",
    "/en/information/rules/privacy_policy",
    "/en/information/cookies",
    "/en/champs",
    "/en/fast-bet",
]

SKIP_EXT    = {'.pdf','.zip','.exe','.apk','.mp4','.mp3','.avi','.mov'}
PAGE_SKIP   = {'.css','.js','.png','.jpg','.ico','.svg','.gif',
               '.jpeg','.webp','.woff','.woff2','.ttf','.eot','.otf','.map'}
SKIP_DOMAIN = ['google-analytics','googletagmanager','facebook','twitter',
               'instagram','doubleclick','adservice','suphelper','hotjar',
               'intercom','zendesk','freshchat','drift']

log_lock = threading.Lock()
log_fh   = None

def log(msg):
    with log_lock:
        try:
            print(msg, flush=True)
        except Exception:
            pass
        if log_fh:
            try:
                log_fh.write(msg + "\n")
                log_fh.flush()
            except Exception:
                pass

# ---- ASSET PATH HELPERS ----------------------------------------------------

def asset_local(url: str, assets_dir: Path):
    parsed = urllib.parse.urlparse(url)
    name   = Path(parsed.path).name or "asset"
    h      = hashlib.md5(url.encode()).hexdigest()[:10]
    ext    = Path(parsed.path).suffix.lower()
    if ext == '.css':                                                         subdir = "css"
    elif ext in {'.js','.mjs'}:                                              subdir = "js"
    elif ext in {'.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.avif'}: subdir = "images"
    elif ext in {'.woff','.woff2','.ttf','.eot','.otf'}:                      subdir = "fonts"
    else:                                                                     subdir = "misc"
    fname = f"{h}_{name}"
    local = assets_dir / subdir / fname
    rel   = f"assets/{subdir}/{fname}"
    return local, rel

def rel_path(target: Path, from_dir: Path) -> str:
    return os.path.relpath(target, from_dir).replace("\\", "/")

def page_local_path(url: str, output_dir: Path) -> Path:
    parsed = urllib.parse.urlparse(url)
    path   = parsed.path.strip("/") or "index"
    if parsed.query:
        qh = hashlib.md5(parsed.query.encode()).hexdigest()[:8]
        parts = path.rsplit(".", 1)
        path  = f"{parts[0]}__{qh}.{parts[1]}" if len(parts)==2 else f"{path}__{qh}"
    if not Path(path).suffix:
        path += ".html"
    return output_dir / path

# ---- HTML REWRITER ---------------------------------------------------------

def rewrite_html(html: str, page_url: str, page_path: Path,
                 asset_map: dict, output_dir: Path) -> str:
    assets_dir = output_dir / "assets"
    page_dir   = page_path.parent

    url_to_rel = {}
    for orig_url, local_p in asset_map.items():
        if local_p and local_p.exists():
            url_to_rel[orig_url] = rel_path(local_p, page_dir)

    def try_rewrite(raw_url: str) -> str | None:
        if raw_url.startswith('data:') or raw_url.startswith('#'):
            return None
        if raw_url.startswith('//'):
            raw_url = 'https:' + raw_url
        abs_url = urllib.parse.urljoin(page_url, raw_url)
        if abs_url in url_to_rel:
            return url_to_rel[abs_url]
        clean = abs_url.split('?')[0]
        for k, v in url_to_rel.items():
            if k.split('?')[0] == clean:
                return v
        return None

    def rep_src(m):
        attr, val = m.group(1), m.group(2)
        new = try_rewrite(val)
        return f'{attr}="{new}"' if new else m.group(0)
    html = re.sub(r'(src)="([^"]{4,})"', rep_src, html)
    html = re.sub(r"(src)='([^']{4,})'", rep_src, html)

    def rep_link(m):
        full = m.group(0)
        if not any(k in full for k in ('stylesheet','icon','preload','font','manifest')):
            return full
        href_m = re.search(r'href=["\']([^"\']+)["\']', full)
        if not href_m:
            return full
        new = try_rewrite(href_m.group(1))
        if new:
            return full.replace(href_m.group(0), f'href="{new}"')
        return full
    html = re.sub(r'<link[^>]+>', rep_link, html, flags=re.IGNORECASE|re.DOTALL)

    def rep_srcset(m):
        parts, new_parts = m.group(1).split(','), []
        for part in parts:
            tokens = part.strip().split()
            if tokens:
                new = try_rewrite(tokens[0])
                if new: tokens[0] = new
            new_parts.append(' '.join(tokens))
        return f'srcset="{",".join(new_parts)}"'
    html = re.sub(r'srcset="([^"]+)"', rep_srcset, html)

    def rep_css_url(m):
        raw = m.group(1).strip("'\"\t ")
        new = try_rewrite(raw)
        return f"url('{new}')" if new else m.group(0)
    html = re.sub(r'url\(([^)]+)\)', rep_css_url, html)

    return html

def rewrite_internal_links(html: str, page_url: str, page_path: Path,
                            url_to_file: dict) -> str:
    page_dir = page_path.parent
    def rep(m):
        href = m.group(1)
        if any(href.startswith(p) for p in ('#','javascript:','mailto:','tel:')):
            return m.group(0)
        if href.startswith('//'):
            href = 'https:' + href
        abs_url = urllib.parse.urljoin(page_url, href).split('#')[0].rstrip('/')
        parsed  = urllib.parse.urlparse(abs_url)
        if parsed.netloc and BASE_DOMAIN not in parsed.netloc:
            return m.group(0)
        target = url_to_file.get(abs_url)
        if target and target.exists():
            return f'href="{rel_path(target, page_dir)}"'
        return m.group(0)
    html = re.sub(r'href="([^"]+)"', rep, html)
    html = re.sub(r"href='([^']+)'", rep, html)
    return html

# ---- MAIN CRAWLER ----------------------------------------------------------

def crawl():
    global log_fh
    output_dir = OUTPUT_DIR
    assets_dir = output_dir / "assets"
    output_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)
    for sub in ["css","js","images","fonts","misc"]:
        (assets_dir / sub).mkdir(exist_ok=True)

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    log_fh = open(LOG_FILE, 'a', encoding='utf-8')

    log("\n[RESUME] 1xBet Cloner v3 — Full Static Mirror")
    log(f"[DIR]    {output_dir}")
    log(f"[URL]    {BASE_URL}  (IP: {XBET_IP})")
    log("-" * 60)

    visited     = {}
    url_to_file = {}
    queue       = deque()
    seeded      = set()

    # Pre-register already scraped files
    for hf in output_dir.rglob("*.html"):
        rel = hf.relative_to(output_dir).as_posix()
        # map e.g. en.html -> https://1xbetpk.mobi/en
        u = BASE_URL + "/" + rel.replace(".html", "")
        visited[u] = hf
        url_to_file[u] = hf
        log(f"  [FOUND EXISTING] {rel}")

    for p in PRIORITY_PATHS:
        u = BASE_URL + p
        if u not in seeded and u not in visited:
            queue.append(u)
            seeded.add(u)

    from playwright.sync_api import sync_playwright, TimeoutError as PWT

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--ignore-certificate-errors',
                '--lang=en-US',
                f'--host-resolver-rules=MAP {BASE_DOMAIN} {XBET_IP}',
                '--disable-web-security',
            ]
        )
        ctx = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent=(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/131.0.0.0 Safari/537.36'
            ),
            locale='en-US',
            ignore_https_errors=True,
            extra_http_headers={
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        )

        count = len(visited)

        while queue and count < MAX_PAGES:
            url = queue.popleft().split('#')[0].rstrip('/')
            if not url: url = BASE_URL
            if not url.startswith('http'): continue
            if url in visited: continue
            parsed = urllib.parse.urlparse(url)
            if parsed.netloc and BASE_DOMAIN not in parsed.netloc: continue
            ext = Path(parsed.path).suffix.lower()
            if ext in SKIP_EXT or ext in PAGE_SKIP: continue
            if any(d in url for d in SKIP_DOMAIN): continue

            log(f"\n[{count+1}/{MAX_PAGES}] {url}")

            page_assets = {}
            intercept_lock = threading.Lock()
            page = ctx.new_page()

            def on_response(response):
                resp_url = response.url
                if any(d in resp_url for d in SKIP_DOMAIN): return
                rp = urllib.parse.urlparse(resp_url)
                ext_r = Path(rp.path).suffix.lower()
                if ext_r not in {'.css','.js','.mjs','.png','.jpg','.jpeg',
                                  '.gif','.webp','.svg','.ico','.avif',
                                  '.woff','.woff2','.ttf','.eot','.otf',
                                  '.json','.map'}:
                    return
                try:
                    body = response.body()
                    if not body: return
                    local_p, _ = asset_local(resp_url, assets_dir)
                    if not (local_p.exists() and local_p.stat().st_size > 0):
                        local_p.parent.mkdir(parents=True, exist_ok=True)
                        local_p.write_bytes(body)
                    with intercept_lock:
                        page_assets[resp_url] = local_p
                        clean = resp_url.split('?')[0]
                        page_assets[clean] = local_p
                except Exception:
                    pass

            page.on("response", on_response)

            try:
                resp = page.goto(url, wait_until='domcontentloaded', timeout=PAGE_TIMEOUT)
                if resp and resp.status >= 400:
                    log(f"  [SKIP] HTTP {resp.status}")
                    page.close()
                    visited[url] = None
                    continue

                time.sleep(WAIT_AFTER)
                try: page.wait_for_load_state('networkidle', timeout=6000)
                except Exception: pass

                try:
                    page.evaluate("""
                        async () => {
                            await new Promise(res => {
                                let h = 0;
                                const t = setInterval(() => {
                                    window.scrollBy(0, 800);
                                    h += 800;
                                    if(h >= document.body.scrollHeight || h > 10000){
                                        clearInterval(t); res();
                                    }
                                }, 80);
                            });
                        }
                    """)
                    time.sleep(1.5)
                except Exception: pass

                final_url = page.url.split('#')[0].rstrip('/') or url
                local_p   = page_local_path(final_url, output_dir)
                local_p.parent.mkdir(parents=True, exist_ok=True)

                html_content = page.content()

                try:
                    links = page.evaluate(
                        "() => Array.from(document.querySelectorAll('a[href]')).map(a=>a.href)"
                    )
                except Exception:
                    links = []

                page.close()

                visited[url] = local_p
                if final_url != url: visited[final_url] = local_p
                url_to_file[url] = local_p
                if final_url != url: url_to_file[final_url] = local_p

                added = 0
                for lnk in links:
                    lnk = lnk.split('#')[0].rstrip('/')
                    if not lnk.startswith('http'): continue
                    lp = urllib.parse.urlparse(lnk)
                    if BASE_DOMAIN not in lp.netloc: continue
                    if lnk not in visited:
                        ex = Path(lp.path).suffix.lower()
                        if ex not in SKIP_EXT and ex not in PAGE_SKIP:
                            queue.append(lnk)
                            added += 1

                log(f"  [HTML]   {len(html_content):,} bytes")
                log(f"  [ASSETS] {len(page_assets)} captured from network")
                log(f"  [LINKS]  {len(links)} found, {added} queued | queue={len(queue)}")

                html_content = rewrite_html(
                    html_content, final_url, local_p, page_assets, output_dir
                )
                local_p.write_text(html_content, encoding='utf-8', errors='replace')
                log(f"  [SAVED]  {local_p.relative_to(output_dir)}")

                count += 1

            except PWT:
                log(f"  [TIMEOUT] {url}")
                try: page.close()
                except: pass
                visited[url] = None
            except Exception as e:
                log(f"  [ERROR] {type(e).__name__}: {e}")
                try: page.close()
                except: pass
                visited[url] = None

        browser.close()

    # ---- Post-process: rewrite internal links ----
    log("\n" + "="*60)
    log("[LINKS] Rewriting internal navigation links in all HTML files...")
    v_map = {u: p for u, p in url_to_file.items() if p and p.exists()}
    for hf in list(output_dir.rglob("*.html")):
        try:
            file_url = next((u for u, p in v_map.items() if p == hf), None)
            if not file_url: continue
            ht = hf.read_text(encoding='utf-8', errors='ignore')
            ht = rewrite_internal_links(ht, file_url, hf, v_map)
            hf.write_text(ht, encoding='utf-8', errors='replace')
        except Exception as e:
            log(f"  [WARN] {hf.name}: {e}")

    # ---- Setup GitHub Pages Root index.html and 404.html ----
    en_html = output_dir / "en.html"
    index_html = output_dir / "index.html"
    notfound_html = output_dir / "404.html"

    if en_html.exists():
        shutil.copy2(en_html, index_html)
        shutil.copy2(en_html, notfound_html)
        log("[INDEX] Copied en.html -> index.html (Root GitHub Pages entrypoint)")
        log("[404]   Copied en.html -> 404.html (GitHub Pages fallback)")

    # ---- Summary ----
    log("\n" + "="*60)
    log("[DONE] CLONE COMPLETE!")
    t_html  = len(list(output_dir.rglob("*.html")))
    t_css   = len(list(assets_dir.rglob("*.css")))
    t_js    = len(list(assets_dir.rglob("*.js")))
    t_img   = len(list((assets_dir/"images").rglob("*")))
    t_fonts = len(list((assets_dir/"fonts").rglob("*")))
    all_f   = list(output_dir.rglob("*"))
    total_f = sum(1 for f in all_f if Path(f).is_file())
    total_mb = sum(Path(f).stat().st_size for f in all_f if Path(f).is_file()) / (1024*1024)
    log(f"  Pages scraped  : {count}")
    log(f"  HTML files     : {t_html}")
    log(f"  CSS files      : {t_css}")
    log(f"  JS files       : {t_js}")
    log(f"  Images         : {t_img}")
    log(f"  Fonts          : {t_fonts}")
    log(f"  Total files    : {total_f}")
    log(f"  Total size     : {total_mb:.1f} MB")

    sitemap = {u: str(p.relative_to(output_dir).as_posix()) for u, p in url_to_file.items() if p and p.exists()}
    (output_dir/"sitemap.json").write_text(json.dumps(sitemap, indent=2), encoding='utf-8')
    log(f"  Sitemap saved  : site/sitemap.json")
    if log_fh:
        log_fh.close()

if __name__ == "__main__":
    crawl()
