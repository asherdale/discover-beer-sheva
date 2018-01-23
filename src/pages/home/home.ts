// ionic cordova build ios --prod
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController, Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { PopoverController } from 'ionic-angular';
import { PopoverPage } from './popover';
import { PlacePage } from '../place/place';

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  addressElement: HTMLInputElement = null;

  map: any;
  loading: any;
  error: any;
  currentregional: any;

  places: any = [];
  infoWindow: any = null;
  selectedPlace: any = null;
  userLocation: any = null;
  selectedFilter: String = "all";

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: App,
    public nav: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    // public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public geolocation: Geolocation,
    public popoverCtrl: PopoverController,
    public events: Events,
    public ga: GoogleAnalytics,
    public http: Http
  ) {
    this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('home');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.platform.ready().then(() => this.loadMaps());

    events.subscribe('filter:changed', (newFilter) => {
      this.setDisplay(document.getElementById('arrow-button'), 'none', document.getElementById('menu-button'), 'block');
      if (newFilter === this.selectedFilter) {
        return;
      }
      this.selectedFilter = newFilter;
      this.filterResults();
    });
  }


  loadMaps() {
    var isOnline = window.navigator.onLine;
    if (isOnline && !!google) {
      this.http.get('assets/data/sampleBusinesses.json').map(res => res.json()).subscribe(data => {
        this.http.get('assets/data/categories.json').map(res2 => res2.json()).subscribe(cats => {
          this.initializeMap(data.features, cats);
        });
      });
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }

  initializeMap(jsonData, cats) {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }
        ],
        disableDoubleClickZoom: false,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM,
           mapTypeIds: ['roadmap', 'satellite']
        }
      });

      this.places = jsonData;
      this.places.forEach((place) => {
        place.cat = cats[place.properties.type];
        place.marker = this.getMarker(place, this.map);
        place.infowindow = this.getInfoWindow(place);

        place.marker.addListener('click', () => {
          this.openInfoWindow(place);
        });
      });
      const markers = this.places.map(place => place.marker);
      this.getUserLocation();

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        this.bounceMap(markers);
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.zone.run(() => {
          this.resizeMap();
        });
      });

      google.maps.event.addListener(this.map, "click", () => {
        this.closeInfoWindow();
      });
    });
  }

  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.loadMaps();
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    const menuButton = document.getElementById('menu-button');
    const arrowButton = document.getElementById('arrow-button');
    const optionsButton = document.getElementById('options-button');
    const clearButton = document.getElementById('clear-button');
    const searchInput = (<HTMLInputElement>document.getElementById('search-input'));
    document.getElementById('search-form').onsubmit = () => {
      this.mapSearch(searchInput.value);
    }
    searchInput.onfocus = () => {
      this.setDisplay(menuButton, 'none', arrowButton, 'block');
      if (searchInput.value.length > 0) {
        this.setDisplay(optionsButton, 'none', clearButton, 'block');
      } else {
        this.setDisplay(clearButton, 'none', optionsButton, 'block');
      }
    }

    arrowButton.onclick = () => {
      searchInput.blur();
      searchInput.value = '';
      this.setDisplay(arrowButton, 'none', menuButton, 'block');
      this.setDisplay(clearButton, 'none', optionsButton, 'block');
    }

    clearButton.onclick = () => {
      searchInput.value = '';
      searchInput.focus();
      this.setDisplay(clearButton, 'none', optionsButton, 'block');
      this.mapSearch('');
      this.setDisplay(menuButton, 'none', arrowButton, 'block');
    }
    const thisPage = this;
    searchInput.addEventListener('input', function (evt) {
      if (this.value.length > 0) {
        thisPage.setDisplay(optionsButton, 'none', clearButton, 'block');
      } else {
        thisPage.setDisplay(clearButton, 'none', optionsButton, 'block');
      }
    });
  }

  setDisplay(icon1, display1, icon2, display2) {
    icon1.style.display = display1;
    icon2.style.display = display2;
  }

  //Center zoom
  //http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
  bounceMap(markers) {
    let bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }

  getMarker(place, map) {
    return new google.maps.Marker({
      position: {
        lat: place.geometry.coordinates[1],
        lng: place.geometry.coordinates[0]
      },
      map: map,
      title: place.properties.name,
      animation: google.maps.Animation.DROP,
    });
  }


  getInfoWindow(place) {
    let contentString = '<div id="info-window-content">'+
        `<h6 id="title">${place.properties.name}</h6>`+
        `<p id="title">${place.cat}</p>`+
        '<button id="toPlacePage">More</button>' +
        '</div>';
    return new google.maps.InfoWindow({
      content: contentString
    });
  }

  openInfoWindow(place) {
    this.closeInfoWindow();
    this.selectedPlace = place;
    this.selectedPlace.infowindow.open(this.map, place.marker);

    document.getElementById("toPlacePage").addEventListener("click", () => {
      document.getElementById("hiddenButton").click();
    });
  }

  closeInfoWindow() {
    if (this.selectedPlace && this.selectedPlace.infowindow) {
      this.selectedPlace.infowindow.close();
    }
  }

  toPlacePage() {
    this.nav.push(PlacePage, { place: this.selectedPlace, userLocation: this.userLocation });
  }

  mapSearch(query) {
    console.log('query');
    this.closeInfoWindow();
    this.clearMarkers();
    this.selectedFilter = "all";
    this.setDisplay(document.getElementById('arrow-button'), 'none', document.getElementById('menu-button'), 'block');

    const results = [];
    this.places.forEach((place) => {
      if (this.placeMatchesQuery(place, query)) {
        place.marker.setMap(this.map);
        results.push(place);
      }
    });


    if (results.length == 1) {
      this.openInfoWindow(results[0]);
      this.map.setCenter({lat: results[0].latitude, lng: results[0].longitude});
      this.map.setZoom(16);
    } else if (results.length > 0) {
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'));
    } else {
      this.showToast("No results found.");
      this.showMarkers();
      this.bounceMap(this.getAttributeFromPlaces(this.places, 'marker'));
    }
  }

  placeMatchesQuery(place, query) {
    return place.title.toLowerCase().includes(query.toLowerCase());
  }

  // Sets the map on all markers in the array.
  setMapOnAll(map) {
    for (var i = 0; i < this.places.length; i++) {
      this.places[i].marker.setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  showMarkers() {
    this.setMapOnAll(this.map);
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  getAttributeFromPlaces(places, attr) {
    return places.map((place) => place[attr]);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage, { selectedFilter: this.selectedFilter });
    popover.present({
      ev: myEvent
    });
  }

  filterResults() {
    this.closeInfoWindow();
    this.clearMarkers();

    const results = [];
    this.places.forEach((place) => {
      if (place.type == this.selectedFilter) {
        place.marker.setMap(this.map);
        results.push(place);
      }
    });

    const displayName = this.selectedFilter.charAt(0).toUpperCase() + this.selectedFilter.slice(1);
    (<HTMLInputElement>document.getElementById('search-input')).value = this.selectedFilter === "all" ? '' : displayName;

    if (results.length == 1) {
      this.map.setCenter({lat: results[0].latitude, lng: results[0].longitude});
      this.map.setZoom(16);
    } else if (results.length > 0) {
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'));
    } else {
      this.showMarkers();
      this.bounceMap(this.getAttributeFromPlaces(this.places, 'marker'));
    }
  }

  locate() {
    if (this.userLocation && this.userLocation.position) {
      this.map.setCenter(this.userLocation.position);
      this.map.setZoom(16);
    } else {
      this.getUserLocation();
    }
    // TODO: delete following
    this.bounceMap(this.places.map(place => place.marker));
  }

  // go show currrent location
  getUserLocation() {
    this.loading = this.loadingCtrl.create({
      content: 'Searching Location ...'
    });
    this.loading.present();

    const thisPage = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.loading.dismiss().then(() => {
            thisPage.showToast('Location found!');
            thisPage.userLocation = new google.maps.Marker({
              position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              map: thisPage.map,
              animation: google.maps.Animation.DROP,
              icon: '../../assets/img/blue-dot.png',
            });
            thisPage.locate();
          });
        },
        (error) => {
          this.loading.dismiss().then(() => {
            thisPage.showToast('Location not found. Please enable your GPS!');
            console.log(error);
          });
        });
    } else {
      this.showToast('Location not found. Please enable your GPS!');
      console.log('Device/browser doesn\'t support Geolocation');
    }
  }
}
