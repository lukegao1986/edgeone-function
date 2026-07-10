const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, '../src/data/ejuSyllabus.ts');
let content = fs.readFileSync(syllabusPath, 'utf8');

// The strategy is to find `"content": "..."` and remove everything after it until the end of the topic object.
// A topic object ends with `\n                  }` or `\n                  },` (indentation of 18 spaces).

// We split the content by `"id": "` to isolate each topic.
const parts = content.split('"id": "');

let newParts = [parts[0]]; // The first part contains everything before the first topic id

for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  
  // Extract the topic ID
  const idMatch = part.match(/^([^"]+)"/);
  if (!idMatch) {
    newParts.push(part);
    continue;
  }
  const topicId = idMatch[1];
  
  // If it's phy_1_1_1, we keep it exactly as is
  if (topicId === 'phy_1_1_1') {
    newParts.push(part);
    continue;
  }
  
  // Find the end of the "content": "..." line
  const contentRegex = /("content"\s*:\s*"[^"]+")/;
  const contentMatch = part.match(contentRegex);
  
  if (contentMatch) {
    const contentEndIndex = contentMatch.index + contentMatch[0].length;
    
    // Find the end of the topic object
    const remainingPart = part.substring(contentEndIndex);
    
    // The closing brace for a topic is usually indented by 18 spaces: `                  }`
    const endTopicRegex = /\n\s{18}\}/;
    const endMatch = remainingPart.match(endTopicRegex);
    
    if (endMatch) {
      // Reconstruct the part
      const cleanPart = part.substring(0, contentEndIndex) + remainingPart.substring(endMatch.index);
      newParts.push(cleanPart);
    } else {
      newParts.push(part);
    }
  } else {
    newParts.push(part);
  }
}

const finalContent = newParts.join('"id": "');
fs.writeFileSync(syllabusPath, finalContent, 'utf8');
console.log('Deep cleaned ejuSyllabus.ts!');