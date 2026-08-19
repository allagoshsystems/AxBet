import * as cheerio from 'cheerio';

async function test() {
  const html = await fetch('https://www.cricbuzz.com/live-cricket-scores/167870/bgr-vs-esp-16th-match-icc-mens-t20-world-cup-sub-regional-europe-qualifier-c').then(r => r.text());
  const $ = cheerio.load(html);
  
  const mincbText = $('.cb-min-bat-rw').text();
  console.log("Mini score text:", mincbText);
  
  const comm = $('.cb-com-ln').first().text();
  console.log("Latest comm:", comm);

  const mainScore = $('.cb-nav-main').parent().text();
  console.log("Main Score Area:", mainScore.substring(0, 300));
}
test();
