import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from 'src/app/services/user/user.service';
import { Router, RouterOutletContract } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from 'src/app/core/components';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  users: any = [];
  params: any;
  show: string = 'password';
  Show: string = 'password';
  id: string = '';
  isAddMode: boolean = false;
  
  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    // private actRouter: ActivatedRoute,
    private validationService: ValidationService,
    private toastService:ToastrService
  ) {}

  ngOnInit(): void {
    this.userForm;
    this.isAddMode = !this.id;
  }
 
  userForm = this.formBuilder.group(
    {
      firstName: new FormControl('', [Validators.required, 
                                    this.validationService.noWhitespaceValidator]),
      lastName: new FormControl('', [Validators.required,
                                 this.validationService.noWhitespaceValidator]),
      userName: new FormControl('', [Validators.required, 
                                    this.validationService.noWhitespaceValidator]),
      email: new FormControl('', [Validators.required,
                                   this.validationService.emailValidator, this.validationService.noWhitespaceValidator]),
      mobileNumber: new FormControl('', [Validators.required, 
                                    this.validationService.noWhitespaceValidator,
                                    this.validationService.mobileValidator]),
      role: new FormControl('Super_Admin', []),
      password: new FormControl('',[Validators.required,
                                    Validators.minLength(6),Validators.maxLength(10),
                                  this.validationService.noWhitespaceValidator]),
      confirmPassword: new FormControl('', [Validators.required]),
      address: new FormControl('',[]),
    },
    { 
      validator : this.validationService.MustMatch('password','confirmPassword' )
     }
    );

  get f() {
    return this.userForm.controls;
  }
  createUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.toastService.warning("Please fill all required field!");
      return;
    } else {
      console.log(this.userForm.value);
      this.userService
        .createUser(this.userForm.value)
        .subscribe((success: any) => {
          console.log(success);
          this.router.navigate(['/login']);
        });
      this.toastService.success("User created Successfully!");
      // this.router.navigate(["users/users"])
    }
  }

  loginpage() {
    this.router.navigate(['/login']);
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

  reset() {
    this.userForm.reset();
  }


  add(){
    this.router.navigate(['/login/']);
  }
}
