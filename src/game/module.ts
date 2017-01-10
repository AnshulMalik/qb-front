import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GameComponent } from './gameComponent';

@NgModule({
    imports: [BrowserModule],
    declarations:[
        GameComponent
    ],
    bootstrap: [
        GameComponent
    ]
})
export class AppModule {}