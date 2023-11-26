export interface uploadFormDataType {
  formName: string;
  isSingleChoice: boolean;
  isRandomized: boolean;
  questions: questionsType[];
  correctAnswer: number[][];
}

export interface verifyFormType {
  fid: number;
  answers: number[][];
  formIndex: string;
}

export interface questionsType {
  question: string;
  options: string[];
}

export interface formHistoryItems {
  fid: string;
  score: number;
  data: formHistoryItem[];
}

export interface formHistoryItem {
  errorQuestionIndex: number;
  errorAnswerIndexs: number[];
}

export type questionIndexType = number;
export type optionsIndexType = number[];
export type shuffledIndex = [questionIndexType, optionsIndexType];
