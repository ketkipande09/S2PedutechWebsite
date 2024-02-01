import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup,Validators,FormBuilder } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransitionCourseService } from 'src/app/Services/transition-course/transition-course.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transition-course-list',
  templateUrl: './transition-course-list.component.html',
  styleUrls: ['./transition-course-list.component.css'],
})
export class TransitionCourseListComponent implements OnInit {
  transitionListForm: FormGroup | any;
  transitionList: any = [];
  imageArr: any = [];
  selectedRow: any = {};
  collection: any;
  images: any;
  fileContent: any;
  choosen: boolean = false;
  pdf: any;
  search: any = '';
  page = 1;
  pagesize = 10;
  public currentPageLimit: number = 0;
  public pageLimitOptions = [
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  constructor(
    private transitionService: TransitionCourseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllTransition();
  }

  onChangePage(pageNo: any) {
    console.log(pageNo);
    if (pageNo > 0) {
      this.page = pageNo;
    }
    this.getAllTransition();
  }

  searchFn() {
    console.log('this.search', this.search);
    this.search.toString().length >= 3 || this.search.toString().length == 0
      ? this.getAllTransition()
      : null;
  }

  fileChoosen(event: any) {
    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        this.toastService.warning('Unable to upload image size more than 5MB');
        return;
      }
      this.pdf = <File>event.target.files[0];
      this.fileContent = this.pdf;
      console.log(this.pdf);
      const reader = new FileReader();
      reader.readAsDataURL(this.pdf);
      reader.onload = () => {
        this.fileContent = reader.result;
      };
      reader.onerror = (error) => {
        console.log(error);
      };
      this.choosen = true;
      console.log(this.pdf, 'pdf');
    }
  }

  getAllTransition() {
    let obj = {
      page: this.page,
      pagesize: this.pagesize,
      search: this.search,
    };
    this.transitionService.getAllTransition(obj).subscribe(
      (success: any) => {
        console.log(success);
        this.imageArr = success.result['Transition_course'];
        this.collection = success.result.count;
        console.log(this.imageArr);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  updatedPdf(t: any) {
    console.log('pass the id in form component ', t);
    this.router.navigate(['/transition/transition-form'], {
      queryParams: {
        id: t.id,
      },
    });
  }

  deleteTransition(id: any) {
    console.log('id...', id);
    this.transitionService.deleteTransition(id).subscribe(
      (success: any) => {
        console.log(success, 'deleted successfully');
        this.toastService.success('Transition Deleted Successfully!');
        this.modalService.dismissAll();
        this.getAllTransition();
      },
      (error) => {
        console.log(error);
        this.toastService.error('Unable to Delete !');
      }
    );
  }

  open(s: any, content: any) {
    this.selectedRow = s;
    console.log(s);
    this.modalService.open(content, { centered: true });
    // this.getAllServices();
  }

  add() {
    this.router.navigate(['/transition/transition-form']);
  }

  //upload pdf file
  updatePdf(c: any) {
    console.log('c...', c);
    const fd = new FormData();
    fd.append('key', 'pdf'),
      fd.append('id', c),
      fd.append('pdf', this.pdf, this.pdf.name);
    console.log('fd.....', fd);
    this.transitionService.uploadPdf(c, fd).subscribe((success) => {
      console.log(success);
      this.toastService.success('PDF Upload Successfully!');
      this.modalService.dismissAll();
    });
  }

  //view pdf
  openDocument(link: any) {
    if (link) {
      window.open(link);
    }
  }
}