
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from '../environments/environment';

import {SessionStorage} from './_services/SessionService';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  constructor(
    public ses: SessionStorage
  ) { }
  title = "Detailing Devil's";
  isLoggedIn() {
    return this.ses.users.logged;
  }
  location: Location;

  ngOnInit() {
  
  if (environment.production) {
    if (location.protocol === 'http:') {
    window.location.href = location.href.replace('http', 'https');
    }  
  }  
    
}



}
