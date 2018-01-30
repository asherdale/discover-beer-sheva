import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Http } from '@angular/http';
// import { EmailComposer } from '@ionic-native/email-composer';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact-us.html'
})
export class ContactUsPage {

  constructor(
    public navCtrl: NavController,
    public http: Http,
    public alertCtrl: AlertController
  ) { }

  goToHome() {
  	 this.navCtrl.setRoot(HomePage);
  }

  ionViewDidLoad() {

  }

  submitEmail() {
    const fName = (<HTMLInputElement>document.getElementById('firstNameIn').childNodes[1]).value;
    const fN = fName;
    const lName = (<HTMLInputElement>document.getElementById('lastNameIn').childNodes[1]).value;
    const email = (<HTMLInputElement>document.getElementById('emailIn').childNodes[1]).value;
    const subject = (<HTMLInputElement>document.getElementById('subjectIn').childNodes[1]).value;
    const message = (<HTMLInputElement>document.getElementById('MessageTA').childNodes[2]).value;

    const fullMessage = `First Name: ${fName} Last Name: ${lName} 
                         Email Address: ${email} Subject: ${subject} 
                         Message: ${message}`;

    const data = {
      "Name": "Discover Beersheva",
      "Email": "asher@dales.org",
      "Message": fullMessage
    };
    console.log(data);
    this.http.post("http://startups.cdi-negev.com/send-email.php",data).subscribe(
      data => {
        console.log(data);
        this.showSuccessAlert();
      },
      err => {
        console.log(err);
        this.showErrorAlert();
      }  
    );
  }

  showSuccessAlert() {
    let alert = this.alertCtrl.create({
      title: 'Success!',
      subTitle: 'We will get back to you as soon as possible :)',
      buttons: [{
        text: 'Okie Dokie',
        handler: data => {
          this.goToHome();
          // this.navCtrl.push(HomePage, {});
        }
      }]
    });
    alert.present();
  }

  showErrorAlert() {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Unfortunately the message could not be sent. Please try again.',
      buttons: ['OK']
    });
    alert.present();
  }
}
