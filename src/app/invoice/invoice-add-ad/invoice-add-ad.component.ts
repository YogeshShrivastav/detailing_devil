import { Component, OnInit } from '@angular/core';
import {DialogComponent} from '../../dialog/dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { FormsModule, FormGroup }   from '@angular/forms';
import * as moment from 'moment';
import { log } from 'util';

import { DirectCustomerComponent } from '../direct-customer/direct-customer.component';


@Component({
  selector: 'app-invoice-add-ad',
  templateUrl: './invoice-add-ad.component.html'
})
export class InvoiceAddAdComponent implements OnInit {

  franchiseList: any = [];

  data:any = {};
  data1:any = {};

  dbItemData:any = {};

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
          console.log(params);
          this.franchise_id = this.db.crypto(params['id'],false);
          this.invoiceData.franchise_id = this.db.crypto(params['id'],false);
          this.invoiceData.order_id = this.db.crypto(params['orderId'],false);
          console.log(this.invoiceData.order_id);
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
      if (this.invoiceData.order_id) { 
       
          this.getOrderItemList(this.invoiceData.order_id);

      }

    });
    }


    
    getOrderItemList(ord_id) {
       
        this.loading_list = true;
        this.db.get_rqst(  '', 'sales/getSalesOrder/' + ord_id)
          .subscribe(data1 => {

                console.log(data1);
                this.org = this.organization.filter(x => x.id === this.invoiceData.organization_id)[0];
    
                this.orderDetail = data1['data']['orderdetail'];
                this.orderItemDetail = data1['data']['itemdetail'];         
            
                this.invoiceData.franchise_id = this.orderDetail.franchise_id;

                this.loading_list = false;  
                console.log(data1);            
                console.log("orderdata");

                this.invoiceData.netSubTotal = 0;
                this.invoiceData.netDiscountAmount = 0;
                this.invoiceData.netGstAmount = 0;
                this.invoiceData.netAmount = 0;

                this.dbItemData = {};
                for(let x = 0; x < this.orderItemDetail.length; x++) {

                    for(let z = 0; z < this.orderItemDetail[x]['item_list'].length; z++) {

                        let remainQty = parseInt(this.orderItemDetail[x]['item_list'][z].item_qty) - parseInt(this.orderItemDetail[x]['item_list'][z].delivered_qty);

                        if(remainQty > 0) {

                            this.dbItemData.id = this.orderItemDetail[x]['item_list'][z].id;
                            this.dbItemData.brand_name = this.orderItemDetail[x]['item_list'][z].brand_name;
                            this.dbItemData.category = this.orderItemDetail[x]['item_list'][z].category;
                            this.dbItemData.hsn_code = this.orderItemDetail[x]['item_list'][z].hsn_code;

                            this.dbItemData.product_id = this.orderItemDetail[x]['item_list'][z].item_id;
                            this.dbItemData.measurement = this.orderItemDetail[x]['item_list'][z].item_measurement_type;
                            this.dbItemData.uom_id = this.orderItemDetail[x]['item_list'][z].uom_id;
                            this.dbItemData.description = this.orderItemDetail[x]['item_list'][z].description;
                            this.dbItemData.attribute_type = this.orderItemDetail[x]['item_list'][z].item_attribute_type;
                            this.dbItemData.attribute_option = this.orderItemDetail[x]['item_list'][z].item_attribute_value;
                            this.dbItemData.sale_qty = this.orderItemDetail[x]['item_list'][z].sale_qty;

                            this.dbItemData.qty = remainQty;
                            this.dbItemData.rate = this.orderItemDetail[x]['item_list'][z].item_rate;
                            this.dbItemData.amount = this.dbItemData.qty * this.dbItemData.rate;
                            this.dbItemData.discount = this.orderItemDetail[x]['item_list'][z].discount;

                            this.dbItemData.discounted_amount = this.dbItemData.amount * (this.dbItemData.discount / 100) || 0;
                            
                            this.dbItemData.gross_amount = this.dbItemData.amount - this.dbItemData.discounted_amount;
                            this.dbItemData.product_name = this.orderItemDetail[x]['item_list'][z].item_name;
                            this.dbItemData.gst = this.orderItemDetail[x]['item_list'][z].gst;

                            this.dbItemData.gst_amount = this.dbItemData.gross_amount * (this.dbItemData.gst / 100);
                            
                            this.dbItemData.item_final_amount = this.dbItemData.gross_amount + this.dbItemData.gst_amount;
                            this.invoiceItemList.push(JSON.parse(JSON.stringify(this.dbItemData)));


                            this.invoiceData.netSubTotal += this.dbItemData.amount;
                            this.invoiceData.netDiscountAmount += this.dbItemData.discounted_amount;
                            this.invoiceData.netGstAmount += this.dbItemData.gst_amount;
                            this.invoiceData.netAmount += this.dbItemData.item_final_amount;
                        }
                    }
                }

          

                this.invoiceData.netGrossAmount = this.invoiceData.netSubTotal - this.invoiceData.netDiscountAmount;

                this.invoiceData.receivedAmount = this.invoiceData.netAmount;
                this.invoiceData.balance = 0;

                console.log(this.invoiceData);
                console.log(this.invoiceItemList);

                this.calculateNetInvoiceTotal();
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

org : any = {};
    change_org(){
      this.org = this.organization.filter(x => x.id === this.invoiceData.organization_id)[0];
      
      if(this.invoiceItemList.length > 0){
        this.calculateNetInvoiceTotal();
      }
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
                this.loading_list = false;

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
        this.loading_list = false;
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
            this.invoiceItemList[i].amount = this.invoiceItemList[i].qty * this.invoiceItemList[i].rate ;
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
            this.invoiceItemList[i].amount = this.invoiceItemList[i].qty * this.invoiceItemList[i].rate ;
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
// console.log(this.invoiceData.extra_discount);

      }
      clear(){
          this.invoiceItemList = [];
          this.calculateNetInvoiceTotal();
          this.invoiceData.mode  = '';
      }


  grater_stock:any = 0;
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
            
            this.invoiceItemList[j].discount -= parseInt( this.invoiceItemList[j].extra_discount ); 

            this.invoiceItemList[j].discount += parseInt( this.invoiceData.extra_discount  );
            
            this.invoiceItemList[j].extra_discount = parseInt( this.invoiceData.extra_discount );
            
            this.invoiceItemList[j].discounted_amount = parseInt( this.invoiceItemList[j].amount ) * ( this.invoiceItemList[j].discount  / 100);
            this.invoiceItemList[j].discounted_amount = this.invoiceItemList[j].discounted_amount ? this.invoiceItemList[j].discounted_amount.toFixed(2) : 0;
          }
            this.invoiceItemList[j].amount = this.invoiceItemList[j].qty * this.invoiceItemList[j].rate ;
             this.invoiceItemList[j].gross_amount =  this.invoiceItemList[j].amount -   this.invoiceItemList[j].discounted_amount;


            
            if(this.mode == '1')this.franchiseDetail = this.franchiseList.filter(x => x.id === parseInt(this.invoiceData.franchise_id ) )[0];
            
            if(this.mode == '2')this.franchiseDetail = this.DirectCustomers.filter(x => x.id === parseInt(this.invoiceData.customer_id ) )[0];

            this.invoiceData.shiping_gst.push( this.invoiceItemList[j].gst );

            if(j == (this.invoiceItemList.length - 1) ){

                this.invoiceData.shiping_gst_per = Math.max.apply(null, this.invoiceData.shiping_gst);

                console.log(this.invoiceData.shiping_gst_per);

                // this.invoiceData.shipping_charges = 
            }
          

            if( this.franchiseDetail.state == this.org.state ){

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

        


        console.log(this.invoiceData.shipping_charges);
        
        // this.invoiceData.netAmount += this.invoiceData.shipping_charges;

        this.invoiceData.netDiscountPer = (  (this.invoiceData.netDiscountAmount / this.invoiceData.itemTotal ) * 100 ).toFixed(2);




        this.invoiceData.netGrossAmount = this.invoiceData.itemTotal - this.invoiceData.netDiscountAmount;

        this.invoiceData.receivedAmount = this.invoiceData.netAmount;
        this.invoiceData.balance = 0;


                // this.invoiceData.apply_extra_discount = this.invoiceData.extra_discount;
console.log(this.invoiceItemList);

        console.log(this.invoiceData);

        if(this.grater_stock > 0){
          this.dialog.success('Stock Down');
        }
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
            this.invoiceData.mode == '';
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


        this.db.insert_rqst( {'data':this.invoiceData} , 'sales/saveInvoice')
        .subscribe((result: any) => {
            this.savingData = false;

            console.log(result);
            if(result == 'Date is Grater')
            {
              this.loading_list = false;
              this.dialog.error("DATE IS GRATER");
              return;
            }
            this.router.navigate(['/order-invoice-list']);

            this.loading_list = false;

        },err => {console.log(err);  this.savingData = false; this.loading_list = false; this.dialog.retry().then((result) => { }); });
  }




  createDirectCustomer() {
    const dialogRef = this.matDialog.open(DirectCustomerComponent, {
      width: '1024px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { this.getDirectCustomers();   }
    });
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
    if(this.mode == '2')this.createDirectCustomer();
    if(this.mode == '1') this.router.navigate(['/franchise-add']);
  }



}
