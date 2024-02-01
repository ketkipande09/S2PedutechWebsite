import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
// import {NgxSpinner} from "ngx-spinner";

// import { NgxSpinner } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ValidationService } from "src/app/core/components";
import { HttpInterceptor } from "@angular/common/http";
import { AuthService } from "src/app/Services/auth-services/auth.service";


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  submitted = false;
  userId: any;
  params: any;
  c:any;
  show: string = 'password';
  Show: string = 'password';
  SHow: string = 'password';

  constructor(
      private formBuilder: FormBuilder,
      private actRouter: ActivatedRoute,
      //   private imageService: ImageService,
      private router: Router,
      // private spinner: NgxSpinner,
      private toastService: ToastrService,
      //   private validationService: ValidationService,
      public authService: AuthService,
      // public inceptor: HttpInterceptor
  ) { }

  ngOnInit(): void {
    this.actRouter.queryParams.subscribe(params => {
      this.params = params;

    
      this.userId = params["id"];
      console.log(this.userId);
    });


  };




  rpForm = new FormGroup({
    id: new FormControl(),
    oldPassword: new FormControl(),
    newPassword: new FormControl(),
    confirmNewPassword : new FormControl()
    
  
  });


  resetPass(payload:any)
  {
  let userObj = {
    id: this.userId, 
    oldPassword: this.rpForm.value.oldPassword,
    newPassword: this.rpForm.value.newPassword,
  }
  //  console.log(userObj)
    this.authService.resetPass(userObj).subscribe(
      (success: any) => {
        console.log(success);
        this.toastService.success('Password Reset Successfully!');
        if (typeof window !== "undefined") {
          localStorage.setItem("s2pUser", JSON.stringify(success["result"]));
        }
      },
      (error: any) => {
        console.log(error,"login error");
        this.toastService.error('Invalid Credentials !');
      }
    );
  }

 
  password_show() {
    this.show = 'text';
  }
  password_hide() {
    this.show = 'password';
  }
  password_Show() {
    this.Show = 'text';
  }
  password_Hide() {
    this.Show = 'password';
  }
  Password_Show() {
    this.SHow = 'text';
  }
  Password_Hide() {
    this.SHow = 'password';
  }



add(){
  this.router.navigate(['../../user/user-list']);
}
  
}
