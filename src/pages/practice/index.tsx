import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import { QUESTIONS } from '@/data/questions';
import Navbar from '@/components/Navbar';
import styles from './index.module.scss';

export default function PracticePage() {
  const router = useRouter();
  const subjectId = router.params.subjectId || 'japanese';
  
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const questions = useMemo(() => QUESTIONS.filter(q => q.subjectId === subjectId), [subjectId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // 记录答题状态，格式: { [questionId]: { selectedIndex, isCorrect } }
  const [answers, setAnswers] = useState<Record<string, { selectedIndex: number, isCorrect: boolean }>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const existingAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  useEffect(() => {
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selectedIndex);
      setShowAnswer(true);
    } else {
      setSelectedOption(null);
      setShowAnswer(false);
    }
    // Mock 收藏状态
    setIsBookmarked(false);
  }, [currentIndex, existingAnswer]);

  const handleSelectOption = (index: number) => {
    if (showAnswer || !currentQuestion) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { selectedIndex: selectedOption, isCorrect }
    }));
    
    setShowAnswer(true);

    if (isCorrect) {
      Taro.showToast({ title: '回答正确！', icon: 'success' });
    } else {
      Taro.showToast({ title: '回答错误，已加入错题本', icon: 'none' });
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Taro.showModal({
        title: '练习完成',
        content: `你已完成所有题目。共 ${totalQuestions} 题，答对 ${Object.values(answers).filter(a => a.isCorrect).length} 题。`,
        confirmText: '返回大厅',
        success: function (res) {
          if (res.confirm) {
            Taro.navigateBack();
          }
        }
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Taro.showToast({ title: !isBookmarked ? '已收藏到错题本' : '已取消收藏', icon: 'success' });
  };

  const handleJumpToQuestion = (idx: number) => {
    setCurrentIndex(idx);
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
                <Text className={styles.stemText}>{currentQuestion.stem}</Text>
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
                    <Text className={styles.optionText}>{option}</Text>
                    
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
                  <Text className={styles.expContent}>{currentQuestion.explanation}</Text>
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
              <View className={styles.bookmarkBtn} onClick={handleToggleBookmark}>
                <Text className={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
                <Text className={classnames(styles.bookmarkText, isBookmarked && styles.textWarning)}>
                  {isBookmarked ? '已收藏' : '收藏'}
                </Text>
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
    </View>
  );
}
