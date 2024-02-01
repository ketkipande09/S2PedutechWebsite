import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventRoutingModule } from './event-routing.module';
import { EventFormComponent } from './event-form/event-form.component';
import { EventListComponent } from './event-list/event-list.component';
import { HttpClientModule } from '@angular/common/http';
import { EventService } from '../services/event-services/event.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../core/core.module';
@NgModule({
  declarations: [
    EventFormComponent,
    EventListComponent
  ],
  imports: [
    FormsModule, 
    ReactiveFormsModule,
    CommonModule,
    EventRoutingModule,
    HttpClientModule,NgbModule,
    CoreModule.forRoot(),
  ],
  providers: [EventService]
})
export class EventModule { }
