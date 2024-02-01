import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CourseModuleService } from 'src/app/services/course-module/course-module.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.css'],
})
export class ServicesListComponent implements OnInit {
  serviceListForm: FormGroup | any;
  serviceList: any = [];
  page = 1;
  pagesize = 10;
  search: any = '';
  imageArr: any = [];
  collection: any;
  selectedRow: any = {};
  public currentPageLimit: number = 0;
  public pageLimitOptions = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private courseModuleService: CourseModuleService,
    private modalService: NgbModal,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllServices();
  }

  searchFn() {
    console.log('this.search', this.search);

    this.search.toString().length >= 0 || this.search.toString().length == 0
      ? this.getAllServices()
      : null;
  }

  onChangePage(pageNo: any) {
    console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getAllServices();
  }

  getAllServices() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };
    this.courseModuleService.getAllServices(obj).subscribe(
      (success: any) => {
        console.log(success);
        this.imageArr = success.result['courses'];
        this.collection = success.result.count;
        console.log(this.imageArr);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  updateService(s: any) {
    // console.log("pass the id in form component ",s );
    this.router.navigate(['/services/service-form'], {
      queryParams: {
        id: s.id,
        name: s.name,
      },
    });
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, { centered: true });
    // this.getAllServices();
  }
  deleteServices(id: any) {
    console.log('id...', id);
    this.courseModuleService.deleteCourse(id).subscribe(
      (success: any) => {
        console.log(success, 'deleted successfully');
        this.toastService.success('Course Deleted Successfully!');
        this.modalService.dismissAll();
        this.getAllServices();
      },
      (error) => {
        console.log(error);
        this.toastService.error('Unable to Delete !');
      }
    );
  }

  add() {
    this.router.navigate(['/services/service-form']);
  }
}
