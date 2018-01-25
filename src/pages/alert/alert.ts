import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the AlertPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-alert',
  templateUrl: 'alert.html',
})
export class AlertPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlertPage');
  }

  start(event){
    this.showToast("Start");
    event.target.classList.toggle("pressDown", true);
    event.target.innerText = "Armed";

    console.log(event.target.className);
  }

  end(event){
    this.showToast("End");
    event.target.classList.toggle("pressDown", false);
    event.target.innerText = "Idle";

    console.log(event.target.className);
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
