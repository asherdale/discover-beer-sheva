import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
// import { EmailComposer } from '@ionic-native/email-composer';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact-us.html'
})
export class ContactUsPage {

  constructor(public navCtrl: NavController) {


  }
  goToHome(){
  	 this.navCtrl.setRoot(HomePage);
  }



}
