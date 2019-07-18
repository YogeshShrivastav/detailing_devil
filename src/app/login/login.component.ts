import { Component, OnInit } from '@angular/core';
import {SessionStorage} from '../_services/SessionService';
import {DatabaseService} from '../_services/DatabaseService';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: any = {};
  loading = false;
  DDVideoUrl: string;
  sendingData = false;
  constructor(public ses: SessionStorage, public db: DatabaseService, public sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  login() {
    // this.sendingData = true;
    this.ses.setSession(this.form);
  }
}
