import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { UserModule } from './user/user.module';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './auth-module/login/login.component';
import { SignupComponent } from './auth-module/signup/signup.component';
import { AuthGuard } from './services/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    children: [],
    
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.module').then((m) => m.UserModule),
          canActivate: [AuthGuard]
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./modules/modules.module').then((m) => m.ModulesModule),
          canActivate: [AuthGuard]
      },
      {
        path: 'event',
        loadChildren: () =>
          import('./event/event.module').then((m) => m.EventModule),
          // canActivate: [AuthGuard]
      },
      {
        path: 'feedback',
        loadChildren: () =>
          import('./feedback/feedback.module').then((m) => m.FeedbackModule),
          canActivate: [AuthGuard]
      },
      {
        path: 'enquiry',
        loadChildren: () =>
          import('./enquiry/enquiry.module').then((m) => m.EnquiryModule),
          canActivate: [AuthGuard]
      },
      
      {
        path: 'transition',
        loadChildren: () =>
          import('./transition-course/transition-course.module').then(
            (m) => m.TransitionCourseModule
          ),
          canActivate: [AuthGuard]
      },
    ],
  },
  {
    path:"auth",
    loadChildren:()=>import("./auth-module/auth-module.module").then(m=>m.AuthModuleModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth-module/auth-module.module').then(
        (m) => m.AuthModuleModule
      ),
      // canActivate: [AuthGuard]
  },
  // {
  //   path: 'auth',
  //   loadChildren: () =>
  //     import('./auth-module/auth-module.module').then(
  //       (m) => m.AuthModuleModule
  //     ),
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
