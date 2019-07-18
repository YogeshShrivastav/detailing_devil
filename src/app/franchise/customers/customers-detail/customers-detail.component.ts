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
export class FrachisesCustomersDetailComponent implements OnInit {

  id;
  franchise_id;
  franchise_name;
  loading_list = false;


  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.id = this.db.crypto(params['id'],false);

      this.getCustomerDetail();    
    });
  }

  detail:any = [];
  vehicle_info:any = [];

  tmp:any;

  getCustomerDetail() {
    this.loading_list = true;
    this.db.get_rqst(  '', 'customer/customer_detail/' + this.id)
    .subscribe(d => {
      this.loading_list = false;
      this.tmp = d;
      console.log(  this.tmp );
      this.detail = this.tmp.detail;

      if( !this.detail ){ 
        this.dialog.warning('This customer has been Deleted!'); 
        this.router.navigate(['/franchise-customers/'+this.db.crypto(this.franchise_id)+'/'+this.db.crypto(this.id)]);
        return;
      }

      this.vehicle_info = this.tmp.vehicle_info;
      this.db.customer_name = this.detail.first_name+ ' ' + this.detail.last_name;
      console.log(  this.detail );
    },err => {  this.dialog.retry().then((result) => { 
      this.loading_list = false;
      this.getCustomerDetail();      
      console.log(err); });  
  });
  }

}
