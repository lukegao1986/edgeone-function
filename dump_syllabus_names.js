const fs = require("fs");
const path = require("path");
const tsContent = fs.readFileSync(
  path.join(__dirname, "src/data/ejuSyllabus.ts"),
  "utf8",
);

const match = tsContent.match(
  /export const EJU_SYLLABUS:\s*EjuSyllabus\s*=\s*([\s\S]+);/,
);
if (match) {
  try {
    const jsonStr = match[1];
    const syllabus = JSON.parse(jsonStr);
    const physics = syllabus
      .find((s) => s.code === "science")
      ?.subSubjects.find((ss) => ss.code === "physics");
    if (physics) {
      physics.chapters.forEach((ch) => {
        ch.sections.forEach((sec) => {
          sec.topics.forEach((top) => {
            console.log(`{ "id": "${top.id}", "title": "${top.title}" }`);
          });
        });
      });
    }
  } catch (e) {
    console.error("JSON parse error", e);
  }
}
