import { Component } from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-daily-guess',
  templateUrl: './daily-guess.component.html',
  styleUrls: ['./daily-guess.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('800ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DailyGuessComponent {

}
