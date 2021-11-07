import { Component, OnInit } from '@angular/core';
import { IAnswer } from '../home/IAnswer';
import { IQuestion } from '../home/IQuestion';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ITestConfig } from '../ITestConfig';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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
        if (this.questions[i].useDisabled !== undefined && this.questions[i].useDisabled === true) {
          tmpQuestion.disabledAnswers = this.randomizeAnswers(tmpQuestion.answers);
          // @ts-ignore
          tmpQuestion.answers = [];
        } else {
          tmpQuestion.answers = this.randomizeAnswers(tmpQuestion.answers);
        }
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

  drop(questionPosition: number, event: CdkDragDrop<string[]>, dropToDisabled: boolean): void {
    if (event.previousContainer === event.container) {
      if (dropToDisabled === true) {
        // tslint:disable-next-line:max-line-length
        moveItemInArray(this.dropListSource[this.getDropListSourcePosition(questionPosition)].disabledAnswers, event.previousIndex, event.currentIndex);
      } else {
        // tslint:disable-next-line:max-line-length
        moveItemInArray(this.dropListSource[this.getDropListSourcePosition(questionPosition)].answers, event.previousIndex, event.currentIndex);
      }
    } else {  // dropList with disabled items
      if (dropToDisabled === true) {
        transferArrayItem(this.dropListSource[this.getDropListSourcePosition(questionPosition)].answers,
          this.dropListSource[this.getDropListSourcePosition(questionPosition)].disabledAnswers,
          event.previousIndex,
          event.currentIndex);
      } else {
        transferArrayItem(this.dropListSource[this.getDropListSourcePosition(questionPosition)].disabledAnswers,
          this.dropListSource[this.getDropListSourcePosition(questionPosition)].answers,
          event.previousIndex,
          event.currentIndex);
      }
    }
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
        let valueTrueIndexForUseDisabled = -1;
        for (let j = 0; j < question.answers.length; j++) {
          this.possibleAnswersCounter++;

          if (question.useDisabled) {
            if (question.answers[j].value) {
              valueTrueIndexForUseDisabled++;

              // const orderedAnswer = question.answers[j];
              const orderedAnswer = this.getAllAnswersWithTrueValue(orderedList.answers)[valueTrueIndexForUseDisabled];
              if (valueTrueIndexForUseDisabled >= 0 && orderedAnswer !== undefined &&
                this.checkDropListSolution(question, orderedAnswer, i, undefined, true)) {
                this.rightAnswers++;
              }
            } else {
              // answer is false and should be in the disabledAnswers list. check this here.
              for (const disabledAnswer of orderedList.disabledAnswers) {
                if (disabledAnswer.text === question.answers[j].text) {
                  this.rightAnswers++;
                }
              }
            }
          } else {
            if (question.answers[j].value && orderedList.answers[j].value && question.answers[j].text === orderedList.answers[j].text) {
              // right position in orderedList and the answer is marked as possible with value = true
              this.rightAnswers++;
            }
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

  getPositionIndexIgnoringFalseValues(text: string, answers: [IAnswer]): number {
    let trueValuesCounter = -1;
    for (const answer of answers) {
      if (answer.value) {
        trueValuesCounter++;
      }
      if (answer.text === text) {
        break;
      }
    }
    return trueValuesCounter;
  }

  getAllAnswersWithTrueValue(answers: [IAnswer]): [IAnswer] {
    // @ts-ignore
    const arr: [IAnswer] = [];
    for (const answer of answers) {
      if (answer.value) {
        arr.push(answer);
      }
    }
    return arr;
  }

  checkDropListSolution(question: IQuestion, answer: IAnswer, id: number, index: number, useDisabledState: boolean = false): boolean {
    const orderedList = this.dropListSource[this.getDropListSourcePosition(id)];

    if (useDisabledState === true) {
      for (const originalAnswer of question.answers) {
        if (originalAnswer.text === answer.text) {
          return originalAnswer.value && this.getPositionIndexIgnoringFalseValues(answer.text, question.answers)
            === this.getPositionIndexIgnoringFalseValues(answer.text, orderedList.answers);
        }
      }
      return false;
    }

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
