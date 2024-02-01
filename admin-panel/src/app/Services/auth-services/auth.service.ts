import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { map, catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { LocalStorageService } from 'angular-web-storage';
// import { state } from "@angular/animations";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    // user: User;
    constructor(private http: HttpClient, public router: Router) { }

    createUser(userPayload: any) {
        return this.http.post(environment.apiEndpoint + "user/signup", userPayload);
    }

    login(loginPayload: any) {
        return this.http.post(environment.apiEndpoint + "user/login", loginPayload).pipe(
            map((res: any) => res),
            catchError(this.handleErrorObservable)
        );
    }
    setCurrentUser() {
        return JSON.parse(localStorage.getItem('s2pUser') || '');
    }
    getCurrentUser() {
        let x: any = localStorage.getItem('s2pUser');
        return JSON.parse(x)
    }
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // get isLoggedIn(): boolean {
    //     const user = JSON.parse(localStorage.getItem("s2pUser") || '{}');
    //     return user !== null;
    // }
    getUserRole() {
        let currentUser = JSON.parse(localStorage.getItem('s2pUser') || '');
        return currentUser.payload.roleName
    }
    logout(): void {
        // remove user from local storage to log user out
        if (typeof window !== "undefined") {
            const s2pUser = JSON.parse(localStorage.getItem("s2pUser") || '{}');
            console.log(s2pUser);
            this.router.navigateByUrl("login");
            localStorage.removeItem("s2pUser");
        }
    }
    forgetPassword(payload: any) {
        return this.http.post(environment.apiEndpoint + "/user/forgot-password", payload).pipe(
            map((res: any) => res),
            catchError(this.handleErrorObservable)
        );
    }
    resetPass(payload: any) {
        return this.http.post(environment.apiEndpoint + "/user/reset-password", payload).pipe(
            map((res: any) => res),
            catchError(this.handleErrorObservable)
        );
    }
    setPass(payload: any) {
        console.log(payload);
      
        return this.http.post(environment.apiEndpoint + `/user/set-password`, payload);
        // .pipe(
        //     map((res: any) => res),
        //     catchError(this.handleErrorObservable)
    }
    private handleErrorObservable(error: HttpErrorResponse) {
        return throwError(error);
    }




}