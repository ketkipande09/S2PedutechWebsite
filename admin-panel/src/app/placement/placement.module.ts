import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacementRoutingModule } from './placement-routing.module';
import { PlacementFormComponent } from './placement-form/placement-form.component';
import { PlacementListComponent } from './placement-list/placement-list.component';
import { EventService } from '../services/event-services/event.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../core/core.module';


@NgModule({
  declarations: [
    PlacementFormComponent,
    PlacementListComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PlacementRoutingModule,
    HttpClientModule, NgbModule,
    CoreModule.forRoot(),
  ],
  providers: [EventService]
})
export class PlacementModule { }
