import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../_services/SessionService';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
  
  lead_id;
  franchise_name;
  lead_type;
  
  loading_list = false;
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
    }
    
    ngOnInit() {
      
      this.route.params.subscribe(params => {
        this.lead_id = params['id'];
        this.lead_type = params['type'];

      this.franchise_name = this.db.franchise_name;

        
        console.log(this.lead_id);
        console.log(this.lead_type);
        
      if (this.lead_id) {
        this.getConsumers(); 
      }
      
      if (this.lead_id && this.lead_type) {
        this.getCustomers(); 
      }
      this.loading_list = true;
    });
    
    }
    
    consumers:any = [];
    tmp:any;
    
    getConsumers() {
      this.loading_list = false;
      this.db.get_rqst(  '', 'franchises/franch_consumers/' + this.lead_id)
      .subscribe(d => {
        this.tmp = d;
        console.log(  this.tmp );
        this.consumers = this.tmp.consumers;
        console.log(  this.consumers );
        this.loading_list = true;
      });
    }

    getCustomers() {
      this.loading_list = false;
      this.db.get_rqst(  '', 'customer/franch_customers/' + this.lead_id)
      .subscribe(d => {
        this.tmp = d;
        console.log(  this.tmp );
        this.consumers = this.tmp.customers;
        console.log(  this.consumers );
        this.loading_list = true;
      });
    }
    
    
  }
  