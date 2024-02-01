import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserRoutingModule } from './user-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from '../auth-module/login/login.component';
// import { PlacementComponent } from './placement/placement.component';
import { CoreModule } from '../core/core.module';
// import { BrowserModule } from '@angular/platform-browser';
import { SliderListComponent } from './slider-list/slider-list.component';
import { SliderComponent } from './slider/slider.component';
import { HomeListComponent } from './home-list/home-list.component';
import { HomeComponent } from './home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientListComponent } from './client-list/client-list.component';
@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
    ClientFormComponent,
    ClientListComponent,
    //  PlacementComponent
    // BrowserAnimationsModule,
  
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule.forRoot(),
    NgbModule,
    NgxSpinnerModule,
    // NgbModal
    
    
  ]
})
export class UserModule { }
