import { Component, OnInit, inject } from '@angular/core';
import { ClientService } from '../services/client-services/client.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.scss'],
})
export class DevelopmentComponent implements OnInit {
  active: string = '';
  private modalService = inject(NgbModal);
  longContent: any;

  constructor(private clientService: ClientService) {}


  ngOnInit(): void {
    this.getAllClient();
  }

  openVerticallyCentered(longContent: any) {
    this.modalService.open(longContent, { centered: true });
  }

	openXl(content: any) {
		this.modalService.open(content, { size: 'xl' });
	}



  clientiterate: any = [];

  setActive(key: any) {
    this.active = key;
  }

  getAllClient() {
    this.clientService.getAllClient().subscribe((data: any) => {
      this.clientiterate = data.result.client;
      console.log('aara', this.clientiterate);
    });
  }
}
