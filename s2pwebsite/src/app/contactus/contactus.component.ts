import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/services/rest.service';
@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent {


  id : any;
  constructor(private activatedRoute: ActivatedRoute, private restService: RestService) {
  }


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
      name: new FormControl('',[Validators.required]),
      message: new FormControl(),
      contact: new FormControl('', [Validators.required]),
      email: new FormControl(),
      
    });
  
    onSubmit(): void {
      console.log('Submit button clicked');
      if (this.contactForm.invalid) {
  
        return;
      }
      const formValues = this.contactForm.value;
      console.log('Form values:', formValues);
      this.restService.createContact(formValues).subscribe(
        (successResponse: any) => {
          console.log('contactform created successfully:', successResponse);
          
        },
        (errorResponse: any) => {
          console.error('Error creating contactform:', errorResponse);
          
        }
      );
    }
  
  }

