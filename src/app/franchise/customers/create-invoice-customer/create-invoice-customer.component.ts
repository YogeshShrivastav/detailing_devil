import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-create-invoice-customer',
  templateUrl: './create-invoice-customer.component.html'
})
export class CreateInvoiceCustomerComponent implements OnInit {
  
  custid;
  cardid;
  franchise_id;
  franchise_name;
  customer_name;
  
  loading_list = false;
  tmp:any;
  detail:any = [];
  invoice_items=[];
  invoice_detail:any;
  dis_edit:number=0;
  
  
  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public dialog : DialogComponent) { }
  
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.custid = params['cust_id'];
      this.cardid = params['card_id'];
      
      console.log(this.custid);   
      console.log(this.cardid);   
      
      this.franchise_id = this.db.franchise_id;
      this.franchise_name = this.db.franchise_name;
      this.customer_name = this.db.customer_name;
      
      console.log(this.db.franchise_id);   
      console.log(this.db.franchise_name);  
      console.log(this.db.customer_name);  
      
      
      
      console.log('TEST FRANCHISE TABS');
      this.getPendingpreventive_service();       
      
    });
  }
  
  getPendingpreventive_service() 
  {
    this.loading_list = false;
    this.db.get_rqst(  '', 'customer/getPendingpreventive_service/' + this.custid + '/' + this.cardid + '/' + this.franchise_id)
    .subscribe(d => {
      this.tmp = d;
      console.log(  this.tmp );
      this.invoice_items = this.tmp.item_data; 
      this.invoice_detail = this.tmp.detail;  
      
      console.log(this.invoice_items);
      this.loading_list = true;
    },err => {  this.dialog.retry().then((result) => { 
      this.getPendingpreventive_service();      
      console.log(err); });  
     });
  }
  
  get_rateqty(price,qty,index)
  {
    
    this.invoice_items[index].amount = price * qty;
    
    
    if(this.invoice_items[index].cgst)
    this.invoice_items[index].cgst = price * 9/100;
    
    if(this.invoice_items[index].sgst)
    this.invoice_items[index].sgst = price * 9/100;
    
    if(this.invoice_items[index].igst)
    this.invoice_items[index].igst = price * 18/100;
    
    var item_total_temp=0;
    var total_cgst_temp=0;
    var total_sgst_temp=0;
    var total_igst_temp=0;
    
    for(var i=0; i<this.invoice_items.length; i++)
    {
      item_total_temp = item_total_temp + this.invoice_items[i].amount;
      total_cgst_temp = total_cgst_temp + this.invoice_items[i].cgst;
      total_sgst_temp = total_sgst_temp + this.invoice_items[i].sgst;
      total_igst_temp = total_igst_temp + this.invoice_items[i].igst;
    }
    
    this.invoice_detail['item_total'] = item_total_temp;
    if(this.invoice_detail['dis_per'])
    {
      this.invoice_detail['dis_amt'] = this.invoice_detail['item_total'] * this.invoice_detail['dis_per']/100;
      this.invoice_detail['sub_total'] = this.invoice_detail['item_total'] - this.invoice_detail['dis_amt'];
    }
    
    else
    {
      this.invoice_detail['sub_total'] = this.invoice_detail['item_total'];
    }
    
    this.invoice_detail['total_cgst'] = total_cgst_temp;
    this.invoice_detail['total_sgst'] = total_sgst_temp;
    this.invoice_detail['total_igst'] = total_igst_temp;
    this.invoice_detail['total_amount'] = this.invoice_detail['sub_total'] + total_cgst_temp + total_sgst_temp + total_igst_temp;
    
    console.log(this.invoice_detail);
  }
  
  
  get_dis_per(dis_per)
  {
    this.invoice_detail['dis_amt'] = this.invoice_detail['item_total'] * dis_per/100;
    this.invoice_detail['sub_total'] = this.invoice_detail['item_total'] - this.invoice_detail['dis_amt'];
    this.invoice_detail['total_amount'] = this.invoice_detail['sub_total'] +  this.invoice_detail['total_cgst'] +  this.invoice_detail['total_sgst'] +  this.invoice_detail['total_igst']; 
  }
  
  save_invoice(card_id,cust_id)
  {
    console.log(card_id);
    console.log(cust_id);

    this.invoice_detail['created_by'] = this.ses.users.id;
    this.db.post_rqst({'items': this.invoice_items,'detail': this.invoice_detail}, 'customer/save_invoice/' + card_id + '/' + cust_id + '/' + this.franchise_id)
    .subscribe(d => {
      this.tmp = d;
      console.log(  this.tmp );
    },err => {  this.dialog.retry().then((result) => { 
      this.save_invoice(card_id,cust_id);      
      console.log(err); });  
     });
  }
  
}