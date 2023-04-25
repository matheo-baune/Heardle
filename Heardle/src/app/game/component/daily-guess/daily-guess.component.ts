import {Component, OnDestroy, OnInit} from '@angular/core';
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
export class DailyGuessComponent implements OnInit, OnDestroy{


  song!: any;
  isInitialized: boolean = false;
  audio!: HTMLAudioElement;

  ngOnInit(): void {
  }

  listenSong(): void{
    const streamUrl = this.song.preview_url;

    // 5. Set up an audio player and start streaming the audio
    this.audio = new Audio();
    this.audio.src = streamUrl;
    this.audio.play();
  }

  ngOnDestroy(): void {
    if(this.audio){
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

}
