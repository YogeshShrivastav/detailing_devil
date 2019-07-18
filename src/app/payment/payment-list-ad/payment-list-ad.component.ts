import { Component,  OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list-ad.component.html'
})
export class PaymentListAdComponent implements OnInit {

  loading: any;
  isInvoiceDataExist = false;
  invoicePaymentList: any = {};
  servicePaymentList: any = {};
  data: any;
  sum:any;
  search: any = '';
  searchData = true;

  loading_list = false;

  current_page = 1;
  last_page: number ;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { }


  ngOnInit() {
      // this.getInvoicePaymentList();
      this.get_payments('invoice');
  }

  redirect_previous() {
    this.current_page--;
      this.get_payments(this.active_tab);
      // this.getInvoicePaymentList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.get_payments(this.active_tab);
      // this.getInvoicePaymentList();
  }


  invoice:any='';
  payment:any='';
  active_tab:any="";
  get_payments(args)
  {
    if(args == 'invoice')
    {
      this.getInvoicePaymentList();
      this.invoice='';
      this.payment='1';
      this.active_tab = "invoice";
    }
    else
    {
      this.getServicePaymentList();
      this.invoice='1';
      this.payment='';
      this.active_tab = "payment";
    }
  }




  filter:any = {};

  filtering : any = false;

  getInvoicePaymentList() 
  {
    this.isInvoiceDataExist = false;
    this.loading_list = false;
    //this.db.get_rqst( '', 'sales/getInvoicePayment')
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    if( this.filter.date || this.filter.type   || this.filter.mode)this.filtering = true;
    this.db.post_rqst( { 'filter': this.filter }, 'sales/getInvoicePayment?page=' + this.current_page + '&s=' + this.search)
      .subscribe(data => {
        this.data=data;
        console.log(data);
        this.current_page = this.data.data.invoicePaymentList.current_page;
        this.last_page = this.data.data.invoicePaymentList.last_page;
        this.invoicePaymentList = this.data.data.invoicePaymentList.data;
        this.sum = this.data.data.sum;
        console.log(this.sum);        
        this.loading_list = true;
        console.log(this.invoicePaymentList);
      },err => {  this.dialog.retry().then((result) => { this.getInvoicePaymentList(); });   });
  }


  getServicePaymentList() 
  {
    this.isInvoiceDataExist = false;
    this.loading_list = false;
    //this.db.get_rqst( '', 'sales/getInvoicePayment')
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    if( this.filter.date || this.filter.type   || this.filter.mode)this.filtering = true;
    this.db.post_rqst( { 'filter': this.filter }, 'sales/getServicePayment?page=' + this.current_page + '&s=' + this.search)
      .subscribe(data => {
        this.data=data;
        console.log(data);
        this.current_page = this.data.data.servicePaymentList.current_page;
        this.last_page = this.data.data.servicePaymentList.last_page;
        this.invoicePaymentList = this.data.data.servicePaymentList.data;
        this.sum = this.data.data.sum;
        console.log(this.sum);        
        this.loading_list = true;
        console.log(this.invoicePaymentList);
      },err => {  this.dialog.retry().then((result) => { this.getInvoicePaymentList(); });   });
  }
  


}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];