import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';
@Component({
  selector: 'app-customers-detail',
  templateUrl: './customers-detail.component.html'
})
export class CustomersDetailComponent implements OnInit {

  id;
  franchise_id;
  franchise_name;
  loading_list = false;


  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.db.franchise_id = params['franchise_id'];
      this.franchise_id = this.db.franchise_id;

      this.id = params['id'];
      console.log(this.id);   
      console.log(this.franchise_id);   

      this.getCustomerDetail();    
    });
  }

  detail:any = [];
  vehicle_info:any = [];

  tmp:any;

  getCustomerDetail() {
    this.loading_list = false;
    this.db.get_rqst(  '', 'customer/customer_detail/' + this.id)
    .subscribe(d => {
      this.tmp = d;
      console.log(  this.tmp );
      this.detail = this.tmp.detail;
      this.vehicle_info = this.tmp.vehicle_info;
      this.db.customer_name = this.detail.first_name+ ' ' + this.detail.last_name;
      this.franchise_name = this.db.franchise_name;
      console.log(  this.detail );
      this.loading_list = true;
    });
  }

}
