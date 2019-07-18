import { Component,  OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../dialog/dialog.component';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stock-transfer',
  templateUrl: './stock-transfer.component.html',
})
export class StockTransferComponent implements OnInit {
  
  loading: any;
  isInvoiceDataExist = false;
  invoiceList: any = {};
  data: any;
  sum:any;
  totalstock;
  balance:any;
  loading_list = false;
  
  search: any = '';
  searchData = true;
  
  current_page = 1;
  last_page: number ;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor( private router: Router, public db: DatabaseService, public dialog: DialogComponent,public matDialog: MatDialog  ) { }
  ngOnInit() {
    this.salesInvoiceList();
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
  
  filter:any = {};
  
  filtering : any = false;
  salesInvoiceList() {
    this.isInvoiceDataExist = false;
    this.loading_list = false;
    
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if( this.filter.date || this.filter.search)this.filtering = true;
    
    this.db.post_rqst(  { 'filter': this.filter }, 'sales/transfer_stock_list?page=' + this.current_page + '&s=' + this.search)
    .subscribe(data => {
      this.loading_list = true;
      this.data=data;
      console.log(data);
      console.log("called");
      
      this.current_page = this.data.data.salesInvoiceList.current_page;
      this.last_page = this.data.data.salesInvoiceList.last_page;
      this.invoiceList = this.data.data.salesInvoiceList.data;
      this.totalstock = this.data.data.totalstock;
      this.sum = this.data.data.sum;
      console.log(this.invoiceList);
    },err => {   this.loading_list = true; this.dialog.retry().then((result) => { this.salesInvoiceList(); });   });
  }
  
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];