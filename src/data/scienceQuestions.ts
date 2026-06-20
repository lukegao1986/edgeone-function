export const generateQuestionsByTopic = (subjectId: string, topicId: string, topicTitle: string, count: number = 5) => {
  const questions: any[] = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `${subjectId}_${topicId}_q${i + 1}`,
      subjectId: subjectId,
      category: topicTitle,
      stem: `【${topicTitle}】 模擬問題 ${i + 1}：\n\nこのトピックに関する知識を問う問題です。正しい選択肢を1つ選びなさい。`,
      options: [
        `選択肢 A（${topicTitle}に関連するダミーの記述）`,
        `選択肢 B（${topicTitle}に関連するダミーの記述）`,
        `選択肢 C（${topicTitle}に関連するダミーの記述）`,
        `選択肢 D（${topicTitle}に関連するダミーの記述）`
      ],
      correctIndex: Math.floor(Math.random() * 4),
      explanation: `【解説】\n\n正解は選択肢です。\n\n${topicTitle}の基本的な概念に基づき、問題文の条件を当てはめると、この結論が導かれます。実際の試験では、より複雑な計算や図表の読み取りが求められる場合があります。`
    });
  }

  return questions;
};