import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackService } from 'src/app/services/feedback/feedback.service';
import { EventService } from 'src/app/services/event-services/event.service';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css'],
})
export class FeedbackListComponent implements OnInit {
  page: any = 1;
  pagesize: any = 10;
  search: any = '';
  Feedback: any = [];
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
  eventName: any;
  eventId: any;
  branch: any = '';
  selectedRow: any = {};

  constructor(
    private feedBackService: FeedbackService,
    private modalService: NgbModal,
    private eventService: EventService,
    private actRout: ActivatedRoute,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllFeedback();
  }

  resetFilter() {
    this.search = '';
    this.getAllFeedback();
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    // console.log(s);
    this.modalService.open(content, { centered: true });
    // this.getAllServices();
  }

  onChangePage(pageNo: any) {
    // console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getAllFeedback();
  }
  searchFn() {
    // console.log('this.search', this.search);
    this.getAllFeedback();
  }

  getAllFeedback() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };

    this.feedBackService.getContact(obj).subscribe(
      (success: any) => {
        console.log(success);
          this.Feedback= success.result.Feedback;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // getEventById() {
  //   let obj = {
  //     page: this.page,
  //     pagesize: this.pagesize,
  //     search: this.search,
  //   };
  //   this.eventService.EventById(this.eventId).subscribe(
  //     (success: any) => {
  //       this.Feedback = success.result['Feedback'];
  //       this.collection = success.result.count;
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

  deleteFeedback(id: any) {
    this.feedBackService.deleteFeedback(id).subscribe(
      (success) => {
        console.log(success);
        this.toastService.success('Feedback Deleted Successfully!');
        this.modalService.dismissAll();
        this.getAllFeedback();
        // this.getEventById();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  download(title:any) {
    let obj: any = {
      type: title,
      search: this.search,
    };
    this.feedBackService.downloadFile(obj).subscribe(
      (success:any) => {
        if (title == 'csv') {
          saveAs(success, 'Feedback-list.csv');
        } else {
          saveAs(success, 'Feedback-list.xlsx');
        }
      },
      (error:any) => {
     console.log(error)
      }
    );
  }
//   download(title:any) {
//     // console.log(title);
//     let obj: any = {
//         type: title,
//         id: this.eventId,
        
//     };
//     // console.log("obj csv", obj);
    
//     this.feedBackService.downloadFile(obj).subscribe(
//         success => {
//           console.log("success", success)

//             if (title == "csv") {
//                 saveAs(success, "Feedback-list.csv");
//             } else {
//                 saveAs(success, "Feedback-list.xlsx");
//             }
//         },
//         error => {
//         }
//     );
// }
}




