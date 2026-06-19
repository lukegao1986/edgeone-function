import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, RichText, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import { QUESTIONS } from '@/data/questions';
import Navbar from '@/components/Navbar';
import AIAnalysisModal, { AIAnalysisData } from '@/components/AIAnalysisModal';
import styles from './index.module.scss';

export default function PracticePage() {
  const router = useRouter();
  const subjectId = router.params.subjectId || 'japanese';
  
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const userInfo = Taro.getStorageSync('userInfo');
        const userId = userInfo ? userInfo.id : '';
        
        // 这里由于部署架构变更为：前端(EdgeOne) -> 公网访问 -> Node中间层(轻量服务器)
        // 所以生产环境下必须写死指向轻量服务器公网 IP 的绝对路径。
        // 请在部署后将下面的 http://您的轻量服务器公网IP:3000 替换为实际 IP
        const apiUrl = process.env.NODE_ENV === 'production'
          ? `http://您的轻量服务器公网IP:3000/api/get_questions?subjectId=${subjectId}&userId=${userId}`
          : `/api/get_questions?subjectId=${subjectId}&userId=${userId}`;

        const res = await Taro.request({
          url: apiUrl,
          method: 'GET'
        });
        if (res.data && res.data.success) {
          setQuestions(res.data.data);
          
          // 如果后端返回了历史答题记录，将其恢复到前端状态
          if (res.data.userAnswers) {
            setAnswers(res.data.userAnswers);
            
            // 自动跳到第一道没做的题
            const total = res.data.data.length;
            let firstUnansweredIndex = 0;
            for (let i = 0; i < total; i++) {
              if (!res.data.userAnswers[res.data.data[i].id]) {
                firstUnansweredIndex = i;
                break;
              }
            }
            setCurrentIndex(firstUnansweredIndex);
          }
          
          if (res.data.userNotes) {
            setNotes(res.data.userNotes);
          }
        } else {
          Taro.showToast({ title: '加载题目失败', icon: 'none' });
        }
      } catch (err) {
        Taro.showToast({ title: '网络请求错误', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subjectId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // 记录答题状态，格式: { [questionId]: { selectedIndex, isCorrect, isBookmarked } }
  const [answers, setAnswers] = useState<Record<string, { selectedIndex: number, isCorrect: boolean, isBookmarked?: boolean }>>({});
  
  // 记录用户笔记，格式: { [questionId]: { content: string, updatedAt: string } }
  const [notes, setNotes] = useState<Record<string, { content: string, updatedAt: string }>>({});

  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [tempNoteContent, setTempNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // AI 弹窗相关状态
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState<AIAnalysisData | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const existingAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  useEffect(() => {
    if (existingAnswer && existingAnswer.selectedIndex !== undefined && existingAnswer.selectedIndex !== -1) {
      setSelectedOption(existingAnswer.selectedIndex);
      setShowAnswer(true);
    } else {
      setSelectedOption(null);
      setShowAnswer(false);
    }
    // 恢复收藏状态
    setIsBookmarked(existingAnswer && existingAnswer.isBookmarked ? true : false);
  }, [currentIndex, existingAnswer]);

  const handleSelectOption = (index: number) => {
    if (showAnswer || !currentQuestion) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    setAnswers(prev => {
      const existing = prev[currentQuestion.id] || {};
      return {
        ...prev,
        [currentQuestion.id]: { ...existing, selectedIndex: selectedOption, isCorrect }
      };
    });
    
    setShowAnswer(true);

    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : 1;

      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://您的轻量服务器公网IP:3000/api/submit_answer'
        : '/api/submit_answer';

      await Taro.request({
        url: apiUrl,
        method: 'POST',
        data: {
          userId: userId,
          questionId: currentQuestion.id,
          subjectId: currentQuestion.subjectId,
          selectedIndex: selectedOption,
          isCorrect: isCorrect
        }
      });
      if (isCorrect) {
        Taro.showToast({ title: '回答正确！', icon: 'success' });
      } else {
        Taro.showToast({ title: '回答错误，已记录', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 准备展示弹窗的数据
      const answersArray = Object.values(answers);
      const correctCount = answersArray.filter(a => a.isCorrect).length;
      const wrongCount = answersArray.length - correctCount;
      const rate = answersArray.length > 0 ? Math.round((correctCount / answersArray.length) * 100) : 0;
      
      // 模拟大模型的分析数据
      const mockAnalysisData: AIAnalysisData = {
        total: answersArray.length,
        correct: correctCount,
        wrong: wrongCount,
        rate: rate,
        diagnoses: [
          {
            category: '有机化学基础',
            errorCount: Math.ceil(wrongCount * 0.6),
            advice: '你在「官能团性质」与「同分异构体」判断上失分较多。建议复习碳碳双键的加成反应和苯环的取代反应规律。'
          },
          {
            category: '物质的量计算',
            errorCount: Math.ceil(wrongCount * 0.4),
            advice: '涉及到气体体积与浓度的综合计算时，你容易在单位换算上出错。做题时请先在草稿纸上统一所有单位。'
          }
        ].filter(d => d.errorCount > 0),
        resources: [
          {
            title: '《EJU 化学考点速记：有机化学篇》',
            type: '飞书文档',
            url: 'https://feishu.cn',
            icon: '📄'
          },
          {
            title: '【视频解析】物质的量计算常见陷阱',
            type: 'Bilibili',
            url: 'https://bilibili.com',
            icon: '📺'
          }
        ]
      };

      setAiAnalysisData(mockAnalysisData);
      setIsAIModalVisible(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    // 更新本地 answers 状态，以便在题号间切换时能保持最新收藏状态
    setAnswers(prev => {
      const existing = prev[currentQuestion.id] || { selectedIndex: -1, isCorrect: false };
      return {
        ...prev,
        [currentQuestion.id]: { ...existing, isBookmarked: newBookmarkState }
      };
    });
    
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : 1;

      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://您的轻量服务器公网IP:3000/api/submit_answer'
        : '/api/submit_answer';

      await Taro.request({
        url: apiUrl,
        method: 'POST',
        data: {
          userId: userId,
          questionId: currentQuestion.id,
          subjectId: currentQuestion.subjectId,
          isBookmarked: newBookmarkState
        }
      });
      Taro.showToast({ title: newBookmarkState ? '已收藏到错题本' : '已取消收藏', icon: 'success' });
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
      setIsBookmarked(!newBookmarkState); // 回滚状态
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    setCurrentIndex(idx);
  };

  const handleOpenNote = () => {
    if (!currentQuestion) return;
    const existingNote = notes[currentQuestion.id];
    setTempNoteContent(existingNote ? existingNote.content : '');
    setIsNoteDrawerOpen(true);
  };

  const handleCloseNote = () => {
    setIsNoteDrawerOpen(false);
  };

  const handleSaveNote = async () => {
    if (!currentQuestion) return;
    setIsSavingNote(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : 1;

      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://您的轻量服务器公网IP:3000/api/submit_note'
        : '/api/submit_note';

      await Taro.request({
        url: apiUrl,
        method: 'POST',
        data: {
          userId: userId,
          questionId: currentQuestion.id,
          subjectId: currentQuestion.subjectId,
          content: tempNoteContent
        }
      });
      
      setNotes(prev => ({
        ...prev,
        [currentQuestion.id]: { content: tempNoteContent, updatedAt: new Date().toISOString() }
      }));
      
      Taro.showToast({ title: '笔记已保存', icon: 'success' });
      setIsNoteDrawerOpen(false);
    } catch (err) {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setIsSavingNote(false);
    }
  };

  const getQuestionStatus = (qId: string) => {
    const ans = answers[qId];
    if (!ans) return 'unanswered';
    return ans.isCorrect ? 'correct' : 'wrong';
  };

  const getOptionStyle = (index: number) => {
    if (!showAnswer || selectedOption === null) {
      if (selectedOption === index) return styles.optionSelected;
      return styles.optionNormal;
    }
    if (index === currentQuestion.correctIndex) return styles.optionCorrect;
    if (index === selectedOption && !existingAnswer?.isCorrect) return styles.optionWrong;
    return styles.optionDisabled;
  };

  const getLabelStyle = (index: number) => {
    if (!showAnswer || selectedOption === null) {
      if (selectedOption === index) return styles.labelSelected;
      return styles.labelNormal;
    }
    if (index === currentQuestion.correctIndex) return styles.labelCorrect;
    if (index === selectedOption && !existingAnswer?.isCorrect) return styles.labelWrong;
    return styles.labelDisabled;
  };

  const letters = ['A', 'B', 'C', 'D'];

  // 简易 Markdown 解析，用于处理题目中的图片和换行
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; display: block; border-radius: 8px;" />');
    html = html.replace(/\n/g, '<br/>');
    return `<div style="line-height: 1.6;">${html}</div>`;
  };

  if (loading) {
    return (
      <View className={styles.emptyContainer}>
        <Text className={styles.emptyText}>题目加载中...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View className={styles.emptyContainer}>
        <Text className={styles.emptyText}>暂无题目</Text>
        <Text className={styles.backLink} onClick={() => Taro.navigateBack()}>返回大厅</Text>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <Navbar simplified subjectName={`${subject?.name} - ${currentQuestion.category}`} />

      <View className={styles.layoutBody}>
        
        {/* 左侧：题号导航矩阵 */}
        <View className={styles.leftPanel}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressTitle}>答题进度</Text>
            <View className={styles.progressBarBg}>
              <View className={styles.progressBarFill} style={{ width: `${progress}%` }} />
            </View>
            <Text className={styles.progressText}>{answeredCount} / {totalQuestions} 题</Text>
          </View>

          <ScrollView className={styles.navGridScroll} scrollY>
            <View className={styles.navGrid}>
              {questions.map((q, i) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = i === currentIndex;
                
                let btnClass = styles.navBtnNormal;
                if (isCurrent) btnClass = styles.navBtnCurrent;
                else if (status === 'correct') btnClass = styles.navBtnCorrect;
                else if (status === 'wrong') btnClass = styles.navBtnWrong;

                return (
                  <View key={q.id} className={classnames(styles.navBtn, btnClass)} onClick={() => handleJumpToQuestion(i)}>
                    <Text className={classnames(styles.navBtnText, isCurrent && styles.navBtnTextCurrent)}>{i + 1}</Text>
                  </View>
                );
              })}
            </View>

            <View className={styles.legendRow}>
              <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotNormal)} /><Text className={styles.legendText}>未做</Text></View>
              <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotCorrect)} /><Text className={styles.legendText}>正确</Text></View>
              <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotWrong)} /><Text className={styles.legendText}>错误</Text></View>
            </View>
          </ScrollView>
        </View>

        {/* 右侧：答题主区域 */}
        <View className={styles.rightPanel}>
          <ScrollView className={styles.questionScroll} scrollY>
            <View className={styles.questionContainer}>
              
              {/* 题头 */}
              <View className={styles.questionHeader}>
                <Text className={styles.questionCounter}>第 {currentIndex + 1} 题（共 {totalQuestions} 题）</Text>
                {showAnswer && existingAnswer && (
                  <Text className={classnames(styles.statusText, existingAnswer.isCorrect ? styles.textSuccess : styles.textDanger)}>
                    {existingAnswer.isCorrect ? '✅ 回答正确' : '❌ 回答错误'}
                  </Text>
                )}
              </View>

              {/* 题干 */}
              <View className={styles.stemCard}>
                <RichText nodes={renderMarkdown(currentQuestion.stem)} className={styles.stemText} />
              </View>

              {/* 选项 */}
              <View className={styles.optionsList}>
                {currentQuestion.options.map((option, index) => (
                  <View 
                    key={index} 
                    className={classnames(styles.optionCard, getOptionStyle(index))}
                    onClick={() => handleSelectOption(index)}
                  >
                    <View className={classnames(styles.optionLabel, getLabelStyle(index))}>
                      <Text className={styles.labelText}>{letters[index]}</Text>
                    </View>
                    <View className={styles.optionText}>
                      <RichText nodes={renderMarkdown(option)} />
                    </View>
                    
                    {showAnswer && index === currentQuestion.correctIndex && <Text className={styles.iconCorrect}>✓</Text>}
                    {showAnswer && index === selectedOption && index !== currentQuestion.correctIndex && <Text className={styles.iconWrong}>✗</Text>}
                  </View>
                ))}
              </View>

              {/* 解析 (答题后显示) */}
              {showAnswer && (
                <View className={styles.explanationCard}>
                  <View className={styles.expHeader}>
                    <Text className={styles.expTitle}>📖 答案解析</Text>
                  </View>
                  <View className={styles.divider} />
                  <Text className={styles.expCorrectText}>✅ 正确答案：{letters[currentQuestion.correctIndex]}</Text>
                  {selectedOption !== null && selectedOption !== currentQuestion.correctIndex && (
                    <Text className={styles.expWrongText}>❌ 你的答案：{letters[selectedOption]}</Text>
                  )}
                  <View className={styles.expContent}>
                    <RichText nodes={renderMarkdown(currentQuestion.explanation)} />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 底部操作条 */}
          <View className={styles.bottomBar}>
            <View 
              className={classnames(styles.btnPrev, currentIndex === 0 && styles.btnDisabled)} 
              onClick={handlePrev}
            >
              <Text className={styles.btnTextSecondary}>‹ 上一题</Text>
            </View>

            <View className={styles.bottomCenter}>
              <View className={styles.actionBtnsWrap}>
                <View className={styles.bookmarkBtn} onClick={handleToggleBookmark}>
                  <Text className={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
                  <Text className={classnames(styles.bookmarkText, isBookmarked && styles.textWarning)}>
                    {isBookmarked ? '已收藏' : '收藏'}
                  </Text>
                </View>
                <View className={styles.bookmarkBtn} onClick={handleOpenNote}>
                  <Text className={styles.bookmarkIcon}>📝</Text>
                  <Text className={classnames(styles.bookmarkText, notes[currentQuestion?.id]?.content && styles.textPrimary)}>
                    {notes[currentQuestion?.id]?.content ? '已记笔记' : '记笔记'}
                  </Text>
                </View>
              </View>

              {!showAnswer ? (
                <View 
                  className={classnames(styles.btnSubmit, selectedOption === null && styles.btnSubmitDisabled)}
                  onClick={handleSubmitAnswer}
                >
                  <Text className={styles.btnTextWhite}>提交答案</Text>
                </View>
              ) : (
                <Text className={styles.counterText}>{currentIndex + 1} / {totalQuestions}</Text>
              )}
            </View>

            <View className={styles.btnNext} onClick={handleNext}>
              <Text className={styles.btnTextWhite}>{currentIndex === totalQuestions - 1 ? '交卷' : '下一题 ›'}</Text>
            </View>
          </View>

        </View>

      </View>

      {/* 笔记侧边滑出面板 */}
      <View className={classnames(styles.noteDrawerOverlay, isNoteDrawerOpen && styles.drawerOpen)} onClick={handleCloseNote} />
      <View className={classnames(styles.noteDrawer, isNoteDrawerOpen && styles.drawerOpen)}>
        <View className={styles.drawerHeader}>
          <Text className={styles.drawerTitle}>题目笔记</Text>
          <Text className={styles.drawerClose} onClick={handleCloseNote}>×</Text>
        </View>
        
        <View className={styles.drawerBody}>
          <View className={styles.noteMeta}>
            <Text className={styles.metaItem}>题号：{currentQuestion.id}</Text>
            <Text className={styles.metaItem}>章节：{subject?.name} - {currentQuestion.category}</Text>
            {notes[currentQuestion.id]?.updatedAt && (
              <Text className={styles.metaItem}>最后修改：{new Date(notes[currentQuestion.id].updatedAt).toLocaleString()}</Text>
            )}
          </View>
          
          <Textarea
            className={styles.noteInput}
            placeholder="在这里记录你的思考、疑问或解题技巧..."
            value={tempNoteContent}
            onInput={(e) => setTempNoteContent(e.detail.value)}
            maxlength={1000}
          />
        </View>

        <View className={styles.drawerFooter}>
          <View className={classnames(styles.btnSave, isSavingNote && styles.btnDisabled)} onClick={handleSaveNote}>
            <Text className={styles.btnTextWhite}>{isSavingNote ? '保存中...' : '保存笔记'}</Text>
          </View>
        </View>
      </View>

      {/* AI 诊断弹窗 */}
      {aiAnalysisData && (
        <AIAnalysisModal
          visible={isAIModalVisible}
          data={aiAnalysisData}
          onClose={() => {
            setIsAIModalVisible(false);
            Taro.navigateBack();
          }}
          onViewErrors={() => {
            setIsAIModalVisible(false);
            Taro.navigateTo({ url: '/pages/errorbook/index' });
          }}
          onAskAI={() => {
            Taro.showToast({ title: 'AI 对话功能开发中...', icon: 'none' });
          }}
        />
      )}
    </View>
  );
}
