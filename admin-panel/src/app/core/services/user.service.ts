import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {map, catchError} from "rxjs/operators";
import {throwError} from "rxjs";
import {environment} from "../../../environments/environment";
import {User} from "../models/user.interface";

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(environment.apiEndpoint + '/users').pipe(
      map((users: any) => {
        return users.data;
      }),
      catchError(this.handleErrorObservable)
    );
  }

  getById(_id: string) {
    return this.http.get<User>(environment.apiEndpoint + '/user/' + _id).pipe(
      map((user: any) => {
        return user.data;
      }),
      catchError(this.handleErrorObservable)
    );
  }
  getAllUsersByRoleCare(obj: any) {
    // console.log(obj);
    return this.http
      .get<User>(
        environment.apiEndpoint +
          '/getAllUsersByRole/' +
          obj.page +
          '/' +
          obj.pageSize
      )
      .pipe(
        map((user: any) => {
          return user;
        }),
        catchError(this.handleErrorObservable)
      );
  }
  //  search user
  userSearch(searchString: string, role: string) {
    return this.http
      .get(environment.apiEndpoint + '/userSearch/' + searchString + '/' + role)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleErrorObservable)
      );
  }
  // gets2pUser(): User {
  //     if (localStorage.getItem("s2pUser")) {
  //         const user = JSON.parse(localStorage.getItem('s2pUser') || '');
  //         return user;
  //     }
  // }
  gets2pUser() {
    if (localStorage.getItem('s2pUser')) {
      const user = JSON.parse(localStorage.getItem('s2pUser') || '');
      return user;
    }
  }

  create(user: User) {
    return this.http.post(environment.apiEndpoint + '/users', user).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );
  }

  update(user: User) {
    return this.http
      .put<User>(environment.apiEndpoint + '/user/' + user._id, user)
      .pipe(
        map((user: any) => {
          return user.data;
        }),
        catchError(this.handleErrorObservable)
      );
  }

  changePassword(id: string, password: any, oldPassword: any) {
    return this.http
      .put(environment.apiEndpoint + '/user/changepassword/' + id, {
        password: password,
        oldPassword: oldPassword,
      })
      .pipe(
        map((res: any) => res),
        catchError(this.handleErrorObservable)
      );
  }

  delete(_id: string) {
    return this.http.delete(environment.apiEndpoint + '/user/' + _id).pipe(
      map((res: any) => res.data),
      catchError(this.handleErrorObservable)
    );
  }

  resendMail(user: User) {
    return this.http.post(environment.apiEndpoint + '/resendMail', user).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );
  }
  verifyOtp(otp: any) {
    console.log(environment.apiEndpoint + '/verify/' + otp);
    return this.http.get(environment.apiEndpoint + '/verify/' + otp).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );
  }
  private handleErrorObservable(error: HttpErrorResponse) {
    return throwError(error);
  }

 
}
