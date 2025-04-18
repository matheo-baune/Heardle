import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Track } from "../../core/models/track.model";
import { animate, style, transition, trigger } from "@angular/animations";
import { environment } from "../../../environments/environement";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ top: '-100%' }),
        animate('300ms ease-out', style({ top: '50%' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ top: '-100%' }))
      ])
    ])
  ]
})
export class AudioPlayerComponent implements OnInit, OnDestroy {

  tracks!: Track[];
  availableTracks!: Track[];
  audio!: HTMLAudioElement;
  volume: number = 15;
  @Input() song!: Track;

  @Input() steps!: number[];
  currentStep: number = 0;

  @Input() playlistId!: string;
  @Input() mode!: string;
  @Input() endAction!: string;

  @Input() localKey!: string;

  currentTime!: number;
  width: number = 0;
  isInitialized: boolean = false;

  guesses: any = [0, 1, 2, 3, 4];
  embedUrl: string = "";
  artists: string = "";
  trackName: string = "";
  end_text: string = "";
  victory_flag: boolean = false;
  albumCover: string = "";
  nbConfettis: any = [];
  showEndScreen: boolean = false;
  streakEndScreen: boolean = false;
  currentStreak: number = 0;
  streakGuesses: any = [];
  streakFireEmoji: HTMLElement | null = null;

  nbRightGuesses: number = 0;
  urlIframeSanitize: SafeResourceUrl = '';
  guessInputValue: string = "";
  selectedTrackId: string = "";

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.currentTime = 0;
    this.audio = new Audio();
    this.audio.volume = this.volume / 100;
    this.initSongData();
    this.initConfetti();
  }

  async initSongData(): Promise<void> {
    let xhr = new XMLHttpRequest();
    xhr.onload = async () => {
      if (xhr.status === 200) {
        this.tracks = JSON.parse(xhr.response);
      }
      this.embedUrl = this.song.embed_url;
      this.artists = this.song.artists_name.join('-');
      this.trackName = this.song.track_name;

      if (localStorage.getItem(this.localKey + "guess") === null || localStorage.getItem(this.localKey + "guess") != this.song.track_name) {
        localStorage.setItem(this.localKey + "guess", this.song.track_name);
        localStorage.removeItem(this.localKey);
      }

      this.albumCover = this.song.img_album.url;

      await fetch(`https://guesshit-api.k-mathe.fr/proxy?url=${encodeURIComponent(this.embedUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then((response) => response.text())
        .then((htmlContent) => {
          const audioUrl = this.extractAudioPreviewUrl(htmlContent);
          this.audio.src = audioUrl ?? "";
          this.isInitialized = true;

          const urlIframe = `https://open.spotify.com/embed/track/${this.song.id}/?utm_source=generator&theme=0`;
          this.urlIframeSanitize = this.sanitizer.bypassSecurityTrustResourceUrl(urlIframe);

          this.initializeGuesses();
        }).catch((error) => {
          console.error('There was a problem with the fetch operation:', error);
        });
    };
    if (this.playlistId) {
      xhr.open('GET', `${environment.apiUrl}/playlists/${this.playlistId}/tracks`);
    } else {
      xhr.open('GET', `${environment.apiUrl}/all`);
    }
    xhr.send();

    let xhr2 = new XMLHttpRequest();
    xhr2.onload = () => {
      if (xhr2.status === 200) {
        this.nbRightGuesses = JSON.parse(xhr2.response).nbRightGuesses;
      }
    };
    xhr2.open('GET', `${environment.apiUrl}/rightGuesses`);
    xhr2.send();
  }

  initializeGuesses(): void {
    this.guesses = JSON.parse(localStorage.getItem(this.localKey) ?? "[]");
    this.guesses.forEach((elt: any, index: number) => {
      if (elt?.status === 'correct') this.victory_flag = true;
      if (elt !== null) this.currentStep = index + 1;
    });

    if (this.victory_flag) {
      this.end_text = `Bravo ! Vous avez trouvé la musique en ${this.currentStep} essai${this.currentStep > 1 ? 's' : ''} !`;
      this.showEndScreen = true;
    }

    if (this.currentStep === this.steps.length) {
      this.end_text = `Vous avez perdu !`;
      this.showEndScreen = true;
    }

    while (this.guesses.length < 5) {
      this.guesses.push(null);
    }
  }

  listenSong(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = Math.round(this.audio.currentTime);
      if (!this.audio.paused) {
        requestAnimationFrame(() => {
          this.width = (this.audio.currentTime / 15) * 100 < 100 ? (this.audio.currentTime / 15) * 100 : 100;
        });
      }
    });

    this.audio.play();
    setTimeout(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
    }, this.steps[this.currentStep] * 1000);
  }

  adjustVolume(value: string): void {
    this.volume = Number(value);
    this.audio.volume = this.volume / 100;
  }

  refreshResultList(value: string) {
    this.availableTracks = this.tracks.filter((elt: Track) => {
      return this.guessContainsName(value, elt.track_name) || this.guessContainsArtists(value, elt.artists_name);
    });
  }

  guessContainsName(value: string, name: string) {
    if (name.toLowerCase().includes(value.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  guessContainsArtists(value: string, artists: string[]) {
    let isValid = false;
    artists.forEach((elt: string) => {
      if (elt.toLowerCase().includes(value.toLowerCase())) {
        isValid = true;
      }
    });
    return isValid;
  }

  selectTrack(value: string, id: number) {
    let guessInput = document.querySelector<HTMLInputElement>('.guess-input');
    if (guessInput) {
      guessInput.value = value;
    }
    this.guessInputValue = value;
    this.refreshResultList(value);
    this.selectedTrackId = id.toString();
  }

  skipGuess(): void {
    if (this.victory_flag) {
      return;
    }
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      if (this.mode == 'sreak') {
        this.end_text = `Vous avez perdu ! Vous avez trouvé ${this.currentStreak} hits !`
      } else {
        this.end_text = `Vous avez perdu !`
      }
      this.showEndScreen = true
    }

    if (this.currentStep < 6) {
      this.guesses[this.currentStep - 1] = {
        status: 'incorrect'
      }
      localStorage.setItem(this.localKey, JSON.stringify(this.guesses))
    }
  }

  onGuess(inputElement: HTMLInputElement): void {
    if (this.currentStep > 5 || this.victory_flag) {
      return;
    }

    let isValideGuess: boolean = false
    let id_track: string = ""

    if (this.selectedTrackId !== "") {
      id_track = this.selectedTrackId
      isValideGuess = true
    }


    if (isValideGuess) {
      inputElement.value = ""
      this.selectedTrackId = ""
      this.guessInputValue = ""
      this.currentStep++;
      console.log(this.currentStep);
      console.log(this.steps.length);
      if (this.currentStep >= this.steps.length) {
        console.log('test');
        if (this.mode == 'streak') {
          this.end_text = `Vous avez perdu ! Vous avez trouvé ${this.currentStreak} hits !`
          this.streakEndScreen = true;
        } else {
          this.end_text = `Vous avez perdu !`
          this.showEndScreen = true
        }
      }
      this.displayGuess(id_track)
    } else {
      //TODO - Dire que musique pas connu

    }
  }

  displayGuess(id_track: string) {
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      let info_track: Track = JSON.parse(xhr.response)

      let gResult = '';
      if (this.isWrong(info_track.track_name, info_track.artists_name)) {
        gResult = 'incorrect'
        if (this.mode == 'streak' && this.streakEndScreen) {
          this.showEndScreen = true;
        }
      } else if (this.isCorrect(info_track.track_name, info_track.artists_name)) {
        if (this.mode == 'streak') {
          gResult = 'correct'
          this.showEndScreen = false;
          this.end_text = "";
          if (this.streakFireEmoji == null) {
            this.streakFireEmoji = document.querySelector('.fire');
            this.streakFireEmoji?.addEventListener('animationend', () => {
              this.streakFireEmoji?.classList.remove('active');
            });
          }
          this.streakFireEmoji?.classList.add('active');
          this.streakGuesses.push({
            track_name: info_track.track_name,
            artists_name: info_track.artists_name,
            img_album: info_track.img_album,
            status: gResult,
          })
          this.currentStreak++
          this.currentStep = 0;
          this.guesses = [null, null, null, null, null]
          localStorage.setItem(this.localKey + "streak", JSON.stringify(this.currentStreak))
          localStorage.setItem(this.localKey, '{}');
          let xhr2 = new XMLHttpRequest()
          xhr2.onload = () => {
            if (xhr2.status === 200) {
              this.song = JSON.parse(xhr2.response)
              this.initSongData();
              this.initializeGuesses();
            }
          }
          xhr2.open('GET', `${environment.apiUrl}/playlists/${this.playlistId}/randomTrack`)
          xhr2.send()
        } else {
          gResult = 'correct'
          this.victory_flag = true
          this.end_text = `Bravo ! Vous avez trouvé la musique en ${this.currentStep} essai${this.currentStep > 1 ? 's' : ''} !`
          this.showEndScreen = true
          if (this.mode == 'daily') {
            let xhr2 = new XMLHttpRequest()
            xhr2.onload = () => {
              if (xhr2.status === 200) {
                this.nbRightGuesses = JSON.parse(xhr2.response).nbRightGuesses
              }
            }
            xhr2.open('GET', `${environment.apiUrl}/addRightGuess`)
            xhr2.send()
          }
        }
      } else {
        gResult = 'p-correct'
        if (this.mode == 'streak' && this.streakEndScreen) {
          this.showEndScreen = true;
        }
      }

      this.guesses[this.currentStep - 1] = {
        track_name: info_track.track_name,
        artists_name: info_track.artists_name,
        img_album: info_track.img_album,
        status: gResult,
      }
      localStorage.setItem(this.localKey, JSON.stringify(this.guesses))
    }
    xhr.open('GET', `${environment.apiUrl}/tracks/${id_track}`)
    xhr.send()
  }

  isWrong(track_name: string, artists: any): boolean {
    artists.sort()
    this.song.artists_name.sort()
    return this.song.track_name.replace(/\s/g, "").toLowerCase() != track_name.replace(/\s/g, "").toLowerCase()
          && (JSON.stringify(artists).replace(/\s/g, "").toLowerCase() != JSON.stringify(this.song.artists_name).replace(/\s/g, "").toLowerCase())
  }

  isCorrect(track_name: string, artists: any): boolean {
    artists.sort()
    this.song.artists_name.sort()
    return this.song.track_name.replace(/\s/g, "").toLowerCase() == track_name.replace(/\s/g, "").toLowerCase()
          && (JSON.stringify(artists).replace(/\s/g, "").toLowerCase() == JSON.stringify(this.song.artists_name).replace(/\s/g, "").toLowerCase())
  }

  extractAudioPreviewUrl(htmlContent: string): string | null {
    // Regex pour trouver la balise meta contenant l'URL de l'audio
    const regex = /<meta property="og:audio" content="([^"]+)"\/>/;
    const match = htmlContent.match(regex);

    return match ? match[1] : null;
  }

  executeEndAction() {
    switch (this.endAction) {
      case 'Menu principal':
        window.location.href = '/';
        break;
      case 'Rejouer':
        window.location.reload();
        break;
      default:
        console.error('Invalid end action:', this.endAction);
    }
  }

  share() {
    let text = '';
    if (!this.victory_flag) {
      text = `😔 Je n'ai pas trouvé le hit du jour aujourd'hui...`;
      text += ` 🎵 Essaye de le trouver ici : https://guesshit.k-mathe.fr/ 🎶`;
    } else {
      text = `🎉 J'ai trouvé le hit du jour en ${this.currentStep} essai${this.currentStep > 1 ? 's' : ''} !`;
      text += ` 🏆 Essaye de me battre ici : https://guesshit.k-mathe.fr/ 🎶`;
    }

    navigator.clipboard.writeText(text);
  }

  initConfetti() {
    this.nbConfettis = Array.from({ length: 200 }, () => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const randomSize = Math.floor(Math.random() * 10) + 5; // Size between 5 and 15
      const confettiHeight = randomSize;
      const confettiWidth = randomSize * 0.5;
      const randomPositionX = Math.random() * 100; // Position X between 0 and 100%
      const randomPositionY = Math.random() * 100; // Position Y between 0 and 100%
      const randomRotation = Math.random() * 360; // Rotation between 0 and 360 degrees
      const randomAnimationDuration = Math.random() * 2 + 3; // Duration between 3 and 5 seconds
      const randomAnimationDelay = Math.random() * 2; // Delay between 0 and 2 seconds
      const rotationSpeed = Math.random() * 2 + 1; // Speed between 1 and 3 seconds
      return {
        color: randomColor,
        height: confettiHeight,
        width: confettiWidth,
        positionX: randomPositionX,
        positionY: randomPositionY,
        rotation: randomRotation,
        animationDuration: randomAnimationDuration,
        animationDelay: randomAnimationDelay,
        rotationSpeed: rotationSpeed,
      };
    });
  }

  closeEndScreen() {
    this.showEndScreen = false;
    this.victory_flag = false;
  }

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}
