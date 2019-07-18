import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-stock-transfer-detail',
  templateUrl: './stock-transfer-detail.component.html'
})
export class StockTransferDetailComponent implements OnInit {


  loading: any;
  invoiceDetail: any = [];
  invoiceItemDetail: any = [];
  invoicePaymentList: any = [];
  data: any;

  invoice_id;
  loading_list = false;

  current_page = 1;
  last_page: number ;
  
  constructor(public db: DatabaseService,
              private route: ActivatedRoute, 
              private router: Router, public dialog: DialogComponent,
              public matDialog: MatDialog 
              ) { }
     
    ngOnInit() {
      
        this.route.params.subscribe(params => {
          this.invoice_id = params['id'];
        
        if (this.invoice_id) { this.salesInvoiceDetail(this.invoice_id); }
      });
    }
    


    
    salesInvoiceDetail(invoice_id) {

      this.loading_list = false;
      
      this.db.get_rqst(  '', 'sales/getStockTransferDetail/' + invoice_id)
      .subscribe(data => {
        
        this.invoiceDetail = data['data']['invoicedetail'];
        this.invoiceItemDetail = data['data']['itemdetail'];
        this.invoicePaymentList = data['data']['invoicePaymentList'];

        this.loading_list = true;
        
        console.log(data);
        console.log(this.invoiceDetail);
        console.log(this.invoiceItemDetail);
        
      },err => {  this.dialog.retry().then((result) => { this.salesInvoiceDetail(invoice_id); });   });
      
      
    }
    


    
    print(): void {
      let printContents, popupWin;
      printContents = document.getElementById('print-section').innerHTML;
      popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
      <head>
      <title>Print tab</title>
      
      <style>
  
      body
      {
        font-family: 'arial';
      }
      .print-section
      {
        width: 1024px;
        background: #fff;
        padding: 15px;
        margin: 0 auto
      }
      
      
      .print-section table
      {
        width: 1024px;
        box-sizing: border-box;
        table-layout: fixed;
      }
      
      
      
      
      .print-section table tr table.table1 tr td:nth-child(1){width: 324px;}
      .print-section table tr table.table1 tr td:nth-child(2){width: 700px;}
  
  
      </style>
      
      </head>
      
      <body onload="window.print();window.close()">${printContents}</body>
      </html>`
      );
      popupWin.document.close();
    }
    
  }
  