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
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500)
      ])
    ]),
    trigger('slideInOut', [
      state('void', style({ transform: 'translatey(100%)' })),
      transition(':enter', [
        animate('1s ease-in-out')
        
      ])
    ]),
  ],
})
export class MainComponent implements OnInit, OnDestroy {
  selectedTab: any;
  mainData: any = [];
  animationState: string = 'in';
  currentNumber: number = 0;
  targetNumber: any;
  yearExperienceNumber: number = 0
  yearExperience: any;
  employeeNumber: number = 0;
  employee: any;
  showLine1: boolean = true;

  private subscription: Subscription;
  
  constructor(private restService: RestService, private router: Router, ) {
    this.subscription = new Subscription();
  } 
  showOne() {
    this.selectedTab = 'one';
  }
  showTwo() {
    this.selectedTab = 'two';
  }
  showThree() {
    this.selectedTab = 'three';
  }
  showFour() {
    this.selectedTab = 'four';
  }
  
  ngOnInit(): void {
    this.selectedTab = 'one';
    this.getall();
    // this.getalldata();
    this.animationState = 'in';
    this.subscription = interval(10).subscribe(() => {
      this.incrementNumber();
      // this.incrementNumberEmployee();
      // this.incrementNumberYearExperience();
    });
    setInterval(() => {
      this.toggleLines();
    }, 3000);
  }
  toggleLines() {
    this.showLine1 = !this.showLine1;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  incrementNumber() {
    if (this.currentNumber < this.targetNumber) {
      this.currentNumber++;
    }
  }

  // incrementNumberYearExperience() {
  //   if (this.yearExperienceNumber < this.yearExperience) {
  //     this.yearExperienceNumber++;
  //   }
  // }
  // incrementNumberEmployee() {
  //   if (this.employeeNumber < this.employee) {
  //     this.employeeNumber++;
  //   }
  // }
  incrementNumberOne(){

  }

  getall() {
    this.restService.getbulletin().subscribe((data: any) => {
      this.mainData = data.result.Home;
      this.targetNumber = this.mainData[0]?.placementCount 
    });
  }
  // getalldata() {
  //   this.restService.getbulletin().subscribe((data: any) => {
  //     this.mainData = data.result.Home;
  //     this.targetNumber = this.mainData[0]?.placementCount
  //     this.yearExperience = this.mainData[0]?.YearsExperience;
  //     this.employee = this.mainData[0]?.OurEMPLOYEE;
  //   });
  // }

}

