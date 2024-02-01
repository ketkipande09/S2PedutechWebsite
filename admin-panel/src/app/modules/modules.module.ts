import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesFormComponent } from './services-form/services-form.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { ModulesRoutingModule } from './modules-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
   ServicesFormComponent,
   ServicesListComponent
  ],
  imports: [
    CommonModule,
    ModulesRoutingModule,ReactiveFormsModule,FormsModule,
    CoreModule.forRoot(),NgbModule
  ],
})
export class ModulesModule { }