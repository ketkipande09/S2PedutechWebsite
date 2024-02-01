import { Component, OnInit } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { UserService } from 'src/app/services/user/user.service';
import { identifierModuleUrl } from '@angular/compiler';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.css']
})
export class HomeListComponent implements OnInit {
  homeForm: any;
  id : any = [];
  selectedRow: any;

  constructor(private userService :  UserService, 
              private router : Router,
              private modalService:NgbModal,
              private toastService:ToastrService) { }

  ngOnInit(): void {
    this.getAllHome();
  }
  homeUsers: any = [];
   // public userForm : FormGroup;
   collection: any;
   submitted = false;
   page = 1;
   pageSize = 25;
   search: any = "";
   params: any;
   
   

  

  getAllHome() {
    this.userService.getAllHome().subscribe(
      (success:any) => {
        console.log(success);
        this.homeUsers = success.result.Home;
        // this.collection =success.result.home.count;

      }, (error: any) => {
        console.log(error);

      }
    )
  }

  open(s: any, content: any){
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, {centered: true})
    // this.getAllServices();
  }
  deleteHome(c:any){

    console.log(c)
    this.userService.deleteHome(c).subscribe((success:any) => {
      console.log(success);
      // this.contacts = success;
      this.getAllHome();
      this.modalService.dismissAll();
      this.toastService.success("Deleted Successfully!");
    }, (error:any) => {
      console.log(error);
      this.toastService.error('Unable to Delete !');
    });
  }

  edit(c:any){
    console.log(c);
    this.router.navigate(['user/home'],{
      queryParams:{
          id :c.id,
      }
    })
  }
add(){
  this.router.navigate(['/user/home']);
}

}
