import { Component, OnInit } from '@angular/core';
import {DialogComponent} from '../../../dialog/dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { FormsModule, FormGroup }   from '@angular/forms';
import * as moment from 'moment';
import { log } from 'util';

// import { DirectCustomerComponent } from '../direct-customer/direct-customer.component';

@Component({
  selector: 'app-franchise-service-edit',
  templateUrl: './franchise-service-edit.component.html',
})
export class FranchiseServiceEditComponent implements OnInit {
  
  franchiseList: any = [];
  
  data:any = {};
  data1:any = {};
  dbItemData:any = {};
  serviceList:any = [];
  durationList : any = [];
  brandList:any = [];
  productList : any = [];
  measurementList: any = [];
  attributeTypeList: any = [];
  attributeOptionList: any = [];
  orderDetail: any = [];
  orderItemDetail: any = {};
  orderInvoiceList: any = {};
  
  invoiceItemList: any = [];
  ary: any;
  franchise_id:any;
  ord_id:any;
  
  loader: any = '';
  current_page = 1;
  search: any = '';
  
  invoiceData: any = {};
  loading_list = false;
  
  mode: any = '1'; 
  
  constructor(public db: DatabaseService,
    public dialog: DialogComponent,
    private route: ActivatedRoute, 
    private router: Router,
    public matDialog: MatDialog,
    ) { }
    
    ngOnInit() {
      
      this.route.params.subscribe(params => {
        
        this.invoiceData.order_id = this.db.crypto(params['id'],false);
        this.invoiceData.shipping_charges = 0;
        this.invoiceData.extra_discount = 0;
        this.invoiceData.apply_extra_discount = 0;
        
        this.getOrderItemList(this.invoiceData.order_id);
        if (this.invoiceData.order_id) { 
        }
        
        if (this.franchise_id) { 
          this.getFranchiseList(this.franchise_id); 
        } else {
          this.getFranchiseList(0);
        }
        
        this.getCaegoryList();
      });
      
      
    }
    
    organization:any = [];
    change_invoice_id()
    {
      this.loading_list = true;
      this.db.post_rqst( this.invoiceData , 'sales/getInvoiceId')
      .subscribe((result: any) => {
        console.log(result);
        this.organization = result['data'].organization;
        this.org = this.organization.filter(x => x.id ===  this.invoiceData.organization_id )[0];
        this.calculateNetInvoiceTotal();
        
        this.loading_list = false;
        
      },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { this.change_invoice_id(); }); });
    }
    
    
    
    change_org(){
      
      this.org = this.organization.filter(x => x.id ===  this.invoiceData.organization_id )[0];
      console.log(  this.org  );
      if(this.invoiceItemList.length > 0){
        console.log( 'in');
        this.calculateNetInvoiceTotal();
      }
    }
    
    
    getServiceList()
    {
      
      this.data.service_id = '';
      this.data.duration_id = '';
      this.data.price = '';
      this.data.description = '';
      this.serviceList = [];
      this.durationList = [];
      this.loading_list = true;
      console.log(this.data.category);
      
      this.db.post_rqst(  {'category':this.data.category } , 'stockdata/getBillServiceNames')
      .subscribe((d: any) => {
        this.loading_list = false;
        this.serviceList = d.serviceList;
        if(this.serviceList.length  == 1){
          this.data.service_name = this.serviceList[0].service_name;
          this.getDurationtList();
        }
        
        console.log(this.serviceList);       
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getServiceList(); });   });
      
    }
    
    getDurationtList()
    {
      this.loading_list = true;
      
      this.data.duration_id = '';
      this.data.price = '';
      this.data.description = '';
      this.durationList = [];
      
      this.db.post_rqst( this.data , 'stockdata/getBillServiceDuration')
      .subscribe((d) => {
        console.log(d);
        this.durationList = d.durationList;
        this.loading_list = false;
        
        if(this.durationList.lenght  == 1){
          this.data.duration_id = this.durationList[0].id;
          
          this.getDurationDetail();
        }
        
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getDurationtList(); });   });
      
    }
    
    
    getDurationDetail()
    {
      this.data.qty = 1;
      this.data.duration = this.durationList.filter(x=>x.id === this.data.duration_id)[0]['value_of_duration'] +' ' + this.durationList.filter(x=>x.id === this.data.duration_id)[0]['unit_of_duration'];
      this.data.amount = this.durationList.filter(x=>x.id === this.data.duration_id)[0]['price'];
      this.data.description = this.durationList.filter(x=>x.id === this.data.duration_id)[0]['description'];
      
      this.data.sac = this.serviceList.filter(x=>x.id === this.data.service_id)[0]['sac'];
      this.data.gst = this.serviceList.filter(x=>x.id === this.data.service_id)[0]['gst'];
      this.data.service_name = this.serviceList.filter(x=>x.id === this.data.service_id)[0]['service_name'];
    }
    
    
    org: any = {};
    getOrderItemList(ord_id) {
      
      this.loading_list = true;
      this.db.post_rqst( { 'id':ord_id}, 'sales/getServiceEdit' )
      .subscribe(data1 => {
        this.loading_list = false;  
        console.log(data1);
        this.invoiceData = data1['data']['invoicedetail'];
        this.invoiceData.date_created = moment(this.invoiceData.date_created).format('YYYY-MM-DD');
        this.invoiceItemList = data1['data']['itemdetail'];         
        console.log(this.invoiceItemList);
        this.change_invoice_id();
        
        this.invoiceData.already_received = this.invoiceData.receivedAmount;
        
        
        this.invoiceData.netSubTotal = 0;
        this.invoiceData.netDiscountAmount = 0;
        this.invoiceData.netGstAmount = 0;
        this.invoiceData.netAmount = 0;
        
        
      },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  this.getOrderItemList(ord_id);  }); });
    }
    
    getFranchiseList(franchise_id) {
      
      console.log(franchise_id);
      this.loading_list = true;        
      this.db.get_rqst('' , 'sales/getFranchise/' + franchise_id)
      .subscribe((result: any) => {
        console.log(result);
        this.franchiseList  = result['data']['franchisesList'];            
        this.loading_list = false;
        console.log(this.franchiseList);
      },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  this.getFranchiseList(franchise_id);  }); });
    }
    
    
    
    
    
    categoryList:any = [];
    getCaegoryList()
    {
      
      this.data.service_id = '';
      this.data.duration_id = '';
      this.data.price = '';
      this.data.description = '';
      this.serviceList = [];
      this.durationList = [];
      
      
      this.loading_list = true;
      this.db.post_rqst(  '', 'stockdata/getBillServiceCategory')
      .subscribe((d: any) => {
        console.log(d);
        
        this.loading_list = false;
        this.categoryList = d.categoryList;
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getCaegoryList(); });   });
    }
    
    getSalePrice()
    {
      console.log(this.data);
      console.log(this.measurementList);
      
      this.data.qty = 1;
      this.data.rate = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['sale_price'];
      this.data.sale_qty = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['sale_qty'];
      this.data.uom_id = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['id'];
      this.data.description = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['description'];
      console.log(this.data);
    }
    
    
    getAmount(qty,rate)
    {
      console.log(qty);
      console.log(rate);
      
      this.data.amount = qty * rate;
      console.log(this.data);
    }  
    
    
    AddItem(form)
    {
      this.loading_list = true;
      this.data.id = 0;
      
      let itemFoundIndex = null;
      for(let i=0; i < this.invoiceItemList.length;i++)
      {
        if(this.data.category === this.invoiceItemList[i].category && this.data.service_id === this.invoiceItemList[i].service_id && this.data.duration_id === this.invoiceItemList[i].duration_id )
        {
          itemFoundIndex = i;
        }
      }
      
      this.data.amount = this.data.amount;
      this.data.discount = this.data.discount || 0;
      this.data.discounted_amount = 0;
      this.data.gross_amount = this.data.amount;
      this.data.gst_amount = this.data.gross_amount * (this.data.gst / 100);
      this.data.item_final_amount = this.data.gross_amount + this.data.gst_amount;
      this.data.start_date = this.data.start_date ? this.db.pickerFormat(this.data.start_date) : '';
      
      if(itemFoundIndex !== null) {
        
        this.invoiceItemList[itemFoundIndex].start_date = this.data.start_date;
        
      } else {
        
        this.invoiceItemList.push(JSON.parse(JSON.stringify(this.data)));
        
        console.log(this.invoiceItemList);
      }
      
      
      this.calculateNetInvoiceTotal();
      
      console.log(this.invoiceItemList);
      console.log(this.data);
      this.loading_list = false;
      this.data = {};
      form.resetForm();
      
    }
    
    
    
    item_price:any = 0;
    disc_price:any = 0;
    sub_amount:any = 0;
    gst_price:any =  0;
    inv_price:any =  0;
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
    
    
    
    
    RemoveItem(index)
    {
      console.log(index);
      this.dialog.delete('Item Data !').then((result) => {
        console.log(result);
        if(result){
          
          
          
          
          this.invoiceItemList.splice(index,1);
          
          this.calculateNetInvoiceTotal();
          this.dialog.success('Item has been deleted.');
        }
      });
    }
    
    
    
    
    RemoveInoiceItem(index,item)
    {
      console.log(index);
      this.dialog.delete('Item Data !').then((result) => {
        console.log(result);
        if(result){
          this.loading_list = true;
          
          this.db.post_rqst(  {'item': item,'franchise_id':this.invoiceData.franchise_id } , 'sales/deleteServiceInvoiceItem')
          .subscribe((result: any) => {
            this.loading_list = false;
            
            
            
            
            
            this.invoiceItemList.splice(index,1);
            this.calculateNetInvoiceTotal();
            this.dialog.success('Item has been deleted.');
            
            
          },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  });   });
          
        }
      });
    }
    
    
    discount_per_count(i){
      if( this.invoiceItemList[i].discount > 0 ){
        this.invoiceItemList[i].discounted_amount = ( this.invoiceItemList[i].amount ) * ( this.invoiceItemList[i].discount / 100);
        this.invoiceItemList[i].discounted_amount = this.invoiceItemList[i].discounted_amount ? this.invoiceItemList[i].discounted_amount.toFixed(2) : 0;
      }else{
        this.invoiceItemList[i].discounted_amount = 0 ;
        this.invoiceItemList[i].discount  = 0;
      }
      
      this.calculateNetInvoiceTotal(i);
      
    }
    
    discount_amt_count(i){
      if(  this.invoiceItemList[i].discounted_amount > 0 ){
        this.invoiceItemList[i].discount =   ( this.invoiceItemList[i].discounted_amount /  this.invoiceItemList[i].amount  ) * 100 ;
        this.invoiceItemList[i].discount =  this.invoiceItemList[i].discount ? this.invoiceItemList[i].discount.toFixed(2) : 0;
        
      }else{
        this.invoiceItemList[i].discounted_amount = 0 ;
        this.invoiceItemList[i].discount  = 0;
      }
      this.calculateNetInvoiceTotal(i);
      
      
    }
    
    allItemDiscount(){
      this.calculateNetInvoiceTotal();
    }
    clear(){
      this.invoiceItemList = [];
      this.calculateNetInvoiceTotal();
    }
    
    grater_stock:any = 0;
    franchiseDetail:any = {};
    calculateNetInvoiceTotal(i:any = '-1')
    {
      console.log(this.invoiceItemList);
      console.log(this.invoiceData);
      
      this.invoiceData.rate = 0;
      this.invoiceData.itemTotal = 0;
      this.invoiceData.netSubTotal = 0;
      this.invoiceData.netDiscountAmount = 0;
      this.invoiceData.netDiscountPer  = 0;
      this.invoiceData.netGstAmount = 0
      this.invoiceData.cgst_amt = 0;
      this.invoiceData.sgst_amt = 0;
      this.invoiceData.igst_amt = 0;
      this.invoiceData.shiping_gst_per  = 0;
      this.invoiceData.sgst_per = 0;
      this.invoiceData.cgst_per = 0;
      this.invoiceData.igst_per = 0;
      this.invoiceData.netAmount = 0;
      this.invoiceData.shiping_gst = [];		
      this.invoiceData.shippingWithGst = 0;		
      this.invoiceData.shipping_cgst_amt = 0;		
      this.invoiceData.shipping_sgst_amt = 0;		
      this.invoiceData.shipping_igst_amt = 0;		
      this.invoiceData.shiping_igst_per  = 0;		
      this.invoiceData.shiping_sgst_per  = 0;		
      this.invoiceData.shiping_cgst_per  = 0;		
      this.grater_stock = 0;		
      
      if(this.invoiceItemList.length == 0){		
        this.invoiceData.shipping_charges = 0;		
        this.invoiceData.extra_discount = 0;		
      }
      
      for (let j = 0; j < this.invoiceItemList.length; j++)
      { 
        if(this.invoiceItemList[j].sale_qty < this.invoiceItemList[j].qty){
          this.grater_stock++;
        }

        if(i == '-1'){
          this.invoiceItemList[j].extra_discount = this.invoiceItemList[j].extra_discount || 0;
          this.invoiceItemList[j].discount = this.invoiceItemList[j].discount || 0;
          
          this.invoiceItemList[j].discount -= parseInt( this.invoiceItemList[j].extra_discount ); 
          
          this.invoiceItemList[j].discount += parseInt( this.invoiceData.extra_discount  );
          
          this.invoiceItemList[j].extra_discount = parseInt( this.invoiceData.extra_discount );
          
          this.invoiceItemList[j].discounted_amount = parseInt( this.invoiceItemList[j].amount ) * ( this.invoiceItemList[j].discount  / 100);
          this.invoiceItemList[j].discounted_amount = this.invoiceItemList[j].discounted_amount ? this.invoiceItemList[j].discounted_amount.toFixed(2) : 0;
        }
        
        // this.invoiceItemList[j].amount = this.invoiceItemList[j].qty * this.invoiceItemList[j].rate ;
        this.invoiceItemList[j].gross_amount =  this.invoiceItemList[j].amount -   this.invoiceItemList[j].discounted_amount;
        
        this.invoiceData.shiping_gst.push( this.invoiceItemList[j].gst );
        
        if(j == (this.invoiceItemList.length - 1) ){
          this.invoiceData.shiping_gst_per = Math.max.apply(null, this.invoiceData.shiping_gst);		
          console.log(this.invoiceData.shiping_gst_per);		
        }
        console.log(this.org);
        console.log(this.franchiseDetail);
        
        if( this.invoiceData.state == this.org.state ){
          
          this.invoiceItemList[j].cgst_per = this.invoiceItemList[j].gst/2;
          this.invoiceItemList[j].sgst_per = this.invoiceItemList[j].gst/2;
          this.invoiceItemList[j].igst_per = 0;
          
          this.invoiceItemList[j].cgst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].cgst_per / 100) );
          this.invoiceItemList[j].sgst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].sgst_per / 100) );
          this.invoiceItemList[j].igst_amt = 0;
          
          this.invoiceItemList[j].gst_amount = Math.round( this.invoiceItemList[j].cgst_amt +  this.invoiceItemList[j].sgst_amt + this.invoiceItemList[j].igst_amt );
          
          if(j == (this.invoiceItemList.length - 1) && this.invoiceData.shipping_charges > 0 ){		
            
            this.invoiceData.shiping_cgst_per = this.invoiceData.shiping_gst_per/2;		
            this.invoiceData.shiping_sgst_per = this.invoiceData.shiping_gst_per/2;		
            this.invoiceData.shiping_igst_per = 0;		
            
            this.invoiceData.shipping_cgst_amt = Math.round( this.invoiceData.shipping_charges * (  this.invoiceData.shiping_cgst_per/ 100) );  		
            this.invoiceData.shipping_sgst_amt = Math.round( this.invoiceData.shipping_charges * (  this.invoiceData.shiping_sgst_per/ 100) );  		
            this.invoiceData.shipping_igst_amt = 0;		
            this.invoiceData.shippingWithGst = Math.round(  this.invoiceData.shipping_cgst_amt + this.invoiceData.shipping_sgst_amt);		
            // this.invoiceData.itemTotal +=  this.invoiceData.shipping_charges || 0;		
            this.invoiceData.netAmount += this.invoiceData.shipping_charges +  this.invoiceData.shippingWithGst;		
            
          }
          
        }else{
          this.invoiceItemList[j].cgst_per = 0;
          this.invoiceItemList[j].sgst_per = 0;
          this.invoiceItemList[j].igst_per = this.invoiceItemList[j].gst;
          
          this.invoiceItemList[j].cgst_amt = 0;
          this.invoiceItemList[j].sgst_amt = 0;
          this.invoiceItemList[j].igst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].igst_per / 100) );
          this.invoiceItemList[j].gst_amount = Math.round( this.invoiceItemList[j].cgst_amt +  this.invoiceItemList[j].sgst_amt + this.invoiceItemList[j].igst_amt );
          
          if(j == (this.invoiceItemList.length - 1 ) && this.invoiceData.shipping_charges > 0  ){		
            this.invoiceData.shiping_cgst_per = 0;		
            this.invoiceData.shiping_sgst_per = 0;		
            this.invoiceData.shiping_igst_per = this.invoiceData.shiping_gst_per;		
            
            
            this.invoiceData.shipping_igst_amt = Math.round( this.invoiceData.shipping_charges * (  this.invoiceData.shiping_igst_per/ 100) ); 		
            this.invoiceData.shippingWithGst = Math.round( this.invoiceData.shipping_igst_amt); 		
            // this.invoiceData.itemTotal +=  this.invoiceData.shipping_charges || 0;		
            this.invoiceData.netAmount += this.invoiceData.shipping_charges +  this.invoiceData.shippingWithGst;		
            
          }
          
        }
        
        this.invoiceItemList[j].item_final_amount = this.invoiceItemList[j].gross_amount + this.invoiceItemList[j].gst_amount;
        
        this.invoiceData.rate += this.invoiceItemList[j].rate;
        this.invoiceData.itemTotal += this.invoiceItemList[j].amount;
        this.invoiceData.netDiscountAmount += parseFloat(this.invoiceItemList[j].discounted_amount );
        this.invoiceData.netDiscountAmount = this.invoiceData.netDiscountAmount || 0;
        this.invoiceData.netSubTotal += this.invoiceData.itemTotal;
        
        this.invoiceData.netGstAmount += this.invoiceItemList[j].gst_amount || 0;
        if(j == (this.invoiceItemList.length - 1) && this.invoiceData.shipping_charges > 0 )		
        this.invoiceData.netGstAmount += this.invoiceData.shippingWithGst || 0;
        
        this.invoiceData.cgst_amt += this.invoiceItemList[j].cgst_amt ? this.invoiceItemList[j].cgst_amt : 0;
        this.invoiceData.sgst_amt += this.invoiceItemList[j].sgst_amt ? this.invoiceItemList[j].sgst_amt : 0;
        this.invoiceData.igst_amt += this.invoiceItemList[j].igst_amt ? this.invoiceItemList[j].igst_amt : 0;
        
        this.invoiceData.cgst_per += this.invoiceItemList[j].cgst_per ? this.invoiceItemList[j].cgst_per : 0;
        this.invoiceData.sgst_per += this.invoiceItemList[j].sgst_per ? this.invoiceItemList[j].sgst_per : 0;
        this.invoiceData.igst_per += this.invoiceItemList[j].igst_per ? this.invoiceItemList[j].igst_per : 0;
        
        
        
        this.invoiceData.igst_per += this.invoiceData.shiping_igst_per ? this.invoiceData.shiping_igst_per : 0;
        this.invoiceData.sgst_per += this.invoiceData.shiping_sgst_per ? this.invoiceData.shiping_sgst_per : 0;
        this.invoiceData.cgst_per += this.invoiceData.shiping_cgst_per ? this.invoiceData.shiping_cgst_per : 0;
        
        
        this.invoiceData.cgst_amt += this.invoiceData.shipping_cgst_amt ? this.invoiceData.shipping_cgst_amt : 0;
        this.invoiceData.sgst_amt += this.invoiceData.shipping_sgst_amt ? this.invoiceData.shipping_sgst_amt : 0;
        this.invoiceData.igst_amt += this.invoiceData.shipping_igst_amt ? this.invoiceData.shipping_igst_amt : 0;
        
        this.invoiceData.netAmount += this.invoiceItemList[j].item_final_amount;
        
      }
      
      
      this.invoiceData.netDiscountPer = (  (this.invoiceData.netDiscountAmount / this.invoiceData.itemTotal ) * 100 ).toFixed(2);
      
      this.invoiceData.netGrossAmount = this.invoiceData.itemTotal - this.invoiceData.netDiscountAmount;
      
      // this.invoiceData.receivedAmount = this.invoiceData.netAmount;
      
      // this.invoiceData.balance = 0;
      
      console.log(this.invoiceItemList);
      
      console.log(this.invoiceData);
      
    }
    
    changeMode(){
      
      if(this.invoiceData.mode && this.invoiceData.mode == 'None'){
        
        this.invoiceData.receivedAmount = 0;
        this.invoiceData.balance = this.invoiceData.netAmount;
        
      }
      
    }
    
    onReceivedChangeHandler() {
      
      console.log(this.invoiceData.receivedAmount);
      //  if(this.invoiceData.receivedAmount < 0) {
      //     this.invoiceData.receivedAmount = 0;
      //     this.invoiceData.due_terms = '';
      //  }
      
      //  if(this.invoiceData.receivedAmount <= this.invoiceData.netAmount){
      //  this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
      
      //   }else{
      //     this.invoiceData.receivedAmount = 0
      //     this.invoiceData.due_terms = '';
      //     this.invoiceData.balance = this.invoiceData.netAmount;
      //   }
      
      
      
      
      // console.log(this.price.received);
      if(this.invoiceData.receivedAmount > 0 ){
        
        console.log(this.invoiceData.already_received);
        
        if(this.invoiceData.receivedAmount <= this.invoiceData.netAmount &&  this.invoiceData.already_received <= this.invoiceData.netAmount ){
          this.invoiceData.balance =  this.invoiceData.netAmount - this.invoiceData.receivedAmount;
          this.invoiceData.mode  = ( this.invoiceData.mode == 'None' || this.invoiceData.mode == '' ) ?  '' : this.invoiceData.mode ;
          
        }else  if( this.invoiceData.already_received > this.invoiceData.netAmount ){
          this.invoiceData.balance =  this.invoiceData.netAmount  - this.invoiceData.already_received;
          
        }else{
          this.invoiceData.receivedAmount = 0;
          this.invoiceData.balance = this.invoiceData.netAmount;
          this.invoiceData.due_terms = '';
        }
        
        
      }else{
        this.invoiceData.balance = this.invoiceData.netAmount;
        this.invoiceData.receivedAmount = 0;
        this.invoiceData.due_terms = '';
        
      }
      
      console.log( Math.abs( this.invoiceData.balance) );
      
      
      if(this.invoiceData.refund > 0  && ( Math.abs( this.invoiceData.balance) >= this.invoiceData.refund ) ){
        this.invoiceData.balance =   this.invoiceData.balance  +  this.invoiceData.refund;
        
      }else{
        this.invoiceData.refund = 0;
      }
      //  this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
      
      console.log(this.invoiceItemList);
      
      
    }
    
    savingData :any = false;
    submit_sales_invoice()
    {
      console.log(this.invoiceData.due_terms);
      this.invoiceData.date_created =  this.invoiceData.date_created ? this.db.pickerFormat(this.invoiceData.date_created) :'';
      this.invoiceData.due_terms = this.invoiceData.due_terms ? this.db.pickerFormat(this.invoiceData.due_terms) : '';
      this.invoiceData.mode = this.invoiceData.mode ? this.invoiceData.mode : '';
      this.invoiceData.netDiscountPer =this.invoiceData.netDiscountPer ? this.invoiceData.netDiscountPer : '';
      this.invoiceData.netDiscountAmount =this.invoiceData.netDiscountAmount ? this.invoiceData.netDiscountAmount : '';
      this.invoiceData.login_id= this.db.datauser.id;
      
      console.log( this.invoiceData.date_created );
      
      this.loading_list = true
      this.savingData = true;
      console.log(this.invoiceData);
      console.log(this.invoiceItemList);
      
      this.invoiceData.shipping_charges = this.invoiceData.shipping_charges || 0
      
      if(!this.invoiceData.order_id) {
        this.invoiceData.order_id = 0;
      }
      
      if(!this.invoiceData.receivedAmount) {
        this.invoiceData.receivedAmount = 0;
      }
      
      if(!this.invoiceData.mode) {
        this.invoiceData.mode = '';
      }
      
      if(!this.invoiceData.balance) {
        this.invoiceData.balance = 0;
      }
      
      if(this.invoiceData.receivedAmount && this.invoiceData.netAmount == this.invoiceData.receivedAmount) {
        this.invoiceData.paymentStatus = 'Paid';
      } else {
        this.invoiceData.paymentStatus = 'Pending';
      }
      
      this.invoiceData.itemList = this.invoiceItemList;
      
      
      console.log(this.invoiceData);
      
      
      this.db.insert_rqst( {'data':this.invoiceData} , 'sales/UpdateServiceInvoice')
      .subscribe( d => {
        
        console.log(d);
        
        this.savingData = false;
        
        this.dialog.success(d);
        
        if(d === 'Service updated Successfully!'){
          this.router.navigate(['/service-detail/'+this.db.crypto(this.invoiceData.id,true)]);
        }
        
        this.loading_list = false;
        
      },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { }); });
    }
    
    
    
    
    // createDirectCustomer() {
    //   const dialogRef = this.matDialog.open(DirectCustomerComponent, {
    //     width: '1024px',
    //     data: {}
    //   });
    
    //   dialogRef.afterClosed().subscribe(result => {
    //     if (result) { this.getDirectCustomers();   }
    //   });
    // }
    
    DirectCustomers:any = [];
    getDirectCustomers()
    {
      
      this.db.post_rqst( '', 'sales/getDirectCustomers')
      .subscribe((d: any) => {
        this.DirectCustomers = d['data'].result;
        console.log(  this.DirectCustomers );
        
        
      },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { }); });
    }
    
    addNew(){
      // if(this.mode == '2')this.createDirectCustomer();
      if(this.mode == '1') this.router.navigate(['/franchise-add']);
    }
    
    
    
  }
  