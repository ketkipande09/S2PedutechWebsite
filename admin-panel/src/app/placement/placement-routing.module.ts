import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlacementFormComponent } from './placement-form/placement-form.component';
import { PlacementListComponent } from './placement-list/placement-list.component';

const routes: Routes = [
  {
   path:'',
   data:{
    title:'placement'
  },
  children:[
    {
        path:'',
        redirectTo:'placement-form'
    },
    {
        path:'placement-form',
        component:PlacementFormComponent,
        data:{
            title:'placement-form'
        }
    },
    {
        path:'placement-list',
        component:PlacementListComponent,
        data:{
            title:'placement-list'
        }
    }
]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacementRoutingModule { }
