import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { catchError, map, throwError } from 'rxjs';
// import { JwtInterceptorProvider } from 'src/app/helpers/jwt.interceptor';
@Injectable({
  providedIn: 'root'
})

export class UserService {
  user:any;
  constructor(private http: HttpClient, public router: Router
  ) {
    this.user = localStorage.getItem('s2pUser');
    this.user = JSON.parse(this.user);
    // console.log(this.user)
    const headers = new Headers();
    // headers.append('Authorization', 'Bearer' + '' + token)
    // this.options = new RequestOptions({})
  }

  getById(id:any){
// console.log("id", id);
    return this.http.get(environment.apiEndpoint + `/user/profile?id=${id}`).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );
  } 

  createUser(userPayLoad: any) {
    return this.http.post(environment.apiEndpoint + `/user/signUp`, userPayLoad);


  }

  getAllUsers(obj: any) {
    return this.http.get(environment.apiEndpoint + `user/getAllUsers?page=${obj.page}&pagesize=${obj.pageSize}&search=${obj.search}`).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );

  }

  updateUser(id: any, PayLoad: any) {
    // let headers = new HttpHeaders()
    // headers = headers.append('Authorization', `jwt ${this.user.token}`);
    // console.log(id)
    // console.log("headers")
    return this.http.put(environment.apiEndpoint + `/user/updateProfile?id=${id}`, PayLoad).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );
  }

  deleteUser(id: any) {
    // return user;
    // let headers = new HttpHeaders()
    // headers = headers.append('Authorization', `jwt ${this.user.token}`);
    // console.log(id)
    // console.log("headers")
    return this.http.delete(environment.apiEndpoint + `/user/delete/${id}`);
  }
  private handleErrorObservable(error: HttpErrorResponse) {
    return throwError(error);
  }

  createHome(userPayLoad: any) {
    return this.http.post(environment.apiEndpoint + `/home/create`, userPayLoad)
  }

  getAllHome() {
    return this.http.get(environment.apiEndpoint + `home/getListing`).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    );

  }

  deleteHome(id: any) {
 

    return this.http.delete(environment.apiEndpoint + `home/delete/${id}`);
  }

  updateHome(id:any, userPayLoad: any){
    return this.http.put(environment.apiEndpoint + `home/update/${id}`,userPayLoad).pipe(
      map((res:any)=> res),
      catchError(this.handleErrorObservable)
    );
  }

  getHomeById(id : any)
  {
    return this.http.get(environment.apiEndpoint + `home/getByid/${id}`);
    }

    createImage(payload:any){
      return this.http.post(environment.apiEndpoint+`/slider/create`,payload);
    }

    updateImage(id:any, payload:any){
      console.log("slider", id);
      console.log(environment.apiEndpoint+`slider/update/+id`, payload);
      return this.http.put(environment.apiEndpoint+`slider/update/${id}`, payload);
    }

    getImageById(id:any){
      return this.http.get(environment.apiEndpoint+`/slider/getById/`+id)
    }

    getAllSliders(obj: any){
      return this.http.get(environment.apiEndpoint+ `/slider/getListing?page=${obj.page}&pageSize=${obj.pageSize}`).pipe(
        map((res:any) => res),
        catchError(this.handleErrorObservable)
      );
    }

    deleteSlider(id:any){
      console.log("id Slider", id);
      
      return this.http.delete(environment.apiEndpoint+`/slider/delete/${id}`);
  
    }


    //* organisation Api *//
    createOrg(userPayLoad : any){
      return this.http.post(environment.apiEndpoint + `/org/createOrg`, userPayLoad)

    }

    updateOrg(id : any , userPayLoad : any )
    {
      return this.http.put(environment.apiEndpoint + `/org/updateOrg/${id}`,userPayLoad).pipe(
        map((res:any)=> res),
        catchError(this.handleErrorObservable)
      );

    }

    getOrgById(id:any)
    {
      return this.http.get(environment.apiEndpoint + `/org/getOrgById/${id}`).pipe(
        map((res: any) => res),
        catchError(this.handleErrorObservable)
      );
    }

    getAllOrgs()
    {
      return this.http.get(environment.apiEndpoint + `/org/getOrgListing`).pipe(
        map((res: any) => res),
        catchError(this.handleErrorObservable)
      ); 
    }

    deleteOrg(id:any){
    console.log(id)

      return this.http.delete(environment.apiEndpoint+`/org/deleteOrg/${id}`);

    }



    //portal registration api//
    getAllStudents(obj:any)
    {
      console.log("obj getAllStudents", obj);      

      return this.http.get(environment.apiEndpoint +
         `/portalRegistration/getAllUsers?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}&eventId=${obj.eventId}`);
    }

    getAllEvents(obj:any)
    {
        return this.http.get(environment.apiEndpoint+`event/getEventListing?page=${obj.page}&pagesize=${obj.pagesize}&search=${obj.search}`);
    }

    deleteStudent(id:any){
      return this.http.delete(environment.apiEndpoint+ `/portalRegistration/delete/${id}`);

    }

studentGetById(obj:any){
  return this.http.get(environment.apiEndpoint+ `/portalRegistration/studentGetById/${obj.id}`);
}

    downloadFile(obj:any) {
      console.log("obj service", obj);      
      return this.http.get(environment.apiEndpoint + `/portalRegistration/downloadFile/?type=${obj.type}&search=${obj.search}`,
       {
          responseType: "blob",
          headers: new HttpHeaders().append("Content-Type", "text/csv"),
      });
    }
 
  

}


