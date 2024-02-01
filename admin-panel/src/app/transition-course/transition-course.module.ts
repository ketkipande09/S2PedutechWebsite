import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransitionCourseListComponent } from './transition-course-list/transition-course-list.component';
import { TransitionCourseFormComponent } from './transition-course-form/transition-course-form.component';
import { TransitionRoutingModule } from './transition-course-routing';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@NgModule({
  declarations: [
 
    TransitionCourseListComponent,
    TransitionCourseFormComponent
  ],
  imports: [
    CommonModule,TransitionRoutingModule,
    ReactiveFormsModule,FormsModule,
    CoreModule.forRoot(),NgbModule,
    PdfViewerModule
  ]
})
export class TransitionCourseModule { }
