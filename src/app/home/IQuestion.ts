import { IAnswer } from './IAnswer';

export interface IQuestion {
  name: string;
  type: string;
  answers: [IAnswer];
  answer: string;
}
