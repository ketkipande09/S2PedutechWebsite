import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient , HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http:HttpClient) { }


// getAllFeedback(obj:any){
//   console.log(obj);
  
//   return this.http.get(environment.apiEndpoint+
//     `feedback/getFeedback?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);

// }

getContact(){
  return this.http.get(environment.apiEndpoint + "contact/getContact")
};

deleteFeedback(id:any){
  console.log();
  return this.http.delete(environment.apiEndpoint+`/feedback/deleteFeedback/${id}`);
  
}

// downloadFile(obj:any) {
//   console.log("obj",obj)
//   return this.http.get(
//     environment.apiEndpoint +
//       `/feedback/downloadFile?type=${obj.type}&search=${obj.search}`,
//     {
//       responseType: 'blob',
//       headers: new HttpHeaders().append('Content-Type', 'text/csv'),
//     }
//   );
// }
downloadFile(obj:any) {
  console.log("obj", obj);
  
  return this.http.get(environment.apiEndpoint + `/feedback/downloadFile/${obj.id}?type=${obj.type}`, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "text/csv"),
  });
}


}
