import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-franchise-header-tab',
  templateUrl: './franchise-header-tab.component.html',
})
export class FranchiseHeaderTabComponent implements OnInit {

  franchise_id;
  tmp;
  frchise; 
  constructor(public db : DatabaseService,private route : ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this. db.datauser.franchise_id;
      console.log( this.franchise_id);
      
      this.getFranchises_name();
    });
  }

  getFranchises_name() {
    this.db.get_rqst(  '', 'franchises/getFranchises_name/' + this.franchise_id )
    .subscribe(data => {
     this.tmp = data;
     console.log(data);
     
     this.db.franchise_name  = this.tmp.franchisenam.company_name;
     this.db.franchise_location  = this.tmp.franchisenam.location_id;
     this.db.franchise_state  = this.tmp.franchisenam.state;

     console.log(  this.tmp.franchisenam );
     console.log(  this.tmp.franchisenam.location_id );
    });
  }

}
