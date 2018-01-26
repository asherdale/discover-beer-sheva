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
  @ViewChild('keyPadStatus') keyPadStatus: ElementRef;
  @ViewChild('keyPad') keyPad: ElementRef;

  keypadInput : string;
  alertCountDown : number;
  alertCountTimeout : any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, ) {
    this.keypadInput = "";
    this.alertCountDown = 5;

    this.alertCountTimeout = setInterval(() => {
      if (--this.alertCountDown >= 1){
        this.onTimeIn();
      }
      else{
        clearInterval(this.alertCountTimeout);
        this.onTimeOut();
      }
    }, 1000);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlertPage');
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  sendKey(n): void{
    keyPadStatus.innerText += "●";
    this.keypadInput += "" + n;
    console.log(typeof(n), this.keypadInput);
  }

  onTimeIn(){

  }

  onTimeOut(){

  }
}
