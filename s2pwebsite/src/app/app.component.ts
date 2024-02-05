import { Component,OnInit } from '@angular/core';
import { trigger,state,style,animate,transition } from '@angular/animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('textAnimation', [
      state('initial', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('final', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('initial => final', animate('500ms ease-in')),
    ]),
  ]
})
export class AppComponent {
 
  title = 's2pwebsite';

  //   tab:any='Home'

//   navigate(key:any){
// this.tab=key

//   }
  

  
}
