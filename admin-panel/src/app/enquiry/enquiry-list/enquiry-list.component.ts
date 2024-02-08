import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { EnquiryService } from 'src/app/Services/enquiry-service/enquiry.service';
import { EnquiryService } from 'src/app/services/enquiry-service/enquiry.service';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-enquiry-list',
  templateUrl: './enquiry-list.component.html',
  styleUrls: ['./enquiry-list.component.css'],
})
export class EnquiryListComponent implements OnInit {
  enquiry: any = [];
  search: any = '';
  course: any = '';
  branch: any = '';
  page: any = 1;
  pagesize: any = 10;
  collection: any;
  public currentPageLimit: number = 0;
  public pageLimitOptions = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  selectedRow: any = {};

  constructor(
    private enquiryService: EnquiryService,
    private toastService: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getAllEnquiry();
  }

  resetFilter() {
    this.course = '';
    this.branch = '';
    this.getAllEnquiry();
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    // console.log(s);
    this.modalService.open(content, { centered: true });
    this.getAllEnquiry();
  }

  onChangePage(pageNo: any) {
    console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getAllEnquiry();
  }

  searchFn() {
    // console.log('this.search', this.search);
    this.getAllEnquiry();
  }

  getAllEnquiry() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
      course: this.course,
      branch: this.branch,
    };
    console.log(this.course, "course");
    console.log(this.branch, "branch");


    this.enquiryService.getAllEnquiry(obj).subscribe(
      (success: any) => {
        console.log(success);
        this.enquiry = success.result.Enquiry;
        this.collection = success.result.count;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteEnquiry(id: any) {
    this.enquiryService.deleteEnquiry(id).subscribe(
      (success) => {
        console.log(success);
        this.toastService.success('Enquiry Deleted Successfully!');
        this.modalService.dismissAll();
        this.getAllEnquiry();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  download(title: any) {
    let obj: any = {
      type: title,
      course: this.course,
      branch: this.branch
    };
    this.enquiryService.downloadFile(obj).subscribe(
      (success: any) => {
        if (title == 'csv') {
          saveAs(success, 'Enquiry-list.csv');
        } else {
          saveAs(success, 'Enquiry-list.xlsx');
        }
        // console.log(success,"success");

      },
      (error: any) => {
        console.log(error)
      }
    );
  }

}
