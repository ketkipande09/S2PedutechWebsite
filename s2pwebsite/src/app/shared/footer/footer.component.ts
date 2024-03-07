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
  private modalService = inject(NgbModal);
  id: any;
  isOpen = false;
  @ViewChild('SuccessMessage') SuccessMessage: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private restService: RestService
  ) {}
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
    this.modalService.open(longContent, { centered: true });
  }

  get enquiryFormControls() {
    return this.enquiryForm.controls;
  }

  enquiryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    branch: new FormControl('Select your Branch', [Validators.required]),
    college: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.pattern('^[0-9]{10}$'),
    ]),
    passingyear: new FormControl('', [Validators.required]),
    course: new FormControl('Select your course', [Validators.required]),
  });

  onSubmit(): void {
    console.log('Submit button clicked');
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
}
