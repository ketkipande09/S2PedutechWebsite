import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class EventService {


  constructor(private http: HttpClient) { }

  createImage(data:any):Observable <any>
  { 
      console.log(data, "data")
      return this.http.post(environment.apiEndpoint+`event/createEvent`,data);
  }

  updateEvent(data:any , id:any){

    return this.http.put(environment.apiEndpoint+`event/updateEvent/${id}`, data);

  }
  updateEventStatus(id:any,data:any){
    console.log("id",environment.apiEndpoint+`event/updateEventStatus/${id}`, data);
    
    return this.http.put(environment.apiEndpoint+`event/updateEventStatus/${id}`, data);

  }
  //feedback
  EventById(id:any){
    console.log(id);
    
    return this.http.get(environment.apiEndpoint+`/feedback/getEventsById/${id}`);
 }

  getEventById(id :any){
     return this.http.get(environment.apiEndpoint+`event/getEventById/${id}`);
  }

  getAllEvents(obj:any):Observable<any>
  {
      return this.http.get(environment.apiEndpoint+`event/getAllEventListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
  }

  deleteEvent(id:any)
  {
    let ids = id;
    return this.http.delete(environment.apiEndpoint+`event/deleteEvent/${ids}`);
  }
}
