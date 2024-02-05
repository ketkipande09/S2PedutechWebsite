import { Component, OnInit, EventEmitter, Input, } from '@angular/core';
import { EventService } from 'src/app/services/event-services/event.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PlacementService } from 'src/app/Services/placement-service/placement.service';
@Component({
  selector: 'app-placement-list',
  templateUrl: './placement-list.component.html',
  styleUrls: ['./placement-list.component.css']
})
export class PlacementListComponent implements OnInit {

  selectedRow: any;
  search: any = '';
  page = 1;
  pagesize = 10;
  ap: any;
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
    private PlacementService: PlacementService,
    private router: Router,
    private modalService: NgbModal,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getAllPlacements();
  }

  onChangePage(pageNo: any) {
    console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getAllPlacements();
  }


  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 0 || this.search.toString().length == 0
      ? this.getAllPlacements()
      : null;
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

  editList(data: any) {
    // console.log(data,"inside edit");
    this.router.navigate(['/placement/placement-form'], {
      queryParams: data,
    });
  }

  delete(id: any) {
    this.spinner.show();
    this.PlacementService.deletePlacement(id).subscribe((res) => {
      this.toastService.success('placement Deleted Successfully!');
      this.modalService.dismissAll();
      this.spinner.hide();
      this.getAllPlacements();
    });
  }

  add() {
    this.router.navigate(['/placement/placement-form']);
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    // console.log(s);
    this.modalService.open(content, { centered: true });
    // this.getAllServices();
  }

}