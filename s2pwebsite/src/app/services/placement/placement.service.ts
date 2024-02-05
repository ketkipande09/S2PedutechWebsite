import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {

  constructor(private http: HttpClient) { }

  getLLPlacement(obj: any): Observable<any> {
    return this.http.get(environment.apiEndpoint + `placement/getListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
  }
}
