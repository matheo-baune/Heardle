import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { RouterLink } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavComponent } from './component/nav/nav.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    NavComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    RouterLink,
    BrowserAnimationsModule
  ]
})
export class CoreModule { }
