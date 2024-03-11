import { Component, inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RestService } from 'src/app/services/rest.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss']
})
export class CareerComponent {
  id: any;
  isOpen = false;
  @ViewChild('SuccessMessage') SuccessMessage: any;
  // private modalService = inject(NgbModal);
  mainData: any = [];
  private xlModalRef: NgbModalRef | null = null;
  private centeredModalRef: NgbModalRef | null = null;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private restService: RestService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.enquiryForm = this.formBuilder.group({
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
      course: new FormControl({ value: '', disabled: true }, [Validators.required]),
    });
  }

  openXl(content: any) {
    if (this.centeredModalRef) {
      this.centeredModalRef.close();
    }
    this.xlModalRef = this.modalService.open(content, { size: 'xl' });
  }

  openVerticallyCentered(course: any, longContent: any) {
    this.enquiryForm.controls['course'].setValue(course);
    if (this.xlModalRef) {
      this.xlModalRef.close();
    }
    this.centeredModalRef = this.modalService.open(longContent, {
      centered: true,
    });
    this.centeredModalRef.dismissed.subscribe(() => {
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
    course: new FormControl({ value: '', disabled: true }, [Validators.required]),
  });
  onSubmit(): void {
    Object.values(this.enquiryForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.enquiryForm.invalid) {
      return;
    }
    this.enquiryForm.enable();
    const formValues = this.enquiryForm.value;
    console.log('Form values:', formValues);

    this.restService.createEnquiry(formValues).subscribe(
      (successResponse: any) => {
        console.log('Enquiry created successfully:', successResponse);
        this.enquiryForm.reset();
        this.enquiryForm.controls['course'].setValue('Select your course');
        this.enquiryForm.controls['branch'].setValue('Select your Branch');
        this.enquiryForm.controls['course'].disable();
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
