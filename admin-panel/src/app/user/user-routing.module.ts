import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';

import { HomeComponent } from "./home/home.component";
import { HomeListComponent } from "./home-list/home-list.component";
import { SliderComponent } from "./slider/slider.component";
import { SliderListComponent } from "./slider-list/slider-list.component";
import { OrganisationComponent } from "./organisation/organisation.component";
import { OrganisationListComponent } from "./organisation-list/organisation-list.component";
import { StudentsComponent } from "../portal/students/students.component";
import { ClientFormComponent } from "./client-form/client-form.component";
import { ClientListComponent } from "./client-list/client-list.component";


const userRoutes: Routes = [

  {
    path: '',
    data: {
      title: 'User'
    },
    children: [
      {
        path: '',
        redirectTo: 'user-list'
      },
      {
        path: 'user-list',
        component: UserListComponent,
        data: {
          title: 'Users List'
        }
      },
      {
        path: 'user-form',
        component: UserFormComponent,
        data: {
          title: 'Users Form'
        }
      },
        // {
        //   path: 'placement',
        //   component: PlacementComponent,
        //   data: {
        //     title: 'Users placement'
        //   }
        
        // },
        {
          path: 'home',
          component: HomeComponent,
          data: {
            title: 'bulletin/placement'
          }
        
        },
        {
          path: 'home-list',
          component: HomeListComponent,
          data: {
            title: 'list'
          }
        
        },
        {
          path: 'slider',
          component: SliderComponent,
          data: {
            title: 'slider'
          }
        
        },
        {
          path: 'slider-list',
          component: SliderListComponent,
          data: {
            title: 'slider'
          }
        
        },
        {
          path: 'organisation',
          component: OrganisationComponent,
          data: {
            title: 'organisation'
          }
        
        },
        {
          path: 'org-list',
          component: OrganisationListComponent,
          data: {
            title: 'organisationList'
          }
        
        },
        {
          path: 'student-list',
          component: StudentsComponent,
          data: {
            title: 'studentlist'
          }
        
        },
        {
          path: 'client-form',
          component: ClientFormComponent,
          data: {
            title: 'client-form'
          }
        
        },
        {
          path: 'client-list',
          component: ClientListComponent,
          data: {
            title: 'client-list'
          }
        
        },
    ]
  }
];
@NgModule({
    imports: [RouterModule.forChild(userRoutes)],
    exports: [RouterModule]
  })
  
export class UserRoutingModule {}