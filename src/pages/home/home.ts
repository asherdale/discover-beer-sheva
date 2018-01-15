import { identifierModuleUrl } from '@angular/compiler/compiler';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

import { PlacePage } from '../place/place';

declare var google: any;
declare const jQuery: any;
let infoWindow = null;
let selectedPlace = null;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  // @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;

  listSearch: string = '';

  map: any;
  marker: any;
  loading: any;
  search: boolean = false;
  error: any;
  switch: string = "map";

  places: any = [];
  markers: any = [];
  currentregional: any;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: App,
    public nav: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public geolocation: Geolocation
  ) {
    this.platform.ready().then(() => this.loadMaps());
    this.places = [{
      "title": "Performance Rock Beersheba",
      "latitude": 31.238039,
      "longitude": 34.793046,
    }, {
      "title": "Beit HaBaguette",
      "latitude": 31.238168,
      "longitude": 34.792666,
    }, {
      "title": "Carraso Science Park",
      "latitude": 31.241974,
      "longitude": 34.785521,
    }];
  }

  loadMaps() {
    if (!!google) {
      this.initializeMap();
      // this.initAutocomplete();
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
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

  initializeMap() {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        // zoom: 10,
        // center: { lat: 34.793139, lng: 31.251530 },
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
        zoomControl: true,
        scaleControl: true,
      });

      this.markers = this.places.map((place) => this.addMarkerWithWindow(place, this.map));

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        this.bounceMap(this.markers);
        // this.getCurrentPositionfromStorage(markers)
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.zone.run(() => {
          this.resizeMap();
        });
      });

      document.getElementById('search-form').onsubmit = () => {
        this.mapSearch(document.getElementById('search-input').value);
      };
    });
  }

  markerTapped() {
    this.nav.push(PlacePage, selectedPlace);
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

  addMarkerWithWindow(place, map) {
    place.marker = new google.maps.Marker({
      position: {
        lat: place.latitude,
        lng: place.longitude
      },
      map: map,
      title: place.title,
    });
    this.addInfoWindow(place);
    return place.marker;
  }

  addInfoWindow(place) {
    let contentString = '<div id="info-window-content">'+
        '<h4 id="title">'+
        place.title +
        '</h4>'+
        '<button ion-button color="primary" id="toPlacePage" onclick="">More</button>'
        '</div>';
    let infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    place.marker.addListener('click', () => {
      if (infoWindow) {
        infoWindow.close();
      }
      infoWindow = infowindow;
      infoWindow.open(this.map, place.marker);
      selectedPlace = place;

      document.getElementById("toPlacePage").addEventListener("click", () => {
        document.getElementById("hiddenButton").click();
      });
    });
  }

  mapSearch(query) {
    console.log(query);
    console.log(this.markers);
  }

    // mapsSearchBar(ev: any) {
  //   // set input to the value of the searchbar
  //   //this.search = ev.target.value;
  //   console.log(ev);
  //   const autocomplete = new google.maps.places.Autocomplete(ev);
  //   autocomplete.bindTo('bounds', this.map);
  //   return new Observable((sub: any) => {
  //     google.maps.event.addListener(autocomplete, 'place_changed', () => {
  //       const place = autocomplete.getPlace();
  //       if (!place.geometry) {
  //         sub.error({
  //           message: 'Autocomplete returned place with no geometry'
  //         });
  //       } else {
  //         sub.next(place.geometry.location);
  //         sub.complete();
  //       }
  //     });
  //   });
  // }

  // initAutocomplete(): void {
  //   // reference : https://github.com/driftyco/ionic/issues/7223
  //   this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
  //   this.createAutocomplete(this.addressElement).subscribe((location) => {
  //     console.log('Searchdata', location);

  //     let options = {
  //       center: location,
  //       zoom: 10
  //     };
  //     this.map.setOptions(options);
  //     this.addMarker(location, "Mein gesuchter Standort");

  //   });
  // }

  // createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
  //   const autocomplete = new google.maps.places.Autocomplete(addressEl);
  //   autocomplete.bindTo('bounds', this.map);
  //   return new Observable((sub: any) => {
  //     google.maps.event.addListener(autocomplete, 'place_changed', () => {
  //       const place = autocomplete.getPlace();
  //       if (!place.geometry) {
  //         sub.error({
  //           message: 'Autocomplete returned place with no geometry'
  //         });
  //       } else {
  //         console.log('Search Lat', place.geometry.location.lat());
  //         console.log('Search Lng', place.geometry.location.lng());
  //         sub.next(place.geometry.location);
  //         //sub.complete();
  //       }
  //     });
  //   });
  // }

  // getCurrentPositionfromStorage(markers) {
  //   this.storage.get('lastLocation').then((result) => {
  //     if (result) {
  //       let myPos = new google.maps.LatLng(result.lat, result.long);
  //       this.map.setOptions({
  //         center: myPos,
  //         zoom: 14
  //       });
  //       let marker = this.addMarker(myPos, "My last saved Location: " + result.location);

  //       markers.push(marker);
  //       this.bounceMap(markers);

  //       this.resizeMap();
  //     }
  //   });
  // }

  // go show currrent location
  // getCurrentPosition() {
  //   this.loading = this.loadingCtrl.create({
  //     content: 'Searching Location ...'
  //   });
  //   this.loading.present();

  //   let locationOptions = { timeout: 10000, enableHighAccuracy: true };

  //   this.geolocation.getCurrentPosition(locationOptions).then(
  //     (position) => {
  //       this.loading.dismiss().then(() => {

  //         this.showToast('Location found!');

  //         console.log(position.coords.latitude, position.coords.longitude);
  //         let myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //         let options = {
  //           center: myPos,
  //           zoom: 14
  //         };
  //         this.map.setOptions(options);
  //         this.addMarker(myPos, "Mein Standort!");

  //         let alert = this.alertCtrl.create({
  //           title: 'Location',
  //           message: 'Do you want to save the Location?',
  //           buttons: [
  //             {
  //               text: 'Cancel'
  //             },
  //             {
  //               text: 'Save',
  //               handler: data => {
  //                 let lastLocation = { lat: position.coords.latitude, long: position.coords.longitude };
  //                 console.log(lastLocation);
  //                 this.storage.set('lastLocation', lastLocation).then(() => {
  //                   this.showToast('Location saved');
  //                 });
  //               }
  //             }
  //           ]
  //         });
  //         alert.present();

  //       });
  //     },
  //     (error) => {
  //       this.loading.dismiss().then(() => {
  //         this.showToast('Location not found. Please enable your GPS!');

  //         console.log(error);
  //       });
  //     }
  //   )
  // }

  // showToast(message) {
  //   let toast = this.toastCtrl.create({
  //     message: message,
  //     duration: 3000
  //   });
  //   toast.present();
  // }

  // viewPlace(id) {
  //   console.log('Clicked Marker', id);
  // }
}
