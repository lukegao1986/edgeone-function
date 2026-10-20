const fs = require("fs");
const path = require("path");

const syllabusPath = path.join(__dirname, "src/data/ejuSyllabus.ts");
let content = fs.readFileSync(syllabusPath, "utf8");

const tsCode = content.replace(
  /export const EJU_SYLLABUS.*=/,
  "const EJU_SYLLABUS =",
);
// 用 typescript 编译器或简单的正则处理，因为 tsCode 里有类型，eval 会报错
// 更好的是写个简单的脚本，使用 ts-node
