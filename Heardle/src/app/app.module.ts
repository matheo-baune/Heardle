import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule } from "./core/core.module";
import { LoadingPageComponent } from './loading-page/component/loading-page/loading-page.component';
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from './game/component/home/home.component';
import { MainMenuComponent } from './game/component/main-menu/main-menu.component';
import { DailyGuessComponent } from './game/component/daily-guess/daily-guess.component';
import { ThemesComponent } from './game/component/themes/themes.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent,
    LoadingPageComponent,
    HomeComponent,
    MainMenuComponent,
    DailyGuessComponent,
    ThemesComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
