import { Component, OnDestroy, OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('textAnimation', [
      state('void', style({ transform: 'translateX(-100%)' })),
      transition('void => *', [
        animate('2000ms ease-in-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class MainComponent implements OnInit, OnDestroy {
  mainData: any = [];
  animationState: string = 'in';
  currentNumber: number = 0;
  targetNumber: any;
  
  private subscription: Subscription;
  
  constructor(private restService: RestService, private router: Router, ) {
    this.subscription = new Subscription();
  } 
  
  // img :any = {
  //   img1: "../",
  //   img2: "../../assets/landing.gif",
  //   img3: "../../assets/WELCOME TO.gif"
  // }
  
  ngOnInit(): void {
    this.getall();
    this.animationState = 'in';
    this.subscription = interval(10).subscribe(() => {
      this.incrementNumber();
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  incrementNumber() {
    if (this.currentNumber < this.targetNumber) {
      this.currentNumber++;
    }
  }
  incrementNumberOne(){

  }

  getall() {
    this.restService.getbulletin().subscribe((data: any) => {
      this.mainData = data.result.Home;
      this.targetNumber = this.mainData[0]?.placementCount 
    });
  }

}

