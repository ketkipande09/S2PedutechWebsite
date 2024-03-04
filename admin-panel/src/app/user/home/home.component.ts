import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
    private validationService: ValidationService,
    private toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.actRout.queryParams.subscribe((params: any) => {
      console.log(params)
      this.homeId = params.id;
      console.log(this.homeId);
      if (this.homeId) {
        this.getHomeById();
      }
    });



  }


  homeForm = new FormGroup({
    bulletPoint: new FormControl(''),
    placementCount: new FormControl(0),
    OurEMPLOYEE: new FormControl(0),
    YearsExperience: new FormControl(0),
    // image: new FormControl(''),
  });

  get f() {
    return this.homeForm.controls;
  }

  createHome() {
    this.submitted = true;

    if (this.homeForm.invalid) {
      this.toastService.info('Please enter all valid data!');
      return;
    } else {
      const homeData = {
        bulletPoint: this.homeForm.value.bulletPoint,
        placementCount: this.homeForm.value.placementCount,
        OurEMPLOYEE: this.homeForm.value.OurEMPLOYEE,
        YearsExperience: this.homeForm.value.YearsExperience

      };

      this.userService.createHome(homeData).subscribe((data) => {
        console.log(data);
        this.submitted = false;
        this.router.navigate(['user/home-list']);
        this.toastService.success('Created Successfully!');
      });
    }
  }

  updateHome() {
    this.submitted = true;
    if (this.homeForm.invalid) {
      this.toastService.warning('Please fill all required fields!');
      return;
    }

    const homeData = {
      OurEMPLOYEE: this.homeForm.value.OurEMPLOYEE,
        YearsExperience: this.homeForm.value.YearsExperience,
      bulletPoint: this.homeForm.value.bulletPoint,
      placementCount: this.homeForm.value.placementCount
    };
    this.userService.updateHome(this.homeId, homeData).subscribe((success) => {
      console.log(success);
      this.submitted = false;
      this.router.navigate(['/user/home-list']);
      this.toastService.success('Updated Successfully!');
    });
  }


  getHomeById() {
    console.log(this.homeId);
    this.userService.getHomeById(this.homeId).subscribe((success: any) => {
      console.log(success);
      this.fileContent = success.result.image;
      console.log(this.fileContent);

      this.homeForm.patchValue(success.result);
    },
      (error) => {
        console.log(error);
      })
  }

  add() {
    this.router.navigate(['/user/home-list']);
  }
}
