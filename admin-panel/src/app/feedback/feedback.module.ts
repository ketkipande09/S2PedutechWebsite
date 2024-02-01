import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackListComponent } from './feedback-list/feedback-list.component';
import { FeedbackRoutingModule } from './feedback-routing';
import { CoreModule } from '../core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    FeedbackListComponent,
  ],
  imports: [
    CommonModule,
    FeedbackRoutingModule,
    CoreModule.forRoot(),
    NgbModule,
    // NgbModal,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule
  ]
})
export class FeedbackModule { }
