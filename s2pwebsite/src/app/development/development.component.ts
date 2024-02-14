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

  openScrollableContent(longContent: any) {
    this.modalService.open(longContent, { scrollable: true });
  }

  clientiterate: any = [];
  website =
    'Web development is the work involved in developing a website for the Internet (World Wide Web) or an intranet (a private network). Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.';

  web =
    'What is a Web Application? A web application is software that runs in your web browser. Businesses have to exchange information and deliver services remotely. They use web applications to connect with customers conveniently and securely.';

  mobile =
    'Mobile app development is the act or process by which a mobile app is developed for one or more mobile devices, which can include personal digital assistants (PDA), enterprise digital assistants (EDA), or mobile phones.[1] Such software applications are specifically designed to run on mobile devices, taking numerous hardware constraints into consideration. Common constraints include CPU architecture and speeds, available memory (RAM), limited data storage capacities, and considerable variation in displays (technology, size, dimensions, resolution) and input methods (buttons, keyboard, touch screens with/without styluses).[2] These applications (or apps) can be pre-installed on phones during manufacturing or delivered as web applications, using server-side or client-side processing (e.g., JavaScript) to provide an "application-like" experience within a web browser.';

  resoucing =
    'Resourcing is the process of allocating money,workers, and skills to a specific job or task. It can also refer to the process of attracting and recruiting people for the right role at the right time and cost.';

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
