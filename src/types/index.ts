export type SubjectId = 'japanese' | 'bunso' | 'math1' | 'math2' | 'science';

export interface Subject {
  id: SubjectId;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}
