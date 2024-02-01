import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/Services/client-services/client.service';
@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {

  clientiterate : any = [];
  images: any;
  submitted = false;
  fileContent: any;
  choosen: boolean = false;
  params: any;
  clientId : any ;
  course: any;
  constructor(  private router: Router, 
    private clientService : ClientService,
    private modalService:NgbModal,
    private actRout: ActivatedRoute,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit(): void {
    this.clientForm;
    this.actRout.queryParams.subscribe((params: any) => {
      this.clientId  = params.id;
      console.log(this.clientId );
      if(this.clientId ){
        this.getClientById();
        console.log('params id ', params.id);
      }
    });

  }

  get f() {
    return this.clientForm.controls;
  }

  clientForm = new FormGroup({
    id: new FormControl(),
    image: new FormControl(''),
    name: new FormControl(''),
  });

  fileChoosen(event: any) {

    if (event.target.value) {
      if (event.target.files[0].size > 5000000) {
        this.toastService.warning('Unable to upload image size more than 5MB');
        return;
      }
      this.images = <File>event.target.files[0];
      this.fileContent = this.images;
      console.log(this.images);
      const reader = new FileReader();
      reader.readAsDataURL(this.images);
      reader.onload = () => {
        this.fileContent = reader.result;
      };
      reader.onerror = (error) => {
        console.log(error);
      };
      this.choosen = true;
      console.log(this.fileContent);
      console.log(this.images, 'images');
    }
  } 


  createClient() {
    console.log(this.images);
    this.submitted = true;
    if (this.clientForm.invalid) {
      this.toastService.warning('Please fill all required field !');
      return;
    } else {
      const fd = new FormData();
      if (this.images) {
        // this.spinner.show();
        fd.append('key', 'client');
        fd.append('image', this.images, this.images.name);
        fd.append('name', this.clientForm.value.name);
        console.log('fd,,,,', fd);
        this.clientService.createClient(fd).subscribe((data) => {
          console.log(data);
          this.router.navigate(['/user/client-list']);
          this.toastService.success('Gallery Created Successfully!');
          //  this.modalService.dismissAll();
          // this.spinner.hide();
        });
      } else {
        this.toastService.warning('Please upload images');
      }
    }
  }

  updateClient() {
    this.submitted = true
    if (this.clientForm.invalid) {
      this.toastService.warning("Please fill all required field !");
      return;
    }
    const fd = new FormData();
    fd.append('key', 'client');
    fd.append('type', this.clientForm.value.type);
    fd.append('name', this.clientForm.value.name);
    if (this.images) {
      // fd.append('key', 'client')
      fd.append('image', this.images, this.images.name);
    }
    this.clientService.updateClient(this.clientId, fd).subscribe((success) => {
      console.log(success);
      this.toastService.success('Client Update Successfully!');
      this.spinner.hide();
      this.router.navigate(['/user/client-list']);
     
    });
  }

  getClientById() {

    this.clientService.getClientById(this.clientId).subscribe((success:any) => {
      console.log(success);
      this.clientForm.patchValue(success.result);
      this.fileContent = success.result.image;
      console.log('this.fileContent',this.fileContent);
      
      
    },
      (error) => {
        console.log(error);

      })
  }

  reset() {
    this.clientForm.reset();
  }

  add() {
    this.router.navigate(['/user/client-list']);
  }

}
