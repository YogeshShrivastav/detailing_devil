import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-franchise-customer-left-tabs',
  templateUrl: './franchise-customer-left-tabs.component.html'
})
export class FranchiseCustomerLeftTabsComponent implements OnInit {
  id; 
  franchise_id; 
  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.franchise_id = params['franchise_id'];
      this.getCounsumer_name();
    });
  }
  

  tmp;
  getCounsumer_name() {
    this.db.get_rqst(  '', 'franchises/getConsumer_name/' + this.db.crypto(this.id,false) )
    .subscribe(data => {
     this.tmp = data;
     this.db.customer_name  = this.tmp.Consumernam.first_name + ' ' + this.tmp.Consumernam.last_name;
     //console.log('consumer name');
     //console.log( this.db.customer_name  );
    });
  }

}
