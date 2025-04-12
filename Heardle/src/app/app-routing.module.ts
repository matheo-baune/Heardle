import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainMenuComponent} from "./game/component/main-menu/main-menu.component";
import {DailyGuessComponent} from "./game/component/daily-guess/daily-guess.component";
import {ThemesComponent} from "./game/component/themes/themes.component";

const routes: Routes = [
  { path : '', component: MainMenuComponent},
  { path : 'daily', component: DailyGuessComponent},
  { path : 'themes', component: ThemesComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
