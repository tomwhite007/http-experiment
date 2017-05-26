import { ExternalInterfaceService } from './services/external-interface.service';
import { GlobalsService } from './services/globals.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    GlobalsService,
    ExternalInterfaceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
