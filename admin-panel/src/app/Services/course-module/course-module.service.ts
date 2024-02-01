import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CourseModuleService {
 
 
  constructor(private http:HttpClient) { }


  createImage(payload:any){
    return this.http.post(environment.apiEndpoint+`courses/createCourse`,payload);
  }

  updateImage(id:any, payload:any){
    console.log("course", id);
    console.log(environment.apiEndpoint+`courses/updateCourse/+id`, payload);
    return this.http.put(environment.apiEndpoint+`courses/updateCourse/${id}`, payload);
  }

  getImageById(id:any){
    return this.http.get(environment.apiEndpoint+`courses/getCourseById/`+id)
  }

  getAllServices(obj:any){
    return this.http.get(environment.apiEndpoint+
      `courses/getCourseListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
  }

  deleteCourse(id:any){
    console.log("id service", id);
    
    return this.http.delete(environment.apiEndpoint+`courses/deleteCourse/${id}`);

  }
}
