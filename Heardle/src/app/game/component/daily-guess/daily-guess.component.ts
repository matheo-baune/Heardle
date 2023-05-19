import {Component, OnInit, ViewChild} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {Track} from "../../../core/models/track.model";
import {AudioPlayerComponent} from "../../../audio-player/audio-player/audio-player.component";

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
export class DailyGuessComponent implements OnInit{

  song!:Track;
  steps:number[] = [ 1, 5, 7, 10, 15 ]
  @ViewChild(AudioPlayerComponent) audioPlayerComponent!: AudioPlayerComponent;

  ngOnInit(): void {
    let xhrDaily = new XMLHttpRequest()
    xhrDaily.onload = () => {
      if(xhrDaily.status === 200){
        this.song = JSON.parse(xhrDaily.response)
      }
    }
    xhrDaily.open('GET',"http://localhost:8080/daily")
    xhrDaily.send()
  }
}
