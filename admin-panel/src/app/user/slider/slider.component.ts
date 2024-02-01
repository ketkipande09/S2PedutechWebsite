import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { ValidationService } from 'src/app/core/components';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent implements OnInit {
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
    // private activeModel:NgbActiveModal,
    // private modalService:NgbModal,
    private router: Router,
    private userSer: UserService,
    private actRoutes: ActivatedRoute,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.sliderForm;
    this.actRoutes.queryParams.subscribe((params: any) => {
      this.id = params.id;
      // console.log("params id",this.id);

      this.course = params.studentName;
      //for update (if id exist )
      if (this.id) {
        this.getSliderById();
        console.log('params id ', params.id);
      }
    });
  }

  get f() {
    return this.sliderForm.controls;
  }

  sliderForm = new FormGroup({
    id: new FormControl(),
    image: new FormControl(''),
    name: new FormControl(''),
  });

  fileChoosen(event: any) {
    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        this.toastService.warning('Unable to upload image size more than 5MB');
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
    if (this.sliderForm.invalid) {
      this.toastService.warning('Please fill all required field !');
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        this.spinner.show();
        fd.append('key', 'slider');
        fd.append('image', this.images, this.images.name);
        fd.append('name', this.sliderForm.value.name);

        // fd.append('studentName', this.sliderForm.value.studentName);
        // fd.append('companyName', this.sliderForm.value.companyName);
        // fd.append('collegeName', this.sliderForm.value.collegeName);
        console.log('fd,,,,', fd);
        this.userSer.createImage(fd).subscribe((data) => {
          console.log(data);
          this.router.navigate(['/user/slider-list']);
          this.toastService.success('Gallery Created Successfully!');
          //  this.modalService.dismissAll();
          this.spinner.hide();
        });
      } else {
        this.toastService.warning('Please upload images');
      }
    }
  }

  updateImage() {
    this.spinner.show();
    this.submitted = true;
    if (this.sliderForm.invalid) {
      this.toastService.warning('Please fill all required field !');
      return;
    }
    const fd = new FormData();
    fd.append('key', 'slider');
    fd.append('type', this.sliderForm.value.type);
    fd.append('name', this.sliderForm.value.name);
    if (this.images) {
      fd.append('image', this.images, this.images.name);
    }
    this.userSer.updateImage(this.id, fd).subscribe((success) => {
      console.log(success);
      this.toastService.success('Gallery Update Successfully!');
      this.spinner.hide();
      this.router.navigate(['/user/slider-list']);
    });
  }
  getSliderById() {
    this.userSer.getImageById(this.id).subscribe(
      (success: any) => {
        console.log(success);
        this.sliderForm.patchValue(success.result);
        this.fileContent = success['result'].image;
        console.log('this.fileContent', this.fileContent);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  
  reset() {
    this.sliderForm.reset();
  }

  add() {
    this.router.navigate(['/user/slider-list']);
  }
}
