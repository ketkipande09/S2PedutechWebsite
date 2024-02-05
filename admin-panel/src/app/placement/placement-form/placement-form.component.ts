import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService } from 'src/app/core/components';
import { ToastrService } from 'ngx-toastr';
import { PlacementService } from 'src/app/Services/placement-service/placement.service';
@Component({
  selector: 'app-placement-form',
  templateUrl: './placement-form.component.html',
  styleUrls: ['./placement-form.component.css']
})
export class PlacementFormComponent implements OnInit {
  images: any;
  fileContent: any;
  choosen: boolean = false;
  submitted = false;
  id: any;
  placement: any;
  params: any;
  placementId: any;
  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastrService,
    private PlacementService: PlacementService,
  ) { }

  ngOnInit(): void {
    this.placementForm;
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.placementId = params.id;
      console.log("this.placementId", this.placementId);
      if (this.placementId) {
        this.getPlacementId();
        console.log('params id ', this.placementId);
      }
    });

  }

  get f() {
    return this.placementForm.controls;
  }

  placementForm = new FormGroup({
    id: new FormControl(),
    image: new FormControl(''),
    studentName: new FormControl(''),
    collage: new FormControl(''),
    company: new FormControl(''),
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

  createPlacement() {
    console.log(this.images);
    this.submitted = true;
    if (this.placementForm.invalid) {
      this.toastService.warning('Please fill all required field !');
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        // this.spinner.show();
        fd.append('key', 'placement');
        fd.append('image', this.images, this.images.name);
        fd.append('studentName', this.placementForm.value.studentName);
        fd.append('collage', this.placementForm.value.collage);
        fd.append('company', this.placementForm.value.company)
        console.log('fd,,,,', fd);
        this.PlacementService.createPlacement(fd).subscribe((data) => {
          console.log(data);
          this.router.navigate(['/placement/placement-list']);
          this.toastService.success('placement Created Successfully!');
          //  this.modalService.dismissAll();
          // this.spinner.hide();
        });
      } else {
        this.toastService.warning('Please upload images');
      }
    }
  }

  updatePlacement() {
    if (this.placementForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    console.log("fd------", fd);
    fd.append('studentName', this.placementForm.value.studentName);
    fd.append('collage', this.placementForm.value.collage);
    fd.append('company', this.placementForm.value.company);
    if (this.images) {
      fd.append('key', 'placement')
      fd.append('image', this.images, this.images.name);
    }
    this.PlacementService
      .updatePlacement(fd, this.placementId)
      .subscribe((success) => {
        this.toastService.success("Placement Updated Successfully!");
        this.router.navigate(['/placement/placement-list']);
      });
  }
  getPlacementId() {
    this.PlacementService.getPlacementById(this.placementId).subscribe(
      (success: any) => {
        console.log(success);
        this.placementForm.patchValue(success.result);
        this.fileContent = success['result'].image;
        console.log('this.fileContent', this.fileContent);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  reset() {
    this.placementForm.reset();
  }
  add() {
    this.router.navigate(['/placement/placement-list']);
  }

}
