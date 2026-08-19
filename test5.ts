import * as cheerio from 'cheerio';
const html = await fetch('https://www.cricbuzz.com/cricket-match/live-scores').then(r => r.text());
const $ = cheerio.load(html);
const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => $(el).find('> div').length >= 2);
cards.each((i, el) => {
  if($(el).text().includes('England') && $(el).text().includes('Pakistan')) {
     const childs = $(el).find('> div, > span');
     childs.each((j, c) => console.log(`Child ${j}:`, $(c).text().trim()));
  }
});
