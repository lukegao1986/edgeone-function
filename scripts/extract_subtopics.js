const fs = require('fs');
const path = require('path');

// Read the syllabus markdown files
const phyPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_phy.md');
const chemPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_chem.md');
const bioPath = path.join(__dirname, '../docs/考试大纲/理综大纲/2026_syllabus_bio.md');

function extractSubtopics(markdownPath, subjectPrefix) {
  if (!fs.existsSync(markdownPath)) return {};
  
  const content = fs.readFileSync(markdownPath, 'utf8');
  const lines = content.split('\n');
  
  const mapping = {};
  
  let currentChapter = 0; // I, II, III...
  let currentSection = 0; // 1, 2, 3...
  let currentTopic = 0;   // (1), (2), (3)...
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match Chapter (## I 力学)
    if (line.match(/^##\s+[IVX]+\s+/)) {
      currentChapter++;
      currentSection = 0;
      currentTopic = 0;
      continue;
    }
    
    // Match Section (### 1.運動と力)
    if (line.match(/^###\s+\d+\./)) {
      currentSection++;
      currentTopic = 0;
      continue;
    }
    
    // Match Topic (#### (1)運動の表し方)
    if (line.match(/^####\s+\(\d+\)/)) {
      currentTopic++;
      
      // Look for the next non-empty line which contains the comma-separated subtopics
      let nextLineIdx = i + 1;
      while (nextLineIdx < lines.length && lines[nextLineIdx].trim() === '') {
        nextLineIdx++;
      }
      
      if (nextLineIdx < lines.length && !lines[nextLineIdx].startsWith('#')) {
        const subtopicText = lines[nextLineIdx].trim();
        const subtopics = subtopicText.split(',').map(s => s.trim()).filter(s => s);
        
        const topicId = `${subjectPrefix}_${currentChapter}_${currentSection}_${currentTopic}`;
        mapping[topicId] = subtopics;
        i = nextLineIdx;
      }
    }
  }
  
  return mapping;
}

const phySubtopics = extractSubtopics(phyPath, 'phy');
const chemSubtopics = extractSubtopics(chemPath, 'chem');
const bioSubtopics = extractSubtopics(bioPath, 'bio');

const allSubtopics = { ...phySubtopics, ...chemSubtopics, ...bioSubtopics };

// Now update ejuSyllabus.ts
const syllabusPath = path.join(__dirname, '../src/data/ejuSyllabus.ts');
let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');

let updatedContent = syllabusContent;

for (const [topicId, subtopics] of Object.entries(allSubtopics)) {
  // Skip phy_1_1_1 as requested
  if (topicId === 'phy_1_1_1') continue;
  
  // Create the subtopics JSON string
  const subtopicsArray = subtopics.map((name, index) => {
    const codeIndex = String(index + 1).padStart(2, '0');
    return `                      {
                        "code": "${topicId}_${codeIndex}",
                        "name": "${name}",
                        "aliases": ["${name}"],
                        "description": "${name}に関する問題"
                      }`;
  });
  
  const subtopicsStr = `\n                    "subtopics": [\n${subtopicsArray.join(',\n')}\n                    ]`;
  
  // Find the topic in the TS file
  // We look for:
  // "id": "topicId",
  // "title": "...",
  // "content": "..."
  // and insert subtopics after content if it doesn't exist, or replace it if it does.
  
  // Create a regex to match the topic definition
  const regexStr = `(\\"id\\"\\s*:\\s*\\"${topicId}\\"\\s*,\\s*\\"title\\"\\s*:\\s*\\"[^\\"]+\\"\\s*,\\s*\\"content\\"\\s*:\\s*\\"[^\\"]+\\")(?:\\s*,\\s*\\"subtopics\\"\\s*:\\s*\\[[\\s\\S]*?\\])?`;
  const regex = new RegExp(regexStr, 'g');
  
  updatedContent = updatedContent.replace(regex, `$1,${subtopicsStr}`);
}

fs.writeFileSync(syllabusPath, updatedContent, 'utf8');
console.log('Successfully updated ejuSyllabus.ts with subtopics from markdown files.');