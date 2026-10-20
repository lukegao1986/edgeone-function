const fs = require('fs');
const { parse } = require('csv-parse/sync');

const data = parse(fs.readFileSync('docs/Chapter8_10_Topics_Review.csv', 'utf8'), { columns: true });
const withComments = data.filter(r => r['人工意见'] && r['人工意见'].trim() !== '');
console.log(`Found ${withComments.length} comments.`);
if (withComments.length > 0) {
  console.log(withComments[0]);
}
