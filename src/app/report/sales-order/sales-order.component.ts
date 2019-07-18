import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../../dialog/dialog.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.component.html',
})
export class SalesOrderComponent implements OnInit {
  @ViewChild('exportData') table: ElementRef;

  
  loading: any;
  isOrderDataExist = false;
  orderList: any = [];
  data: any;
  search: any = {};
  totalorder;
  pendingorder;
  //statuss;
  neworder;
  searchData = true;
  loading_list = false;
  current_page = 1;
  last_page: number;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { }
  
  ngOnInit() {
    this.OrderList();
  }
  
  redirect_previous() {
    this.current_page--;
    this.OrderList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.OrderList();
  }

  GetStatus(action)
  {
    this.search.status = action;
  }
  
  GetFranchiseName(name)
  {
    this.search.name = name;
  }

  action:any = '';
  franchiseList:any = [];

  OrderList(action:any='') {
    
    if(action == 'refresh')
    {
      this.search = {};
    }
    console.log(this.search);

    this.isOrderDataExist = false;
    this.loading_list = false;
    this.db.post_rqst(  {'search' : this.search}, 'report/order?page=' + this.current_page)
    .subscribe(data => {            
      this.data = data;
      console.log(this.data);
      this.current_page = this.data.data.salesOrderList.current_page;
      this.last_page = this.data.data.salesOrderList.last_page;
      this.orderList = this.data.data.salesOrderList.data;
      this.franchiseList = this.data.data.FranchiseList;
      this.totalorder = this.data.data.totalorder;
      this.pendingorder = this.data.data.pendingorder;
      this.neworder = this.data.data.neworder;
      console.log(this.orderList);
      console.log(this.franchiseList);
      // if (this.search && this.orderList.length < 1) { this.searchData = false; }
      // if (this.search && this.orderList.length > 0) { this.searchData = true; }
      this.isOrderDataExist = true;
      this.loading_list = true;
    });
  }
  

  exportToExcel()
  {
    console.log(this.table.nativeElement);
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');    
    /* save to file */
    XLSX.writeFile(wb, 'Order Report.xlsx');    
  }

}





export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];