import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CourseModuleService } from 'src/app/Services/course-module/course-module.service';
import { UserService } from 'src/app/services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-slider-list',
  templateUrl: './slider-list.component.html',
  styleUrls: ['./slider-list.component.css']
})
export class SliderListComponent implements OnInit {

  // sliderForm: FormGroup | any;
  sliderList: any = [];
  page = 1;
  pagesize = 25;
  search: any = '';
  imageArr: any = [];
  collection: any;
  selectedRow:any = {};
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    // private courseModuleService: CourseModuleService,
    private userSer:UserService,
    private modalService: NgbModal,
    private toastService : ToastrService,
    private spinner:NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.getAllSliders();
  }

  getAllSliders() {
    this.spinner.show();
    let obj: any = {
      page: this.page,
      pagesize: this.pagesize,
    };
    console.log(obj);
    this.userSer.getAllSliders(obj).subscribe((success: any) => {
        console.log(success);
        this.imageArr = success.result.slider;
        this.collection = success;
        console.log(this.imageArr);
        this.spinner.hide();
       
  
      },
      (error:any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  // updateSlider(s:any){

  //   this.router.navigate(['/user/slider'],{
  //     queryParams:{
  //         id:s.id 
  //     }
  //   });
  // }

  open(s: any, content: any){
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, {centered: true})
    
  }

  deleteSlider(id: any) {
    this.spinner.show();
    console.log("id...", id)
    this.userSer.deleteSlider(id).subscribe(
      (success:any) => {
        this.toastService.success("Gallery Deleted Successfully!");
        console.log(success,"deleted successfully");
        this.modalService.dismissAll();
        this.spinner.hide();
        this.getAllSliders();
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  add(){
    this.router.navigate(['/user/slider'])
  }

}
