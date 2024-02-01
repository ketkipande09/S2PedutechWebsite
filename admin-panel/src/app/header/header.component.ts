import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../Services/auth-services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
id:any=[];
  @Output() toggleSide : EventEmitter<any> = new EventEmitter();
  userDetails: any;
  constructor(private fb:FormBuilder, private router : Router, private authService :AuthService, private actRoute :ActivatedRoute
    ) { }
  collapsed = true;
  ngOnInit(): void {
      
    }

  toggleSidebar(){
    this.toggleSide.emit();
  }

  idpatch(){
    let obj:any = localStorage.getItem("s2pUser");
    let user = JSON.parse(obj);
    this.router.navigate(['auth/reset-pwd'],{
      queryParams:{
          id : user.id,
           // console.log(user.id);
      }
    
    })
  }

  // goToReset()
  // {
  //   this.router.navigate(["auth/reset-pwd"]);
  //   // queryParams :{
  //   //   id : 
  //   // }
  // }

  logout(){
    this.authService.logout();
  }

  

  

}


