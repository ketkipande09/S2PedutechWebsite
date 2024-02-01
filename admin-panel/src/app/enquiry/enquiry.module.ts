import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnquiryListComponent } from './enquiry-list/enquiry-list.component';
import { EnquiryRoutingModule } from './enquiry-list/enquiry-routing';
import { CoreModule } from '../core/core.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    EnquiryListComponent
  ],
  imports: [
    CommonModule,EnquiryRoutingModule,
    CoreModule.forRoot(),ReactiveFormsModule,FormsModule,NgbModule,
    Ng2SearchPipeModule
  ]
})
export class EnquiryModule { }
