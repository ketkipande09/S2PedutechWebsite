import {Injectable} from "@angular/core";
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    if (typeof window !== 'undefined') {
       let user:any = localStorage.getItem('s2pUser');
      const s2pUser = JSON.parse(user);
      // console.log("s2pUser",s2pUser);
      if (s2pUser && s2pUser.token) {
        request = request.clone({
          setHeaders: {
            authorization: `jwt ${s2pUser.token}`,
            // role: emergeUser.role
          },
        });
      }
    }
    return next.handle(request);
  }
}

export const JwtInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true,
};
