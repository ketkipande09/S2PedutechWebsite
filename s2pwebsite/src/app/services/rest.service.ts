import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) { }

  getEnquiryById(id:any){
    return this.http.get(environment.apiEndpoint+`enquiry/getById/`+id)
  }

  createEnquiry(payload:any){
    return this.http.post(environment.apiEndpoint+`enquiry/createEnquiry`,payload);
  }

  createContact(payload:any){
    return this.http.post(environment.apiEndpoint+`contact/createContact`,payload);
  }

  getmaincomponent(){
    return this.http.get(environment.apiEndpoint + "home/getListing")
  };

  
  getplacementcomponent(){
    return this.http.get(environment.apiEndpoint + "home/getListing")
  };
}
