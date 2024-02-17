import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { ContactusComponent } from './contactus/contactus.component';
import { GalleryComponent } from './gallery/gallery.component';
import { LandingComponent } from './landing/landing.component';
import { PlacementComponent } from './placement/placement.component';
import { DevelopmentComponent } from './development/development.component';
import { CareerComponent } from './career/career.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',

  },
  {
    path: 'landing', component: LandingComponent

  },

  {
    path: 'gallery', component: GalleryComponent

  },
  {
    path: 'contact', component: ContactusComponent

  },
  {
    path: 'placement', component: PlacementComponent

  },
  {
    path: 'development', component: DevelopmentComponent

  },
  {
    path: 'career', component: CareerComponent

  }

]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
