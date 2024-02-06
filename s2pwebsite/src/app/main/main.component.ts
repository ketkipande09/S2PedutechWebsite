import { Component,OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('textAnimation', [
      state('void', style({   transform: 'translateX(-100%)' })),
      transition('void => *', [
        animate('2000ms ease-in-out', style({transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class MainComponent {
  mainData: any = [];
  projectcount:number = 0;
  projectnumber:number=0;
  projectclient:number=0;


  animationState: string = 'in';


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
    this.animationState = 'in';
  }
  homeUsers: any = [];

  getall(){
    this.restService.getbulletin().subscribe((data: any) => {
      this.mainData = data.result.Home;
      console.log("aara", this.mainData)
    });
  }


  
}
