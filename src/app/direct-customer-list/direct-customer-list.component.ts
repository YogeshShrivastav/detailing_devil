import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../_services/DatabaseService';
import {DialogComponent} from '../dialog/dialog.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-direct-customer-list',
  templateUrl: './direct-customer-list.component.html'
})
export class DirectCustomerListComponent implements OnInit {

  loading_page = false;
  customer_data:any = {};
  loading_list = false;
  loader: any = false;
  isInvoiceDataExist = false;
  totalcustomer;
  
  data: any = {};

  constructor(private route: ActivatedRoute,public db: DatabaseService, public dialog: DialogComponent ) { }

  ngOnInit() {
    this.loading_page = true;
   this.getcustomerList(); 
  }


  redirect_previous() {
    this.current_page--;
    this.getcustomerList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getcustomerList();
  }

  current_page = 1;
  last_page: number ;
  searchData = true;
  total_leads = 0;
  filter:any = {};
  filtering : any = false;
  search: any = '';
  source: any = '';

  getcustomerList() {
    this.isInvoiceDataExist = false;
    this.loading_list = true;
          
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    
    if( this.filter.date || this.filter.search)this.filtering = true;

  
    this.db.post_rqst( { 'filter': this.filter }, 'stockdata/getDirectCustomer?page='+ this.current_page ).subscribe(data => {
    
      console.log(data);
      this.loading_list = false;
      this.data = data['data']['directcustomer'];
      this.customer_data = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;
      this.totalcustomer = this.data.totalcustomer;


      if (this.search && (this.customer_data.length < 1)) { this.searchData = false; }
        if (this.search && (this.customer_data.length > 0)) { this.searchData = true; }

    console.log(  this.customer_data );
   },error => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getcustomerList();  }); });
    }
}
