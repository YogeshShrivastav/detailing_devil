import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-franchise-detail',
  templateUrl: './franchise-detail.component.html'
})
export class FranchiseDetailComponent implements OnInit {
  franchise_id;
  loading_list = false;
  enable_user_assign : any = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}

mode:any = '2';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      console.log(this.franchise_id );
    
    if (this.franchise_id) {
       this.getFranchiseDetails();
       this.salesInvoiceDetail();
       this.getUserList();
    }
  });
  }
  frchise:any = {};
  tmp:any = {};
  agent_assign:any = [];
  remarks:any = [];
  invoice:any = {};
  franchise_plan:any = {};
  // company_sales_agent :any = [];

  getFranchiseDetails() {
    console.log(this.db.datauser);
    
    this.loading_list = true;
    this.db.get_rqst(  '', 'franchises/details/' + this.franchise_id )
    .subscribe(data => {
      console.log(this.db.datauser.franchise_id);      
      this.tmp = data;
      this.frchise = this.tmp.frchise;
      console.log( this.frchise );
      console.log( this.tmp );
      // this.company_sales_agent = this.frchise.company_sales_agent;
      this.db.franchise_name = this.frchise.company_name;

      this.agent_assign = this.tmp.agent_assign;
      this.invoice = this.tmp.invoice;
      this.franchise_plan = this.tmp.franchise_plan;

      
      this.remarks = this.tmp.remarks;

      this.loading_list = false;
    },err => {  this.dialog.retry().then((result) => { 
      this.getFranchiseDetails();      
      console.log(err); });  
    });
  }


//   sales:any = [];
//   getSales() {
//     this.loading_list = true;
//     this.db.post_rqst(  {'login':this.db.datauser } , 'franchises/getsales' )
//     .subscribe(data => {
//       this.sales = data['data'].sales;
//  console.log(this.sales);
//  this.loading_list = false;
 
//     },err => {  this.dialog.retry().then((result) => { 
//       this.getSales();      
//       console.log(err); });  
//     });
//   }




  // updateSales() {
  //   this.loading_list = true;
  //   this.db.post_rqst(  {'id':this.franchise_id, 'company_sales_agent' : this.company_sales_agent } , 'franchises/updateSales' )
  //   .subscribe(data => {
  //   this.loading_list = false;
      
 
  //   },err => { this.loading_list = false;  this.dialog.retry().then((result) => { 
      
  //     console.log(err); });  
  //   });
  // }

  user_list=[];
  getUserList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
    .subscribe(d => {

      this.user_list = d['data'].user;      
      console.log(this.user_list);
      this.loading_list = false;
    },err => { this.loading_list = false; this.dialog.retry().then((result) => { this.getUserList(); });   });
  }


  assignSalesAgent() {
    this.frchise.remark = this.frchise.remark ? this.frchise.remark : '';
    this.frchise.user_assign = this.agent_assign.length ? this.agent_assign : [];
    this.frchise.user_id = this.ses.users.id;
    this.frchise.l_id = this.franchise_id;
    this.loading_list = true;

    this.db.insert_rqst(this.frchise, 'franchise_leads/franchiseAssignSalesAgent').subscribe(data => {
      this.getFranchiseDetails();
      this.loading_list = false;
      this.enable_user_assign = false;
      this.dialog.success('Sales Agent Assign Successfully!');
    },err => { this.loading_list = false;  this.dialog.retry().then((result) => { console.log(err); });  });


  }



  edit(){
    this.router.navigate(['franchise-add/' +this.db.crypto(this.franchise_id)]);
  }




  invoiceDetail: any = {};
  invoiceItemDetail: any = [];
  invoicePaymentList: any = [];
  salesInvoiceDetail() {

    this.loading_list = true;
    
    this.db.post_rqst(  '', 'franchises/getFranchiseStockInvoice/' + this.franchise_id)
    .subscribe(data => {
      console.log(data);
      
      this.invoiceDetail = data['data']['invoicedetail'];
      this.invoiceItemDetail = data['data']['itemdetail'];
      // this.invoicePaymentList = data['data']['invoicePaymentList'];

      this.loading_list = false;
      
      console.log(data);
      console.log(this.invoiceDetail);
      console.log(this.invoiceItemDetail);
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.salesInvoiceDetail(); });   });
    
    
  }
  
  print(): void {
console.log(this.frchise.plan_id);


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
