import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeedbackListComponent } from "./feedback-list/feedback-list.component";


const feedbackRoutes: Routes=[
    {
        path:'',
        data:{
            title:'feedback'
        },
        children:[
            {
                path:'',
                redirectTo:'feedback-list'
            },
            {
                path:'feedback-list',
                component:FeedbackListComponent,
                data:{
                    title:'feedback-list'
                }

            }
           
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(feedbackRoutes)],
    exports: [RouterModule]
})

export class FeedbackRoutingModule {}