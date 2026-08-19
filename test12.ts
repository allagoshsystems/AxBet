import * as cheerio from 'cheerio';

async function test(url) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);
  
  const cards = $("a[href*='/live-cricket-scores/']").filter((i, el) => {
    return $(el).find('> div').length >= 2;
  });

  cards.each((i, el) => {
      const childDivs = $(el).find('> div, > span');
      if (childDivs.length < 2) return;

      const titleText = $(childDivs[0]).text().trim();
      let statusText = childDivs.length > 2 ? $(childDivs[2]).text().trim() : "LIVE";
      const teamRows = $(childDivs[1]).find('> div.flex.items-center.justify-between');
      let team1 = "", team2 = "";
      
      if (teamRows.length >= 2) {
        team1 = $(teamRows[0]).find('.truncate').first().text().trim() || $(teamRows[0]).find('span').first().text().trim();
        team2 = $(teamRows[1]).find('.truncate').first().text().trim() || $(teamRows[1]).find('span').first().text().trim();
      } else {
         const vsSplit = titleText.split(/\s+vs\s+/i);
         if (vsSplit.length === 2) {
             team1 = vsSplit[0].trim();
             team2 = vsSplit[1].replace(/LIVE/i, '').trim();
         } else {
             team1 = titleText;
             team2 = "TBD";
         }
      }
      
      const normStatus = statusText.toLowerCase();
      
      // Let's actually check what the statusText is originally
      if(titleText.includes("England") || titleText.includes("Greece")){
         console.log(`Original Status: [${statusText}]`);
      }
  });
}
await test('https://www.cricbuzz.com/cricket-match/live-scores/upcoming-matches');
