import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { HomePage } from '../home/home';
import { HoursPopoverPage } from './hoursPopover';
import { PopoverController } from 'ionic-angular';

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
  openInfo: any = [];
  userLocation: any;
  contactPoints: any = [];
  isFavorite: any = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public ga: GoogleAnalytics,
    public http: Http,
    public popoverCtrl: PopoverController,
    public events: Events
  ) {
  	this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('place'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.userLocation = navParams.data.userLocation.position;
    this.place = navParams.data.place;
    this.isFavorite = navParams.data.favorites.find(el => el === this.place.id);
    console.log(this.place.id);
    console.log(navParams.data.favorites);
    console.log(this.isFavorite);

    this.contactPoints.push([this.setNullIfEmpty(this.place.properties.phone) || 'No phone number provided', 'call']);
    this.contactPoints.push([this.setNullIfEmpty(this.place.properties.email) || 'No email address provided', 'mail']);
    this.contactPoints.push([this.setNullIfEmpty(this.formatLink(this.place.properties.facebook_u)) || 'No Facebook Page provided', 'logo-facebook']);
    this.contactPoints.push([this.setNullIfEmpty(this.formatLink(this.place.properties.website)) || 'No website provided', 'globe']);
  }

  ionViewDidEnter() {
    if (this.isFavorite) {
      (<HTMLElement>document.getElementById('heart-fill')).style.display = 'inline-block';
    } else {
      (<HTMLElement>document.getElementById('heart-empty')).style.display = 'inline-block';
    }
  }

  ionViewDidLoad() {
    (<HTMLElement>document.getElementsByClassName('back-button')[0]).onclick = () => {
      (<HTMLElement>document.getElementById('heart-fill')).style.display = 'none';
      (<HTMLElement>document.getElementById('heart-empty')).style.display = 'none';
    };

    const destCoords = this.place.geometry.coordinates.reverse().join(',');
    const orgCoords = `${this.userLocation.lat()},${this.userLocation.lng()}`;
    const distanceRequest = `https://maps.googleapis.com/maps/api/distancematrix/json?mode=walking&language=iw&origins=${orgCoords}&destinations=${destCoords}&key=AIzaSyBzo-dNI0lo1OrPyyZxAhvwlXwj-98k95A`;
    this.http.get(distanceRequest).map(res => res.json()).subscribe(
      data => {
        if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0] &&
            data.rows[0].elements[0].distance && data.rows[0].elements[0].distance.text) {
          const distance = data.rows[0].elements[0].distance.text;
          document.getElementById('distance').innerHTML = distance;
        } else {
          this.removeDistanceInfo();
        }
      },
      err => {
        console.log('Distance Matrix API error');
        this.removeDistanceInfo();
      }
    );

    this.http.get('assets/data/strings.json').map(res => res.json()).subscribe(data => {
      this.strings = data;

      for (let i = 1; i <= 7; i++) {
        if (this.place.properties[`days${i}`]) {
          this.openInfo.push({
            'day': this.strings[`days${i}`],
            'open': this.place.properties[`open${i}`],
            'close': this.place.properties[`close${i}`],
            'show': `${this.place.properties[`open${i}`]} - ${this.place.properties[`close${i}`]}`
          });
        } else {
          this.openInfo.push({
            'day': this.strings[`days${i}`],
            'show': this.strings.closed,
          });
        }
      }

      const date = new Date();
      const today = date.getDay();
      this.openInfo[today].bold = 'bold';

      const hours = date.getHours();
      const minutes = date.getMinutes();
      if (this.openInfo[today].show !== this.strings.closed) {
        document.getElementById('hours').innerHTML = `${this.openInfo[today].open} - ${this.openInfo[today].close}`;

        if (Date.parse(`01/01/2011 ${hours}:${minutes}`) > Date.parse(`01/01/2011 ${this.openInfo[today].open}`) &&
            Date.parse(`01/01/2011 ${hours}:${minutes}`) < Date.parse(`01/01/2011 ${this.openInfo[today].close}`)) {
          document.getElementById('isOpen').innerHTML = `${this.strings.open}`;
        } else {
          document.getElementById('isOpen').innerHTML = `${this.strings.closed}`;
          (<HTMLElement>document.getElementById('isOpen')).style.color = 'red';
        }
      } else {
        document.getElementById('isOpen').innerHTML = `${this.strings.closed}`;
        (<HTMLElement>document.getElementById('isOpen')).style.color = 'red';
      }
    });
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

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(HoursPopoverPage, { openInfo: this.openInfo });
    popover.present({
      ev: myEvent
    });
  }

  setNullIfEmpty(string) {
    const maxLength = 31;
    if (string && string.length > maxLength) {
      string = '...' + string.substring(0, maxLength);
    }
    return string ? (string.replace(/\s/g,'').length > 0 ? string : null) : null;
  }

  removeDistanceInfo() {
    document.getElementById('walk-icon').remove();
    (<HTMLElement>document.getElementById('right-side')).style.padding = '0';
    (<HTMLElement>document.getElementById('right-side')).style.width = '100%';
  }

  favorite() {
    console.log('we got a heart!!');
    this.isFavorite = true;
    (<HTMLElement>document.getElementById('heart-fill')).style.display = 'inline-block';
    (<HTMLElement>document.getElementById('heart-empty')).style.display = 'none';
    this.events.publish('favorite', this.place.id);
  }

  unfavorite() {
    console.log('awww shit');
    this.isFavorite = false;
    (<HTMLElement>document.getElementById('heart-empty')).style.display = 'inline-block';
    (<HTMLElement>document.getElementById('heart-fill')).style.display = 'none';
    this.events.publish('unfavorite', this.place.id);
  }
}
