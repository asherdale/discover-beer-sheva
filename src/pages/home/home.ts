import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

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
  ) {
    this.platform.ready().then(() => this.loadMaps());
  }

  loadMaps() {
    if (!!google) {
      this.initializeMap();
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
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

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        this.bounceMap([]);
        // this.getCurrentPositionfromStorage(markers)
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.zone.run(() => {
          this.resizeMap();
        });
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

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

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
}
