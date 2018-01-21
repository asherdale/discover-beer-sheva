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
          <ion-label>{{filterDisplayName(filter.name)}}</ion-label>
          <ion-radio checked={{filter.checked}} value={{filter.name}}></ion-radio>
        </ion-item>
      </ion-list>
  `
})

export class PopoverPage {
  filters: any = [{
      "name": "all",
      "checked": "true",
    }, {
      "name": "restaurants",
      "checked": "false",
    }, {
      "name": "bakeries",
      "checked": "false",
    }, {
      "name": "stores",
      "checked": "false",
    }, {
      "name": "fitness",
      "checked": "false",
    }, {
      "name": "museums",
      "checked": "false",
    }, ];

  constructor(public viewCtrl: ViewController, public events: Events, public navParams: NavParams, public ga: GoogleAnalytics) {
    this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => this.ga.trackView('filter-popup'))
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    this.setChecked(this.navParams.get('selectedFilter'));
  }

  filterDisplayName(filterName) {
    return filterName.charAt(0).toUpperCase() + filterName.slice(1);
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