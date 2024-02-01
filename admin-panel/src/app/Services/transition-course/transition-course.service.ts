import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TransitionCourseService {

  constructor(private http:HttpClient) { }


getAllTransition(obj:any){
  return this.http.get(environment.apiEndpoint+`transition/getListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
}

getTransitionById(id:any){
  return this.http.get(environment.apiEndpoint+`transition/getById/${id}`);
}

createImage(payload:any){
  console.log(payload);
  
  return this.http.post(environment.apiEndpoint+`transition/create`,payload);
}

updateTransition(id:any , payload:any){
  // console.log(id, "updateTransition id");
  // console.log(payload, "updateTransition payload ");
  return this.http.put(environment.apiEndpoint + `transition/update/${id}`,payload);
}

uploadPdf(id:any,payload:any){
  console.log(id,"uploadpdf id");
  console.log(payload,"uploadpdf payload");
  return this.http.put(environment.apiEndpoint+`transition/uploadPdf/${id}`,payload);

}


deleteTransition(id:any){
  console.log(id,"transition id");
  return this.http.delete(environment.apiEndpoint+`transition/delete/${id}`);
}
}
