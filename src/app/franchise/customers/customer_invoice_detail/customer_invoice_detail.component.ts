import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';
import { JobcardPaymentListComponent } from '../jobcard-payment-list/jobcard-payment-list.component';

@Component({
  selector: 'app-customer_invoice_detail',
  templateUrl: './customer_invoice_detail.component.html'
})
export class CustomerInvoiceDetailComponent implements OnInit {
  
  custid;
  inv_id;
  franchise_id;
  InvServItem: any =[];
  franchise_name;
  loading_list = false;
  price:any = {};
  tmp:any;
  edit:any = false; 
  
  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.custid = this.db.crypto(params['id'],false);
      this.inv_id = this.db.crypto(params['inv_id'],false);
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.getInvoiceDeatil();
    });
  }
  
  
  
  openReceivePaymentDialog() {
    const dialogRef = this.matDialog.open(JobcardPaymentListComponent, {
      data: {
        franchise_id: this.franchise_id ,
        invoice_id:  this.inv_id
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.getInvoiceDeatil(); }
    });
  }
  
  invoicePaymentList: any = [];
  getInvoiceDeatil() {
    this.loading_list = false;
    this.db.get_rqst(  '', 'customer/cust_invoicedetail/' + this.custid + '/' + this.inv_id)
    .subscribe(d => {
      this.loading_list = true;
      
      this.tmp = d;
      console.log(  this.tmp );
      this.price = Object.assign({},this.tmp.detail) ;  
      this.InvServItem = Object.assign([],this.tmp.inv_item);
      this.invoicePaymentList = Object.assign([],this.tmp.payment);
      
      this.price.already_received = this.price.received;
      
      this.cal_gst();
      console.log(this.price.balance);
      console.log(this.price);
      console.log(this.tmp.detail.balance);
    },err => { this.loading_list = true; this.dialog.retry().then((result) => { 
      this.getInvoiceDeatil();      
      console.log(err); });  
    });
  }
  
  discount_per_count(i){
    if( this.InvServItem[i].disc_percent > 0 ){
      this.InvServItem[i].discount = parseInt( this.InvServItem[i].price ) * ( this.InvServItem[i].disc_percent / 100);
      this.InvServItem[i].discount = this.InvServItem[i].discount ? this.InvServItem[i].discount.toFixed(2) : 0;
    }else{
      this.InvServItem[i].discount = 0 ;
      this.InvServItem[i].disc_percent  = 0;
    }
    
    this.cal_gst(i);
    
  }
  
  discount_amt_count(i){
    if(  this.InvServItem[i].discount > 0 ){
      this.InvServItem[i].disc_percent =   ( this.InvServItem[i].discount /  this.InvServItem[i].price  ) * 100 ;
      this.InvServItem[i].disc_percent =  this.InvServItem[i].disc_percent ? this.InvServItem[i].disc_percent.toFixed(2) : 0;
      
    }else{
      this.InvServItem[i].discount = 0 ;
      this.InvServItem[i].disc_percent  = 0;
    }
    
    this.cal_gst(i);
    
    
  }
  
  
  changeMode(){
    console.log("comming");
    
    if(this.price.payment_mode && this.price.payment_mode == 'None')
    {
      this.price.received = this.tmp.detail.received;
      this.price.balance = this.tmp.detail.balance;    
    }
  }
  
  
  item_price:any = 0;
  disc_price:any = 0;
  sub_amount:any = 0;
  gst_price:any =  0;
  inv_price:any =  0;
  amount:any =  0;
  igst_price:any  = 0;
  cgst_price:any  = 0;
  sgst_price:any  = 0;
  
  igst_per:any  = 0;
  cgst_per:any  = 0;
  sgst_per:any  = 0;
  dis_per:any  = 0;
  
  i_gst_count:any  = 0;
  c_s_gst_count:any  = 0;
  dis_per_count:any  = 0;
  
  plan_category_array = [];
  plan_cat_count:any = 0;
  all_category_array = [];
  
  cal_gst(i:any = '-1')
  {
    this.item_price = 0;
    this.disc_price = 0;
    this.sub_amount = 0;
    this.gst_price = 0;
    this.amount  = 0;
    this.inv_price  = 0;
    this.igst_price  = 0;
    this.cgst_price  = 0;
    this.sgst_price  = 0;
    this.igst_per  = 0;
    this.cgst_per  = 0;
    this.sgst_per  = 0;
    this.dis_per = 0;
    this.i_gst_count  = 0;
    this.c_s_gst_count  = 0;
    this.dis_per_count  = 0;
    this.plan_category_array = [];
    this.all_category_array = [];
    this.plan_cat_count = 0;
    
    console.log(this.InvServItem.length);
    
    
    for(var l = 0; l < this.InvServItem.length; l++)
    {
      this.InvServItem[l].extra_discount = this.InvServItem[l].extra_discount || 0;
      
      if( i =='-1')
      {
        this.InvServItem[l].disc_percent -= parseInt( this.InvServItem[l].extra_discount ); 
        
        this.InvServItem[l].disc_percent += parseInt( this.price.extra_discount  );
        
        console.log('1:  '+this.InvServItem[l].disc_percent);
        
        this.InvServItem[l].extra_discount = parseInt( this.price.extra_discount );
        
        this.InvServItem[l].discount = ( this.InvServItem[l].price ) * ( this.InvServItem[l].disc_percent  / 100);
        
        console.log('2: '+this.InvServItem[l].discount);
        
        this.InvServItem[l].discount = this.InvServItem[l].discount ? this.InvServItem[l].discount.toFixed(2) : 0;
        
        console.log('3: '+this.InvServItem[l].discount);
        
      }
      this.InvServItem[l].sub_amount =  Math.round( parseInt(this.InvServItem[l].price ) -  parseInt( this.InvServItem[l].discount ) );
      
      console.log(this.price.state);
      console.log("testing ...............");
      
      console.log(this.price.franchise_state);
      
      // this.price.franchise_state = 'JHARKHAND';
      if( this.price.state == this.price.franchise_state )
      {
        this.InvServItem[l].cgst_per = this.InvServItem[l].gst/2;
        this.InvServItem[l].sgst_per = this.InvServItem[l].gst/2;
        this.InvServItem[l].igst_per = 0;
        
        if( this.InvServItem[l].sgst_per && this.InvServItem[l].cgst_per)
        {
          this.c_s_gst_count++;
          this.cgst_per  =    this.cgst_per + this.InvServItem[l].sgst_per;
          this.sgst_per  =    this.sgst_per + this.InvServItem[l].cgst_per;
        }
        
        this.InvServItem[l].cgst_amt = Math.round( this.InvServItem[l].sub_amount * ( this.InvServItem[l].cgst_per / 100) );
        this.InvServItem[l].sgst_amt = Math.round( this.InvServItem[l].sub_amount * ( this.InvServItem[l].sgst_per / 100) );
        this.InvServItem[l].igst_amt = 0;
        
        this.InvServItem[l].item_gst_amt = Math.round( this.InvServItem[l].cgst_amt +  this.InvServItem[l].sgst_amt + this.InvServItem[l].igst_amt );
        
        this.InvServItem[l].amount = Math.round( this.InvServItem[l].cgst_amt +  this.InvServItem[l].sgst_amt +  this.InvServItem[l].sub_amount );
      }
      else
      {
        this.InvServItem[l].cgst_per = 0;
        this.InvServItem[l].sgst_per = 0;
        this.InvServItem[l].igst_per = this.InvServItem[l].gst;
        
        if( this.InvServItem[l].igst_per ){
          this.i_gst_count++;
          this.igst_per  = this.igst_per + this.InvServItem[l].igst_per;
        }
        
        this.InvServItem[l].cgst_amt = 0;
        this.InvServItem[l].sgst_amt = 0;
        this.InvServItem[l].igst_amt = Math.round( this.InvServItem[l].sub_amount * ( this.InvServItem[l].igst_per / 100) );
        this.InvServItem[l].item_gst_amt = Math.round( this.InvServItem[l].cgst_amt +  this.InvServItem[l].sgst_amt + this.InvServItem[l].igst_amt );
        
        this.InvServItem[l].amount = Math.round( this.InvServItem[l].igst_amt +  this.InvServItem[l].sub_amount );
      }
      this.InvServItem[l].disc_percent = this.InvServItem[l].disc_percent || 0;
      this.InvServItem[l].discount = this.InvServItem[l].discount || 0;
      this.InvServItem[l].item_gst_amt = this.InvServItem[l].item_gst_amt || 0;
      
      this.item_price =   Math.round(  parseInt( this.item_price ) + parseInt(this.InvServItem[l].price) );
      this.disc_price =   Math.round(  parseInt( this.disc_price ) + parseInt( this.InvServItem[l].discount ) );
      this.dis_per   =      this.dis_per  + this.InvServItem[l].disc_percent;
      
      if(this.InvServItem[l].discount > 0){
        this.dis_per_count++;
      }
      this.sub_amount =   Math.round(  parseInt( this.sub_amount ) + parseInt( this.InvServItem[l].sub_amount)  );
      
      this.gst_price   =   Math.round(  parseInt( this.gst_price  ) + parseInt( this.InvServItem[l].item_gst_amt ) );
      this.igst_price  =   Math.round(  parseInt( this.igst_price  ) + parseInt( this.InvServItem[l].igst_amt ) );
      this.cgst_price  =   Math.round(  parseInt( this.cgst_price  ) + parseInt( this.InvServItem[l].cgst_amt ) );
      this.sgst_price  =   Math.round(  parseInt( this.sgst_price  ) + parseInt( this.InvServItem[l].sgst_amt ) );
      this.amount  =   Math.round(  parseInt( this.amount   ) + parseInt(this.InvServItem[l].amount) );
    }
    
    this.price.item_price =  this.item_price;
    this.price.disc_price =  this.disc_price ;
    
    this.price.dis_per =   ( this.price.disc_price /   this.price.item_price  ) * 100 ;
    this.price.dis_per =  this.price.dis_per  ? this.price.dis_per.toFixed(2) : 0;
    
    // this.price.dis_per  = this.dis_per ? ( this.dis_per /  this.dis_per_count ) : 0;
    this.price.sub_amount =  this.sub_amount;
    this.price.gst_price =  this.gst_price;
    this.price.igst_price  = this.igst_price;
    this.price.cgst_price  = this.cgst_price;
    this.price.sgst_price  = this.sgst_price;
    this.price.amount =  this.amount;
    // this.price.received =  this.inv_price;
    
    if(this.price.received > 0 )
    {
      if(this.price.received <= this.price.amount &&  this.price.already_received <= this.price.amount )
      {
        this.price.balance =  this.price.amount - this.price.received;
      }
      else if( this.price.already_received > this.price.amount )
      {
        this.price.balance =  this.price.amount  - this.price.already_received;
      }
      else
      {
        this.price.received = 0;
        this.price.balance = this.price.amount;
        console.log("yha pr");
        
      }
    }
    else
    {
      this.price.balance = this.price.amount;
      this.price.received = 0;
    }
    
    console.log( Math.abs( this.price.balance) );
    
    
    if(this.price.refund > 0  && ( Math.abs( this.price.balance) >= this.price.refund ) ){
      this.price.balance =   this.price.balance  +  this.price.refund;
      
    }else{
      this.price.refund = 0;
    }
    
    this.price.igst_per  = this.igst_per ? ( this.igst_per  / this.i_gst_count ) : 0;
    this.price.cgst_per  = this.cgst_per ? (this.cgst_per / this.c_s_gst_count ): 0;
    this.price.sgst_per  = this.sgst_per ? ( this.sgst_per /  this.c_s_gst_count ) : 0;
    console.log( this.price);
    
    console.log(this.tmp.detail);
    console.log(this.price.payment_mode); 
    
    if(this.price.payment_mode == 'None')
    {
      this.price.received = this.tmp.detail.received;
      console.log(this.price.received);
      console.log("yes");
    }
  }
  

  updateInvoice(){
    this.loading_list = false;
    this.price.date_created = this.price.date_created  ? this.db.pickerFormat(this.price.date_created) : '';
    
    
    let inv_item =[];
    for(var j = 0; j < this.InvServItem.length; j++)
    {
      if(this.InvServItem[j].checked)
      {
        inv_item.push(this.InvServItem[j]);
      }
    }
    
    console.log(this.db.datauser);
    
    this.db.insert_rqst( {'updated_by':this.db.datauser.id ,'price':this.price,'InvServItem':this.InvServItem} , 'jobcard/updateInvoice')
    .subscribe((data:any) => {
      this.loading_list = true;
      console.log(data);
      if(data == 'GREATER DATE')
      {
        this.dialog.error("Date Is Grater");
        return;
      }
      
      if(data == 'BILL DATE REQUIRED')
      {
        this.dialog.warning("Invoice Date Required");
        return;
        
      }
      
      this.dialog.success('Invoice Updated Successfully!');
      this.edit = false;
      this.price.payment_mode = '';
      this.price.item_price = 0;
      this.price.disc_price = 0;
      this.price.sub_amount = 0;
      this.price.gst_price = 0;
      this.price.amount = 0;
      this.price.received_amount = 0;
      this.getInvoiceDeatil();  
      
    },err => {  this.loading_list = true; this.dialog.retry().then((result) => { }); });
    
    
  }
  
  
  
  
  updateNote() {
    // this.loading_list = false;
    this.db.post_rqst(  {'note': this.price }, 'jobcard/updateNote')
    .subscribe(d => {
      this.dialog.success('Note Saved!');
      // this.loading_list = true
    },err => {  this.dialog.retry().then((result) => { 
      console.log(err); });  
    });
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
    
    
    .print-section table tr table.table1 tr td h2
    {
      font-size: 4px;
      line-height: 10px;
    }
    
    .print-section table tr table.table1 tr td p
    {
      font-size: 1px;
      line-height: 10px;
    }
    
    table .table3 tr td
    {
      background: #ccc;
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
