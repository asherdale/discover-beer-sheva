import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public ga: GoogleAnalytics) {
  	this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('about'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
