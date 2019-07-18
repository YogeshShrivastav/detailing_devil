import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-master-listing-tabs',
  templateUrl: './master-listing-tabs.component.html'
  // styleUrls: ['./master-listing-tabs.component.scss']
})
export class MasterListingTabsComponent implements OnInit {

  constructor(public db : DatabaseService,private route : ActivatedRoute) { }


  ngOnInit() {
    console.log(this.db.datauser);
    
  }

}
