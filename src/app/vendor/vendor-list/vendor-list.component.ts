import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  loading: any;
  v_id;
  vendors: any = [];
  vendor_con: any = [];
  isInvoiceDataExist = false;
  vendor_us: any = [];
  vendor_count: any;
  //contact_detail: any = [];
  data: any;
  search: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  searchData = true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getVendorList(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
  }
  redirect_previous() {
    this.current_page--;
    this.getVendorList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getVendorList();
  }
 
  filter:any = {};

  filtering : any = false;


  getVendorList() {
    this.isInvoiceDataExist = false;
    this.loading_list = false;
    //this.db.get_rqst( '', 'sales/getInvoicePayment')

          
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    
    if( this.filter.date || this.filter.search)this.filtering = true;


     this.loading_list = false;
     this.db.post_rqst(   { 'filter': this.filter }, 'vendors?page=' + this.current_page)
       .subscribe(data => {
         this.data = data;
         this.current_page = this.data.data.vendors.current_page;
         this.last_page = this.data.data.vendors.last_page;
         this.vendors = this.data.data.vendors.data;
         this.vendor_con = this.data.data.vendor_con;
         this.vendor_us = this.data.data.usernam;
         this.vendor_count = this.data.data.vendors.total;
         if(this.search && this.vendors.length < 1) { this.searchData = false; }
         else { this.searchData = true; }
         //this.contact_detail = this.data.data.contact_detail;
         this.loading_list = true;
         console.log(this.vendors);
         console.log(this.vendor_us);
        },err => { this.dialog.retry().then((result) => { this.getVendorList(); }); });
  }
  deleteVendors(v_id) {
     this.dialog.delete('Vendor').then((result) => {
      if(result) {
         this.db.post_rqst({v_id: v_id}, 'vendors/remove')
           .subscribe(data => {
             this.data = data;            
             this.getVendorList();             
            },err => { this.dialog.retry().then((result) => { this.deleteVendors(v_id); }); });
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