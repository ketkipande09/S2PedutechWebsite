import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  createClient(payload:any){
    return this.http.post(environment.apiEndpoint+`client/create`,payload);
  }

  updateClient(id:any, payload:any){
   
    return this.http.put(environment.apiEndpoint+`client/update/${id}`, payload);
  }

  getClientById(id:any){
    return this.http.get(environment.apiEndpoint+`client/getById/`+id)
  }

  getAllClient(){
    return this.http.get(environment.apiEndpoint+
      `client/getListing`);
  }

  deleteClient(id:any){
    
    return this.http.delete(environment.apiEndpoint+`client/delete/${id}`);

  }
}
