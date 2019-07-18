import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-master-add-tabs',
  templateUrl: './master-add-tabs.component.html'
  // styleUrls: ['./master-add-tabs.component.scss']
})
export class MasterAddTabsComponent implements OnInit {

  constructor(public db : DatabaseService,private route : ActivatedRoute) { }

  ngOnInit() {
  }

}
