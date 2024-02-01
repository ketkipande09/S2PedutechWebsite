import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup, FormBuilder, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationService } from 'src/app/core/components';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  images: any;
  fileContent: any;
  choosen: boolean = false;
  homeId: any;
  submitted = false;
  // homeusers: any = [];
  params: any;
  homeUsers: any = [];

  constructor(private userService: UserService,
              private router: Router, 
              private actRout: ActivatedRoute,
              private validationService:ValidationService,
              private toastService:ToastrService
              ) 
              {}

  ngOnInit(): void {
    this.actRout.queryParams.subscribe((params: any) => {
      console.log(params)
      this.homeId = params.id;
      console.log(this.homeId);
      if(this.homeId){
        this.getHomeById();
      }
    });

  
   
  }
 

  homeForm = new FormGroup({
    bulletPoint: new FormControl(''),
    placementCount: new FormControl(0),
    image: new FormControl(''),
  });

  get f() {
    return this.homeForm.controls;
  }
  fileChoosen(event: any) {
    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        // this.toastService.warning("Unable to upload image/Video of size more than 5MB");
        return;
      }
      this.images = <File>event.target.files[0];
      this.fileContent = this.images;
      console.log(this.fileContent);
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

    if (this.homeForm.invalid) {
      this.toastService.info('Please enter all valid data !');
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        fd.append('image', this.images, this.images.name);
      }
        // this.spinner.show();
        fd.append('key', 'logo');
        // fd.append('image', this.images, this.images.name);
        fd.append('bulletPoint', this.homeForm.value.bulletPoint);
        fd.append('placementCount', this.homeForm.value.placementCount);
        console.log('fd,,,,', fd);
        this.userService.createHome(fd).subscribe((data) => {
          console.log(data);
          this.submitted = false
          this.router.navigate(["user/home-list"]);
          this.toastService.success("Created Successfully!");
          //  this.modalService.dismissAll();
          //  this.spinner.hide();
        });
      // } else {
      //   // console.log("upload image");
      //   this.toastService.error('Invalid Credentials !');
      //    this.toastService.warning("Please upload images");
      // }
    }
   
  } 
   
  updateImage() {
    this.submitted = true
    if (this.homeForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    fd.append('type', this.homeForm.value.type);
    fd.append('bulletPoint', this.homeForm.value.bulletPoint);
    fd.append('placementCount', this.homeForm.value.placementCount);
    if (this.images) {
      fd.append('key', 'logo')
      fd.append('image', this.images, this.images.name);
    }
    this.userService.updateHome(this.homeId, fd).subscribe((success) => {
      console.log(success);
      this.submitted= false
      this.router.navigate(['/user/home-list']);
      this.toastService.success("Updated Successfully!");
    });
  }

  getHomeById() {
    console.log(this.homeId);
    this.userService.getHomeById(this.homeId).subscribe((success:any) => {
      console.log(success);
      this.fileContent = success.result.image;
      console.log(this.fileContent);
      
      this.homeForm.patchValue(success.result);
    },
      (error) => {
        console.log(error);

      })
  }

add(){
  this.router.navigate(['/user/home-list']);
}
}
