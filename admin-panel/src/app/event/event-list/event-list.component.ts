import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventService } from 'src/app/services/event-services/event.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  selectedRow: any;
  search: any = '';
  page = 1;
  pagesize = 10;
  ap:any;
  readList: any;
  disabled: boolean = false;

  public currentPageLimit: number = 0;
  public pageLimitOptions = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  collection: any;

  constructor(
    private service: EventService,
    private router: Router,
    private modalService: NgbModal,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.getEvents();
// console.log(this.getEvents,"get all event");

  }

  onChangePage(pageNo: any) {
    console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getEvents();
  }

  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 0 || this.search.toString().length == 0
      ? this.getEvents()
      : null;
  }

  getEvents() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };
    this.service.getAllEvents(obj).subscribe((res) => {
      console.log(res, "<=getAll");
      this.readList = res.result.events;
      this.collection = res.result.count;
      console.log(this.readList);
    });
  }

  editList(data: any) {
    // console.log(data,"inside edit");
    this.router.navigate(['/event/event-form'], {
      queryParams: data,
    });
  }

  delete(id: any) {
    this.spinner.show();
    this.service.deleteEvent(id).subscribe((res) => {
      this.toastService.success('Event Deleted Successfully!');
      this.modalService.dismissAll();
      this.spinner.hide();
      this.getEvents();
    });
  }
  open(s: any, content: any) {
    this.selectedRow = s;
    // console.log(s);
    this.modalService.open(content, { centered: true });
    // this.getAllServices();
  }
  // view(c: any) {
  //   this.router.navigate(['/feedback/feedback-list'], {
  //     queryParams: {
  //       eventId: c.id,
  //       eventName: c.eventName,
  //     },
  //   });
  //   // console.log(c.id, c.eventName)
  // }

  add() {
    this.router.navigate(['/event/event-form']);
  }
  eventStatus(c: any) {
    console.log("sdfdsf",c);
    this.service.updateEventStatus(c.id, c).subscribe(
      (success: any) => {
        console.log(success);
        this.toastService.success(success['result'].message);
        this.getEvents();
      },
      (error) => {
        console.log(error);
      }
    );
  }
 
}
