import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/services/event-services/event.service';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
})
export class EventFormComponent implements OnInit {
  readonly DELIMITER = '/';
  images: any;
  choosen: boolean = false;
  model: NgbDateStruct | any;
  submitted = false;

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : '';
  }
  constructor(
    private service: EventService,
    private actrouter: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private toastService: ToastrService
  ) { }

  errmsg: any;
  successmsg: any;
  getid: any;
  fileContents: any;

  ngOnInit(): void {
    this.actrouter.queryParams.subscribe((data: any) => {
      this.getid = data.id;
      if (this.getid) {
        this.getEventusingId();
        // console.log(this.getid);

        // console.log(data, '<=params');
      }
      // console.log(this.getid);
      // console.log(data, '<=params');
      this.eventForm.patchValue(data);
    });
  }
  eventForm = new FormGroup({
    eventName: new FormControl('', Validators.required),
    eventLink: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
  });

  fileChoosen(event: any) {
    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        // this.toastService.warning("Unable to upload image/Video of size more than 5MB");
        return;
      }
      this.images = <File>event.target.files[0];
      this.fileContents = this.images;
      console.log(this.images);
      const reader = new FileReader();
      reader.readAsDataURL(this.images);
      reader.onload = () => {
        this.fileContents = reader.result;
      };
      reader.onerror = (error) => {
        console.log(error);
      };
      this.choosen = true;
      console.log(this.fileContents);
      console.log(this.images, 'images');
    }
  }
  // createEvent() {
  //   console.log(this.eventForm.value);
  //   const stud = this.eventForm.value;
  //   if (stud.date_time.year && stud.date_time.month && stud.date_time.day) {
  //     stud.date_time = `${stud.date_time.year}-${stud.date_time.month}-${stud.date_time.day}`;
  //   }
  //   console.log('stud', stud);
  // }

  createImage() {
    console.log(this.images);
    this.submitted = true;
    if (this.eventForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    if (this.images) {
      // this.spinner.show();
      console.log(" this.images", this.images);

      fd.append('key', 'event');
      fd.append('image', this.images, this.images.name);
      fd.append('eventLink', this.eventForm.value.eventLink);
      // fd.append('date_time', this.eventForm.value.date_time);
      fd.append('startDate', this.eventForm.value.startDate);
      fd.append('endDate', this.eventForm.value.endDate);
      fd.append('eventName', this.eventForm.value.eventName);
      fd.append('description', this.eventForm.value.description);
      console.log('fd,,,,', fd);

      this.service.createImage(fd).subscribe((success: any) => {
        console.log(success);
        this.toastService.success("Event created Successfully!");
        this.router.navigate(['/event/event-list']);
      });
    } else {
      this.toastService.warning("Please upload images");
    }
  }

  getEventusingId() {
    this.service.getEventById(this.getid).subscribe((success: any) => {
      console.log(success);
      this.fileContents = success.result.image;
      // console.log(this.fileContents)
      success.result.startDate = success.result.startDate.split('Z')[0];
      success.result.endDate = success.result.endDate.split('Z')[0];
      this.eventForm.patchValue(success.result);
      // this.eventForm.patchValue(success.result.startDate);
      this.fileContents = success['result'].image;

      // this.fileContents = success.result.image;

      // console.log('this.fileContents', this.fileContents);

      // this.fileContents = success['result'].date_time;

      // this.getid = success.id;
      // console.log('this.fileContents', this.getid);
    });
  }

  updateEvent() {
    if (this.eventForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    console.log("fd------", fd);

    fd.append('eventLink', this.eventForm.value.eventLink);
    // fd.append('date_time', this.eventForm.value.date_time);
    fd.append('startDate', this.eventForm.value.startDate);
    fd.append('endDate', this.eventForm.value.endDate);
    fd.append('eventName', this.eventForm.value.eventName);
    fd.append('description', this.eventForm.value.description);
    if (this.images) {
      fd.append('key', 'event')
      fd.append('image', this.images, this.images.name);
    }
    this.service
      .updateEvent(fd, this.getid)
      .subscribe((success) => {
        // console.log(success)
        this.toastService.success("Event Updated Successfully!");
        this.router.navigate(['/event/event-list']);
      });
  }
  reset() {
    this.eventForm.reset();
    this.errmsg = '';
    this.successmsg = '';

  }
  add() {
    this.router.navigate(['/event/event-list'])
  }

}



