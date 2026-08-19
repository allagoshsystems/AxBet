const cheerio = require('cheerio');

async function test() {
  const html = await fetch('https://www.cricbuzz.com/cricket-match/live-scores').then(r => r.text());
  const $ = cheerio.load(html);
  
  const matches = [];
  $('.cb-mtch-lst, .cb-lv-scrs-col').each((i, el) => {
    matches.push($(el).text());
  });
  console.log("Found matches with class:", matches.length);

  // let's try getting all text blocks with score-like things
  const aLinks = $("a[href*='live-cricket-scores']").slice(0, 3);
  aLinks.each((i, el) => {
    console.log("----");
    console.log("Href:", $(el).attr('href'));
    console.log("Text:", $(el).text());
    console.log("Parent Text:", $(el).parent().text());
    console.log("Grandparent Text:", $(el).parent().parent().text());
  });
}
test();
