
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/services/rest.service';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {


  id: any;
  isOpen = false;

  constructor(private activatedRoute: ActivatedRoute, private restService: RestService) {
  }
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



  get enquiryFormControls() {
    return this.enquiryForm.controls;
  }

  enquiryForm = new FormGroup({
    name: new FormControl('',[Validators.required]),
    branch: new FormControl(),
    college: new FormControl(),
    mobile: new FormControl('', [Validators.required]),
    passingyear: new FormControl(),
    course: new FormControl('Select your course'),
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
        
      },
      (errorResponse: any) => {
        console.error('Error creating enquiry:', errorResponse);
        
      }
    );
  }


}
