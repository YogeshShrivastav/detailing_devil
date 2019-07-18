import { Component, OnInit } from '@angular/core';
import {DialogComponent} from '../../../dialog/dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { FormsModule, FormGroup }   from '@angular/forms';
import * as moment from 'moment';
import { log } from 'util';



@Component({
  selector: 'app-service-add',
  templateUrl: './service-add.component.html'
})
export class FranchiseServiceAddComponent implements OnInit {
  
  franchiseList: any = [];
  
  data:any = {};
  data1:any = {};
  
  dbItemData:any = {};
  
  serviceList:any = [];
  
  durationList : any = [];
  
  
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
        console.log(params);
        this.franchise_id = params['id'];
        this.invoiceData.franchise_id = params['id'];
        // this.invoiceData.order_id = params['orderId'];
        // console.log(this.invoiceData.order_id);
        this.invoiceData.shipping_charges = 0;
        this.invoiceData.extra_discount = 0;
        this.invoiceData.apply_extra_discount = 0;
        
        this.change_invoice_id();
        
        
        
        if (this.franchise_id) { 
          this.getFranchiseList(this.franchise_id); 
        } else {
          this.getFranchiseList(0);
        }
        this.getCaegoryList();
        
      });
      
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
    
    
    change_org(){
      this.org = this.organization.filter(x => x.id === this.invoiceData.organization_id)[0];
      
      if(this.invoiceItemList.length > 0){
        this.calculateNetInvoiceTotal();
      }
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
      
      // form.resetForm();
      
      // this.categoryList = [];
      // this.serviceList = [];
      // this.durationList = [];
      
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
    
    organization:any = [];
    org : any = {};
    change_invoice_id()
    {
      this.loading_list = true;
      
      
      this.db.post_rqst( this.invoiceData , 'sales/getInvoiceId')
      .subscribe((result: any) => {
        this.organization = result['data'].organization;
        
        // if(result['data'].invoice_id){
        this.invoiceData.organization_id = '';
        this.invoiceData.due_terms = '';
        this.invoiceData.date_created = '';
        // }
        
        if(this.organization.length > 0 ){
          this.org = this.organization[0];
          this.invoiceData.organization_id = this.organization[0].id;
        }
        
        this.loading_list = false;
        
      },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { this.change_invoice_id(); }); });
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
    
    franchiseDetail:any = {};
    calculateNetInvoiceTotal(i:any = '-1') {
      
      this.invoiceData.rate = 0;
      this.invoiceData.itemTotal = 0;
      this.invoiceData.netSubTotal = 0;
      this.invoiceData.netDiscountAmount = 0;
      this.invoiceData.netDiscountPer  = 0;
      this.invoiceData.netGstAmount = 0
      this.invoiceData.cgst_amt = 0;
      this.invoiceData.sgst_amt = 0;
      this.invoiceData.igst_amt = 0;
      
      this.invoiceData.sgst_per = 0;
      this.invoiceData.cgst_per = 0;
      this.invoiceData.igst_per = 0;
      
      this.invoiceData.netAmount = 0;
      
      for (let j = 0; j < this.invoiceItemList.length; j++)
      {
        
        
        if(i == '-1'){
          this.invoiceItemList[j].extra_discount = this.invoiceItemList[j].extra_discount || 0;
          
          this.invoiceItemList[j].discount -= parseInt( this.invoiceItemList[j].extra_discount ); 
          
          this.invoiceItemList[j].discount += parseInt( this.invoiceData.extra_discount  );
          
          this.invoiceItemList[j].extra_discount = parseInt( this.invoiceData.extra_discount );
          
          this.invoiceItemList[j].discounted_amount = parseInt( this.invoiceItemList[j].amount ) * ( this.invoiceItemList[j].discount  / 100);
          this.invoiceItemList[j].discounted_amount = this.invoiceItemList[j].discounted_amount ? this.invoiceItemList[j].discounted_amount.toFixed(2) : 0;
        }
        
        
        this.invoiceItemList[j].gross_amount =  this.invoiceItemList[j].amount -   this.invoiceItemList[j].discounted_amount;
        
        if(this.mode == '1')this.franchiseDetail = this.franchiseList.filter(x => x.id === parseInt(this.invoiceData.franchise_id ) )[0];
        
        
        
        
        if( this.franchiseDetail.state == this.org.state ){
          
          this.invoiceItemList[j].cgst_per = this.invoiceItemList[j].gst/2;
          this.invoiceItemList[j].sgst_per = this.invoiceItemList[j].gst/2;
          this.invoiceItemList[j].igst_per = 0;
          
          this.invoiceItemList[j].cgst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].cgst_per / 100) );
          this.invoiceItemList[j].sgst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].sgst_per / 100) );
          this.invoiceItemList[j].igst_amt = 0;
          
          this.invoiceItemList[j].gst_amount = Math.round( this.invoiceItemList[j].cgst_amt +  this.invoiceItemList[j].sgst_amt + this.invoiceItemList[j].igst_amt );
          
          
        }else{
          this.invoiceItemList[j].cgst_per = 0;
          this.invoiceItemList[j].sgst_per = 0;
          this.invoiceItemList[j].igst_per = this.invoiceItemList[j].gst;
          
          this.invoiceItemList[j].cgst_amt = 0;
          this.invoiceItemList[j].sgst_amt = 0;
          this.invoiceItemList[j].igst_amt = Math.round( this.invoiceItemList[j].gross_amount * ( this.invoiceItemList[j].igst_per / 100) );
          this.invoiceItemList[j].gst_amount = Math.round( this.invoiceItemList[j].cgst_amt +  this.invoiceItemList[j].sgst_amt + this.invoiceItemList[j].igst_amt );
          
          
        }
        
        this.invoiceItemList[j].item_final_amount = this.invoiceItemList[j].gross_amount + this.invoiceItemList[j].gst_amount;
        
        this.invoiceData.itemTotal += this.invoiceItemList[j].amount;
        this.invoiceData.netDiscountAmount += parseFloat(this.invoiceItemList[j].discounted_amount );
        this.invoiceData.netDiscountAmount = this.invoiceData.netDiscountAmount || 0;
        this.invoiceData.netSubTotal += this.invoiceData.itemTotal;
        
        this.invoiceData.netGstAmount += this.invoiceItemList[j].gst_amount || 0;
        
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
      
      this.invoiceData.receivedAmount = this.invoiceData.netAmount;
      
      this.invoiceData.balance = 0;
      
      console.log(this.invoiceItemList);
      
      console.log(this.invoiceData);
      
    }
    
    changeMode(){
      if(this.invoiceData.mode && this.invoiceData.mode == 'None'){
        
        this.invoiceData.receivedAmount = 0;
        this.invoiceData.balance = this.invoiceData.netAmount;
        
      }else{
        //   this.invoiceData.receivedAmount = this.invoiceData.netAmount;
        //   this.invoiceData.balance = 0;
      }
    }
    
    onReceivedChangeHandler() {
      
      console.log(this.invoiceData.receivedAmount);
      
      
      if(this.invoiceData.receivedAmount < 0) {
        this.invoiceData.receivedAmount = 0;
        this.invoiceData.due_terms = '';
      }
      
      if(this.invoiceData.receivedAmount <= this.invoiceData.netAmount){
        this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
        this.invoiceData.mode  = ( this.invoiceData.mode == 'None' || this.invoiceData.mode == '' ) ?  '' : this.invoiceData.mode ;
      }else{
        this.invoiceData.receivedAmount = 0
        this.invoiceData.due_terms = '';
        this.invoiceData.balance = this.invoiceData.netAmount;
      }
      
      //  this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
      
      
      
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
      
      
      this.db.insert_rqst( {'data':this.invoiceData} , 'stockdata/saceInvoiceService')
      .subscribe((result: any) => {
        this.savingData = false;
        
        console.log(result);
        if(result == 'Date is Grater')
        {
          this.loading_list = false;
          this.dialog.error("DATE IS GRATER");
          return;
        }
        this.router.navigate(['/franchise-service-list/'+ this.db.crypto(this.invoiceData.franchise_id) ]);
        
        this.loading_list = false;
        
      },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { }); });
    }
    
    
    
    
    
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
      if(this.mode == '1') this.router.navigate(['/franchise-add']);
    }
    
    
    
  }
  