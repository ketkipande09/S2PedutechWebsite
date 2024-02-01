import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  currentRoute: string | undefined;
  constructor(private toastrService: ToastrService, private router: Router,private spinner: NgxSpinnerService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // extract error message from http body if an error occurs
    return next.handle(request).pipe(
      catchError((errorResponse) => {
        this.spinner.hide();
        if (errorResponse instanceof HttpErrorResponse) {
          switch (errorResponse.status) {
            case 401: // login
              // redirect to login page with the return url
              this.router.events
                .pipe(filter((event: any) => event instanceof NavigationEnd))
                .subscribe((event) => {
                  this.currentRoute = event['url'];
                });
              this.router.navigate(['/login'], { queryParams: { returnUrl: this.currentRoute } });

              break;
            case 400: // forbidden
              // // show server bad request message
              console.log(errorResponse.error.error.error_params);
              if (errorResponse.error?.error?.errors) {
                errorResponse.error.error.errors.forEach((x: any) => {
                  this.toastrService.error(x);
                });
              }
              if (errorResponse.error?.error?.error_params) {
                errorResponse.error.error.error_params.forEach((x: any) => {
                  this.toastrService.error(x.msg);
                });

              }
              break;
              case 500: // Internal Server Error
              // // show server bad request message
              // console.log(errorResponse.error);
              // console.log(errorResponse.error.error.errors);
              // console.log(errorResponse.error.error.error_params);
              // this.toastrService.error(errorResponse.error?.message);
              if (errorResponse.error?.error?.errors) {
                errorResponse.error.error.errors.forEach((x: any) => {
                  this.toastrService.error(x);
                });
              }
              if (errorResponse.error?.error?.error_params) {
                errorResponse.error.error.error_params.forEach((x: any) => {
                  this.toastrService.error(x.msg);
                });

              }
              break;
          }
        } else {
        }

        return throwError(errorResponse.error);
      })
    );
  }
}

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true
};
