import { ITestConfig } from './ITestConfig';

export interface IConfig {
  title: string;
  tests: [ITestConfig];
}
