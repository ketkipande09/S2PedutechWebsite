import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { ContactusComponent } from './contactus/contactus.component';
import { GalleryComponent } from './gallery/gallery.component';
import { LandingComponent } from './landing/landing.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  
  },
  {
    path: 'landing',component:LandingComponent
   
  },

  {
    path: 'gallery',component:GalleryComponent
   
  },
  {
    path: 'contact',component:ContactusComponent
   
  }

]
@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule]
})
export class AppRoutingModule { }
