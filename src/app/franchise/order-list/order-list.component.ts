import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {

  franchise_id;
  loading_list = false;
  isInvoiceDataExist = false;
  search: any = '';
  source: any = '';
  loading_page = false;
  loader: any = false;
  searchData = true;
  data: any;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) { }
  
  ngOnInit() {
      this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
   
      if (this.franchise_id) {
        this.getFranchiseOrderList(); 
       }
      });
    
  }

  orders:any = [];
  tmp:any;
  tmp2:any;

  
  current_page = 1;
  last_page: number ;
  total_order = 0;
  filter:any = {};
  filtering:any = false;

  redirect_previous() {
  this.current_page--;
  this.getFranchiseOrderList();
}
redirect_next() {
  if (this.current_page < this.last_page) { this.current_page++; }
  else { this.current_page = 1; }
  this.getFranchiseOrderList();
}
  
getFranchiseOrderList() {

    this.isInvoiceDataExist = false;
    this.loading_list = true;
          
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    
    if( this.filter.date || this.filter.search || this.filter.status)this.filtering = true;

    this.db.post_rqst(  {'filter': this.filter , 'franchise_id':this.franchise_id }, 'franchises/franch_saleorders?page='+this.current_page)
    .subscribe(data => {

      this.loading_list = false;
        console.log(data);
        
      this.data = data['data']['salesOrderList'];
      this.orders = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;
      this.total_order = this.data.total;

      if (this.search && (this.orders.length < 1)) { this.searchData = false; }
      if (this.search && (this.orders.length > 0)) { this.searchData = true; }

    console.log(this.orders);
    },err => {  this.dialog.retry().then((result) => {this.getFranchiseOrderList(); }); });
  }

  GetSaleOrder(action:any)
  {
    console.log(action);
    this.loading_list = true;
    this.db.post_rqst(  {'franchise_id':this.franchise_id,'action':action}, 'franchises/franchise_saleorder_asper_status')
      .subscribe((result)=>{
        this.tmp2 = result;
        this.loading_list = false;
        console.log(this.tmp2);
        this.orders = this.tmp2['data']['ordersale'];
        console.log(this.orders);
      },err => {  this.dialog.retry().then((result) => { 
        this.GetSaleOrder(action);      
        console.log(err); });  
       });
  }
  orderListReverse(){
    this.orders=this.orders.reverse();
  }

}
