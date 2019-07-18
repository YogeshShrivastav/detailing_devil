import { Component, OnInit,Inject } from '@angular/core';
import {MAT_DIALOG_DATA , MatDialogRef} from '@angular/material';
import { SessionStorage } from 'src/app/_services/SessionService';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { ConvertArray } from '../../../_Pipes/ConvertArray.pipe';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { FormsModule, FormGroup }   from '@angular/forms';
import * as moment from 'moment';
import { log } from 'util';

@Component({
  selector: 'app-consumption-stock-add',
  templateUrl: './consumption-stock-add.component.html'

})
export class ConsumptionStockAddComponent implements OnInit {

  raw_form: any={};
  loading_list = false;
  brandsdata:any ;
  productsdata: any ;
  attr_typedata: any ;
  attr_optiondata: any ;
  tmp:any;
  cart_data: any=[] ;
  uom_data : any ;
  card_id: any;
  franchise_id: any;
  measures:any=[];
  type:any = '';
  
  constructor(@Inject(MAT_DIALOG_DATA) public d: any,public db : DatabaseService,private route : ActivatedRoute,private router: Router,public matDialog : MatDialog , public dialog : DialogComponent,public ses : SessionStorage,public dialogRef: MatDialogRef<ConsumptionStockAddComponent>) { 
    console.log(db);
    this.franchise_id = 0;
    this.type = d.type;
  }
  
  ngOnInit() {
    this.getBrandList();
  }



  
  productList : any = [];
  brandList:any = [];
  measurementList: any = [];
  attributeTypeList: any = [];
  attributeOptionList: any = [];

data:any = {};
  
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
      this.data.category = 'Product';
      this.loading_list = true;
     
      this.db.post_rqst(  {'category':this.data } , 'sales/getBrandByCategory')
      .subscribe((result: any) => {
        this.loading_list = false;

        this.brandList = result['data']['brandList'];
        // if(this.brandList.length  == 1){
        //     this.data.brand_name = this.brandList[0].brand_name;
        //     this.getProductList();
        // }

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
                    this.data.uom = this.measurementList[0].unit_of_measurement;
                  this.getSalePrice();


                }
                this.loading_list = false;

                console.log(this.data.product_id);
                

            this.data.product_name  = this.productList.filter(x => x.id === this.data.product_id)[0]['product_name'];


            },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getMeasurementList(); });   });
    }


   


    getSalePrice()
    {
        console.log(this.data);
        console.log(this.measurementList);

        this.data.qty = 1;
        this.data.rate = this.measurementList.filter(x=>x.unit_of_measurement === this.data.uom)[0]['sale_price'];
        this.data.current_stock = this.measurementList.filter(x=>x.unit_of_measurement === this.data.uom)[0]['sale_qty'];
        this.data.uom_id = this.measurementList.filter(x=>x.unit_of_measurement === this.data.uom)[0]['id'];
        this.data.description = this.measurementList.filter(x=>x.unit_of_measurement === this.data.uom)[0]['description'];
        console.log(this.data);
    }


  addtocart(form:any)
  {
 
    console.log( this.data );
    this.data.category = 'Product';


 
    
    if(this.cart_data.length == 0)
    {
      this.cart_data.push(this.data);
    }
    else
    {
      for(var i=0;i<this.cart_data.length;i++)
      {
        if(this.cart_data[i].brand_name == this.data.brand_name && this.cart_data[i].category == this.data.category && this.cart_data[i].product_id == this.data.product_id && this.cart_data[i].uom == this.data.uom )
        {
          this.cart_data[i].qty = parseInt(this.cart_data[i].qty) + parseInt(this.data.qty);
        }
        else
        {
          this.cart_data.push(this.data);
        }
      }
    }
    console.log(this.cart_data);
    // form.reset();
    this.data = {};
    this.data.category = 'Product';

  }
  
  removeCartData(index)
  {
    this.cart_data.splice(index,1);
  }

  remark:any = '';
  issue_to:any = '';
  purpose:any = '';
  date_created:any = '';
  saveraw_material()
  {
    console.log(this.card_id);
    console.log(this.cart_data);

    this.date_created = this.date_created   ? this.db.pickerFormat(this.date_created) : '';

    this.loading_list = true;
    var d = {'itemList' : this.cart_data ,'login_id': this.ses.users.id,'type': this.type,'remark':this.remark,'franchise_id':this.franchise_id,'issue_to':this.issue_to,'purpose':this.purpose , 'date_created': this.date_created};
    this.db.insert_rqst( {'stock':d}, 'stockdata/add_company_assumption')
    .subscribe(d => {
      this.tmp = d;
      this.loading_list = false;
      this.dialog.success('Counsumption Stock Added Successfully and stock updated!')
      console.log(  this.tmp );
      this.dialogRef.close('true'); 
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { 
      console.log(err); });  
     });
  }
  
}
