import { Component, OnInit } from "@angular/core";
import {FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
// import {NgxSpinner} from "ngx-spinner";

// import { NgxSpinner } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ValidationService } from "src/app/core/components";
import { HttpInterceptor } from "@angular/common/http";
import { AuthService } from "src/app/Services/auth-services/auth.service";
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(  
    // private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    //   private imageService: ImageService,
    private router: Router,
    // private spinner: NgxSpinner,
    private toastService: ToastrService,
    //   private validationService: ValidationService,
    public authService: AuthService,
    
    
    // public inceptor: HttpInterceptor
    ) { }

  ngOnInit(): void {
  }

  fpForm = new FormGroup({
    email: new FormControl(),
    
  });

  forgetPassword()
  {
    //   this.spinner.show();
    console.log(this.fpForm.value);
    this.authService.forgetPassword(this.fpForm.value).subscribe(
      (success: any) => {
        console.log(success);
        // if (typeof window !== "undefined") {
        //   localStorage.setItem("s2pUser", JSON.stringify(success["result"]));
        // }
        this.toastService.success('Password Reset Link Sent on your Email please check mail !');
        this.router.navigate(["/login"]);
        // this.router.navigateByUrl(this.returnUrl);
        //   this.spinner.hide();
      },
      (error: any) => {
        console.log(error,"login error");
        this.toastService.error('Invalid Credentials !');
        // this.toastService.error("Invalid Credentials !");
        //   this.spinner.hide();
      }
    );
  }
 

}



