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
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {
  submitted = false;
  users: any = [];
  params: any;
  show: string = 'password';
  Show: string = 'password';

  orgId: any;
  organisations: any;


  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private actRouter: ActivatedRoute,
    private validationService: ValidationService,
    private toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.actRouter.queryParams.subscribe((params: any) => {
      this.orgId = params.id;
      // console.log("params id",this.id);

      this.orgId = params.id;
      //for update (if id exist )
      if (this.orgId) {
        this.getOrgById();
        console.log('params id ', params.id);
      }
    });
  }

  orgForm = this.formBuilder.group({
    id: new FormControl(),

    orgName: new FormControl('', [Validators.required,
    this.validationService.alphaValidator,
    this.validationService.noWhitespaceValidator,
    this.validationService.specialCharacter]),


    email: new FormControl('', [Validators.required,
    this.validationService.emailValidator,
    this.validationService.noWhitespaceValidator]),

    mobile: new FormControl('', [Validators.required,
    this.validationService.noWhitespaceValidator,
    this.validationService.mobileValidator]),

    alternateMobile: new FormControl('', [Validators.required,
      this.validationService.noWhitespaceValidator,
      this.validationService.mobileValidator]),

    address: new FormControl('', [])
  });

  createOrg() {
    this.submitted = true;
    if (this.orgForm.invalid) {
      console.log("invalid form");
      this.toastService.warning("Please fill all required field!");
      return;
    } else {
      console.log(this.orgForm.value);
      this.userService
        .createOrg(this.orgForm.value)
        .subscribe((success: any) => {
          console.log(success);
          this.router.navigate(['/user/org-list']);
        });
      this.toastService.success("Org created Successfully!");
    }
  }
  get f() {
    return this.orgForm.controls;
  }

  add(){
    this.router.navigate(['/user/org-list']);
  }


  updateOrg() {
    let obj: any = {};
    obj = this.orgForm.value;

    console.log("orgUpdated", obj);
    this.userService.updateOrg(this.orgId, obj).subscribe(success => {

      this.organisations = success.result;
      this.router.navigate(['/user/org-list']);
      this.toastService.success("Org Updated Successfully!");
    }, error => {
      console.log(error);
      this.toastService.error('Invalid Credentials !');
    });
  }

  getOrgById() {
    this.userService.getOrgById(this.orgId).subscribe(
      (success: any) => {
        console.log(success);
        this.orgForm.patchValue(success.result);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  
  reset() {
    this.orgForm.reset();
  }

  



}
