const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, '../src/data/ejuSyllabus.ts');
let content = fs.readFileSync(syllabusPath, 'utf8');

// The issue was caused by:
// const regexClear = /(\"id\"\s*:\s*\"(?!phy_1_1_1\")[^\"]+\"\s*,\s*\"title\"\s*:\s*\"[^\"]+\"\s*,\s*\"content\"\s*:\s*\"[^\"]+\")(?:\s*,\s*\"subtopics\"\s*:\s*\[[\s\S]*?\])?/g;
// The ? modifier made it match only ONE "subtopics" block, and then append a new one. 
// So running it multiple times appended multiple blocks.

// Fix: Match the base Topic definition AND ALL subsequent "subtopics" blocks, and replace them with just the base Topic definition.
// We use (?: ... )* to match ZERO OR MORE subtopics blocks.

const regexClear = /(\"id\"\s*:\s*\"(?!phy_1_1_1\")[^\"]+\"\s*,\s*\"title\"\s*:\s*\"[^\"]+\"\s*,\s*\"content\"\s*:\s*\"[^\"]+\")(?:\s*,\s*\"subtopics\"\s*:\s*\[[\s\S]*?\])*/g;

const updatedContent = content.replace(regexClear, '$1');

fs.writeFileSync(syllabusPath, updatedContent, 'utf8');
console.log('Successfully cleared all duplicate subtopics arrays!');