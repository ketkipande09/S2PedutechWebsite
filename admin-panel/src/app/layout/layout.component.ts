import { Component, OnInit } from '@angular/core';
import { Router,RouterModule } from '@angular/router';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  sideBarOpen = true;

  constructor(private router:Router) { }
  // status: any;

  ngOnInit(): void {
  }
  public sidebarShow: boolean = false;
  status: boolean = false;
  clickEvent(){
      this.status = !this.status;       
  }

  sideBarToggler(){
    this.sideBarOpen = !this.sideBarOpen;
  }
}


