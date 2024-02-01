import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationService } from 'src/app/core/components';
import { HttpInterceptor } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Services/auth-services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

// import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  returnUrl!: string;
  //  loginForm !: FormGroup;
  // loginForm: any = [];
  submitted: boolean = false;
  myInterval: number | false = 6000;
  slides: any[] = [];
  activeSlideIndex: number = 0;
  noWrapSlides: boolean = false;
  fieldTextType: boolean = false;
  show: string = 'password';
  Show: string = 'password';
  imageArr: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    //   private imageService: ImageService,
    private router: Router,
    private toastService: ToastrService,
    private validationService: ValidationService,
    public authService: AuthService,
    private ngxspinner : NgxSpinnerService
  ) // public inceptor: HttpInterceptor
  {
    for (let i = 0; i < 4; i++) {
      this.addSlide();
    }
  }

  ngOnInit(): void {
    this.loginForm.value;
    // localStorage.removeItem("s2pUser");
    // get return url from route parameters or default to "/"
    this.returnUrl = this.route.snapshot.queryParams[`returnUrl`] || '/login';
    // this.login();
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      this.validationService.noWhitespaceValidator,
      this.validationService.emailValidator,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      this.validationService.noWhitespaceValidator,
    ]),
  });

  get f() {
    return this.loginForm.controls;
  }

  login() {
    this.ngxspinner.show();
    this.authService.login(this.loginForm.value).subscribe(
      (success: any) => {
        this.ngxspinner.hide();
        this.toastService.success('Login Successfully!');
        if (typeof window !== 'undefined') {
          localStorage.setItem('s2pUser', JSON.stringify(success['result']));
        }
        this.router.navigate(['user/user-list']);
        // this.router.navigateByUrl(this.returnUrl);
      },
      (error: any) => {
        console.log(error, 'login error');
        this.toastService.error('Invalid Credentials !');
          this.ngxspinner.hide();
      }
    );
  }

  password_show() {
    this.show = 'text';
  }
  password_hide() {
    this.show = 'password';
  }
  // getCourseListing() {
  //     this.spinner.show();
  //     let obj: any = {
  //         page: 1,
  //         pageSize: 20,
  //         search: "",
  //         flag: "Slider",
  //     };
  //     console.log(obj);
  //     this.auth.getImageListing(obj).subscribe(
  //       (success:any)=> {
  //             console.log(success);
  //             this.slides = success["result"].courses;
  //             this.search = '';
  //             this.spinner.hide();
  //         },
  //         (error:any) => {
  //             console.log(error);
  //             this.spinner.hide();
  //         }
  //     );
  // }
  ngOnDestroy(): void {
    this.myInterval = 0;
    this.noWrapSlides = true;
    this.myInterval = false;
  }

  addSlide(): void {
    // setTimeout( () => {
    //   const seed = Math.random().toString(36).slice(-6);
    //   this.slides.push({
    //     image: `https://picsum.photos/seed/${seed}/900/500`
    //   });
    // }, 500);
  }

  removeSlide(index?: number): void {
    const toRemove = index ? index : this.activeSlideIndex;
    this.slides.splice(toRemove, 1);
  }

  forgetpswd() {
    // console.log();
    this.router.navigate(['auth/forget-pwd'], {});
  }

  Signup() {
    this.router.navigate(['/signup']);
  }
}
