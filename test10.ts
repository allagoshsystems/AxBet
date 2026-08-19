import * as cheerio from 'cheerio';

async function test(url) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);
  
  const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => {
    return $(el).find('> div').length >= 2;
  });

  console.log(`Found ${cards.length} cards on ${url}`);

  cards.each((i, el) => {
      const childDivs = $(el).find('> div, > span');
      if (childDivs.length < 2) return;

      const titleText = $(childDivs[0]).text().trim();
      const teamRows = $(childDivs[1]).find('> div.flex.items-center.justify-between');
      let statusText = "";
      if (childDivs.length > 2) {
         statusText = $(childDivs[2]).text().trim();
      }
      if(statusText.includes("won by") || statusText.includes("Match abandoned") || titleText.includes("Greece")){
         console.log(`- ${titleText} | Status: ${statusText.substring(0,40)}`);
      }
  });
}
await test('https://www.cricbuzz.com/cricket-match/live-scores/recent-matches');
