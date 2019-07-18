import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import { d } from '@angular/core/src/render3';


@Component({
  selector: 'app-franchise-covert',
  templateUrl: './franchise-covert.component.html',
})
export class FranchiseCovertComponent implements OnInit {
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,public dialog: DialogComponent) {}
  lead_id:any = '';
  ngOnInit() {
    
    this.route.params.subscribe(params => {
     

      
    
    if (  this.lead_id = this.db.crypto(params['id'],false) ) {  
      this.getServicePlan();
      this.lead_detail();
      this.change_invoice_id();
      this.getCaegoryList();
      this.invoiceData.franchise_id = this.db.crypto(params['id'],false);
    }

  });
    
  }
  
  savingData:any = false;
  organization:any = [];
  change_invoice_id(){
    this.loading_list = true;
    
    
    this.db.post_rqst( this.invoiceData , 'sales/getInvoiceId')
    .subscribe((result: any) => {
      this.organization = result['data'].organization;
      
      // if(result['data'].invoice_id){
      this.invoiceData.organization_id = '';
      this.invoiceData.due_terms = '';
      // }

      if(this.organization.length > 0 ){
        this.invoiceData.organization_id = this.organization[0].id;
      }
      
      this.loading_list = false;
      
    },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { this.change_invoice_id(); }); });
  }
  
  
  loading_list = false;
  dataPlan:any=[];
  service_plans: any= [];
  franch_stock:any = {};
  
  getServicePlan() {
    this.loading_list = true;
    this.db.get_rqst( '', 'franchises/service_plans')
    .subscribe(data => {
      this.dataPlan = data;
      this.service_plans = this.dataPlan.data.plans;
      this.loading_list = false;
      console.log(this.service_plans);

      // if(this.service_plans.length > 0 ){
      //   this.franch_stock.plan_id = this.service_plans[0].id;
      // }

    },err => { this.loading_list = false;  this.dialog.retry().then((result) => { this.getServicePlan(); });   });
  }

  change_org(){
    if(this.invoiceItemList > 0){
      this.calculateNetInvoiceTotal();
    }
  }
  
  
  leadDetail:any = {};
  lead_detail() {
    this.loading_list = true;
    this.db.get_rqst(  '', 'franchise_leads/details/' + this.lead_id)
    .subscribe(d => {
      this.leadDetail = d['data'].lead;
      console.log(d);
      
      this.loading_list = false;
      console.log(this.service_plans);
    },err => {  this.dialog.retry().then((result) => { this.lead_detail(); });   });
  }
  
  
  plan_data:any = [];
  stock:any = [];
  get_stock() {
    //console.log(this.franch_stock.plan_id);    
    this.loading_list = true;
    this.db.get_rqst( '', 'franchises/get_franchise_plan_stock/' + this.franch_stock.plan_id)
    .subscribe(d => {
      
      this.stock = d['data'].stock;
      this.plan_data = d['data'].plans;

      this.invoiceData.plan = this.plan_data.plan;
      this.invoiceData.price = this.plan_data.price;
      this.invoiceData.description = this.plan_data.description;
      this.invoiceData.plan_id = this.plan_data.id;

      // console.log(d['data']);
      this.getIntiialStockList();
      this.loading_list = false;
      
    },err => {  this.dialog.retry().then((result) => { this.get_stock(); });   });
  }
  
  
  discount_per_count(i){
    if( this.invoiceItemList[i].discount > 0 ){
      this.invoiceItemList[i].amount = this.invoiceItemList[i].qty * this.invoiceItemList[i].rate ;
      this.invoiceItemList[i].discounted_amount = ( this.invoiceItemList[i].amount ) * ( this.invoiceItemList[i].discount / 100);
      this.invoiceItemList[i].discounted_amount = this.invoiceItemList[i].discounted_amount ? this.invoiceItemList[i].discounted_amount.toFixed(2) : 0;
    }else{
      this.invoiceItemList[i].discounted_amount = 0 ;
      this.invoiceItemList[i].discount  = 0;
    }
    
    this.calculateNetInvoiceTotal();
    
  }
  
  discount_amt_count(i){
    if(  this.invoiceItemList[i].discounted_amount > 0 ){
      this.invoiceItemList[i].amount = this.invoiceItemList[i].qty * this.invoiceItemList[i].rate ;
      this.invoiceItemList[i].discount =   ( this.invoiceItemList[i].discounted_amount /  this.invoiceItemList[i].amount  ) * 100 ;
      this.invoiceItemList[i].discount =  this.invoiceItemList[i].discount ? this.invoiceItemList[i].discount.toFixed(2) : 0;
      
    }else{
      this.invoiceItemList[i].discounted_amount = 0 ;
      this.invoiceItemList[i].discount  = 0;
    }
    this.calculateNetInvoiceTotal();
    
    
  }
  
  allItemDiscount(){
    
    
    
    this.calculateNetInvoiceTotal();
    // console.log(this.invoiceData.extra_discount);
    
  }
  
  clear(){
    this.invoiceItemList = [];
    this.calculateNetInvoiceTotal();
  }
  
  
  dbItemData:any = {};
  invoiceData:any = {};
  invoiceItemList:any = [];
  
  getIntiialStockList() {
    
    
    
    this.invoiceItemList = [];
    this.loading_list = true;  
    
    this.invoiceData.netSubTotal = 0;
    this.invoiceData.netDiscountAmount = 0;
    this.invoiceData.netGstAmount = 0;
    this.invoiceData.netAmount = 0;

    this.invoiceData.shipping_charges = 0;
    this.invoiceData.extra_discount = 0;
    
    
    for(let z = 0; z < this.stock.length; z++) {
      
      this.dbItemData = {};
      
      
      
      this.dbItemData.id = this.stock[z].id;
      this.dbItemData.brand_name = this.stock[z].brand;
      this.dbItemData.category = this.stock[z].category;
      this.dbItemData.hsn_code = this.stock[z].hsn_code;
      this.dbItemData.product_name = this.stock[z].product;
      this.dbItemData.product_id = this.stock[z].products_id;
      this.dbItemData.measurement = this.stock[z].unit_measurement;
      this.dbItemData.uom_id = this.stock[z].uom_id;
      this.dbItemData.description = this.stock[z].description;
      this.dbItemData.attribute_type = this.stock[z].attribute_type;
      this.dbItemData.attribute_option = this.stock[z].attribute_option;
      this.dbItemData.description = this.stock[z].description;
      this.dbItemData.stock_total = this.stock[z].stock_total;
      this.dbItemData.sale_qty = this.stock[z].sale_qty;
      this.dbItemData.gst = this.stock[z].gst;
      this.dbItemData.qty = parseInt(this.stock[z].quantity );
      this.dbItemData.rate = this.stock[z].sale_price;
      
      this.dbItemData.extra_discount = 0;
      this.dbItemData.discount = 0;
      this.dbItemData.discounted_amount = 0;
      
      this.dbItemData.cgst_per = 0;
      this.dbItemData.sgst_per = 0;
      this.dbItemData.igst_per = 0;
      this.dbItemData.cgst_amt = 0;
      this.dbItemData.sgst_amt = 0;
      this.dbItemData.igst_amt = 0;
      this.dbItemData.gst_amount = 0;
      this.dbItemData.gross_amount = 0;
      
      this.invoiceItemList.push(JSON.parse(JSON.stringify(this.dbItemData)));
      
    }
    
    console.log(this.invoiceItemList);
    
    this.calculateNetInvoiceTotal();
    
    
    
  }
  


  
  AddItem(form)
  {

    this.data.id = 0;
    
    let itemFoundIndex = null;
    for(let i=0; i < this.invoiceItemList.length;i++)
    {
      if(this.data.category === this.invoiceItemList[i].category && this.data.brand_name === this.invoiceItemList[i].brand_name && this.data.product_id === this.invoiceItemList[i].product_id &&  this.data.measurement === this.invoiceItemList[i].measurement)
      {
        itemFoundIndex = i;
      }
    }
    
    this.data.amount = this.data.qty * this.data.rate;
    this.data.discount = this.data.discount || 0;
    this.data.discounted_amount = this.data.amount * (this.data.discount / 100) || 0;
    this.data.gross_amount = this.data.amount - this.data.discounted_amount;
    
    const productItem = this.productList.filter(product =>  product.id === this.data.product_id)[0];
    
    console.log(productItem);
    
    this.data.category = productItem.category;
    this.data.product_name = productItem.product_name;
    this.data.hsn_code = productItem.hsn_code;
    this.data.gst = productItem.gst;
    this.data.gst_amount = this.data.gross_amount * (this.data.gst / 100);
    this.data.item_final_amount = this.data.gross_amount + this.data.gst_amount;
    
    if(itemFoundIndex !== null) {
      
      this.invoiceItemList[itemFoundIndex].qty = parseInt(this.invoiceItemList[itemFoundIndex].qty) + parseInt(this.data.qty);
      this.invoiceItemList[itemFoundIndex].amount += this.data.amount;
      this.invoiceItemList[itemFoundIndex].discounted_amount += this.data.discounted_amount;
      this.invoiceItemList[itemFoundIndex].gross_amount += this.data.gross_amount;
      this.invoiceItemList[itemFoundIndex].gst_amount += this.data.gst_amount;
      this.invoiceItemList[itemFoundIndex].item_final_amount += this.data.item_final_amount;
      this.invoiceItemList[itemFoundIndex].attribute_option = this.data.attribute_option;
      this.invoiceItemList[itemFoundIndex].attribute_type = this.data.attribute_type;
      
    } else {
      
      this.invoiceItemList.push(JSON.parse(JSON.stringify(this.data)));
      
      console.log(this.invoiceItemList);
    }
    
    
    this.calculateNetInvoiceTotal();
    
    form.resetForm();
    
    this.productList = [];
    this.measurementList = [];
    this.attributeTypeList = [];
    this.attributeOptionList = [];
    
    console.log(this.invoiceItemList);
    console.log(this.data);
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
  
  
  grater_stock:any = 0;
  org :any = {};
  calculateNetInvoiceTotal() {



    this.org = Object.assign({}, this.organization.filter(x => x.id === this.invoiceData.organization_id)[0] );
    
    console.log(this.leadDetail);
    console.log(this.invoiceItemList);
    
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

    if(this.invoiceItemList == 0){
      this.invoiceData.shipping_charges = 0;
      this.invoiceData.extra_discount = 0;
    }
    
    
    
    for (let j = 0; j < this.invoiceItemList.length; j++)
    {

      if(this.invoiceItemList[j].sale_qty < this.invoiceItemList[j].qty){
        this.grater_stock++;
      }
      
      this.invoiceItemList[j].extra_discount = this.invoiceItemList[j].extra_discount || 0;
      
      this.invoiceItemList[j].discount -= parseInt( this.invoiceItemList[j].extra_discount ); 
      
      this.invoiceItemList[j].discount += parseInt( this.invoiceData.extra_discount  );
      this.invoiceItemList[j].discount = this.invoiceItemList[j].discount || 0;
      
      this.invoiceItemList[j].extra_discount = parseInt( this.invoiceData.extra_discount );
      
      this.invoiceItemList[j].discounted_amount = parseInt( this.invoiceItemList[j].amount ) * ( this.invoiceItemList[j].discount  / 100);
      this.invoiceItemList[j].discounted_amount = this.invoiceItemList[j].discounted_amount ? this.invoiceItemList[j].discounted_amount.toFixed(2) : 0;
      
      this.invoiceItemList[j].amount = this.invoiceItemList[j].qty * this.invoiceItemList[j].rate ;
      this.invoiceItemList[j].gross_amount =  this.invoiceItemList[j].amount -   this.invoiceItemList[j].discounted_amount;
      
      
      
      
      this.invoiceData.shiping_gst.push( this.invoiceItemList[j].gst );
      
      if(j == (this.invoiceItemList.length - 1) ){
        
        this.invoiceData.shiping_gst_per = Math.max.apply(null, this.invoiceData.shiping_gst);
        
        console.log(this.invoiceData.shiping_gst_per);
        
        // this.invoiceData.shipping_charges = 
      }
      

      console.log(this.leadDetail);
      console.log(this.org);
      
      if( this.leadDetail.state == this.org.state ){
        
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
        //   && this.invoiceData.shipping_charges != 0 
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
    
    
    
    
    console.log(this.invoiceData.shipping_charges);
    
    // this.invoiceData.netAmount += this.invoiceData.shipping_charges;
    
    this.invoiceData.netDiscountPer = (  (this.invoiceData.netDiscountAmount / this.invoiceData.itemTotal ) * 100 ).toFixed(2);
    
    
    
    
    this.invoiceData.netGrossAmount = this.invoiceData.itemTotal - this.invoiceData.netDiscountAmount;
    
    this.invoiceData.receivedAmount = this.invoiceData.netAmount;
    this.invoiceData.balance = 0;
    
    
    // this.invoiceData.apply_extra_discount = this.invoiceData.extra_discount;
    
    console.log(this.invoiceData);


    if(this.grater_stock > 0){
      this.dialog.success('Stock Down');
    }
  }
  
  
  onReceivedChangeHandler() {
    
    console.log(this.invoiceData.receivedAmount);
    
    
    if(this.invoiceData.receivedAmount < 0) {
      this.invoiceData.receivedAmount = 0;
    }
    
    if(this.invoiceData.receivedAmount <= this.invoiceData.netAmount){
      this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
      this.invoiceData.mode  = ( this.invoiceData.mode == 'None' || this.invoiceData.mode == '' ) ?  '' : this.invoiceData.mode ;
      
    }else{
      this.invoiceData.receivedAmount = 0
      this.invoiceData.balance = this.invoiceData.netAmount;
    }
    
    //  this.invoiceData.balance = this.invoiceData.netAmount - this.invoiceData.receivedAmount;
    
    
    
  }
  
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
  
  categoryList:any = [];
  getCaegoryList()
  {
    
    this.data.product_id = '';
    this.data.measurement = '';
    this.data.rate = '';
    this.data.sale_qty =  '';
    this.data.attribute_type = '';
    this.data.attribute_option = '';
    this.brandList = [];
    this.productList = [];
    this.measurementList = [];
    this.attributeTypeList = [];
    this.attributeOptionList = [];
    
    this.loading_list = true;
    this.db.post_rqst(  '', 'sales/getCategoryList')
    .subscribe((result: any) => {
      this.loading_list = false;
      console.log(result);
      this.categoryList = result['data']['categoryList'];
      console.log(this.categoryList);        
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getCaegoryList(); });   });
  }
  
  
  getBrandList()
  {
    this.data.product_id = '';
    this.data.measurement = '';
    this.data.rate = '';
    this.data.attribute_type = '';
    this.data.attribute_option = '';
    this.productList = [];
    this.measurementList = [];
    this.attributeTypeList = [];
    this.attributeOptionList = [];
    
    this.loading_list = true;
    console.log(this.data.category);
    
    this.db.post_rqst(  {'category':this.data } , 'sales/getBrandByCategory')
    .subscribe((result: any) => {
      this.loading_list = false;
      console.log(result);
      this.brandList = result['data']['brandList'];
      if(this.brandList.length  == 1){
        this.data.brand_name = this.brandList[0].brand_name;
        this.getProductList();
      }
      
      console.log(this.brandList);       
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getBrandList(); });   });
    
  }
  
  
  getProductList()
  {
    this.loading_list = true;
    
    this.data.product_id = '';
    this.data.measurement = '';
    this.data.rate = '';
    this.data.sale_qty =  '';
    this.data.attribute_type = '';
    this.data.attribute_option = '';
    this.productList = [];
    this.measurementList = [];
    this.attributeTypeList = [];
    this.attributeOptionList = [];
    
    this.db.post_rqst( this.data , 'sales/getProduct')
    .subscribe((result) => {
      console.log(result);
      this.productList = result['data']['productList'];
      this.loading_list = false;
      
      if(this.productList.lenght  == 1){
        this.data.product_id = this.productList[0].id;
        
        this.getMeasurementList();
      }
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getProductList(); });   });
    
  }
  
  getMeasurementList()
  {
    this.loading_list = true;
    
    this.data.measurement = '';
    this.data.rate = '';
    this.data.sale_qty =  '';
    
    this.db.post_rqst( this.data , 'sales/getMeasurement')
    .subscribe((result: any) => {
      console.log(result);
      this.loading_list = false;
      this.measurementList = result['data']['measurementList'];
      console.log(this.measurementList);       
      
      if( this.measurementList.length == 1 ){
        this.data.measurement = this.measurementList[0].unit_of_measurement;
        this.getSalePrice();
        
        
      }
      this.data.attribute_option = '';
      this.data.attribute_type = '';
      
      this.attributeTypeList = result['data']['attributeList'];
      console.log(this.attributeTypeList);
      
      
      if(this.attributeTypeList.lenght == 1){
        this.data.attribute_type = this.attributeTypeList[0].attr_type;
        
        this.getAttributeOptionList();
      }
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getMeasurementList(); });   });
  }
  
  getAttributeOptionList()
  {
    this.data.attribute_option = '';
    
    this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.data.attribute_type)[0]['optionList'];
    console.log(this.attributeOptionList);
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



  submit_sales_invoice()
  {
    
    console.log(this.invoiceData.due_terms);
    this.invoiceData.due_terms = this.invoiceData.due_terms ? this.db.pickerFormat(this.invoiceData.due_terms) : '';
    this.invoiceData.mode = this.invoiceData.mode ? this.invoiceData.mode : '';
    this.invoiceData.netDiscountPer =this.invoiceData.netDiscountPer ? this.invoiceData.netDiscountPer : '';
    this.invoiceData.netDiscountAmount =this.invoiceData.netDiscountAmount ? this.invoiceData.netDiscountAmount : '';
    this.invoiceData.login_id = this.db.datauser.id;
    
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
    
    
    // this.db.insert_rqst( this.invoiceData , 'franchises/saveFranchiseStockInvoice')

    // this.db.insert_rqst( {'data':this.invoiceData} , 'sales/saveInvoice')
    
    this.db.insert_rqst( {'data':this.invoiceData} , 'sales/convert_to_franchise')
    .subscribe((result: any) => {
      this.savingData = false;
      this.loading_list = false;
      
      console.log(result);
      this.router.navigate(['/franchise-detail/'+this.db.crypto(this.lead_id)]);            
      
      
    },err => {console.log(err); this.loading_list = false; this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { }); });
    
  }
  
  
  changeMode(){
    if(this.invoiceData.mode && this.invoiceData.mode == 'None'){
      
      this.invoiceData.receivedAmount = 0;
      this.invoiceData.balance = this.invoiceData.netAmount;

    }else{
      // this.invoiceData.receivedAmount = this.invoiceData.netAmount;
      // this.invoiceData.balance = 0;
    }
  }

  
  data:any = {};
  attributeOptionList:any = [];
  attributeTypeList:any = [];
  productList:any = [];
  brandList:any = [];
  measurementList:any = [];
  
}
