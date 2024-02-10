import { Component,OnInit, inject, TemplateRef } from '@angular/core';
import { PlacementService } from '../services/placement/placement.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../services/event-services/event.service';

@Component({
  selector: 'app-placement',
  templateUrl: './placement.component.html',
  styleUrls: ['./placement.component.scss']
})
export class PlacementComponent implements OnInit{
  isAbove1200px = window.innerWidth > 1200;
  selectedRow: any;
  search: any = '';
  page = 1;
  pagesize = 10;
  ap: any;
  readList: any;
  readLists: any;
  disabled: boolean = false;
  collection: any;
  collections: any;
  private modalService =inject(NgbModal)


  constructor(
    private PlacementService: PlacementService,
    private router: Router,
    private service: EventService
  ) { }

  openVerticallyCentered(content: TemplateRef<any>) {
		this.modalService.open(content, { centered: true });
	}

  ngOnInit(): void {
    this.getAllPlacements();
    this.getEvents();
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
      this.readLists = res.result.events;
      this.collections = res.result.count;
    });
  }
}
