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
  yearExperienceNumber: number = 0
  yearExperience: any;
  employeeNumber: number = 0;
  employee: any;
  
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
    this.getalldata();
    this.animationState = 'in';
    this.subscription = interval(10).subscribe(() => {
      this.incrementNumber();
      this.incrementNumberEmployee();
      this.incrementNumberYearExperience();
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

  incrementNumberYearExperience() {
    if (this.yearExperienceNumber < this.yearExperience) {
      this.yearExperienceNumber++;
    }
  }
  incrementNumberEmployee() {
    if (this.employeeNumber < this.employee) {
      this.employeeNumber++;
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
  getalldata() {
    this.restService.getbulletin().subscribe((data: any) => {
      this.mainData = data.result.Home;
      this.targetNumber = this.mainData[0]?.placementCount
      this.yearExperience = this.mainData[0]?.YearsExperience;
      this.employee = this.mainData[0]?.OurEMPLOYEE;
    });
  }

}

