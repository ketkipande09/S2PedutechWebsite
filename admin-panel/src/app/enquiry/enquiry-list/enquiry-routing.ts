import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnquiryListComponent } from './enquiry-list.component';

const enquiryRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'enquiry',
    },
    children: [
      {
        path: '',
        redirectTo: 'enquiry-list',
      },
      {
        path: 'enquiry-list',
        component: EnquiryListComponent,
        data: {
          title: 'enquiry-list',
        },
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(enquiryRoutes)],
  exports: [RouterModule],
})
export class EnquiryRoutingModule {}
