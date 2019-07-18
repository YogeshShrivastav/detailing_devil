import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../../_services/DatabaseService';
import {DialogComponent} from '../../../dialog/dialog.component';
import {MatDialog} from '@angular/material';
import { ServiceStartComponent } from '../../../franchise/service/service-start/service-start.component';
import { FranchiseServicesPaymantComponent } from 'src/app/franchise-services-paymant/franchise-services-paymant.component';


@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
})
export class ServiceDetailComponent implements OnInit {
  
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
        this.invoice_id = this.db.crypto(params['id'],false);
        
        if (this.invoice_id) { this.salesInvoiceDetail(this.invoice_id); }
      });
    }
    
    
    openReceivePaymentDialog() {
      const dialogRef = this.matDialog.open(FranchiseServicesPaymantComponent, {
        data: {
          franchise_id: this.invoiceDetail.franchise_id,
          customer_id: this.invoiceDetail.customer_id,
          invoice_id: this.invoice_id
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {  this.salesInvoiceDetail(this.invoice_id); }
      });
    }
    
    
    change_start_date(id){
      
      const dialogRef = this.matDialog.open(ServiceStartComponent, {
        data: {
          service_id: id
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) { 
          this.salesInvoiceDetail(this.invoice_id);
          this.dialog.success('Plan Start Date Changed!');
        }
        
        
      });
      
    }
    
    salesInvoiceDetail(invoice_id) {
      
      this.loading_list = false;
      
      this.db.get_rqst(  '', 'sales/getServiceDetail/' + invoice_id)
      .subscribe(data => {
        
        this.invoiceDetail = data['data']['invoicedetail'];
        this.invoiceItemDetail = data['data']['itemdetail'];
        this.invoicePaymentList = data['data']['invoicePaymentList'];
        
        this.loading_list = true;
        this.change_invoice_id();
        
        console.log(data);
        console.log(this.invoiceDetail);
        console.log(this.invoiceItemDetail);
        console.log(this.invoicePaymentList);
        
      },err => {  this.dialog.retry().then((result) => { this.salesInvoiceDetail(invoice_id); });   });
      
      
    }
    
    
    
    
    print(): void 
    {
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

    org: any = {};
    
    organization:any = [];
    change_invoice_id()
    {
      this.loading_list = false;
      
      
      this.db.post_rqst( this.invoiceDetail , 'sales/getInvoiceId')
      .subscribe((result: any) => {
       
        this.organization = result['data'].organization;
        this.org = this.organization.filter(x => x.id ===  this.invoiceDetail.organization_id )[0];
        console.log(this.organization);
        console.log(this.org);
        
        this.calculateNetInvoiceTotal();
        
        this.loading_list = true;
        
      },err => {console.log(err); this.loading_list = true; this.dialog.retry().then((result) => { this.change_invoice_id(); }); });
    }

    grater_stock:any = 0;
    franchiseDetail:any = {};
    calculateNetInvoiceTotal(i:any = '-1') {
      
      this.invoiceDetail.rate = 0;
      this.invoiceDetail.itemTotal = 0;
      this.invoiceDetail.netSubTotal = 0;
      this.invoiceDetail.netDiscountAmount = 0;
      this.invoiceDetail.netDiscountPer  = 0;
      this.invoiceDetail.netGstAmount = 0
      this.invoiceDetail.cgst_amt = 0;
      this.invoiceDetail.sgst_amt = 0;
      this.invoiceDetail.igst_amt = 0;
      this.invoiceDetail.shiping_gst_per  = 0;
      
      this.invoiceDetail.sgst_per = 0;
      this.invoiceDetail.cgst_per = 0;
      this.invoiceDetail.igst_per = 0;
      
      this.invoiceDetail.netAmount = 0;
      
      this.invoiceDetail.shiping_gst = [];
      this.invoiceDetail.shippingWithGst = 0;
      
      this.invoiceDetail.shipping_cgst_amt = 0;
      this.invoiceDetail.shipping_sgst_amt = 0;
      this.invoiceDetail.shipping_igst_amt = 0;
      this.invoiceDetail.shiping_igst_per  = 0;
      this.invoiceDetail.shiping_sgst_per  = 0;
      this.invoiceDetail.shiping_cgst_per  = 0;
      this.grater_stock = 0;
      
      if(this.invoiceItemDetail.length == 0){
        this.invoiceDetail.shipping_charges = 0;
        this.invoiceDetail.extra_discount = 0;
      }
      
      
      
      
      for (let j = 0; j < this.invoiceItemDetail.length; j++)
      {
        
        if(this.invoiceItemDetail[j].sale_qty < this.invoiceItemDetail[j].qty){
          this.grater_stock++;
        }
        
        // if(i == '-1'){
        //   this.invoiceItemDetail[j].extra_discount = this.invoiceItemDetail[j].extra_discount || 0;
        //   this.invoiceItemDetail[j].discount = this.invoiceItemDetail[j].discount || 0;
          
        //   this.invoiceItemDetail[j].discount -= parseInt( this.invoiceItemDetail[j].extra_discount ); 
          
        //   this.invoiceItemDetail[j].discount += parseInt( this.invoiceDetail.extra_discount  );
          
        //   this.invoiceItemDetail[j].extra_discount = parseInt( this.invoiceDetail.extra_discount );
          
        //   this.invoiceItemDetail[j].discounted_amount = parseInt( this.invoiceItemDetail[j].amount ) * ( this.invoiceItemDetail[j].discount  / 100);
        //   this.invoiceItemDetail[j].discounted_amount = this.invoiceItemDetail[j].discounted_amount ? this.invoiceItemDetail[j].discounted_amount.toFixed(2) : 0;
        // }
        
        // this.invoiceItemDetail[j].amount = this.invoiceItemDetail[j].qty * this.invoiceItemDetail[j].rate ;
        this.invoiceItemDetail[j].amount = this.invoiceItemDetail[j].item_qty * this.invoiceItemDetail[j].rate ;  // modified
        // this.invoiceItemDetail[j].gross_amount =  this.invoiceItemDetail[j].amount -   this.invoiceItemDetail[j].discounted_amount;
        
        
        
        
        this.invoiceDetail.shiping_gst.push( this.invoiceItemDetail[j].gst );
        
        if(j == (this.invoiceItemDetail.length - 1) )
        {
          this.invoiceDetail.shiping_gst_per = Math.max.apply(null, this.invoiceDetail.shiping_gst);
          console.log(this.invoiceDetail.shiping_gst_per);
        }
        
        console.log( 'org' );
        console.log( this.org );
        
        
        if( this.invoiceDetail.state == this.org.state ){
          
          this.invoiceItemDetail[j].cgst_per = this.invoiceItemDetail[j].gst/2;
          this.invoiceItemDetail[j].sgst_per = this.invoiceItemDetail[j].gst/2;
          this.invoiceItemDetail[j].igst_per = 0;
          
          this.invoiceItemDetail[j].cgst_amt = Math.round( this.invoiceItemDetail[j].gross_amount * ( this.invoiceItemDetail[j].cgst_per / 100) );
          this.invoiceItemDetail[j].sgst_amt = Math.round( this.invoiceItemDetail[j].gross_amount * ( this.invoiceItemDetail[j].sgst_per / 100) );
          this.invoiceItemDetail[j].igst_amt = 0;
          
          this.invoiceItemDetail[j].gst_amount = Math.round( this.invoiceItemDetail[j].cgst_amt +  this.invoiceItemDetail[j].sgst_amt + this.invoiceItemDetail[j].igst_amt );
          
          if(j == (this.invoiceItemDetail.length - 1) && this.invoiceDetail.shipping_charges > 0 ){
            
            this.invoiceDetail.shiping_cgst_per = this.invoiceDetail.shiping_gst_per/2;
            this.invoiceDetail.shiping_sgst_per = this.invoiceDetail.shiping_gst_per/2;
            this.invoiceDetail.shiping_igst_per = 0;
            
            this.invoiceDetail.shipping_cgst_amt = Math.round( this.invoiceDetail.shipping_charges * (  this.invoiceDetail.shiping_cgst_per/ 100) );  
            this.invoiceDetail.shipping_sgst_amt = Math.round( this.invoiceDetail.shipping_charges * (  this.invoiceDetail.shiping_sgst_per/ 100) );  
            this.invoiceDetail.shipping_igst_amt = 0;
            this.invoiceDetail.shippingWithGst = Math.round(  this.invoiceDetail.shipping_cgst_amt + this.invoiceDetail.shipping_sgst_amt);
            // this.invoiceDetail.itemTotal +=  this.invoiceDetail.shipping_charges || 0;
            this.invoiceDetail.netAmount += this.invoiceDetail.shipping_charges +  this.invoiceDetail.shippingWithGst;
            
          }
          
          
        }else{
          this.invoiceItemDetail[j].cgst_per = 0;
          this.invoiceItemDetail[j].sgst_per = 0;
          this.invoiceItemDetail[j].igst_per = this.invoiceItemDetail[j].gst;
          
          this.invoiceItemDetail[j].cgst_amt = 0;
          this.invoiceItemDetail[j].sgst_amt = 0;
          this.invoiceItemDetail[j].igst_amt = Math.round( this.invoiceItemDetail[j].gross_amount * ( this.invoiceItemDetail[j].igst_per / 100) );
          this.invoiceItemDetail[j].gst_amount = Math.round( this.invoiceItemDetail[j].cgst_amt +  this.invoiceItemDetail[j].sgst_amt + this.invoiceItemDetail[j].igst_amt );
          //   && this.invoiceDetail.shipping_charges != 0 
          if(j == (this.invoiceItemDetail.length - 1 ) && this.invoiceDetail.shipping_charges > 0  ){
            this.invoiceDetail.shiping_cgst_per = 0;
            this.invoiceDetail.shiping_sgst_per = 0;
            this.invoiceDetail.shiping_igst_per = this.invoiceDetail.shiping_gst_per;
            
            
            this.invoiceDetail.shipping_igst_amt = Math.round( this.invoiceDetail.shipping_charges * (  this.invoiceDetail.shiping_igst_per/ 100) ); 
            this.invoiceDetail.shippingWithGst = Math.round( this.invoiceDetail.shipping_igst_amt); 
            // this.invoiceDetail.itemTotal +=  this.invoiceDetail.shipping_charges || 0;
            this.invoiceDetail.netAmount += this.invoiceDetail.shipping_charges +  this.invoiceDetail.shippingWithGst;
            
          }
          
        }
        
        this.invoiceItemDetail[j].item_final_amount = this.invoiceItemDetail[j].gross_amount + this.invoiceItemDetail[j].gst_amount;
        
        this.invoiceDetail.rate += this.invoiceItemDetail[j].rate;
        // this.invoiceDetail.itemTotal += this.invoiceItemDetail[j].amount;
        this.invoiceDetail.itemTotal += this.invoiceItemDetail[j].item_amount; //modified
        
        // this.invoiceDetail.netDiscountAmount += parseFloat(this.invoiceItemDetail[j].discounted_amount );
        this.invoiceDetail.netDiscountAmount += parseFloat(this.invoiceItemDetail[j].discount_amount ); //modified
        this.invoiceDetail.netDiscountAmount = this.invoiceDetail.netDiscountAmount || 0;
        this.invoiceDetail.netSubTotal += this.invoiceDetail.itemTotal;
        
        this.invoiceDetail.netGstAmount += this.invoiceItemDetail[j].gst_amount || 0;
        if(j == (this.invoiceItemDetail.length - 1) && this.invoiceDetail.shipping_charges > 0 )
        this.invoiceDetail.netGstAmount += this.invoiceDetail.shippingWithGst || 0;
        
        
        
        
        this.invoiceDetail.cgst_amt += this.invoiceItemDetail[j].cgst_amt ? this.invoiceItemDetail[j].cgst_amt : 0;
        this.invoiceDetail.sgst_amt += this.invoiceItemDetail[j].sgst_amt ? this.invoiceItemDetail[j].sgst_amt : 0;
        this.invoiceDetail.igst_amt += this.invoiceItemDetail[j].igst_amt ? this.invoiceItemDetail[j].igst_amt : 0;
        
        this.invoiceDetail.cgst_per += this.invoiceItemDetail[j].cgst_per ? this.invoiceItemDetail[j].cgst_per : 0;
        this.invoiceDetail.sgst_per += this.invoiceItemDetail[j].sgst_per ? this.invoiceItemDetail[j].sgst_per : 0;
        this.invoiceDetail.igst_per += this.invoiceItemDetail[j].igst_per ? this.invoiceItemDetail[j].igst_per : 0;
        
        
        
        this.invoiceDetail.igst_per += this.invoiceDetail.shiping_igst_per ? this.invoiceDetail.shiping_igst_per : 0;
        this.invoiceDetail.sgst_per += this.invoiceDetail.shiping_sgst_per ? this.invoiceDetail.shiping_sgst_per : 0;
        this.invoiceDetail.cgst_per += this.invoiceDetail.shiping_cgst_per ? this.invoiceDetail.shiping_cgst_per : 0;
        
        
        this.invoiceDetail.cgst_amt += this.invoiceDetail.shipping_cgst_amt ? this.invoiceDetail.shipping_cgst_amt : 0;
        this.invoiceDetail.sgst_amt += this.invoiceDetail.shipping_sgst_amt ? this.invoiceDetail.shipping_sgst_amt : 0;
        this.invoiceDetail.igst_amt += this.invoiceDetail.shipping_igst_amt ? this.invoiceDetail.shipping_igst_amt : 0;
        
        this.invoiceDetail.netAmount += this.invoiceItemDetail[j].item_final_amount;
        
      }
      
      
      
      
      console.log(this.invoiceDetail.shipping_charges);
      
      // this.invoiceDetail.netAmount += this.invoiceDetail.shipping_charges;
      
      this.invoiceDetail.netDiscountPer = (  (this.invoiceDetail.netDiscountAmount / this.invoiceDetail.itemTotal ) * 100 ).toFixed(2);
      
      
      
      
      this.invoiceDetail.netGrossAmount = this.invoiceDetail.itemTotal - this.invoiceDetail.netDiscountAmount;
      
      // this.invoiceDetail.balance = 0;
      
      
      // this.invoiceDetail.apply_extra_discount = this.invoiceDetail.extra_discount;
      console.log(this.invoiceItemDetail);
      
      console.log(this.invoiceDetail);
      
      if(this.grater_stock > 0){
        this.dialog.success('Stock Down');
      }
      
      this.onReceivedChangeHandler();
    }

     onReceivedChangeHandler() {
      
      console.log(this.invoiceDetail.received);
      // console.log(this.price.received);
      if(this.invoiceDetail.received > 0 ){
        
        console.log(this.invoiceDetail.already_received);
        console.log(this.invoiceDetail);
        
        if(this.invoiceDetail.received <= this.invoiceDetail.netAmount ){
          this.invoiceDetail.balance =  this.invoiceDetail.netAmount - this.invoiceDetail.received;
          
        }else  if( this.invoiceDetail.received > this.invoiceDetail.netAmount ){
          this.invoiceDetail.balance =  this.invoiceDetail.netAmount  - this.invoiceDetail.received;
          
        }else{
          this.invoiceDetail.received = 0;
          this.invoiceDetail.balance = this.invoiceDetail.netAmount;
          this.invoiceDetail.due_terms = '';
        }
        
        
      }else{
        this.invoiceDetail.balance = this.invoiceDetail.netAmount;
        this.invoiceDetail.received = 0;
        this.invoiceDetail.due_terms = '';
        
      }
      
      console.log( Math.abs( this.invoiceDetail.balance) );
      
      
      if(this.invoiceDetail.refund > 0  && ( Math.abs( this.invoiceDetail.balance) >= this.invoiceDetail.refund ) ){
        this.invoiceDetail.balance =   this.invoiceDetail.balance  +  this.invoiceDetail.refund;
        
      }else{
        this.invoiceDetail.refund = 0;
      }
      //  this.invoiceDetail.balance = this.invoiceDetail.netAmount - this.invoiceDetail.received;
      
      console.log(this.invoiceItemDetail);
      
      
    }
    
  }
  