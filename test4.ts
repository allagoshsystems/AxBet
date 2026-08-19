import * as cheerio from 'cheerio';

async function test(url) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);
  
  const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => {
    return $(el).text().includes('England') && $(el).text().includes('Pakistan');
  });

  const firstCard = cards.eq(0);
  const childDivs = firstCard.find('> div, > span');
  childDivs.each((i, c) => console.log(`Child ${i}:`, $(c).text().trim()));
}
await test('https://www.cricbuzz.com/cricket-match/live-scores/upcoming-matches');
