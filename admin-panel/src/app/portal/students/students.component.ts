import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as _ from 'lodash';
import { MatSelectModule } from '@angular/material/select';
import { Pipe, PipeTransform } from '@angular/core';
    import * as _ from 'lodash';




import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTableDataSource } from '@angular/material/table'
import { saveAs } from 'file-saver';
// import { eventNames } from 'process';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})


export class StudentsComponent implements OnInit {
  // students: any = {};
  students: any = [];
  events: any = [];
  registrationForm: any = [];
  obj: any = [];
  collection: any;
  option: any = [];
  enquiry: any = [];
  search: any = '';
  course: any = '';
  page: any = 1;
  pagesize: any = 10;
  apiResponse: any = [];
  response: any = [];
  event: any = [];
  registerDetails: any = [];
  selectedRow: any;

  readList: any;
  disabled: boolean = false;


  public currentPageLimit: number = 0;
  public pageLimitOptions = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  // selectedRow: any = {};
  dataSource: any = [];
  eventId: any='';
  

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private modalService: NgbModal,
    private actRouter: ActivatedRoute,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllStudents();
    this.apiResponse = this.response;
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    // console.log(s);
    this.modalService.open(content, { centered: true });
    this.getAllStudents();
  }
  
  getAllStudents() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
      eventId: this.eventId
    };
    console.log("obj", obj);

    this.userService.getAllStudents(obj).subscribe((success: any) => {
      console.log(success);
      this.students = success['result'].eventRegister;
      this.collection = success['result'].count;

    }, (error: any) => {
      console.log(error);

    }
    )

  }
  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 0 || this.search.toString().length == 0
      ? this.getAllStudents()
      : null;
  }
  // searchFn() {
  //   console.log('this.search', this.search);
  //   this.getAllStudents();
  //   // this.getEvents();
  //   // this.search.toString().length >= 3 || this.search.toString().length == 0
  //   //   ? this.getAllEnquiry() : null;
  // }

  resetFilter() {
    this.eventId = '';
    this.getAllStudents()
  }

  getAllEvents() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
      eventId: this.eventId
    };
    console.log("obj", obj);

    this.userService.getAllEvents(obj).subscribe((success: any) => {
      console.log(success);
      this.events = success['result'].eventId;
      // this.collection = success['result'].count;

    }, (error: any) => {
      console.log(error);

    }
    )

  }

// getSudent(){
//   this.userService.studentGetById(this.eventId).subscribe((success:any)=>{
//     console.log(success);
//   },
//   (error:any)=>{
//     console.log(error);
//   })
// }

deleteStudent(id: any){
this.userService.deleteStudent(id).subscribe((success:any)=>{
  console.log(success);
  this.toastService.success('Student Deleted Successfully!');
  this.modalService.dismissAll();
  this.getAllStudents();
},
(error:any)=>{
  console.log(error);
})
}
onChangePage(pageNo: any) {
  // console.log(pageNo);
  if (pageNo > 0) {
    this.page = pageNo;
  }
  this.getAllStudents();
}

download(title:any) {
  // console.log(title);
  let obj: any = {
      type: title,
      name: this.registerDetails.eventName,
  };  
  this.userService.downloadFile(obj).subscribe(
      success => {
        console.log("success", success)
          if (title == "csv") {
              saveAs(success, "studentRegistration-list.csv");
          } else {
              saveAs(success, "studentRegistration-list.xlsx");
          }
      },
      error => {
        console.log(error);
      }
  );
}




}

@Pipe({
  name: 'unique',
  pure: false
})

export class UniquePipe implements PipeTransform {
    transform(value: any): any{
        if(value!== undefined && value!== null){
            return _.uniqBy(value, 'eventId');
        }
        return value;
    }
}
