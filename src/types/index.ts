export type SubjectId = 'japanese' | 'bunso' | 'math1' | 'math2' | 'science';

export interface Subject {
  id: SubjectId;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  category: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
