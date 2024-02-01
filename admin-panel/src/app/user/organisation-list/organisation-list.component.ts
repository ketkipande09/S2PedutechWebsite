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
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements OnInit {
  organisations: any  = [];
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

   
  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router : Router,
    private modalService:NgbModal,
    private actRouter : ActivatedRoute,
    private toastService: ToastrService,
    private spinner:NgxSpinnerService,

  ) { }

  ngOnInit(): void {
    let obj:any = localStorage.getItem("s2pUser");
    // console.log(JSON.parse(obj));
    this.getAllOrgs();
  }

  getAllOrgs() {
  this.spinner.show();
    this.userService.getAllOrgs().subscribe(
      (success:any) => {
        console.log(success);
        this.organisations = success['result'].Org;
        // this.collection = success['result'].count;
        this.spinner.hide();

      }, (error:any) => {
        console.log(error);

      }
    )
  }

  updateOrg(o:any){
    console.log(o);
    this.router.navigate(['user/organisation'],{
      queryParams:
      {id :o.id}
    })
  }
  open(s: any, content: any){
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, {centered: true})
    // this.getAllServices();
  }
  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 3 || this.search.toString().length == 0
      ? this.getAllOrgs()
      : null;
  }
  deleteOrg(o:any){

    console.log(o)
    this.userService.deleteOrg(o).subscribe(success => {
      console.log(success);
      // this.contacts = success;
      this.toastService.success("Org Deleted Successfully!");
      this.modalService.dismissAll();
      this.getAllOrgs();
    }, error => {
      console.log(error);
      this.toastService.error('Unable to Delete !');
    });
  }

  add(){
    this.router.navigate(['/user/organisation']);
  }
  

}


