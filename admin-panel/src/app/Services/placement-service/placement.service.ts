import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PlacementService {

  constructor(private http: HttpClient) { }

  createPlacement(data: any): Observable<any> {
    console.log(data, "data")
    return this.http.post(environment.apiEndpoint + `placement/createplacement`, data);
  }

  updatePlacement(data: any, id: any) {

    return this.http.put(environment.apiEndpoint + `placement/update/${id}`, data);

  }
  getPlacementById(id: any) {
    return this.http.get(environment.apiEndpoint + `placement/getById/${id}`);
  }

  getLLPlacement(obj: any): Observable<any> {
    return this.http.get(environment.apiEndpoint + `placement/getListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
  }
  deletePlacement(id: any) {
    let ids = id;
    return this.http.delete(environment.apiEndpoint + `placement/delete/${ids}`);
  }

}




