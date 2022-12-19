import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './views/home/home.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { StoryComponent } from './components/story/story.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, CanvasComponent, StoryComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
