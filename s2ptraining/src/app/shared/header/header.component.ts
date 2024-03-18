import { Component,EventEmitter,HostListener, Output } from '@angular/core';
import { Router,RouterModule, Routes } from '@angular/router';
import { PlacementComponent } from 'src/app/placement/placement.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent { 
  headerVisible = true;
  text: any = '';
  active: any = '';

  isCollapsed = false;
  isScroll: boolean = false;
  
    @Output() navigate = new EventEmitter();
  
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }  
  
  constructor(private router: Router) {}

  navigateTo(path:any){
    this.router.navigate([path])
  }
  

scrollTo(section:any){
  let element:any = document.getElementById(section);

  element.scrollIntoView({
    behavior : 'smooth',
    inline : 'nearest',
    block : 'start'
  })
  
}
routeTo(section:any){
  setTimeout(() => {
    this.scrollTo(section)
  }, 300);
}

  
  ngOnInit(): void {
    
    this.navigate.emit('Home')
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
  lastScrollTop = 0;
  // headerVisible = true;

  @HostListener('window:scroll', [])
  onWindowScroll() {
     const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > this.lastScrollTop) {
      // Scrolling down
      this.headerVisible = true;
    } else {
      // Scrolling up
      this.headerVisible = false;
    }
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
  tabChange(key:any){
    if (key === 'gallery' || key === 'contact') {
      this.scrollToTop();
    }
    this.navigate.emit(key);
  }
  

  

  
}
