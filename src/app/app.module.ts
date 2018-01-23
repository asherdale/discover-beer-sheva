import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PlacePage } from '../pages/place/place';
import { AboutPage } from '../pages/about/about';
import { ContactUsPage} from '../pages/contact-us/contact-us';
import { PopoverPage } from '../pages/home/popover';
import { IonicStorageModule } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PlacePage,
    AboutPage,
    ContactUsPage,
    PopoverPage

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PlacePage,
    AboutPage,
    ContactUsPage,
    PopoverPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GoogleAnalytics
  ]
})
export class AppModule { }
