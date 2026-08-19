const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  const html = await fetch('https://www.cricbuzz.com/cricket-match/live-scores').then(r => r.text());
  const $ = cheerio.load(html);
  
  const aLinks = $("a[href*='live-cricket-scores']").slice(0, 3);
  aLinks.each((i, el) => {
    console.log("----");
    console.log("Href:", $(el).attr('href'));
    console.log("Title:", $(el).attr('title'));
    console.log("Text:", $(el).text());
    
    // Attempt to extract scores. Cricbuzz usually structures it inside a div parent.
    // Let's get the parent's parent's parent HTML to see the structure.
    let parent = $(el).parent().parent();
    console.log("HTML chunk:");
    console.log(parent.html()?.replace(/\s+/g, ' '));
  });
}
test();
