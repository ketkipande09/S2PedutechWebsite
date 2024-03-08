import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/services/rest.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss'],
})
export class ContactusComponent {
  id: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private restService: RestService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.contactForm.value;

    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.id = params.id;
      console.log('params id', this.id);

      if (this.id) {
        console.log('params id ', params.id);
      }
    });
  }

  get enquiryFormControls() {
    return this.contactForm.controls;
  }

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    contact: new FormControl('', [
      Validators.required,
      Validators.pattern('^[7-9][0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
    ]),
    message: new FormControl(),
  });

  // onSubmit(): void {
  //   console.log('Submit button clicked');
  //   if (this.contactForm.invalid) {
  //     return;
  //   }
  //   const formValues = this.contactForm.value;
  //   console.log('Form values:', formValues);
  //   this.restService.createContact(formValues).subscribe(
      
  //     (successResponse: any) => {
  //       console.log('contactform created successfully:', successResponse);
  //   this.toastr.success('Message send successfully');

  //     },
  //     (errorResponse: any) => {
  //       console.error('Error creating contactform:', errorResponse);
  //   this.toastr.error('Please Check Credential');

  //     }
  //   );
    
  // }
  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.toastr.error('Please Check Credential');
      return;
    }
    const formValues = this.contactForm.value;
    this.restService.createContact(formValues).subscribe(
      (successResponse: any) => {
        this.toastr.success('Message sent successfully',successResponse.message);
      },
      (errorResponse: any) => {
        this.toastr.error('Error creating contactform:', errorResponse.message);
      }
    );
  }
  
}
