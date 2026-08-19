import * as cheerio from 'cheerio';

async function test(url) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);
  
  const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => {
    return $(el).find('> div').length >= 2;
  });

  console.log(`Found ${cards.length} cards on ${url}`);
}

async function run() {
  await test('https://www.cricbuzz.com/cricket-match/live-scores/recent-matches');
  await test('https://www.cricbuzz.com/cricket-match/live-scores/upcoming-matches');
}
run();
