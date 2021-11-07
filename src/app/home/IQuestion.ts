import { IAnswer } from './IAnswer';

export interface IQuestion {
  id?: number;
  name: string;
  type: string;
  orientation?: string;
  useDisabled?: boolean;
  answers: [IAnswer];
  disabledAnswers?: [IAnswer];
  answer: string;
}
