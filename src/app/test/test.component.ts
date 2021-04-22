import { Component, OnInit } from '@angular/core';
import { IAnswer } from '../home/IAnswer';
import { IQuestion } from '../home/IQuestion';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ITestConfig } from '../ITestConfig';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  private loadedTestConfig: ITestConfig;
  questionPool: [IQuestion];
  questions: [IQuestion];
  radioAnswers: [string];
  checkboxAnswers: [[boolean]];
  showSolution = false;
  title = '';
  rightAnswers: number;
  possibleAnswersCounter: number;
  startTest = false;
  numberOfRandomQuestions: number;

  constructor(private http: HttpClient, private config: ConfigService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    (async () => {
      for (let j = 0; j < 10; j++) {
        await this.delay(300);
        if (this.config.config !== undefined) {
          break;
        }
      }

      this.route.paramMap.subscribe(params => {
        const routeParams: any = params;
        if (routeParams.params.id) {
          this.loadTest(routeParams.params.id);
        } else {
          // go back?
        }
      });
    })();
  }

  loadTest(id: string): void {
    for (const test of this.config.config.tests) {
      if (test.uniqueIdentifier === id) {
        this.loadedTestConfig = test;
        this.title = this.loadedTestConfig.title;
        this.numberOfRandomQuestions = this.loadedTestConfig.numberOfRandomQuestions;
        this.config.getJSON(this.loadedTestConfig.questions).subscribe(data => {
          this.questionPool = data;
        });
        break;
      }
    }
  }

  startWithRandom(num: number): void {
    const randomNumbers = [];
    const selectedQuestions = [];
    if (num > this.questionPool.length) {
      num = this.questionPool.length;
    }
    for (let i = 0; i < num; i++) {
      const rand = Math.floor(Math.random() * this.questionPool.length);
      if (randomNumbers.includes(rand)) {
        i--;
        continue;
      }
      randomNumbers.push(rand);
      selectedQuestions.push(this.questionPool[rand]);
    }
    this.initiateQuestions(selectedQuestions);
  }

  startWithAll(): void {
    this.initiateQuestions(this.questionPool);
  }

  initiateQuestions(questions): void {
    this.questions = questions;
    this.radioAnswers = [''];
    this.checkboxAnswers = [[false]];
    for (let i = 0; i < questions.length; i++) {
      this.radioAnswers[i] = '';
      this.checkboxAnswers[i] = [false];
      for (let k = 0; k < questions[i].answers.length; k++) {
        this.checkboxAnswers[i][k] = false;
      }
    }
    this.startTest = true;
  }

  delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  solve(): void {
    this.showSolution = true;
    this.rightAnswers = 0;
    this.possibleAnswersCounter = 0;
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      if (question.type === 'radio') {
        this.possibleAnswersCounter++;
        if (this.radioAnswers[i] === this.getRightRadioAnswer(question.answers)) {
          this.rightAnswers++;
        }
      }
      if (question.type === 'checkbox') {
        for (let j = 0; j < question.answers.length; j++) {
          this.possibleAnswersCounter++;
          if (this.checkboxAnswers[i][j] && question.answers[j].value ||
            !this.checkboxAnswers[i][j] && !question.answers[j].value) {
            this.rightAnswers++;
          }
        }
      }
    }
  }

  getRightRadioAnswer(answers: [IAnswer]): string {
    for (const answer of answers) {
      if (answer.value === true) {
        return answer.text;
      }
    }
  }

  checkRadioSolution(question: IQuestion, answer: IAnswer, id: number): boolean {
    return answer.value && this.radioAnswers[id] === answer.text || (!answer.value && this.radioAnswers[id] !== answer.text);
  }

  checkCheckboxSolution(question: IQuestion, answer: IAnswer, id: number, innerId: number): boolean {
    return answer.value && this.checkboxAnswers[id][innerId] ||
      (!answer.value && !this.checkboxAnswers[id][innerId]);
  }

  reset(): void {
    this.startTest = false;
    this.showSolution = false;
    this.rightAnswers = undefined;
    this.possibleAnswersCounter = undefined;
    this.questions = undefined;
    this.radioAnswers = undefined;
    this.checkboxAnswers = undefined;
  }
}
