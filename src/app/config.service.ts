import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IConfig } from './IConfig';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configURL = 'assets/config.json';
  config: IConfig;

  constructor(private http: HttpClient) {
    this.getJSON(this.configURL).subscribe(data => {
      this.config = data;
      document.title = this.config.pageTitle;
    });
  }

  public getJSON(url: string): Observable<any> {
    return this.http.get(url);
  }
}
