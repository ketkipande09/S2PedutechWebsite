import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService } from 'src/app/core/components';
import { TransitionCourseService } from 'src/app/Services/transition-course/transition-course.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transition-course-form',
  templateUrl: './transition-course-form.component.html',
  styleUrls: ['./transition-course-form.component.css'],
})
export class TransitionCourseFormComponent implements OnInit {
  public transitionForm!: FormGroup;
  images: any;
  fileContent: any;
  choosen: boolean = false;
  submitted = false;
  id: any;
  transition: any;
  pdf: any;
 
  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private router: Router,
    private transitionService: TransitionCourseService,
    private activatedRoute: ActivatedRoute,
    private toastService:ToastrService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.id = params.id;
      console.log('params id', this.id);
      this.transition = params.name;
      //for update (if id exist )
      if (this.id) {
        this.getTransitionById();
        console.log('params id ', params.id);
      }
    });
  }
  get f() {
    return this.transitionForm.controls;
  }
  
  createForm(): void {
    this.transitionForm = this.formBuilder.group({
      id: [],
      course: ['', [Validators.required,
                    this.validationService.noWhitespaceValidator,
                    this.validationService.specialCharacter,
               ]],

      duration: ['', [Validators.required,
                      this.validationService.noWhitespaceValidator,
                    
                ]],

      mentor: ['', [Validators.required,
                    this.validationService.noWhitespaceValidator,
                    this.validationService.specialCharacter,
                 
                    ]],

      average_Salary: ['', [Validators.required,
                            this.validationService.noWhitespaceValidator,
                          
                         ]],

      description: ['', [Validators.required,
                        this.validationService.noWhitespaceValidator]],

      average_Salary_Hike: ['', [Validators.required,
                            this.validationService.noWhitespaceValidator,
                         ,
                        ]],

      image: ['', []],
      pdf: ['', []],
    });
  }

  fileChoosen(event: any, fileType: any) {
    if (fileType === 'img') {
      console.log("imageUpload");
      if (event.target.value) {
        if (event.target.files[0].size > 5000000) {
          this.toastService.warning("Unable to upload image size more than 5MB");
          return;
        }
        this.images = <File>event.target.files[0];
        this.fileContent = this.images;
        console.log(this.images);
        const reader = new FileReader();
        reader.readAsDataURL(this.images);
        reader.onload = () => {
          this.fileContent = reader.result;
        };
        reader.onerror = (error) => {
          console.log(error);
        };
        this.choosen = true;
        console.log(this.fileContent);
        console.log(this.images, 'images');
      }
    }
    if (fileType === 'file') {
      console.log("fileUpload");
      if (event.target.value) {
        if (event.target.files[0].size > 5000000) {
          this.toastService.warning("Unable to upload image size more than 5MB");
          return;
        }
        this.pdf = <File>event.target.files[0];
        this.fileContent = this.pdf;
        console.log(this.pdf);
        const reader = new FileReader();
        reader.readAsDataURL(this.pdf);
        reader.onload = () => {
          this.fileContent = reader.result;
        };
        reader.onerror = (error) => {
          console.log(error);
        };
        this.choosen = true;
        console.log(this.fileContent);
        console.log(this.pdf, 'pdf');
      }
    }
  }

  createImage() {
    console.log(this.transitionForm.value);
    this.submitted = true;
    if (this.transitionForm.invalid) {
       this.toastService.warning("Please fill all required field !");
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        // this.spinner.show();
        fd.append('key', 'course');
        fd.append('image', this.images, this.images.name);
        fd.append('course', this.transitionForm.value.course);
        fd.append('duration', this.transitionForm.value.duration);
        fd.append('mentor', this.transitionForm.value.mentor);
        fd.append('average_Salary', this.transitionForm.value.average_Salary);
        fd.append('description', this.transitionForm.value.description);
        fd.append(
          'average_Salary_Hike',
          this.transitionForm.value.average_Salary_Hike
        );
        // fd.append('pdf', this.transitionForm.value.pdf);
        console.log('fd,,,,', fd);
        this.transitionService.createImage(fd).subscribe((data: any) => {
          console.log(data);
          this.toastService.success("Transition created Successfully!");
          this.router.navigate(['/transition/transition-list']);
        });
      } 
    }
    
  }

  updateTransition() {
    console.log(this.transitionForm.value);
    this.submitted = true;
    if (this.transitionForm.invalid) {
       this.toastService.warning("Please fill all required field !");
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        // this.spinner.show();
        fd.append('key', 'course');
        fd.append('image', this.images, this.images.name);
        fd.append('pdf', this.transitionForm.value.pdf);
        fd.append('course', this.transitionForm.value.course);
        fd.append('duration', this.transitionForm.value.duration);
        fd.append('mentor', this.transitionForm.value.mentor);
        fd.append('average_Salary', this.transitionForm.value.average_Salary);
        fd.append('description', this.transitionForm.value.description);
        fd.append(
          'average_Salary_Hike',
          this.transitionForm.value.average_Salary_Hike
        );
        console.log('fd,,,,', fd);
      } else{
          fd.append('course', this.transitionForm.value.course);
          fd.append('duration', this.transitionForm.value.duration);
          fd.append('mentor', this.transitionForm.value.mentor);
          fd.append('average_Salary', this.transitionForm.value.average_Salary);
          fd.append('description', this.transitionForm.value.description);
          fd.append(
            'average_Salary_Hike',
            this.transitionForm.value.average_Salary_Hike
          );
      }
        this.transitionService.updateTransition(this.id,fd).subscribe((data: any) => {
          console.log(data);
          this.toastService.success("Transition Updated Successfully!");
          this.router.navigate(['/transition/transition-list']);
        });

    }
    
  }

  getTransitionById() {
    this.transitionService.getTransitionById(this.id).subscribe(
      (success: any) => {
        console.log(success);
        this.transitionForm.patchValue(success.result);
        this.fileContent = success['result'].image;
        console.log('this.fileContent', this.fileContent);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  add(){
    this.router.navigate(['/transition/transition-list'])
  }
}
