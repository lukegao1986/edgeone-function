import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import { QUESTIONS } from '@/data/questions';
import type { UserAnswer } from '@/types';
import styles from './index.module.scss';

export default function PracticePage() {
  const router = useRouter();
  const subjectId = router.params.subjectId || 'japanese';
  const subject = SUBJECTS.find(s => s.id === subjectId) || SUBJECTS[0];
  const questions = useMemo(() => QUESTIONS.filter(q => q.subjectId === subjectId), [subjectId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(k => questions.some(q => q.id === k)).length;

  const existingAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const isBookmarked = existingAnswer?.isBookmarked ?? false;

  const handleSelectOption = useCallback((index: number) => {
    if (showAnswer || !currentQuestion) return;
    setSelectedOption(index);
  }, [showAnswer, currentQuestion]);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setShowAnswer(true);
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedIndex: selectedOption,
        isCorrect,
        isBookmarked: prev[currentQuestion.id]?.isBookmarked || !isCorrect
      }
    }));

    if (!isCorrect) {
      Taro.showToast({ title: '回答错误，已加入错题本', icon: 'none' });
    } else {
      Taro.showToast({ title: '回答正确！', icon: 'success' });
    }
  }, [selectedOption, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setShowSubmitDialog(true);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQ = questions[currentIndex - 1];
      const prevAns = answers[prevQ?.id];
      if (prevAns) {
        setSelectedOption(prevAns.selectedIndex);
        setShowAnswer(true);
      } else {
        setSelectedOption(null);
        setShowAnswer(false);
      }
    }
  }, [currentIndex, questions, answers]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    const willBookmark = !isBookmarked;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || { questionId: currentQuestion.id, selectedIndex: -1, isCorrect: false }),
        isBookmarked: willBookmark
      }
    }));
    Taro.showToast({ title: willBookmark ? '已收藏到错题本' : '已取消收藏', icon: 'none' });
  }, [currentQuestion, isBookmarked]);

  const handleSubmitAll = useCallback(() => {
    setShowSubmitDialog(false);
    setShowAnswer(true);
    setShowReport(true);
  }, []);

  const handleReportClose = () => {
    setShowReport(false);
    Taro.navigateBack();
  };

  const handleJumpToQuestion = useCallback((idx: number) => {
    setCurrentIndex(idx);
    const q = questions[idx];
    const ans = answers[q?.id];
    if (ans) {
      setSelectedOption(ans.selectedIndex);
      setShowAnswer(true);
    } else {
      setSelectedOption(null);
      setShowAnswer(false);
    }
  }, [questions, answers]);

  const getOptionStyle = (index: number) => {
    if (!showAnswer || selectedOption === null) {
      if (selectedOption === index) return styles.optionSelected;
      return styles.optionNormal;
    }
    if (index === currentQuestion.correctIndex) return styles.optionCorrect;
    if (index === selectedOption && !existingAnswer?.isCorrect) return styles.optionWrong;
    return styles.optionDisabled;
  };

  const letters = ['A', 'B', 'C', 'D'];

  const getQuestionStatus = (qId: string) => {
    const ans = answers[qId];
    if (!ans) return 'unanswered';
    return ans.isCorrect ? 'correct' : 'wrong';
  };

  if (!currentQuestion) {
    return (
      <View className={styles.emptyContainer}>
        <Text>暂无题目</Text>
        <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>返回大厅</View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      {/* 顶部极简导航 */}
      <View className={styles.navbar}>
        <View className={styles.navLeft} onClick={() => Taro.navigateBack()}>
          <Text className={styles.backIcon}>{'<'}</Text>
          <Text className={styles.navTitle}>{subject.name} - {currentQuestion.category}</Text>
        </View>
      </View>

      <View className={styles.body}>
        {/* 左侧题号导航栏 (宽屏显示) */}
        <View className={styles.sidebar}>
          <View className={styles.progressSection}>
            <Text className={styles.progressTitle}>答题进度</Text>
            <View className={styles.progressBar}>
              <View className={styles.progressInner} style={{ width: `${progress}%` }} />
            </View>
            <Text className={styles.progressText}>{answeredCount} / {totalQuestions} 题</Text>
          </View>
          <ScrollView className={styles.gridScroll} scrollY>
            <View className={styles.questionGrid}>
              {questions.map((q, i) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = i === currentIndex;
                return (
                  <View
                    key={q.id}
                    onClick={() => handleJumpToQuestion(i)}
                    className={classnames(
                      styles.gridItem,
                      isCurrent && styles.gridCurrent,
                      status === 'correct' && styles.gridCorrect,
                      status === 'wrong' && styles.gridWrong
                    )}
                  >
                    <Text>{i + 1}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 右侧主答题区 */}
        <ScrollView className={styles.mainArea} scrollY>
          <View className={styles.questionContent}>
            <View className={styles.qHeader}>
              <Text className={styles.qIndex}>第 {currentIndex + 1} 题（共 {totalQuestions} 题）</Text>
              {showAnswer && existingAnswer && (
                <Text className={classnames(styles.qStatus, existingAnswer.isCorrect ? styles.textSuccess : styles.textError)}>
                  {existingAnswer.isCorrect ? '✅ 回答正确' : '❌ 回答错误'}
                </Text>
              )}
            </View>

            <View className={styles.stemCard}>
              <Text className={styles.stemText}>{currentQuestion.stem}</Text>
            </View>

            <View className={styles.optionsList}>
              {currentQuestion.options.map((option, index) => (
                <View
                  key={index}
                  className={classnames(styles.optionItem, getOptionStyle(index))}
                  onClick={() => handleSelectOption(index)}
                >
                  <View className={styles.optionLetter}>
                    <Text>{letters[index]}</Text>
                  </View>
                  <Text className={styles.optionText}>{option}</Text>
                </View>
              ))}
            </View>

            {showAnswer && (
              <View className={styles.explanationCard}>
                <Text className={styles.expTitle}>📖 答案解析</Text>
                <View className={styles.divider} />
                <Text className={styles.expCorrect}>✅ 正确答案：{letters[currentQuestion.correctIndex]}</Text>
                {selectedOption !== null && selectedOption !== currentQuestion.correctIndex && (
                  <Text className={styles.expWrong}>❌ 你的答案：{letters[selectedOption]}</Text>
                )}
                <Text className={styles.expContent}>{currentQuestion.explanation}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 底部操作条 */}
      <View className={styles.bottomBar}>
        <View 
          className={classnames(styles.btnPrev, currentIndex === 0 && styles.btnDisabled)} 
          onClick={handlePrev}
        >
          <Text>上一题</Text>
        </View>
        
        <View className={styles.bottomCenter}>
          <View className={styles.bookmarkBtn} onClick={handleToggleBookmark}>
            <Text style={{ color: isBookmarked ? '#F5A623' : '#9CA3B0' }}>
              {isBookmarked ? '★ 已收藏' : '☆ 收藏'}
            </Text>
          </View>
          {!showAnswer && (
            <View 
              className={classnames(styles.btnSubmit, selectedOption === null && styles.btnDisabled)} 
              onClick={handleSubmitAnswer}
            >
              <Text>提交答案</Text>
            </View>
          )}
        </View>

        <View className={styles.btnNext} onClick={handleNext}>
          <Text>{currentIndex === totalQuestions - 1 ? '交卷' : '下一题'}</Text>
        </View>
      </View>

      {/* 交卷弹窗 (简易实现) */}
      {showSubmitDialog && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>确认交卷</Text>
            <Text className={styles.modalText}>已作答: {answeredCount} / {totalQuestions}</Text>
            <View className={styles.modalActions}>
              <View className={styles.modalBtnCancel} onClick={() => setShowSubmitDialog(false)}><Text>继续做题</Text></View>
              <View className={styles.modalBtnConfirm} onClick={handleSubmitAll}><Text>确认交卷</Text></View>
            </View>
          </View>
        </View>
      )}

      {/* 练习报告弹窗 */}
      {showReport && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>练习报告</Text>
            <Text className={styles.modalText}>共 {totalQuestions} 题，已作答 {answeredCount} 题</Text>
            <View className={styles.modalActions}>
              <View className={styles.modalBtnConfirm} onClick={handleReportClose}><Text>返回大厅</Text></View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
