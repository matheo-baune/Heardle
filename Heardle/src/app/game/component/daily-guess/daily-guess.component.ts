import {Component, OnDestroy, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";


//TODO - Get Access Token auto
const accessToken : string =
  "BQBUMjFGTsO0OiF6rQ3ie7zbygfj2sX6pa8-MH1YlEPU-adqzjeAMOIpr7_zLFwshI3PZ8wR_zYFnfcRG73vDoZmU4S9ZZFfTuTsVJKck-CLa6POErQVKwaTj_IbNYFKnoMXvUmtH1x6R-7UvuOfuFTzrRwrBAGz5sL_r5Zb7AMbG-poM6gI8Lo7AFWwgzvh2zUZ4eAu6T-wqQDGG5e05Usg7rmn7wZ0CC_Qm3oOzvQCH-OnRj54LF3-0g78AX86FOcDYS8"
const user_id: string = "l2medd2pcxwqv50xnvwm2zm6u"

const id_playlist :string = "56NdiJBcbH1YsOVtXXdJz6"

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

  //1h8hJnW6OoHUqhU2vyIxDO --> ID Playlist
  ngOnInit(): void {
    fetch(`https://api.spotify.com/v1/playlists/${id_playlist}/tracks?offset=0&limit=100&locale=fr-FR,fr;q=0.5`,{
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
      .then(response => response.json())
      .then(data => {
        let random = Math.round(Math.random()*data.items.length)%data.items.length
        this.song = data.items[random].track
        this.isInitialized = true;
      })

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
