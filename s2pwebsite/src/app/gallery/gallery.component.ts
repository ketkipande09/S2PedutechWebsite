import { Component,OnInit } from '@angular/core';
import { UserService } from '../services/gallery-services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit{
  selectedTab: any;
  maindata: any ;

  constructor(private user : UserService, private router: Router, ) {
  } 

  showPhoto() {
    this.selectedTab = 'photo';
  }

  showVideo() {
    this.selectedTab = 'video';
  }

  ngOnInit(): void {
    this.selectedTab = 'photo';
    this.getAll()
  }
  getAll() {
    this.user.getAllSliders().subscribe((data: any) => {
       this.maindata = data.result.slider;
       console.log('maindata', this.maindata);
       
    });
  }
}
