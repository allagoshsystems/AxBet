import * as cheerio from 'cheerio';
const html = await fetch('https://www.cricbuzz.com/cricket-match/live-scores/recent-matches', {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  }
}).then(r => r.text());
const $ = cheerio.load(html);
const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => $(el).find('> div').length >= 2);
cards.each((i, el) => {
  if($(el).text().includes('Hong Kong')) {
     const childs = $(el).find('> div, > span');
     let statusText = childs.length > 2 ? $(childs[2]).text().trim() : "UPCOMING";
     console.log("Status text:", statusText);
  }
});
