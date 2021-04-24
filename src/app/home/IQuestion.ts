import { IAnswer } from './IAnswer';

export interface IQuestion {
  id?: number;
  name: string;
  type: string;
  orientation?: string;
  answers: [IAnswer];
  answer: string;
}
