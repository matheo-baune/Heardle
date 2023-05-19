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
import { MatFormFieldModule } from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import { AudioPlayerComponent } from './audio-player/audio-player/audio-player.component';
import { TimerComponent } from './audio-player/timer/timer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingPageComponent,
    HomeComponent,
    MainMenuComponent,
    DailyGuessComponent,
    ThemesComponent,
    AudioPlayerComponent,
    TimerComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
