import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseModuleService } from 'src/app/services/course-module/course-module.service';
import { ValidationService } from 'src/app/core/components';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-services-form',
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.css'],
})
export class ServicesFormComponent implements OnInit {

  public serviceForm!: FormGroup;
  images: any;
  submitted = false;
  fileContent: any;
  choosen: boolean = false;
  params: any;
  id: any;
  course: any;

  constructor(
    private validationService: ValidationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private courseModuleService: CourseModuleService,
    private actRoutes: ActivatedRoute ,
    private toastService: ToastrService
  )

  {}

  ngOnInit(): void {
    this.createForm();
    this.actRoutes.queryParams.subscribe((params: any) => {
      this.id = params.id;
      // console.log("params id",this.id);

      this.course = params.name;
      //for update (if id exist )
      if (this.id) {
        this.getCourseById();
        console.log('params id ', params.id);
      }
    });
  }
  
  
get f() {
    return this.serviceForm.controls;
  }

  createForm(): void {
    this.serviceForm = this.formBuilder.group({
      id: new FormControl (),
      image: new FormControl(''),
      name: new FormControl('', [Validators.required, this.validationService.specialCharacter]),
      description:new FormControl ('', [Validators.required]),
    });
  }

  fileChoosen(event: any) {
    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        // this.toastService.warning("Unable to upload image/Video of size more than 5MB");
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
  createImage() {
    console.log(this.images);

    this.submitted = true;

    if (this.serviceForm.invalid) {
   
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        // this.spinner.show();
        fd.append('key', 'image');
        fd.append('image', this.images, this.images.name);
        fd.append('name', this.serviceForm.value.name);
        fd.append('description', this.serviceForm.value.description);
        console.log('fd,,,,', fd);
        this.courseModuleService.createImage(fd).subscribe((data) => {
          console.log(data);
          this.submitted = false
          this.router.navigate(['/services/service-list']);
          this.toastService.success("Course created Successfully!");
          //  this.modalService.dismissAll();
          //  this.spinner.hide();
        });
      } else {
        console.log("upload image");
        this.toastService.error('Invalid Credentials !');
         this.toastService.warning("Please upload images");
      }
    }
   
  }

  updateImage() {
    this.submitted = true
    if (this.serviceForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    fd.append('type', this.serviceForm.value.type);
    fd.append('description', this.serviceForm.value.description);
    fd.append('name', this.serviceForm.value.name);
    if (this.images) {
      fd.append('image', this.images, this.images.name);
    }
    this.courseModuleService.updateImage(this.id, fd).subscribe((success) => {
      console.log(success);
      this.toastService.success("Course Updated Successfully!");
      this.submitted= false
      this.router.navigate(['/services/service-list']);
    });
  }

  getCourseById() {
    this.courseModuleService.getImageById(this.id).subscribe(
      (success: any) => {
        console.log(success);
        this.serviceForm.patchValue(success.result);
        this.fileContent = success['result'].image;
        console.log('this.fileContent', this.fileContent);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  reset(){
    this.serviceForm.reset();
  }

  add(){
    this.router.navigate(['/services/service-list'])
  }
}
