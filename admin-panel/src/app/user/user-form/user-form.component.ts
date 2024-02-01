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
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  submitted = false;
  users: any = [];
  params: any;
  show: string = 'password';
  Show: string = 'password';

  userId: any;

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private actRouter: ActivatedRoute,
    private validationService: ValidationService,
    private toastService: ToastrService,
    private spinner:NgxSpinnerService,

  ) { }

  ngOnInit(): void {
    this.actRouter.queryParams.subscribe((params: any) => {
      this.userId = params.id;
      // console.log("params id",this.id);

      this.userId = params.id;
      //for update (if id exist )
      if (this.userId) {
        this.getUserById();
        console.log('params id ', params.id);
      }
    });


  }

  userForm = this.formBuilder.group({
    firstName: new FormControl('', [Validators.required,
                                  this.validationService.alphaValidator,
                                  this.validationService.noWhitespaceValidator,
                                  this.validationService.specialCharacter]),

    lastName: new FormControl('', [Validators.required,
                                    this.validationService.alphaValidator,
                                    this.validationService.noWhitespaceValidator,
                                    this.validationService.specialCharacter]),

    userName: new FormControl('', [Validators.required,
                                    this.validationService.noWhitespaceValidator]),

    email: new FormControl('', [Validators.required,
                                   this.validationService.emailValidator,
                                    this.validationService.noWhitespaceValidator]),

    mobileNumber: new FormControl('', [Validators.required,
                                          this.validationService.noWhitespaceValidator,
                                          this.validationService.mobileValidator]),

    role: new FormControl('Super_Admin', []),

    password: new FormControl('', [Validators.required,
                                  Validators.minLength(6),Validators.maxLength(10),
                                this.validationService.noWhitespaceValidator]),
                                
    confirmPassword: new FormControl('', [Validators.required]),

    address: new FormControl('', []),
  },
    {
      validator: this.validationService.MustMatch(
        'password',
        'confirmPassword'
      ),
    }
  );


  // cancelUser() { }

  get f() {
    return this.userForm.controls;
  }
  createUser() {
    this.spinner.show();
    this.submitted = true;
    if (this.userForm.invalid) {
      console.log("invalid form");
      this.toastService.warning("Please fill all required field!");
      return;
    } else {
      console.log(this.userForm.value);
      this.userService
        .createUser(this.userForm.value)
        .subscribe((success: any) => {
          console.log(success);
          this.router.navigate(['/user/user-list']);
        });
      this.toastService.success("User created Successfully!");
      this.spinner.hide();
    }
  }


  getUserById() {
    this.userService.getById(this.userId).subscribe(
      (success: any) => {
        console.log(success);
        this.userForm.patchValue(success.result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateUser() {
    this.spinner.show();
    let obj: any = {};
    obj = this.userForm.value;
    console.log("contactupdated", obj);
    this.userService.updateUser(this.userId, obj).subscribe(success => {

      this.users = success.result;
      this.router.navigate(['/user/user-list']);
      this.toastService.success("User Updated Successfully!");
      this.spinner.hide();
    }, error => {
      console.log(error);
      this.toastService.error('Invalid Credentials !');
      this.spinner.hide();
    });
  }

  add(){
    this.router.navigate(['/user/user-list']);
  }
 
  reset() {
    this.userForm.reset();
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


}



