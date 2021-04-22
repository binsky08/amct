import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ITestConfig } from '../ITestConfig';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tests: [ITestConfig];
  title: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    (async () => {
      for (let j = 0; j < 10; j++) {
        await this.delay(300);
        if (configService.config !== undefined) {
          break;
        }
      }
      this.title = configService.config.title;
      this.tests = configService.config.tests;
    })();
  }

  ngOnInit(): void {
  }

  delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
