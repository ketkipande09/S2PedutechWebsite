import { Injectable } from '@angular/core';
import { LocalStorageService} from 'angular-web-storage'
@Injectable({
  providedIn: 'root'
})
export class HeaderService {
obj:any = {};
  constructor(private local: LocalStorageService) { }

  setHeader(user:any){
    console.log("user....");
    let obj:any = {};
    obj.uid = user.payload.id;
    obj.authorization = user.token;
    this.local.set("s2pHeader", obj);
  }
  getHeaders(){
    return this.local.get('s2pHeader')
  }
}
