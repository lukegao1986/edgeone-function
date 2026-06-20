import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, RichText } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import { QUESTIONS } from '@/data/questions';
import { generateQuestionsByTopic } from '@/data/scienceQuestions';
import Navbar from '@/components/Navbar';
import AIAnalysisModal from '@/components/AIAnalysisModal';
import styles from './index.module.scss';

export default function PracticePage() {
  const router = useRouter();
  const subjectId = router.params.subjectId || 'japanese';
  const topicId = router.params.topicId || '';
  const topicTitle = router.params.topicTitle ? decodeURIComponent(router.params.topicTitle) : '';
  
  const subject = SUBJECTS.find(s => s.id === subjectId) || { id: subjectId, name: subjectId === 'physics' ? '物理' : subjectId === 'chemistry' ? '化学' : subjectId === 'biology' ? '生物' : '未知科目', icon: '', color: '' };
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      
      // 如果传入了 topicId 且是理科，直接使用本地生成的题目（供演示）
      if (topicId && ['physics', 'chemistry', 'biology'].includes(subjectId)) {
        const generated = generateQuestionsByTopic(subjectId, topicId, topicTitle, 5);
        setQuestions(generated);
        setLoading(false);
        return;
      }

      try {
        const userInfo = Taro.getStorageSync('userInfo');
        const userId = userInfo ? userInfo.id : '';
        
        const res = await Taro.request({
          url: `/api/get_questions?subjectId=${subjectId}&userId=${userId}`,
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
  
  // 新增：AI 分析弹窗状态
  const [showAIModal, setShowAIModal] = useState(false);

  // 新增：立即批改开关状态
  const [autoCheck, setAutoCheck] = useState(false);
  
  // 新增：全局批改模式（用于关闭立即批改时，交卷后进入的查看解析状态）
  const [isReviewMode, setIsReviewMode] = useState(false);

  // 新增：未提交时的本地临时选择记录
  const [tempSelections, setTempSelections] = useState<Record<string, number>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const existingAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  useEffect(() => {
    // 根据模式决定如何恢复选项状态
    if (isReviewMode || autoCheck) {
      if (existingAnswer && existingAnswer.selectedIndex !== undefined && existingAnswer.selectedIndex !== -1) {
        setSelectedOption(existingAnswer.selectedIndex);
        setShowAnswer(true);
      } else {
        setSelectedOption(null);
        setShowAnswer(false);
      }
    } else {
      // 在未开启立即批改，且未交卷时，从临时记录恢复
      if (currentQuestion && tempSelections[currentQuestion.id] !== undefined) {
        setSelectedOption(tempSelections[currentQuestion.id]);
      } else {
        setSelectedOption(null);
      }
      setShowAnswer(false);
    }

    // 恢复收藏状态
    setIsBookmarked(existingAnswer && existingAnswer.isBookmarked ? true : false);
  }, [currentIndex, existingAnswer, isReviewMode, autoCheck, tempSelections, currentQuestion]);

  const handleSelectOption = (index: number) => {
    if (showAnswer || !currentQuestion) return;
    if (isReviewMode) return; // 批改回顾模式下不能修改选项
    
    setSelectedOption(index);
    
    if (!autoCheck) {
      // 记录到临时状态中
      setTempSelections(prev => ({
        ...prev,
        [currentQuestion.id]: index
      }));
    }
  };

  const submitAnswerWithOption = async (optionIndex: number) => {
    if (!currentQuestion) return;
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    
    setAnswers(prev => {
      const existing = prev[currentQuestion.id] || {};
      return {
        ...prev,
        [currentQuestion.id]: { ...existing, selectedIndex: optionIndex, isCorrect }
      };
    });
    
    setShowAnswer(true);

    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : 1;

      await Taro.request({
        url: '/api/submit_answer',
        method: 'POST',
        data: {
          userId: userId,
          questionId: currentQuestion.id,
          subjectId: currentQuestion.subjectId,
          selectedIndex: optionIndex,
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

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;
    if (autoCheck) {
      await submitAnswerWithOption(selectedOption);
    }
  };

  const submitAllAnswers = async () => {
    Taro.showLoading({ title: '正在交卷...' });
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : 1;
      
      const newAnswers = { ...answers };
      
      // 遍历临时选择记录进行批量提交
      for (const qId of Object.keys(tempSelections)) {
        if (answers[qId]) continue; // 已经提交过的跳过
        
        const q = questions.find(q => q.id === qId);
        if (!q) continue;
        
        const selectedIdx = tempSelections[qId];
        const isCorrect = selectedIdx === q.correctIndex;
        
        newAnswers[qId] = { selectedIndex: selectedIdx, isCorrect };
        
        await Taro.request({
          url: '/api/submit_answer',
          method: 'POST',
          data: {
            userId: userId,
            questionId: q.id,
            subjectId: q.subjectId,
            selectedIndex: selectedIdx,
            isCorrect: isCorrect
          }
        });
      }
      
      setAnswers(newAnswers);
      setIsReviewMode(true); // 进入回顾模式
      setShowAIModal(true); // 显示分析弹窗
    } catch (err) {
      Taro.showToast({ title: '交卷失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (isReviewMode) {
        // 如果已经在回顾模式，再次点击交卷直接弹窗
        setShowAIModal(true);
      } else {
        if (!autoCheck) {
          // 非立即批改模式下，最后点击交卷批量提交
          submitAllAnswers();
        } else {
          setShowAIModal(true);
        }
      }
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

      await Taro.request({
        url: '/api/submit_answer',
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

  const getQuestionStatus = (qId: string) => {
    // 批改模式或者自动批改模式下显示对错
    if (isReviewMode || autoCheck) {
      const ans = answers[qId];
      if (!ans) return 'unanswered';
      return ans.isCorrect ? 'correct' : 'wrong';
    } else {
      // 否则只要选了就显示已答状态
      const hasTemp = tempSelections[qId] !== undefined;
      return hasTemp ? 'answered' : 'unanswered';
    }
  };

  const getOptionStyle = (index: number) => {
    // 只有在展示答案（批改后）才会高亮对错
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
        <Text className={styles.backLink} onClick={() => Taro.switchTab({ url: '/pages/dashboard/index' })}>返回大厅</Text>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <Navbar simplified subjectName={topicTitle ? `${subject?.name} - ${topicTitle}` : `${subject?.name} - ${currentQuestion.category}`} />

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
                else if (status === 'answered') btnClass = styles.navBtnAnswered; // 新增已答状态样式

                return (
                  <View key={q.id} className={classnames(styles.navBtn, btnClass)} onClick={() => handleJumpToQuestion(i)}>
                    <Text className={classnames(styles.navBtnText, isCurrent && styles.navBtnTextCurrent)}>{i + 1}</Text>
                  </View>
                );
              })}
            </View>

            <View className={styles.legendRow}>
              <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotNormal)} /><Text className={styles.legendText}>未做</Text></View>
              {(isReviewMode || autoCheck) ? (
                <>
                  <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotCorrect)} /><Text className={styles.legendText}>正确</Text></View>
                  <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotWrong)} /><Text className={styles.legendText}>错误</Text></View>
                </>
              ) : (
                <View className={styles.legendItem}><View className={classnames(styles.dot, styles.dotAnswered)} /><Text className={styles.legendText}>已答</Text></View>
              )}
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
              
              {/* 选项下方：操作栏 (上一题 / 提交 / 下一题) */}
              <View className={styles.actionRow}>
                <View 
                  className={classnames(styles.btnPrev, currentIndex === 0 && styles.btnDisabled)} 
                  onClick={handlePrev}
                >
                  <Text className={styles.btnTextSecondary}>‹ 上一题</Text>
                </View>

                {(!showAnswer && autoCheck) ? (
                  <View 
                    className={classnames(styles.btnSubmit, selectedOption === null && styles.btnSubmitDisabled)}
                    onClick={handleSubmitAnswer}
                  >
                    <Text className={styles.btnTextWhite}>提交答案</Text>
                  </View>
                ) : (
                  <View className={styles.btnNext} onClick={handleNext}>
                    <Text className={styles.btnTextWhite}>{currentIndex === totalQuestions - 1 ? (isReviewMode ? '查看报告' : '交卷') : '下一题 ›'}</Text>
                  </View>
                )}
              </View>

            </View>
          </ScrollView>

          {/* 底部工具栏 (居中：收藏/笔记/进度， 左侧：立即批改开关) */}
          <View className={styles.bottomBar}>
            
            <View className={styles.bottomLeft}>
              <View className={classnames(styles.iosSwitch, autoCheck && styles.switchOn)} onClick={() => setAutoCheck(!autoCheck)}>
                <View className={styles.switchHandle} />
              </View>
              <Text className={styles.switchLabel}>立即批改</Text>
            </View>

            <View className={styles.bottomCenter}>
              <View className={styles.bookmarkBtn} onClick={handleToggleBookmark}>
                <Text className={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
                <Text className={classnames(styles.bookmarkText, isBookmarked && styles.textWarning)}>
                  {isBookmarked ? '已收藏' : '收藏'}
                </Text>
              </View>

              <View className={styles.bookmarkBtn} onClick={() => Taro.showToast({ title: '写笔记开发中', icon: 'none' })}>
                <Text className={styles.bookmarkIcon}>📝</Text>
                <Text className={styles.bookmarkText}>写笔记</Text>
              </View>

              <Text className={styles.counterText}>{currentIndex + 1} / {totalQuestions}</Text>
            </View>
            
            <View className={styles.bottomRight} /> {/* 占位以保持居中 */}
          </View>

        </View>

      </View>
      
      {/* 新增的 AI 诊断弹窗 */}
      <AIAnalysisModal 
        visible={showAIModal}
        total={totalQuestions}
        correct={Object.values(answers).filter(a => a.isCorrect).length}
        onClose={() => setShowAIModal(false)}
        onViewErrors={() => Taro.switchTab({ url: '/pages/errorbook/index' })}
        onAskQuestion={() => Taro.showToast({ title: 'AI问答模块开发中', icon: 'none' })}
      />
    </View>
  );
}
