import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SignupComponent } from "./signup/signup.component";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";
import { LoginComponent } from "./login/login.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { SetPasswordComponent } from "./set-password/set-password.component";
import { LogoutComponent } from "./logout/logout.component";


const authRoutes: Routes =[

  {
    path: '',
    data: {
      title: 'Auth'
    },
    children: [
      {
        path : 'login',
         component : LoginComponent
      },
      {
        path : 'forget-pwd',
         component : ForgetPasswordComponent
      },
      {
        path : 'reset-pwd',
         component : ResetPasswordComponent
      },
      {
        path : 'set-pwd',
         component : SetPasswordComponent
      },
      {
        path : 'logout',
         component : LogoutComponent
      },
      {
        path : 'signup',
         component : SignupComponent
      },
       {
         path : '', redirectTo :'login', pathMatch :'full'
      },
    ]
  },


  ];
@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
  })
  
export class AuthRoutingModule {}