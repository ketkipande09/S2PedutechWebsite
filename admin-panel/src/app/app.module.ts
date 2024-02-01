import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ValidationService } from './core/components';
import { CoreModule } from './core/core.module';
import { UserFormComponent } from './user/user-form/user-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './user/home/home.component';
import { HomeListComponent } from './user/home-list/home-list.component';
import { SliderComponent } from './user/slider/slider.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidenavComponent } from './sidenav/sidenav.component';
import { HeaderComponent } from './header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { SliderListComponent } from './user/slider-list/slider-list.component';
import { ResetPasswordComponent } from './auth-module/reset-password/reset-password.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SetPasswordComponent } from './auth-module/set-password/set-password.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter/src/ng2-filter.module';
import { LogoutComponent } from './auth-module/logout/logout.component';
import { OrganisationComponent } from './user/organisation/organisation.component';
import { OrganisationListComponent } from './user/organisation-list/organisation-list.component';
import { StudentsComponent } from './portal/students/students.component';
import { PipePipe } from './pipe.pipe';


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    HomeListComponent,
    SliderComponent,
    SidenavComponent,
    SliderListComponent,
    HeaderComponent,
    ResetPasswordComponent,
    SetPasswordComponent,
    LogoutComponent,
    OrganisationComponent,
    OrganisationListComponent,
    StudentsComponent,
    PipePipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    CommonModule,
    PdfViewerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    CoreModule.forRoot(),
    NgbModule,
    NgxSpinnerModule,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
