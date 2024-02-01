import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  // public userForm : FormGroup;
  collection: any;
  submitted = false;
  page = 1;
  pageSize = 25;
  search: any = "";
  params: any;
  userForm: any;
  selectedRow: any;
  collapsed = true;
  users: any = [];
  userDetails: any = [];


  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router : Router,
    private modalService:NgbModal,
    private actRouter : ActivatedRoute,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService
  ) { }
  

  ngOnInit(): void {
  let obj:any = localStorage.getItem("s2pUser");
  // console.log(JSON.parse(obj));
  this.getAllUsers();


  }

  // getById()
  // {
  //   this.userService.getById(this.params.id).subscribe((success:any)=>{
  //     console.log(success);
  //     this.userForm.patchValue(success['result']);
  //   },
  //   (error)=>{
  //     console.log(error);
      
  //   })

  // }

  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 3 || this.search.toString().length == 0
      ? this.getAllUsers()
      : null;
  }

  getAllUsers() {
    this.spinner.show();
    let obj: any = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search
    }
    this.userService.getAllUsers(obj).subscribe((success)=>{
    console.log(success);
    this.users= success.result.user;
    this.spinner.hide();
    },
    (error)=>{
      console.log(error);
      this.spinner.hide()
    })
    console.log(obj);
  }

  
  updateUser(c:any){
    console.log(c);
    this.router.navigate(['user/user-form'],{
      queryParams:
      {id :c.id}
    })
  }

  deleteUser(c:any){

    // console.log(c)
    this.spinner.show();
    this.userService.deleteUser(c).subscribe(success => {
      console.log(success);
      this.spinner.hide();
      this.toastService.success("User Deleted Successfully!");
      this.modalService.dismissAll();
      this.getAllUsers();
    }, error => {
      console.log(error);
      this.spinner.hide();
      this.toastService.error('Unable to Delete !');
    });
  }
      
    
  
  open(s: any, content: any){
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, {centered: true})
    // this.getAllServices();
  }

add(){
  this.router.navigate(['/user/user-form']);
}

  goBack() {
    this.location.back()
  }

}
