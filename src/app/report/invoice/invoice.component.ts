import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DialogComponent} from '../../dialog/dialog.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
})
export class InvoiceComponent implements OnInit {
  @ViewChild('exportData') table: ElementRef;

  loading: any;
  isInvoiceDataExist = false;
  invoiceList: any = {};
  data: any;

  loading_list = false;

  search: any = {};
  searchData = true;

  current_page = 1;
  last_page: number ;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { }

  ngOnInit() {
      this.InvoiceList();
  }

  redirect_previous() {
    this.current_page--;
    this.InvoiceList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.InvoiceList();
  }

  GetFranchiseName(name)
  {
    this.search.name = name;
  }


  franchiseList:any = [];
  InvoiceList(action:any='') {
    if(action == 'refresh')
    {
      this.search = {};
    }

    console.log(this.search);
    

    this.isInvoiceDataExist = false;
    this.loading_list = false;
    this.db.post_rqst(  {'search':this.search}, 'report/invoice?page=' + this.current_page)
      .subscribe(data => {
          this.data=data;
          console.log(data);
          this.current_page = this.data.data.InvoiceList.current_page;
          this.last_page = this.data.data.InvoiceList.last_page;
          this.invoiceList = this.data.data.InvoiceList.data;
          this.franchiseList = this.data.data.FranchiseList;
          console.log(this.invoiceList);
          console.log(this.franchiseList);

          // if (this.search && this.invoiceList.length < 1) { this.searchData = false; }
          // if (this.search && this.invoiceList.length > 0) { this.searchData = true; }
          // this.isInvoiceDataExist = true;

          this.loading_list = true;
          console.log(this.invoiceList);
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