import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/gallery-services/user.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  selectedTab: any;
  maindata: any = [];
  imageArr: any = [];
  videoArr: any = [];
  currentImageIndex: any;
  sliderArray: any = [];

  constructor(
    private user: UserService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) { }

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
    this.getAll();
  }
  getAll() {
    this.user.getAllSliders().subscribe((data: any) => {
      this.maindata = data.result.slider;
      this.imageArr = this.maindata
        .map((x: any) => {
          return {
            image: x.image,
            id: x.id,
            imageTitle:x.imageTitle
          };
          // return;
        })
        .filter((y: any) => y.image);

      this.videoArr = this.maindata
        .map((x: any) => {
          return {
            videoUrl: x.videoUrl,
          };
          // return;
        })
        .filter((y: any) => y.videoUrl);
    });
  }

  openVerticallyCentered(content: any, index: number, item: any) {
    this.sliderArray = []
    this.currentImageIndex = index;
    this.sliderArray = this.imageArr.filter((x: any) => x.id != item.id);
    this.sliderArray.unshift(item);
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  carouselSlide(slideEvent: any) {
    this.currentImageIndex = slideEvent.current;
  }
}
