import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import * as utmObj from 'utm-latlng';
//var utmObj = require('utm-latlng');

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
  MYLOC: any;

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
    public http: Http,
  ) {
    this.platform.ready().then(() => {
      this.loadMaps();
      this.loadMarkers();
    });
  }

  getCoordinates(x) {
    const utm = new utmObj();

    let temp = utm.convertUtmToLatLng(x.geometry.coordinates[0], x.geometry.coordinates[1], 36, 'R');
    return new google.maps.LatLng(temp.lat, temp.lng);
  }

  loadMarkers() {

    // http://opendata.br7.org.il/datasets/geojson/street_light.geojson
    // http://opendata.br7.org.il/datasets/geojson/cameras.geojson
    let load = (name: string): Promise<{}[]> => {
      return new Promise<{}[]>(resolve => {
        this.http.get(`http://opendata.br7.org.il/datasets/geojson/${name}.geojson`).subscribe(data => {
          let r = JSON.parse(data["_body"])["features"];
          if (!Array.isArray(r)){ throw "Data downloaded is not array"; }
          resolve(r);
        });
      });
    };

    load("street_light").then(heatmapData => {
      this.showToast("Loaded street lights");
      var data = [];
      for (var key in heatmapData){
        data.push(this.getCoordinates(heatmapData[key]));
      }
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: data
      });
      console.log({"lat": data[0].lat(), "long": data[0].lng()});
      heatmap.setMap(this.map);
    });

    load("cameras").then(d => {
      this.showToast("Loaded security cameras");
      console.log(d);
      for (var i = 0; i < d["length"]; i++){
        let item = d[i];
        this.placeMarker({
          "lat": item.properties.Y,
          "long": item.properties.X,
          "title": "Camera",
          "url": "../../assets/icon/camera-32.png",
          "size": {
            "x": 32,
            "y": 32
          }
        });
      }
    });
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
        zoomControl: false,
        scaleControl: false,
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

      try {
        let watch = this.geolocation.watchPosition();
        watch.subscribe(data => this.moveTo(data));
        this.geolocation.getCurrentPosition().then(data => this.moveTo(data));
      }
      catch (e) {
        this.showToast("Unable to pan to location");
        console.error(e);
      }

      this.MYLOC = new google.maps.Marker({
        clickable: false,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
          new google.maps.Size(22, 22),
          new google.maps.Point(0, 18),
          new google.maps.Point(11, 11)),
        shadow: null,
        zIndex: 999,
        map: this.map// your google.maps.Map object
      });
    });
  }

  lastPos : any;

  moveTo(data) {
    //console.log(data);
    if (this.lastPos == data){
      return;
    }
    else{
      this.lastPos = data;
    }

    let lg = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
    this.map.setZoom(20);
    this.map.panTo(lg);
    this.MYLOC.setPosition(lg);
    console.log({
      "zoom": this.map.getZoom(),
      "location": {
        "lat": this.map.getCenter().lat(),
        "lng": this.map.getCenter().lng()
      },
      "data": data
    });
  }


placeMarker(options){
    var marker = new google.maps.Marker({
      map: this.map,
      position: { lat: options.lat || 0, lng: options.long || 0 },
      title: options.title || "",
      icon: {
        url: options.url,
        size: new google.maps.Size(options.size.x, options.size.y),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(options.size.x / 2, options.size.y)
      }
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

}
