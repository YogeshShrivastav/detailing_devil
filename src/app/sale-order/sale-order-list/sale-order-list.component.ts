import { Component,  OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../../dialog/dialog.component';
@Component({
  selector: 'app-sale-order-list',
  templateUrl: './sale-order-list.component.html'
})
export class SaleOrderListComponent implements OnInit {

    loading: any;
    isOrderDataExist = false;
    orderList: any = [];
    data: any;
    
    search: any = '';
    totalorder;
    pendingorder;
    //statuss;
    approved_order:any = '';
    searchData = true;
    loading_list = false;
    current_page = 1;
    last_page: number;
    filter:any = {};
  
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    constructor(public db: DatabaseService, public dialog: DialogComponent ) { }

    ngOnInit() {
        this.salesOrderList();
    }
    
      redirect_previous() {
        this.current_page--;
        this.salesOrderList();
      }
      redirect_next() {
        if (this.current_page < this.last_page) { this.current_page++; }
        else { this.current_page = 1; }
        this.salesOrderList();
      }

     
    filtering : any = false;

    salesOrderList(status:any = '') {
        //alert(this.statuss);
      this.isOrderDataExist = false;

      // this.loading_list = false;

      this.filter.status = status;
      
      this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
  
      
      if( this.filter.date  || this.filter.status ||  this.filter.search )this.filtering = true;

    
      this.db.post_rqst(  {'filter':this.filter }, 'sales/orderList?page=' + this.current_page )
      //this.db.post_rqst( '', 'sales/orderList')
        .subscribe(data => {     
          this.isOrderDataExist = true;
          this.loading_list = true;
                 
            this.data = data;
            console.log(this.data);
            this.current_page = this.data.data.salesOrderList.current_page;
            this.last_page = this.data.data.salesOrderList.last_page;
            this.orderList = this.data.data.salesOrderList.data;
            this.totalorder = this.data.data.totalorder;
            this.pendingorder = this.data.data.pendingorder;
            this.approved_order = this.data.data.approved_order;
            console.log(this.orderList);
            // if (this.search && this.orderList.length < 1) { this.searchData = false; }
            // if (this.search && this.orderList.length > 0) { this.searchData = true; }

        },err => {  this.dialog.retry().then((result) => { this.salesOrderList(status); });   });
    }
    // this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    
  
}


export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
  }
  
  const ELEMENT_DATA: PeriodicElement[] = [];