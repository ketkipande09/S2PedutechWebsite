import { Component,OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  mainData: any = [];
  projectcount:number = 0;
  projectnumber:number=0;
  projectclient:number=0;

  constructor(private restService: RestService, private router: Router) { }
  
  projectcountstop:any = setInterval (()=>{

    this.projectcount++;
    if(this.projectcount==400)
    {
      clearInterval(this.projectcountstop);
    }
  },10

  )

  projectnumberstop:any = setInterval(()=>{

    this.projectnumber++;
    if(this.projectnumber == 50)
    {
      clearInterval(this.projectnumberstop);
    }
  },80

  )
  projectclientstop:any = setInterval(()=>{

    this.projectclient++;
    if(this.projectclient == 15)
    {
      clearInterval(this.projectclientstop);
    }
  },80

  )

  ngOnInit(): void {
    this.getall();
  }

  getall(){
    this.restService.getmaincomponent().subscribe((data: any) => {
      this.mainData = data.result.Home;
      console.log("aara", this.mainData)
    });
  }
}
