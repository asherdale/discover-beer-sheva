import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
import { HTTP } from '@ionic-native/http';


/**
 * Generated class for the ContactUsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contact-us',
  templateUrl: 'contact-us.html',
})

export class ContactUsPage {

  contact : {
    name:'',
    description:'',
    issue:'',
    email:''

  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HTTP/*, private emailComposer: EmailComposerprivate, emailComposer: EmailComposer*/) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactUsPage');
  }

  sendData() {
    let email = {
      Name:this.contact.name,
      Email: 'philliesman4@aol.com',
      //subject: 'Some bitch ass boi complainin',
      Message:this.contact.description,
      //isHtml: true
    };

    this.http.get('http://ionic.io', {}, {})
  .then(data => {

    console.log(data.status);
    console.log(data.data); // data received by server
    console.log(data.headers);

  })
  .catch(error => {

    console.log(error.status);
    console.log(error.error); // error message as string
    console.log(error.headers);

  });

  }



}
