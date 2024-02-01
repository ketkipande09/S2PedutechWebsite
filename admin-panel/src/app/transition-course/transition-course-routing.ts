import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransitionCourseFormComponent } from './transition-course-form/transition-course-form.component';
import { TransitionCourseListComponent } from './transition-course-list/transition-course-list.component';

const transitionRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'transition',
    },
    children: [
      {
        path: '',
        redirectTo: 'transition-list',
      },
      {
        path: 'transition-form',
        component: TransitionCourseFormComponent,
        data: {
          title: 'transition-Form',
        },
      },
      {
        path: 'transition-list',
        component: TransitionCourseListComponent,
        data: {
          title: 'transition-List',
        },
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(transitionRoutes)],
  exports: [RouterModule],
})
export class TransitionRoutingModule {}
