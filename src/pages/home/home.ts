// ionic cordova build ios --prod
import {
  Component,
  NgZone,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  App,
  LoadingController,
  NavController,
  Platform,
  ToastController,
  Events,
  MenuController
} from 'ionic-angular';
import {
  Geolocation
} from '@ionic-native/geolocation';
import {
  GoogleAnalytics
} from '@ionic-native/google-analytics';
import {
  Http
} from '@angular/http';
import {
  Storage
} from '@ionic/storage';
import 'rxjs/add/operator/map';

import {
  PopoverController
} from 'ionic-angular';
import {
  PopoverPage
} from './popover';
import {
  PlacePage
} from '../place/place';

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

  places: any = [];
  infoWindow: any = null;
  selectedPlace: any = null;
  userLocation: any = null;
  selectedFilter: string = 'All';
  cats: any;
  strings: any;
  firstLocation: any = true;
  favorites: any = [];
  shouldRefilter: any = false;
  favoriteChanged: any = null;

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
    public geolocation: Geolocation,
    public popoverCtrl: PopoverController,
    public events: Events,
    public ga: GoogleAnalytics,
    public http: Http,
    public menu: MenuController
  ) {
    this.ga.startTrackerWithId('UA-112680953-1')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('home');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.platform.ready().then(() => this.loadMaps(null));

    events.subscribe('filter:changed', (newFilter) => {
      this.setDisplay(document.getElementById('arrow-button'), 'none', document.getElementById('menu-button'), 'block');
      if (newFilter === this.selectedFilter) {
        return;
      }
      this.selectedFilter = newFilter;
      this.filterResults();
    });

    events.subscribe('favorite', placeID => this.addFavorite(placeID));
    events.subscribe('unfavorite', placeID => this.removeFavorite(placeID));
  }

  ionViewDidEnter() {
    // Disable swiping for side menu
    this.menu.swipeEnable(false);
    if (this.favoriteChanged) {
      this.places.forEach((place) => {
        if (place.id === this.favoriteChanged) {
          place.marker.setMap(null);
          place.marker = this.getMarker(place, this.map);
          place.marker.addListener('click', () => {
            this.openInfoWindow(place);
          });
          this.openInfoWindow(place);
        }
      });
      this.favoriteChanged = null;
    }
    if (this.shouldRefilter) {
      this.shouldRefilter = false;
      this.filterResults();
    }
  }

  ionViewWillLeave() {
    // Re-enable swiping for side menu
    this.menu.swipeEnable(true);
  }


  loadMaps(nil) {
    var isOnline = window.navigator.onLine;
    if (isOnline && !!google) {
      this.storage.get('favorites').then((val) => {
        if (val) {
          this.favorites = val;
        } else {
          this.storage.set('favorites', []);
        }
        this.http.get('assets/data/sampleBusinesses.json').map(res => res.json()).subscribe(data => {
          this.http.get('assets/data/categories.json').map(res2 => res2.json()).subscribe(cats => {
            this.http.get('assets/data/strings.json').map(res3 => res3.json()).subscribe(strings => {
              this.strings = strings;
              this.cats = cats;
              this.initializeMap(data.features, cats);
            });
          });
        });
      });
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.', this.loadMaps, null)
    }
  }

  initializeMap(jsonData, cats) {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles:
        [{
            "featureType": "all",
            "elementType": "all",
            "stylers": [{
                "saturation": "32"
              },
              {
                "lightness": "-3"
              },
              {
                "visibility": "on"
              },
              {
                "weight": "1.18"
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [{
                "saturation": "-70"
              },
              {
                "lightness": "14"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
              "weight": "2"
            }]
          },
          {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "saturation": "100"
              },
              {
                "lightness": "-14"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
              },
              {
                "lightness": "12"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{
              "visibility": "off"
            }]
          },
        ],
        // [
        // {
        //   "featureType": "administrative",
        //   "elementType": "geometry",
        //   "stylers": [
        //     {
        //       "visibility": "off"
        //     }
        //   ]
        // },
        //   {
        //     "featureType": "poi",
        //     "stylers": [
        //       {
        //         "visibility": "off"
        //       }
        //     ]
        //   },
        //   {
        //     "featureType": "road",
        //     "elementType": "labels.icon",
        //     "stylers": [
        //       {
        //         "visibility": "off"
        //       }
        //     ]
        //   },
        //   {
        //     "featureType": "transit",
        //     "stylers": [
        //       {
        //         "visibility": "off"
        //       }
        //     ]
        //   }
        // ],
        gestureHandling: 'greedy',
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
      this.getUserLocation(this);

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        this.bounceMap(markers, 0);
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

  errorAlert(title, message, func, param) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [{
        text: 'OK',
        handler: data => {
          func(param);
        }
      }]
    });
    alert.present();
  }

  ionViewDidLoad() {
    const menuButton = document.getElementById('menu-button');
    const arrowButton = document.getElementById('arrow-button');
    const optionsButton = document.getElementById('options-button');
    const clearButton = document.getElementById('clear-button');
    const searchInput = ( < HTMLInputElement > document.getElementById('search-input'));
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
  bounceMap(markers, zoomOffset) {
    let bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);

    const currentZoom = this.map.getZoom();
    this.map.setZoom(currentZoom - zoomOffset);
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }

  getMarker(place, map) {
    const newMarker = new google.maps.Marker({
      position: {
        lat: place.geometry.coordinates[1],
        lng: place.geometry.coordinates[0]
      },
      map: map,
      title: place.properties.name,
      icon: this.isFavorite(place.id) ? '../../assets/img/default.png' : '',
      // animation: google.maps.Animation.DROP,
    });
    return newMarker;
  }


  getInfoWindow(place) {
    const date = new Date();
    const today = date.getDay() + 1;
    let openInfo = place.properties[`days${today}`] ?
      `${place.properties[`open${today}`]} - ${place.properties[`close${today}`]}` :
      this.strings.closed;
    let contentString = '<div id="info-window-content" dir="rtl">' +
      `<h6 id="title" style="margin-top: 1rem;">${place.properties.name}</h6>` +
      `<p id="cat">${place.cat}</p>` +
      `<p style="display: inline-block; margin: auto; padding-left: 0.5rem;">שעות היום:</p>` +
      `<p dir="ltr" style="display: inline-block; margin: auto;">${openInfo}</p><br>` +
      '<button ion-button id="toPlacePage" style="font-size: 1.3rem; display: block; margin: 1rem auto 0;">More</button>' +
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
    console.log(this.selectedPlace.marker);
    this.nav.push(PlacePage, {
      place: this.selectedPlace,
      userLocation: this.userLocation,
      favorites: this.favorites
    });
  }

  mapSearch(query) {
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

    if (results.length === 1) {
      this.openInfoWindow(results[0]);
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'), 6);
    } else if (results.length > 0) {
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'), 1);
    } else {
      this.showToast("No results found.");
      this.showMarkers();
      this.bounceMap(this.getAttributeFromPlaces(this.places, 'marker'), 0);
    }
  }

  placeMatchesQuery(place, query) {
    return place.properties.name.toLowerCase().includes(query.toLowerCase());
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
    let popover = this.popoverCtrl.create(PopoverPage, {
      'selectedFilter': this.selectedFilter,
      'cats': this.cats
    });
    popover.present({
      ev: myEvent
    });
  }

  filterResults() {
    this.closeInfoWindow();
    this.clearMarkers();

    const results = [];
    let applicableCats = [];

    this.cats['super-cats'].forEach((superCat) => {
      if (superCat.name !== this.selectedFilter) {
        return;
      }
      const subCats = superCat['sub-cats'];
      subCats.forEach((subCat) => {
        applicableCats = applicableCats.concat(this.cats['sub-cats'][subCat].cats);
      });
    });

    const filterIsFavorites = this.selectedFilter === 'Favorites';
    this.places.forEach((place) => {;
      if ((filterIsFavorites && this.isFavorite(place.id)) ||
        (applicableCats.find(el => el === parseInt(place.properties.type)))) {
        place.marker.setMap(this.map);
        results.push(place);
      }
    });

    const filterIsAll = this.selectedFilter === 'All';
    ( < HTMLInputElement > document.getElementById('search-input')).value = filterIsAll ? '' : this.selectedFilter;

    if (results.length === 1) {
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'), 6);
    } else if (results.length > 0) {
      this.bounceMap(this.getAttributeFromPlaces(results, 'marker'), filterIsAll ? 0 : 1);
    } else {
      this.showMarkers();
      this.bounceMap(this.getAttributeFromPlaces(this.places, 'marker'), 0);
      this.showToast("No results found.");
    }
  }

  locate() {
    if (this.userLocation && this.userLocation.position) {
      this.map.setCenter(this.userLocation.position);
      this.map.setZoom(14);
    } else {
      this.getUserLocation(this);
    }

    if (this.firstLocation) {
      this.bounceMap(this.places.map(place => place.marker), 0);
      this.firstLocation = false;
    }
  }

  // go show currrent location
  getUserLocation(thisPage) {
    thisPage.loading = thisPage.loadingCtrl.create({
      content: 'Searching Location ...'
    });
    thisPage.loading.present();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          thisPage.loading.dismiss().then(() => {
            thisPage.showToast('Location found!');
            if (thisPage.userLocation) {
              thisPage.userLocation.setMap(null);
            }
            thisPage.userLocation = new google.maps.Marker({
              position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              map: thisPage.map,
              icon: '../../assets/img/blue-dot.png',
            });
            thisPage.locate();
          });
        },
        (error) => {
          thisPage.loading.dismiss().then(() => {
            // thisPage.showToast('Location not found. Please enable your GPS!');
            thisPage.errorAlert('Error', 'Please allow your location to be accessed.', thisPage.getUserLocation, thisPage);
            console.log(error);
          });
        });
    } else {
      thisPage.showToast('Location not found. Please enable your GPS!');
      console.log('Device/browser doesn\'t support Geolocation');
    }
  }

  locatePressed() {
    this.getUserLocation(this);
  }

  addFavorite(placeID) {
    this.favorites.push(placeID);
    this.storage.set('favorites', this.favorites);
    this.favoriteChanged = placeID;
  }

  removeFavorite(placeID) {
    const index = this.favorites.indexOf(placeID);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.storage.set('favorites', this.favorites);
    }
    if (this.selectedFilter === "Favorites") {
      this.shouldRefilter = true;
    }
    this.favoriteChanged = placeID;
  }

  isFavorite(placeID) {
    return this.favorites.find(el => el === placeID);
  }
}
