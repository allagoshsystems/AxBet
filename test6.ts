import * as cheerio from 'cheerio';
const html = await fetch('https://www.cricbuzz.com/cricket-match/live-scores', {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  }
}).then(r => r.text());
const $ = cheerio.load(html);
const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => $(el).find('> div').length >= 2);
cards.each((i, el) => {
  if($(el).text().includes('England') && $(el).text().includes('Pakistan')) {
     const childs = $(el).find('> div, > span');
     childs.each((j, c) => console.log(`Child ${j}:`, $(c).text().trim()));
     
     // let's try to extract status correctly
     console.log('Status Span Text:', $(el).find('.text-cbPreview, .text-cbLive, .text-cbMatchStatus, .cb-text-complete, .cb-text-live, .cb-text-preview').first().text().trim());
  }
});
