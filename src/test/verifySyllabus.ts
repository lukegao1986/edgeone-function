import { EJU_SYLLABUS } from '../data/ejuSyllabus';

console.log('=== 主科目列表 ===');
EJU_SYLLABUS.forEach(mainSubject => {
  console.log(`- ${mainSubject.code}: ${mainSubject.name} (sort_order: ${mainSubject.sort_order})`);
  console.log(`  分科目数量: ${mainSubject.subSubjects.length}`);
});

const science = EJU_SYLLABUS.find(s => s.code === 'science');
if (science) {
  console.log('\n=== 理科分科目 ===');
  science.subSubjects.forEach(sub => {
    console.log(`- ${sub.code}: ${sub.name}`);
    console.log(`  chapters 数量: ${sub.chapters.length}`);
    if (sub.chapters.length > 0) {
      const firstChapter = sub.chapters[0];
      console.log(`  第一个 chapter: ${firstChapter.id} - ${firstChapter.title}`);
      console.log(`  sections 数量: ${firstChapter.sections.length}`);
      if (firstChapter.sections.length > 0) {
        const firstSection = firstChapter.sections[0];
        console.log(`  第一个 section: ${firstSection.id} - ${firstSection.title}`);
        console.log(`  topics 数量: ${firstSection.topics.length}`);
        if (firstSection.topics.length > 0) {
          const firstTopic = firstSection.topics[0];
          console.log(`  第一个 topic: ${firstTopic.id} - ${firstTopic.title}`);
          console.log(`  subtopics 数量: ${firstTopic.subtopics?.length || 0}`);
          if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
            console.log(`  第一个 subtopic: ${firstTopic.subtopics[0].code} - ${firstTopic.subtopics[0].name}`);
          }
        }
      }
    }
  });
}

console.log('\n=== 其他主科目 ===');
const bunso = EJU_SYLLABUS.find(s => s.code === 'bunso');
if (bunso) { console.log(`文综: subSubjects 数量 = ${bunso.subSubjects.length}`); }

const japanese = EJU_SYLLABUS.find(s => s.code === 'japanese');
if (japanese) { console.log(`日语: subSubjects 数量 = ${japanese.subSubjects.length}`); }

const math1 = EJU_SYLLABUS.find(s => s.code === 'math1');
if (math1) { console.log(`数学1: subSubjects 数量 = ${math1.subSubjects.length}`); }

const math2 = EJU_SYLLABUS.find(s => s.code === 'math2');
if (math2) { console.log(`数学2: subSubjects 数量 = ${math2.subSubjects.length}`); }

const physics = science?.subSubjects.find(sub => sub.code === 'physics');
if (physics) {
  console.log('\n物理分科目:', physics.name);
  console.log('第一章:', physics.chapters[0]?.title);
} else {
  console.error('\n无法找到 physics');
}

export {};
