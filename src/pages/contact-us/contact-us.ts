import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
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
    public http: Http
  ) {

  }
  goToHome(){
  	 this.navCtrl.setRoot(HomePage);
  }

  ionViewDidLoad(){

  }

  submitEmail(){
    const fName = document.getElementById('firstNameIn').childNodes[1];
    let fN = fName.value;
    const lName = document.getElementById('lastNameIn').childNodes[1];
    let lN = lName.value;
    const emailAd = document.getElementById('emailIn').childNodes[1];
    let email = emailAd.value;
    const subjectIn = document.getElementById('subjectIn').childNodes[1];
    let subject = subjectIn.value;
    const messageTA = document.getElementById('MessageTA').childNodes[2];
    let m = messageTA.value;

    let fM  = "First Name: " + fN + " Last Name: " + lN + " Email Address: " + email + " Subject: " + subject + " Message: " + m;
    let data = {
      "Name": "Discover Beersheva",
      "Email": "sammy.shatzkin@gmail.com",
      "Message": fM
    };
    console.log(data);
    this.http.post("http://startups.cdi-negev.com/send-email.php",data).subscribe(d => console.log(d));
  }

}
