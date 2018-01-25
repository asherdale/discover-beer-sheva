import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { HomePage } from '../home/home';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
/**
 * Generated class for the PlacePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-place',
  templateUrl: 'place.html',
})
export class PlacePage {

  place: any;
  strings: any;
  userLocation: any;
  contactPoints: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public ga: GoogleAnalytics,
    public http: Http
  ) {
  	this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('place'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.userLocation = navParams.data.userLocation.position;
    this.place = navParams.data.place;
    this.place.openDays = [];

    // TODO: facebook_j && website cases
    this.contactPoints.push([this.place.properties.phone || 'No phone number provided', 'call']);
    this.contactPoints.push([this.place.properties.email || 'No email address provided', 'mail']);
    this.contactPoints.push([this.formatLink(this.place.properties.facebook_u) || 'No Facebook Page provided', 'logo-facebook']);
    this.contactPoints.push([this.formatLink(this.place.properties.website) || 'No website provided', 'globe']);
  }

  ionViewDidLoad() {
    const destCoords = this.place.geometry.coordinates.reverse().join(',');
    const orgCoords = `${this.userLocation.lat()},${this.userLocation.lng()}`;
    const distanceRequest = `https://maps.googleapis.com/maps/api/distancematrix/json?mode=walking&language=iw&origins=${orgCoords}&destinations=${destCoords}&key=AIzaSyBzo-dNI0lo1OrPyyZxAhvwlXwj-98k95A`;
    this.http.get(distanceRequest).map(res => res.json()).subscribe(data => {
      // TODO: error checking!!!!
      const distance = data.rows[0].elements[0].distance.text;
      document.getElementById('distance').innerHTML = distance;
    });

    this.http.get('assets/data/strings.json').map(res => res.json()).subscribe(data => {
      this.strings = data;
      document.getElementById('isOpen').innerHTML = `${this.strings.open}: `;
    });

    const currentDate = new Date();
    for (let i = 1; i <= 7; i++) {
      if (this.place.properties[`days${i}`]) {
        this.place.openDays.push(i);
      }
    }
  }

  closePlace() {
    this.navCtrl.push(HomePage, {});
  }

  formatLink(link) {
    if (!link || link === 'no') {
      return null;
    }

    let result = '';
    if (link && link.includes('://www.')) {
      result = link.split('://www.')[1];
    }

    return result.endsWith('/') ? result.slice(0, -1) : result;
  }
}
