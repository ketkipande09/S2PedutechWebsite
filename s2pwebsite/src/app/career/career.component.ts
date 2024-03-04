import { Component,inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss']
})
export class CareerComponent {
  private modalService = inject(NgbModal);
  mainData: any = [];
  bullet = 'We Specialize in Mean Stack and Java Full Stack courses and plan to create developers of future. Join us if you wish to learn Web Application Development with emphasis on industry standards.'
  constructor(private router: Router,
  ) { }

  ngOnInit(): void {
  }
  openXl(content: any) {
    this.modalService.open(content, { size: 'xl' });
  }
}
