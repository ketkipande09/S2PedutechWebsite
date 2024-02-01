import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ServicesFormComponent } from "./services-form/services-form.component";
import { ServicesListComponent } from "./services-list/services-list.component";

const modulesRoutes: Routes = [
    {
        path: '',
        data: {
            title: 'services'
        },
        children: [
            {
                path: '',
                redirectTo: 'service-list'
            },
            {
                path: 'service-form',
                component: ServicesFormComponent,
                data: {
                    title: 'Service-Form'
                }

            },
            {
                path: 'service-list',
                component: ServicesListComponent,
                data: {
                    title: 'Service-List'
                }

            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(modulesRoutes)],
    exports: [RouterModule]
})

export class ModulesRoutingModule { }