import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactusComponent } from './contactus/contactus.component';
import { GalleryComponent } from './gallery/gallery.component';
import { CareerComponent } from './career/career.component';
import { PlacementComponent } from './placement/placement.component';
import { DevelopmentComponent } from './development/development.component';
import { MainComponent } from './main/main.component';
import { LearningtoolsComponent } from './learningtools/learningtools.component';
import {HttpClientModule  } from "@angular/common/http";
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    
   ContactusComponent,
    GalleryComponent,
    CareerComponent,
    PlacementComponent,
    DevelopmentComponent,
    MainComponent,
    LearningtoolsComponent,
    LandingComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,SharedModule,HttpClientModule,ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
