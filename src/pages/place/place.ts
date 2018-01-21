import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

/**
 * Generated class for the PlacePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-place',
  templateUrl: 'place.html',
})
export class PlacePage {

  title: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public ga: GoogleAnalytics) {
  	this.title = navParams.get('title');
  	this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('place'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad PlacePage');
  }
}
