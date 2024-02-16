import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/gallery-services/user.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  selectedTab: any;
  maindata: any = [];

  constructor(private user: UserService, private router: Router, private sanitizer: DomSanitizer) {
  }

  showPhoto() {
    this.selectedTab = 'photo';
  }
  sanitizeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
      this.maindata = data.result.slider.filter((x: any) => x.image || x.videoUrl);
    });
  }
  openImage(imageUrl: string) {
    console.log('Opening image:', imageUrl);
    window.open(imageUrl, '_blank');
  }
}
