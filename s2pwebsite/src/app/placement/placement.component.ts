import { Component } from '@angular/core';

@Component({
  selector: 'app-placement',
  templateUrl: './placement.component.html',
  styleUrls: ['./placement.component.scss']
})
export class PlacementComponent {
  isAbove1200px = window.innerWidth > 1200;

  
}
