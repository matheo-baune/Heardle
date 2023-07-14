import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Track } from "../../core/models/track.model";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
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
export class AudioPlayerComponent implements OnInit, OnDestroy {

  tracks!: Track[];
  audio!: HTMLAudioElement;
  @Input() song!: Track;

  @Input() steps!: number[];
  currentStep: number = 0;

  currentTime!: number;
  width: number = 0;
  isInitialized: boolean = false;

  ngOnInit(): void {
    this.currentTime = 0
    this.audio = new Audio();
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      if (xhr.status === 200) {
        this.tracks = JSON.parse(xhr.response)
      }
      while (!this.song.preview_url) { }
      this.audio.src = this.song.preview_url;
      this.isInitialized = true;
    }
    xhr.open('GET', "http://localhost:8080/all")
    xhr.send()
  }

  listenSong(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = Math.round(this.audio.currentTime)
      if (!this.audio.paused)
        this.width = (this.currentTime / 15) * 100 < 100 ? (this.currentTime / 15) * 100 : 100;
    });

    this.audio.volume = 0.05;
    this.audio.play();
    setTimeout(() => {
      this.audio.pause()
      this.audio.currentTime = 0;
    }, this.steps[this.currentStep] * 1000)
  }

  onGuess(inputElement: HTMLInputElement): void {

    let isValideGuess: boolean = false
    let id_track: string = ""

    document.querySelectorAll<HTMLOptionElement>('#list-song option').forEach(elt => {
      if (elt.value === inputElement.value) {
        isValideGuess = true
        id_track = elt.id
        return;
      }
    })


    if (isValideGuess) {
      inputElement.value = ""
      this.displayGuess(id_track)
      this.currentStep++;
    } else {
      //TODO - Dire que musique pas connu

    }
  }

  //TODO - Refactorisation nécessaire
  displayGuess(id_track: string) {
    const color_correct: string = "96, 255, 96";
    const color_partially_correct: string = "255, 191, 96";
    const color_wrong: string = "255,90,90"


    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      let info_track: Track = JSON.parse(xhr.response)

      let guess_card = document.querySelector<HTMLDivElement>('div.song-card.inactive')
      if (guess_card) {
        let img_album = info_track.img_album;
        guess_card.style.backgroundImage = `url('${img_album.url}')`;

        guess_card.classList.remove('inactive')
        guess_card.classList.add('active')

        let p_track_name = guess_card.querySelector<HTMLParagraphElement>('p:nth-child(1)')
        let p_artists_name = guess_card.querySelector<HTMLParagraphElement>('p:nth-child(2)')
        if (p_track_name && p_artists_name) {
          p_track_name.innerHTML = info_track.track_name
          p_artists_name.innerHTML = info_track.artists_name.join('-')

          //   if(!this.sameTrackName(info_track)){
          //     p_track_name.style.setProperty('border',`2px solid rgb(${color_wrong})`)
          //     p_track_name.style.setProperty('background-color',`rgba(${color_wrong},0.6)`)
          //   }else{
          //     p_track_name.style.setProperty('border',`2px solid rgb(${color_correct})`)
          //     p_track_name.style.setProperty('background-color',`rgba(${color_correct},0.6)`)
          //   }


          //   if(this.containArtist(info_track)){
          //     if(this.sameArtists(info_track)){
          //       p_artists_name.style.setProperty('border',`2px solid rgb(${color_correct})`)
          //       p_artists_name.style.setProperty('background-color',`rgba(${color_correct},0.6)`)
          //     }else{
          //       p_artists_name.style.setProperty('border',`2px solid rgb(${color_partially_correct})`)
          //       p_artists_name.style.setProperty('background-color',`rgba(${color_partially_correct},0.6)`)
          //     }
          //   }else{
          //     p_artists_name.style.setProperty('border',`2px solid rgb(${color_wrong})`)
          //     p_artists_name.style.setProperty('background-color',`rgba(${color_wrong},0.6)`)
          //   }

        }



        let checkmark = guess_card.children[2]
        if (this.isWrong(info_track)) {
          checkmark.classList.add("incorrect")
          guess_card.style.setProperty('border', `2px solid rgb(${color_wrong})`)
        }

        if (this.isPartiallyWrong(info_track)) {
          checkmark.classList.add("p-correct")
          guess_card.style.setProperty('border', `2px solid rgb(${color_partially_correct})`)
        }

        if (this.isCorrect(info_track)) {
          checkmark.classList.add("correct")
          guess_card.style.setProperty('border', `2px solid rgb(${color_correct})`)
        }


      }
    }
    xhr.open('GET', `http://localhost:8080/tracks/${id_track}`)
    xhr.send()
  }

  isWrong(guess: Track): boolean {
    return !this.sameTrackName(guess) && !this.containArtist(guess)
  }

  isPartiallyWrong(guess: Track): boolean {
    return (this.containArtist(guess) && !this.sameTrackName(guess)) || (!this.containArtist(guess) && this.sameTrackName(guess))
  }

  isCorrect(guess: Track): boolean {
    return this.sameTrackName(guess) && this.containArtist(guess)
  }
  containArtist(guess: Track) {
    let concat = this.song.artists_name.concat(guess.artists_name)
    let diff = concat.filter(item => !this.song.artists_name.includes(item) || !guess.artists_name.includes(item));
    return concat.length > diff.length;
  }

  sameArtists(guess: Track) {
    //Mettre dans le même ordre les artists
    guess.artists_name.sort()
    this.song.artists_name.sort()
    return (JSON.stringify(guess.artists_name).replace(/\s/g, "").toLowerCase() === JSON.stringify(this.song.artists_name).replace(/\s/g, "").toLowerCase())
  }

  sameTrackName(guess: Track) {
    return this.song.track_name.replace(/\s/g, "").toLowerCase() === guess.track_name.replace(/\s/g, "").toLowerCase()
  }

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}
