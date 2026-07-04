import { EJU_SYLLABUS } from '../data/ejuSyllabus';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  // EJU_SYLLABUS.find(s => s.code === 'science') 能找到理科
  const science = EJU_SYLLABUS.find(s => s.code === 'science');
  assert(science, 'EJU_SYLLABUS.find(s => s.code === "science") should find science');

  // science.subSubjects 有 3 个分科目（physics/chemistry/biology）
  assert(science?.subSubjects.length === 3, 'science.subSubjects should have 3 subSubjects');
  assert(science?.subSubjects.find(sub => sub.code === 'physics'), 'physics should be present');
  assert(science?.subSubjects.find(sub => sub.code === 'chemistry'), 'chemistry should be present');
  assert(science?.subSubjects.find(sub => sub.code === 'biology'), 'biology should be present');

  // physics.chapters[0].sections[0].topics[0].subtopics 有 6 个分考点
  const physics = science?.subSubjects.find(sub => sub.code === 'physics');
  const phy_1 = physics?.chapters.find(c => c.id === 'phy_1');
  const phy_1_1 = phy_1?.sections.find(s => s.id === 'phy_1_1');
  const phy_1_1_1 = phy_1_1?.topics.find(t => t.id === 'phy_1_1_1');
  
  assert(phy_1_1_1?.subtopics?.length === 6, 'phy_1_1_1 should have 6 subtopics');
  
  // bunso/japanese/math1/math2 的 subSubjects 骨架结构存在
  const bunso = EJU_SYLLABUS.find(s => s.code === 'bunso');
  assert(bunso?.subSubjects.length === 5, 'bunso should have 5 subSubjects');
  
  const japanese = EJU_SYLLABUS.find(s => s.code === 'japanese');
  assert(japanese?.subSubjects.length === 4, 'japanese should have 4 subSubjects');
  
  const math1 = EJU_SYLLABUS.find(s => s.code === 'math1');
  assert(math1?.subSubjects.length === 1, 'math1 should have 1 subSubjects');
  
  const math2 = EJU_SYLLABUS.find(s => s.code === 'math2');
  assert(math2?.subSubjects.length === 1, 'math2 should have 1 subSubjects');

  console.log('✅ 验收点 2.1 — 数据结构验证：通过');
} catch (e) {
  console.error('❌ 验收点 2.1 — 数据结构验证：失败');
  console.error(e);
}
