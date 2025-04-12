import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{

  constructor(private router: Router) {
  }

  goMainMenu(){
    this.router.navigateByUrl('/')
  }

  ngOnInit(): void {
  }

  goHome() {
    this.router.navigateByUrl('/')
  }

  showHelp() {
    const helpElement = document.querySelector('.help-container');
    if (helpElement) {
      helpElement.classList.toggle('active');
    }
  }
}
