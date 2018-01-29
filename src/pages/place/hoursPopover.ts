import { Component } from '@angular/core';
import { ViewController, Events, NavParams } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

@Component({
  template: `
      <ion-list>
        <ion-list-header>
          שעות
        </ion-list-header>

        <ion-item class="hours" *ngFor="let info of openInfo" style="min-height: 3.1rem; padding-right: 8px;">
          <ion-label style="margin: 0; min-width: 66%;">{{info.show}}</ion-label>
          <ion-label style="margin: 0; text-align: right; background-color: transparent;">{{info.day}}</ion-label>
        </ion-item>
      </ion-list>
  `
})

export class HoursPopoverPage {

  openInfo: any;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public ga: GoogleAnalytics) {
    this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('hours-popup'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.openInfo = this.navParams.get('openInfo');
    console.log(this.openInfo);
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    const list = document.getElementsByClassName('hours');
    for (let i = 0; i < list.length; i++) {
      (<HTMLElement>list[i]).style.fontWeight = this.openInfo[i].bold || 'normal';
    }
  }
}
