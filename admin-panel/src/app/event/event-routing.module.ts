import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventFormComponent } from './event-form/event-form.component';
import { EventListComponent } from './event-list/event-list.component';
const routes: Routes = [
  {
    path:'',
    data:{
        title:'event'
    },
    children:[
        {
            path:'',
            redirectTo:'event-list'
        },
        {
            path:'event-form',
            component:EventFormComponent,
            data:{
                title:'event-Form'
            }
        },
        {
            path:'event-list',
            component:EventListComponent,
            data:{
                title:'event-List'
            }
        }
    ]
}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }
