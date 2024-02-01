import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule, ToastrService } from "ngx-toastr";

import { AlertComponent, 
  AlertService,
   ValidationMessagesComponent, 
   ValidationService } from "./components/index";
import { AuthGuard } from "./guards/index";
import { JwtInterceptorProvider, ErrorInterceptorProvider } from "./helpers/index";

import { UserService } from "./services";
// import { NgxSpinnerModule } from 'ngx-spinner';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ToastrModule.forRoot()
    ],
  declarations: [
    AlertComponent,
     ValidationMessagesComponent
    ],
  exports: [
    AlertComponent, 
    ValidationMessagesComponent, 
    ToastrModule,
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        AuthGuard,
        UserService, 
        AlertService, 
        ValidationService, 
        JwtInterceptorProvider, 
        ErrorInterceptorProvider,
         ToastrService
        ]
    };
  }
}
