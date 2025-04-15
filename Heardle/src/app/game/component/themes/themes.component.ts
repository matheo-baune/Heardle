import {Component, OnInit} from '@angular/core';
import { environment } from "../../../../environments/environement";


@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.css']
})
export class ThemesComponent implements OnInit{

  playlists!: any[]
  isInitialized:boolean = false
  playerInitialized:boolean = false
  song!:any
  steps:number[] = [ 1, 5, 7, 10, 15 ]
  playlist:string = "";

  ngOnInit(): void {
    console.log(environment.apiUrl)
    fetch(`${environment.apiUrl}/playlists`)
      .then(response => response.json())
      .then(data => {
        this.playlists = data
        this.isInitialized = true
        this.playlists.forEach((playlist) => {
          playlist.name = playlist.name.substring(11);
        });
        this.playlists.sort((a, b) => a.name.localeCompare(b.name));
      })
  }

  onPlaylistClick(playlist: any) {
    this.playlist = playlist.id
    console.log(playlist.id)
    console.log(playlist.name)
    fetch(`${environment.apiUrl}/daily/${playlist.id}`)
    .then(response => response.json())
    .then(data => {
      this.song = data
      this.song.name = this.song.track_name;
      console.log(this.song)
      this.playerInitialized = true
      })
  }

}
