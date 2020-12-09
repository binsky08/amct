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
  answers: [string];
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
        this.answers = [''];
        for (let i = 0; i < data.length; i++) {
          this.answers[i] = '';
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
        if (this.answers[i] === this.getRightRadioAnswer(question.answers)) {
          this.rightAnswers++;
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

  checkSolution(question: IQuestion, answer: IAnswer, id: number): boolean {
    return answer.value && this.answers[id] === answer.text || (!answer.value && this.answers[id] !== answer.text);
  }
}
