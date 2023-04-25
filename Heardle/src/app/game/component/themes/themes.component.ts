import {Component, OnInit} from '@angular/core';


@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.css']
})
export class ThemesComponent implements OnInit{

  playlists!: any[]
  isInitialized:boolean = false

  ngOnInit(): void {
    fetch('http://localhost:8080/playlists')
      .then(response => response.json())
      .then(data => {
        this.playlists = data
        this.isInitialized = true
        console.log(data.length)
        console.log(data)
      })
  }

}
