import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,
   CanActivate,
    RouterStateSnapshot,
    UrlTree }
     from '@angular/router';
import { Observable } from 'rxjs';
// import { Injectable } from "@angular/core";

import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth-services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router) {}
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean | Promise<boolean> {
      var isAuthenticated = this.authService.isLoggedIn();
      // console.log("isAuthenticated",isAuthenticated);
      
      if (!isAuthenticated) {
          this.router.navigate(['./login']);
      }
      return isAuthenticated;
  }
}
