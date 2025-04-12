import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-loading-page',
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.css']
})
export class LoadingPageComponent implements OnInit{
  topValue = -120; //TODO - REMETTRE A ZERO LORS DU DEPLOIEMENT

  ngOnInit(): void {
    setTimeout(() => {
      this.topValue = -120
    },1900)
  }
}
