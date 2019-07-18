import { Component,  OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../../dialog/dialog.component';
import {MatDialog} from '@angular/material';
import { ReceivePaymentComponent } from '../receive-payment/receive-payment.component';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list-ad.component.html'
})
export class InvoiceListAdComponent implements OnInit {
  
  loading: any;
  isInvoiceDataExist = false;
  invoiceList: any = {};
  data: any;
  sum:any;
  balance:any;
  loading_list = false;
  
  search: any = '';
  searchData = true;
  filter:any = {};
  current_page = 1;
  last_page: number ;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent,public matDialog: MatDialog ) { }
  
  ngOnInit() {
    this.salesInvoiceList();
    this.get_organisation();
  }
  
  redirect_previous() {
    this.current_page--;
    this.salesInvoiceList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.salesInvoiceList();
  }
  
  organization:any=[];
  get_organisation()
  {
    this.db.post_rqst( '' , 'sales/getInvoiceId')
    .subscribe((result: any) => {
      this.organization = result['data'].organization;
      console.log(this.organization);
      console.log("organisation");
      
    },err => {console.log(err); this.dialog.retry().then((result) => { this.get_organisation(); }); });
  }
  
  
  filtering : any = false;
  salesInvoiceList() {
    this.isInvoiceDataExist = false;
    this.loading_list = false;
    
    
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    
    
    if( this.filter.date || this.filter.type   || this.filter.payment_status || this.filter.invoice_status)this.filtering = true;
    
    
    
    this.db.post_rqst(  {'filter':this.filter }, 'sales/invoiceList?page=' + this.current_page + '&s=' + this.search)
    //this.db.post_rqst( '', 'sales/invoiceList')
    .subscribe(data => {
      this.data=data;
      console.log(data);
      this.current_page = this.data.data.salesInvoiceList.current_page;
      this.last_page = this.data.data.salesInvoiceList.last_page;
      //this.invoiceList = data['data'].salesInvoiceList;
      this.invoiceList = this.data.data.salesInvoiceList.data;
      this.sum = this.data.data.sum;
      this.balance = this.data.data.balance;
      console.log(this.invoiceList);
      // if (this.search && this.invoiceList.length < 1) { this.searchData = false; }
      // if (this.search && this.invoiceList.length > 0) { this.searchData = true; }
      // this.isInvoiceDataExist = true;
      
      this.loading_list = true;
      console.log(this.invoiceList);
    },err => {  this.dialog.retry().then((result) => { this.salesInvoiceList(); });   });
  }
  
  openReceivePaymentDialog(franchise_id, customer_id,  invoice_id) {
    const dialogRef = this.matDialog.open(ReceivePaymentComponent, {
      data: {
        franchise_id: franchise_id,
        customer_id: customer_id,
        invoice_id: invoice_id
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.salesInvoiceList(); }
    });
  }
  
  
  
  invoice_cancel(franchise_id,   invoice_id) {
    this.dialog.delete('Invoice Order').then((result) => {
      if (result) {
        this.loading_list =true;
        
        this.db.insert_rqst(  { 'franchise_id': franchise_id , 'invoice_id': invoice_id}, 'sales/invoice_cancel')
        .subscribe(data => {
          this.loading_list =false;
          this.dialog.success('Incoice Cancelled successfully');
          this.salesInvoiceList();
        },err => {  this.dialog.retry().then((result) => { 
          this.loading_list =false;
        });   });
        
        
        
      }
      
    });
    
  }
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];