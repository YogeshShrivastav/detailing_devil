import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html'
})
export class StockListComponent implements OnInit {
  
  franchise_id;
  loading_list = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);

    
    if (this.franchise_id) {
       this.getStock(); 
       //this.get_brand();
       this.getCategoryList();
      }

    });

  }

  
  stocks:any = [];
  tmp:any = {};
  plan_data: any = {};
  stock: any = [];
  accessories: any = [];
  getStock() {
  this.loading_list = true;
    
    this.db.get_rqst( '', 'franchises/get_franchises_stock/' + this.franchise_id)
    .subscribe(data => {
      this.loading_list = false;
      this.temp = data;
      this.stock = this.temp.data.data;
      // this.plan_data = this.temp.data.plans;
      this.accessories = this.temp.data.accessories;
      console.log( this.temp.data );
      
    },err => {  this.dialog.retry().then((result) => { 
      this.getStock();      
      console.log(err); });  
     });
  }
  
  remove(i:any,x:any) {
    console.log(this.stock[i][0]);
    this.stock[i][0].splice(x,1);
  }

  addProduct:any  = {};
  brands:any  = [];
  categoryList:any = [];
  getCategoryList()
    {
        this.addProduct.product_id = '';
        this.addProduct.measurement = '';
        this.addProduct.rate = '';
        // this.data.attribute_type = '';
        // this.data.attribute_option = '';
        this.products = [];
        this.units = [];
        // this.attributeTypeList = [];
        // this.attributeOptionList = [];

        // this.loading_list = false;
        this.db.post_rqst(  '', 'sales/getCategoryList')
        .subscribe((result: any) => {
            // this.loading_list = true;
            console.log(result);
            this.categoryList = result['data']['categoryList'];
            console.log(this.categoryList);        
        },err => {  this.dialog.retry().then((result) => { this.getCategoryList(); });   });
    }
  
    getBrandList()
    {

        this.addProduct.product_id = '';
        this.addProduct.measurement = '';
        // this.data.rate = '';
        // this.data.attribute_type = '';
        // this.data.attribute_option = '';
        this.products = [];
        this.units = [];
        // this.attributeTypeList = [];
        // this.attributeOptionList = [];

        // this.loading_list = false;
        console.log(this.addProduct.category);
        
        this.db.post_rqst(  {'category':this.addProduct } , 'sales/getBrandByCategory')
        .subscribe((result: any) => {
            // this.loading_list = true;
            console.log(result);
            this.brands = result['data']['brandList'];
            console.log(this.brands);        
        },err => {  this.dialog.retry().then((result) => { this.getBrandList(); });   });
  }


 
  // get_brand() {
  // this.loading_list = true;
    
  //   this.db.post_rqst( '', 'franchises/get_brand')
  //   .subscribe(data => {
  //     this.temp = data;
  //     this.brands = this.temp.brands;
  //     this.loading_list = false;      
  //   },err => {  this.dialog.retry().then((result) => { 
  //     this.get_brand();      
  //     console.log(err); });  
  //    });
    
  // }
  
  products:any  = [];
  temp:any  = [];
  get_products() {
  this.loading_list = true;
    
    this.db.post_rqst( this.addProduct , 'franchises/get_products')
    .subscribe(data => {
  this.loading_list = false;

      this.temp = data;
      this.products = this.temp.products;
      console.log(this.products);
      
    },err => {  this.dialog.retry().then((result) => { 
      this.get_products();      
      console.log(err); });  
     });
    
  }
  
  
  units:any  = [];
  get_unit() {
    
  this.loading_list = true;
    
    const d =  this.products.filter(items => items.id === this.addProduct.product_id);
    this.addProduct.product = d[0].product_name;
    this.addProduct.hsn_code = d[0].hsn_code;
    
    console.log(d);
    
    this.db.post_rqst( this.addProduct , 'franchises/units')
    .subscribe(data => {
      this.loading_list = false;
      // this.temp = data;
      this.units = data['data'].units;


      this.attributeTypeList = data['data'].attributeList;
      console.log(this.units);
      
      this.addProduct.attribute_type = '';
      this.addProduct.attribute_option = '';
    },err => {  this.dialog.retry().then((result) => { 
      this.get_unit();      
      console.log(err); });  
     });
    
  }


  getCurrentStock()
  {
      this.addProduct.attribute_option = '';

      const unt = this.units.filter(u => u.unit_of_measurement === this.addProduct.unit_measurement)[0];
      console.log(unt);
      
      // this.addProduct.stock_total = unt.stock_total;
      this.addProduct.measurement_id = unt.id;
      this.addProduct.sale_qty = unt.sale_qty;

      console.log(this.addProduct.sale_qty);
  }



  attributeTypeList = [];
  attributeOptionList = [];

  getAttributeOptionList()
  {
      this.addProduct.attribute_option = '';

      this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.addProduct.attribute_type)[0]['optionList'];
      console.log(this.attributeOptionList);
  }



  savingData:any = false;
  addProductItem(f:any){
  this.loading_list = true;

    console.log( this.stock );
    
    this.db.insert_rqst( {'franchise_id': this.franchise_id,'login_id': this.ses.users.id,'addProduct': this.addProduct } , 'franchises/addstock')
    .subscribe(data => {
      this.loading_list = false;
      this.addProduct = {};
      f.resetForm();
      this.dialog.success('Stock added Successfully!');
      this.getStock();
      var temp = data;
      console.log( temp );
      
    },err => {   this.loading_list = false;  this.dialog.retry().then((result) => { 
      this.savingData = false;
      console.log(err); });  
     });
  
  }

  top_index = '-1';
  bottom_index = '-1';
  
  stock_val:any='';

  update_stock(id){

    this.db.insert_rqst( {'franchise_id': this.franchise_id,'login_id': this.ses.users.id,'stock_val': this.stock_val ,'stock_id': id }, 'franchises/update_current_stock')
    .subscribe(data => {
         
  
      this.loading_list = false;

      this.stock[this.top_index][0][this.bottom_index ].stock_limit = this.stock_val;

      this.top_index = '-1';
        this.bottom_index = '-1';
      this.dialog.success('Stock Alert Updated Successfully!');
    },err => {   this.loading_list = false;  this.dialog.retry().then((result) => { 
      this.savingData = false;
      console.log(err); });  
     });
 


  }
}
