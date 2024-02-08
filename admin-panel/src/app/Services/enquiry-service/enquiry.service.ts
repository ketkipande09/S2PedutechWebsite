import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class EnquiryService {
  constructor(private http: HttpClient) { }

  getAllEnquiry(obj: any) {
    console.log(obj);
    return this.http.get(
      environment.apiEndpoint +
      `/enquiry/getEnquiryListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}&course=${obj.course}&branch=${obj.branch}`
    );
  }

  deleteEnquiry(id: any) {
    return this.http.delete(
      environment.apiEndpoint + `/enquiry/deleteEnquiry/${id}`
    );
  }
  downloadFile(obj: any) {
    console.log("obj", obj)
    return this.http.get(
      environment.apiEndpoint +
      `/enquiry/downloadFile?type=${obj.type}&course=${obj.course}&branch=${obj.branch}`,
      {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'text/csv'),
      }
    );
  }
}
