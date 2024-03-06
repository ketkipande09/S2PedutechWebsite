import { Component, OnInit, inject, TemplateRef } from '@angular/core';
import { PlacementService } from '../services/placement/placement.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../services/event-services/event.service';
import { RestService } from '../services/rest.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-placement',
  templateUrl: './placement.component.html',
  styleUrls: ['./placement.component.scss']
})
export class PlacementComponent implements OnInit {
  isAbove1200px = window.innerWidth > 1200;
  selectedRow: any;
  search: any = '';
  page = 1;
  mainData: any = [];
  animationState: string = 'in';
  currentNumber: number = 0;
  targetNumber: any;
  yearExperienceNumber: number = 0
  yearExperience: any;
  employeeNumber: number = 0;
  employee: any;
  private subscription: Subscription;
  pagesize = 10;
  ap: any;
  readList: any;
  readLists: any;
  disabled: boolean = false;
  collection: any;
  collections: any;
  private modalService = inject(NgbModal)
  checkEvent: boolean = false

  constructor(
    private restService: RestService,
    private PlacementService: PlacementService,
    private router: Router,
    private service: EventService
  ) {
    this.subscription = new Subscription();
  }

  openVerticallyCentered(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }

  ngOnInit(): void {
    this.getAllPlacements();
    this.getEvents();
    this.getall();
    this.animationState = 'in';
    this.subscription = interval(10).subscribe(() => {
      this.incrementNumber();
      this.incrementNumberEmployee();
      this.incrementNumberYearExperience();
    });
  }
  getAllPlacements() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };
    this.PlacementService.getLLPlacement(obj).subscribe((res) => {
      this.readList = res.result.placement;
      this.collection = res.result.count;
      console.log(this.readList);
    });
  }

  getEvents() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };
    this.service.getAllEvents(obj).subscribe((res) => {
      console.log(res, "<=getAll");
      this.readLists = res?.result?.events;
      if (this.readLists.length > 0) {
        this.checkEvent = this.readLists?.some((item: any) => item.eventStatus == true)

      }
      this.collections = res?.result?.count;
    });
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  getall() {
    this.restService.getbulletin().subscribe((data: any) => {
      this.mainData = data.result.Home;
      this.targetNumber = this.mainData[0]?.placementCount
      this.yearExperience = this.mainData[0]?.YearsExperience;
      this.employee = this.mainData[0]?.OurEMPLOYEE;
    });
  }

}
