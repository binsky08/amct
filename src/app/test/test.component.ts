import { Component, OnInit } from '@angular/core';
import { IAnswer } from '../home/IAnswer';
import { IQuestion } from '../home/IQuestion';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ITestConfig } from '../ITestConfig';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  private loadedTestConfig: ITestConfig;
  questionPool: [IQuestion];
  questions: [IQuestion];
  dropListSource: [IQuestion];
  radioAnswers: [string];
  checkboxAnswers: [[boolean]];
  showSolution = false;
  title = '';
  rightAnswers: number;
  possibleAnswersCounter: number;
  startTest = false;
  numberOfRandomQuestions: number;

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX – The Rise of Skywalker'
  ];

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
    // @ts-ignore
    this.dropListSource = [];
    this.radioAnswers = [''];
    this.checkboxAnswers = [[false]];
    for (let i = 0; i < questions.length; i++) {
      if (this.questions[i].type === 'dropList') {
        const tmpQuestion: IQuestion = JSON.parse(JSON.stringify(this.questions[i]));  // clone array
        tmpQuestion.id = i;
        tmpQuestion.answers = this.randomizeAnswers(tmpQuestion.answers);
        this.dropListSource.push(tmpQuestion);
      } else {
        this.radioAnswers[i] = '';
        this.checkboxAnswers[i] = [false];
        for (let k = 0; k < questions[i].answers.length; k++) {
          this.checkboxAnswers[i][k] = false;
        }
      }
    }
    this.startTest = true;
  }

  randomizeAnswers(entryArray: [IAnswer]): [IAnswer] {
    const originalArray = JSON.parse(JSON.stringify(entryArray));
    // @ts-ignore
    const newArray: [IAnswer] = [];
    while (originalArray.length !== 0) {
      const randomIndex = Math.floor(Math.random() * originalArray.length);
      newArray.push(originalArray[randomIndex]);
      originalArray.splice(randomIndex, 1);
    }
    return newArray;
  }

  delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDropListSourcePosition(questionId: number): number {
    for (let i = 0; i < this.dropListSource.length; i++) {
      if (this.dropListSource[i].id === questionId) {
        return i;
      }
    }
    return null;
  }

  drop(questionPosition: number, event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.dropListSource[this.getDropListSourcePosition(questionPosition)].answers, event.previousIndex, event.currentIndex);
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
      if (question.type === 'dropList') {
        const orderedList = this.dropListSource[this.getDropListSourcePosition(i)];
        for (let j = 0; j < question.answers.length; j++) {
          this.possibleAnswersCounter++;
          if (question.answers[j].text === orderedList.answers[j].text && question.answers[j].value && orderedList.answers[j].value) {
            // right position in orderedList and the answer is marked as possible with value = true
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

  checkDropListSolution(question: IQuestion, answer: IAnswer, id: number, index: number): boolean {
    const orderedList = this.dropListSource[this.getDropListSourcePosition(id)];
    return question.answers[index].text === orderedList.answers[index].text
      && question.answers[index].value && orderedList.answers[index].value;
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
