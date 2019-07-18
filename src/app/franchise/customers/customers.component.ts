import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html'
})
export class FranchisesCustomersComponent implements OnInit {

  franchise_id;
  loading_list = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
    console.log(this.franchise_id);

    });
    if (this.franchise_id) {
       this.getConsumers(); 
       this.get_vehicle();
      }

  }


    
  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;

  redirect_previous() {
  this.current_page--;
  this.getConsumers();
}
redirect_next() {
  if (this.current_page < this.last_page) { this.current_page++; }
  else { this.current_page = 1; }
  this.getConsumers();
}


  consumers:any = [];
  tmp:any;
  

  getConsumers() {
    this.loading_list = true;

    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.master || this.filter.source || this.filter.lead_status || this.filter.vehicle_type || this.filter.interested_in)this.filtering = true;

    this.db.post_rqst(  {'filter':this.filter}, 'franchises/franchises_consumers/' + this.franchise_id+'?page='+this.current_page)
    .subscribe(d => {
    this.loading_list = false;
     this.tmp = d;
     console.log(  this.tmp );
     this.current_page = this.tmp.consumers.current_page;
     this.last_page = this.tmp.consumers.last_page;
     this.total_leads = this.tmp.consumers.total;
     this.consumers = this.tmp.consumers.data;

     console.log(  this.consumers );
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getConsumers(); });   });
  }



  
  v_type_arr:any = [];
  get_vehicle(){
    this.loading_list = true;
  
    this.db.post_rqst(  {'franchise_id': this.franchise_id }, 'jobcard/getData')
    .subscribe((data:any) => { 
    this.loading_list = false;

      console.log(data);
      this.v_type_arr = data.data.vehicle_type_data;
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_vehicle(); });   });
  }

  deleteLead(l_id) {
    this.dialog.delete('Consumer').then((result) => {
      if (result) {
        this.db.post_rqst({l_id: l_id}, 'consumer_leads/remove')
          .subscribe(data => {
            this.tmp = data;
            if (this.tmp.data.r_lead) { this.getConsumers(); }
          });
      }
    });
  }


}
