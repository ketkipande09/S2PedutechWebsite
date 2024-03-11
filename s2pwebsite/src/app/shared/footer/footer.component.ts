import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/services/rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  id: any;
  isOpen = false;
  @ViewChild('SuccessMessage') SuccessMessage: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private restService: RestService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) { }
  ngOnInit(): void {
    this.enquiryForm.value;
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.id = params.id;
      console.log('params id', this.id);

      if (this.id) {
        console.log('params id ', params.id);
      }
    });
  }
  openVerticallyCentered(longContent: any) {
    const modalRef = this.modalService.open(longContent, { centered: true });
  
    // Subscribe to the dismissed event
    modalRef.dismissed.subscribe(() => {
      // Clear the form data when the modal is dismissed (clicked outside)
      this.resetForm();
    });
  }
  

  get enquiryFormControls() {
    return this.enquiryForm.controls;
  }

  enquiryForm = this.formBuilder.group({
    name: new FormControl('', [Validators.required]),
    branch: new FormControl('', [Validators.required]),
    college: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[7-9][0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10),
    ]),
    passingyear: new FormControl('', [Validators.required]),
    course: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    Object.values(this.enquiryForm.controls).forEach(control => {
      control.markAsTouched();
    });
    if (this.enquiryForm.invalid) {
      return;
    }
    const formValues = this.enquiryForm.value;
    console.log('Form values:', formValues);

    this.restService.createEnquiry(formValues).subscribe(
      (successResponse: any) => {
        console.log('Enquiry created successfully:', successResponse);
        this.enquiryForm.reset();
        this.enquiryForm.controls['course'].setValue('Select your course');
        this.enquiryForm.controls['branch'].setValue('Select your Branch');
        this.modalService.dismissAll();
        this.modalService.open(this.SuccessMessage, { centered: true });
      },
      (errorResponse: any) => {
        console.error('Error creating enquiry:', errorResponse);
      }
    );
  }
  resetForm() {
    this.enquiryForm.reset();
  }
}
