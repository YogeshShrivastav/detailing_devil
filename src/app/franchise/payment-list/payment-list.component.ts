import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html'
})
export class PaymentListComponent implements OnInit {

  franchise_id;
  loading_list = false;
  isInvoiceDataExist = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
    this.franchise_id = this.db.crypto(params['franchise_id'],false);
       console.log(this.franchise_id );
    
    if (this.franchise_id) {
       this.franchise_payment();
      }
    });
  }

  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;

  
  redirect_previous() {
    this.current_page--;
    this.franchise_payment();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.franchise_payment();
  }



  data: any;
  frchise:any;
  payment:any;
  tmp:any = {};
  tmp1:any = {};
  tmp2:any = {};
  franchiseOrderForm:any = {};


  franchise_payment(){

    this.isInvoiceDataExist = false;
    this.loading_list = true;

    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.search || this.filter.mode)this.filtering = true;


    this.db.post_rqst(   {'filter':this.filter, 'franchise_id':this.franchise_id}, 'franchises/franchise_payment_lists?page='+this.current_page)
    .subscribe(d => {
      console.log(d);
      this.loading_list = false;

      this.data = d['data'].payment;
      this.payment = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;

    console.log(  this.payment );
     
    },err => {this.loading_list = false;  this.dialog.retry().then((result) => {  console.log(err); });  });
  }

  GetSaleInvoice(action:any)
  {
    console.log(action);  
    this.loading_list = true; 
    this.db.post_rqst(  {'franchise_id':this.franchise_id,'action':action}, 'franchises/franchise_invoice_asper_status')
      .subscribe((result)=>{
        this.tmp2 = result;
        this.loading_list = false;
        console.log(this.tmp2);
        this.payment = this.tmp2['data']['orderinvs'];
        console.log(this.payment);
      },err => {  this.dialog.retry().then((result) => { 
        this.GetSaleInvoice(action);      
        console.log(err); });  
       });
  }

}
