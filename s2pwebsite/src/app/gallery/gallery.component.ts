import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit{
  selectedTab: any;

  showPhoto() {
    this.selectedTab = 'photo';
  }

  showVideo() {
    this.selectedTab = 'video';
  }

  ngOnInit(): void {
    this.selectedTab = 'photo';
  }
}
