import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {

  franchise_id;
  loading_list = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}

  ngOnInit() {
    this.route.params.subscribe(params => {
    this.franchise_id = this.db.crypto(params['franchise_id'],false);
    
    if (this.franchise_id) {
       this.getFranchiseDetails(); 
       this.franchise_saleinvoice();
      }
    });
  }

  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;
  search: any = '';
  source: any = '';
  ing_page = false;
  loader: any = false;
  searchData = true;

  redirect_previous() {
  this.current_page--;
  this.franchise_saleinvoice();
}
redirect_next() {
  if (this.current_page < this.last_page) { this.current_page++; }
  else { this.current_page = 1; }
  this.franchise_saleinvoice();
}

  frchise:any;
  invoice:any = [];
  data: any;

  tmp:any = {};
  tmp2:any = {};
  franchiseOrderForm:any = {};

  getFranchiseDetails() {
    console.log(this.franchiseOrderForm);
    this.loading_list = true;

    this.db.get_rqst(  '', 'franchises/details/' + this.franchise_id )
    .subscribe(data => {
    this.loading_list = false;

     this.tmp = data;
     this.frchise = this.tmp.frchise;
     //console.log(  this.frchise );
     this.db.franchise_name = this.frchise.company_name;     
    },err => {  this.dialog.retry().then((result) => { 
      this.getFranchiseDetails();      
      console.log(err); });  
    });

  }

  salesInvoiceList:any = [];
 
  

  franchise_saleinvoice(){

    this.loading_list = true;

    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.status ||  this.filter.search)this.filtering = true;

    this.db.post_rqst( {'filter':this.filter ,'franchise_id':this.franchise_id }, 'franchises/franchise_saleinvoice?page='+this.current_page )
    .subscribe(data => {

      this.loading_list = false;
      console.log(data);
      
    this.data = data['data']['salesInvoiceList'];
    this.invoice = this.data.data;
    this.current_page = this.data.current_page;
    this.last_page = this.data.last_page;
    this.total_leads = this.data.total;

    if (this.search && (this.invoice.length < 1)) { this.searchData = false; }
    if (this.search && (this.invoice.length > 0)) { this.searchData = true; }
    
     console.log(this.invoice);
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.franchise_saleinvoice(); }); });
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
        this.invoice = this.tmp2['data']['orderinvs'];
        console.log(this.invoice);
      },err => {  this.dialog.retry().then((result) => { 
        this.GetSaleInvoice(action);      
        console.log(err); });  
      });
  }

}
