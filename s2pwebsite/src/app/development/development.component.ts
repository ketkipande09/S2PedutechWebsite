import { Component } from '@angular/core';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.scss']
})
export class DevelopmentComponent {
  active: string = '';
  
  setActive(key: any) {
    this.active = key;
  }
}
