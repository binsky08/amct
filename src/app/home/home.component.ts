import { Component, OnInit } from '@angular/core';
import { IQuestion } from './IQuestion';
import { HttpClient } from '@angular/common/http';
import { IAnswer } from './IAnswer';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private questionURL = 'assets/questions.json';
  title: string;
  questions: [IQuestion];
  radioAnswers: [string];
  checkboxAnswers: [[boolean]];
  showSolution = false;
  rightAnswers: number;
  possibleAnswersCounter: number;

  constructor(private http: HttpClient, private config: ConfigService) {
    (async () => {
      for (let j = 0; j < 10; j++) {
        await this.delay(300);
        if (config.config !== undefined) {
          break;
        }
      }
      this.title = config.config.title;
      config.getJSON(this.questionURL).subscribe(data => {
        this.questions = data;
        this.radioAnswers = [''];
        this.checkboxAnswers = [[false]];
        for (let i = 0; i < data.length; i++) {
          this.radioAnswers[i] = '';
          this.checkboxAnswers[i] = [false];
          for (let k = 0; k < data[i].answers.length; k++) {
            this.checkboxAnswers[i][k] = false;
          }
        }
        // console.log(this.answers);
      });
    })();
  }

  delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit(): void {
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
}
