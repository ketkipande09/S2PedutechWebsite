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
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  show: string = 'password';
  Show: string = 'password';
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private actRouter: ActivatedRoute,
    //   private imageService: ImageService,
    private router: Router,
    // private spinner: NgxSpinner,
    private toastService: ToastrService,
      private validationService: ValidationService,
    public authService: AuthService,
    // public inceptor: HttpInterceptor
  ) { }

  ngOnInit(): void {
    this.actRouter.queryParams.subscribe((params: any) => {
    console.log(params);
    this.userId = params.sub;
    this.rPin = params.pin;
    console.log(this.userId, this.rPin);
    
    });
  }
  userId: any;
  rPin: any;
  params: any;
  c:any;
  userPin : any;

  

  spForm = this.formBuilder.group({
    id: new FormControl(),
  resetPin: new FormControl(),
    password: new FormControl('',[Validators.required,
                                this.validationService.noWhitespaceValidator]),
    confirmPassword : new FormControl('',[Validators.required])
  },
  {
    validator: this.validationService.MustMatch(
      'password',
      'confirmPassword'
    ),
  }
  );

  // setPas()
  // {
    
  //   console.log(this.spForm.value);
  //   this.authService.setPass(this.spForm.value).subscribe(
  //     (success: any) => {
  //       console.log(success);
  //       if (typeof window !== "undefined") {
  //         localStorage.setItem("s2pUser", JSON.stringify(success["result"]));
  //       }
  //       ;
  //       this.router.navigate(["auth/login"]);
        
  //     },
  //     (error: any) => {
  //       console.log(error,"login error");
       
  //     }
  //   );
  // }


  setPass()
  {
  let userObj = {
    id: this.userId, 
    resetPin: this.rPin,
    password : this.spForm.value.password
  }
  //  console.log(userObj)
    this.authService.setPass(userObj).subscribe(
      (success: any) => {
        console.log(success);
        this.toastService.success("Password Updated Successfully!");
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.log(error,);
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

  add(){
    this.router.navigate(['/'])
  }
}
