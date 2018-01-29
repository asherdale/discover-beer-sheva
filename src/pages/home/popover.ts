import { Component } from '@angular/core';
import { ViewController, Events, NavParams } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

@Component({
  template: `
      <ion-list radio-group (ionChange)="filterClicked($event)">
        <ion-list-header>
          Filter
        </ion-list-header>

        <ion-item *ngFor="let filter of filters">
          <ion-label>{{filter.name}}</ion-label>
          <ion-radio checked={{filter.checked}} value={{filter.name}}></ion-radio>
        </ion-item>
      </ion-list>
  `
})

export class PopoverPage {
  filters: any;

  constructor(public viewCtrl: ViewController, public events: Events, public navParams: NavParams, public ga: GoogleAnalytics) {
    this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('filter-popup'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.filters = this.navParams.get('cats')['super-cats'];
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    this.setChecked(this.navParams.get('selectedFilter'));
  }

  filterClicked(event) {
    this.close();
    this.events.publish('filter:changed', event);
  }

  setChecked(filterName) {
    this.filters.forEach((filter) => {
      filter.checked = filter.name === filterName ? "true" : "false";
    });
  }
}
