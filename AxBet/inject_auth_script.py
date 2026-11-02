"""
Inject axbet-auth.js into all HTML files in site/
"""
from pathlib import Path

site_dir = Path(r"c:\Users\Mashariq Ali\Desktop\1XBET TEMPLATE\site")
html_files = list(site_dir.rglob("*.html"))
print(f"Injecting axbet-auth.js into {len(html_files)} HTML pages...")

for hf in html_files:
    content = hf.read_text(encoding="utf-8", errors="ignore")
    
    # Calculate depth to assets/js/axbet-auth.js
    rel_depth = len(hf.relative_to(site_dir).parts) - 1
    prefix = "../" * rel_depth
    script_tag = f'<script type="module" src="{prefix}assets/js/axbet-auth.js"></script>'
    
    if "axbet-auth.js" not in content:
        if "</body>" in content:
            content = content.replace("</body>", f"  {script_tag}\n</body>")
        elif "</html>" in content:
            content = content.replace("</html>", f"  {script_tag}\n</html>")
        else:
            content += f"\n{script_tag}\n"
            
        hf.write_text(content, encoding="utf-8")

print("Successfully injected axbet-auth.js across all pages!")

