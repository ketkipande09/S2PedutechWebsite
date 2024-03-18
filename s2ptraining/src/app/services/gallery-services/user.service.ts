import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { catchError, map, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class UserService {
  user:any;
  constructor(private http: HttpClient, public router: Router
  ) {
    this.user = localStorage.getItem('s2pUser');
    this.user = JSON.parse(this.user);
    const headers = new Headers();
  }

  private handleErrorObservable(error: HttpErrorResponse) {
    return throwError(error);
  }
    getAllSliders(){
      return this.http.get(environment.apiEndpoint+ `/slider/getListing`)
    }
}


