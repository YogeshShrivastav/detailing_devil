import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-add-finish-good',
  templateUrl: './add-finish-good.component.html'
})
export class AddFinishGoodComponent implements OnInit {

  brandList:any = [];

  productList : any = [];

  measurementList: any = [];
  attributeTypeList: any = [];
  attributeOptionList: any = [];

  data:any = {};
  loading_list:any = false;


    constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}

  ngOnInit() {
    this.getBrandList();
    this.getRawBrandList();
    this.master_measurement_types();
  }



  getBrandList()
  {
    this.loading_list = true;
    this.finish_good.category = 'Product';

      this.db.post_rqst( {'category': this.finish_good } , 'sales/getBrandByCategory')
      .subscribe((result: any) => {
    this.loading_list = false;

          console.log(result);
          this.brandList = result['data']['brandList'];
          console.log(this.brandList);        
      }, error => {
    this.loading_list = false;

          console.log(error);
          this.dialog.retry().then((result) => {
            this.getBrandList();
        });
      });
  }


  getProductList()
  {
    this.loading_list = true;

        this.finish_good.product_id = '';
        this.finish_good.measurement = '';
        this.finish_good.rate = '';
        this.finish_good.attribute_type = '';
        this.finish_good.attribute_option = '';
        this.productList = [];
        this.measurementList = [];
        this.attributeTypeList = [];
        this.attributeOptionList = [];
        this.finish_good.category = 'Product';

        this.db.post_rqst( this.finish_good , 'sales/getProduct')
        .subscribe((result) => {
            console.log(result);
    this.loading_list = false;

            this.productList = result['data']['productList'];

        }, error => {
            console.log(error);
            this.dialog.retry().then((result) => {
              this.getProductList();
          });
        });
  }


  getMeasurementList()
  {
        this.finish_good.measurement = '';
        this.finish_good.rate = '';
        this.loading_list = true;

      this.finish_good.product_name = this.productList.filter(x=>x.id === this.finish_good.product_id)[0]['product_name'];

        this.db.post_rqst( this.finish_good , 'sales/getMeasurement')
        .subscribe((result: any) => {
    this.loading_list = false;

              console.log(result);
              this.measurementList = result['data']['measurementList'];
              console.log(this.measurementList);       
              
              this.attributeTypeList = result['data']['attributeList'];
              console.log(this.attributeTypeList);

        }, error => {
            console.log(error);
            this.dialog.retry().then((result) => {
              this.getMeasurementList();
          });
        });
  }


  getAttributeOptionList()
  {
      this.finish_good.attribute_option = '';

      this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.finish_good.attribute_type)[0]['optionList'];
      console.log(this.attributeOptionList);
  }


  getSalePrice()
  {
      console.log(this.finish_good);
      console.log(this.measurementList);

      this.finish_good.qty = 1;
      this.finish_good.rate = this.measurementList.filter(x=>x.unit_of_measurement === this.finish_good.measurement)[0]['sale_price'];
      this.finish_good.measurement_id = this.measurementList.filter(x=>x.unit_of_measurement === this.finish_good.measurement)[0]['id'];
      console.log(this.finish_good.rate);
  }







  ////////////


  rawbrandList:any = [];

  rawproductList : any = [];

  rawmeasurementList: any = [];
  rawattributeTypeList: any = [];
  rawattributeOptionList: any = [];


  getRawBrandList()
  {
    this.loading_list = true;

      this.db.post_rqst('' , 'stock/getBrand')
      .subscribe((result: any) => {
    this.loading_list = false;

          console.log(result);
          this.rawbrandList = result['data']['brandList'];
          console.log(this.rawbrandList);        
      }, error => {
          console.log(error);
    this.loading_list = false;

          this.dialog.retry().then((result) => {
            this.getRawBrandList();
        });
      });
  }


  getRawProductList()
  {

    this.loading_list = true;

        this.raw_material.product_id = '';
        this.raw_material.measurement = '';
        this.raw_material.rate = '';
        this.raw_material.stock_qty = '';
        this.raw_material.attribute_type = '';
        this.raw_material.attribute_option = '';
        this.rawproductList = [];
        this.rawmeasurementList = [];
        this.rawattributeTypeList = [];
        this.rawattributeOptionList = [];

        this.db.post_rqst( this.raw_material , 'stock/getProduct')
        .subscribe((result) => {
    this.loading_list = false;

            console.log(result);
            this.rawproductList = result['data']['productList'];

        }, error => {
    this.loading_list = false;

            console.log(error);
            this.dialog.retry().then((result) => {
              this.getRawProductList();
          });
        });
  }


  getRawMeasurementList()
  {
    this.loading_list = true;

        this.raw_material.measurement = '';
        this.raw_material.rate = '';
        this.raw_material.stock_qty = '';
        this.raw_material.product_name = this.rawproductList.filter(x=>x.id === this.raw_material.product_id)[0]['product_name'];

        this.db.post_rqst( this.raw_material , 'stock/getMeasurement')
        .subscribe((result: any) => {
    this.loading_list = false;

              console.log(result);
              this.rawmeasurementList = result['data']['measurementList'];
              console.log(this.rawmeasurementList);       
              
              this.attributeTypeList = result['data']['attributeList'];
              console.log(this.rawattributeTypeList);

        }, error => {
            console.log(error);
    this.loading_list = false;

            this.dialog.retry().then((result) => {
              this.getRawMeasurementList();
          });
        });
  }

  change_measurment(m){
  }


  measurementTypes_temp:any = [];
  measurementTypes:any = [];
  t:any={};
  master_measurement_types()
  {
   
        this.db.get_rqst( '' , 'stock/master_measurement')
        .subscribe((data: any) => {
          this.t = data
          this.measurementTypes = this.t.data.measurement;
          this.measurementTypes_temp = this.t.data.measurement;
        }, error => {
            console.log(error);
             this.loading_list = false;

            this.dialog.retry().then((result) => {
              this.master_measurement_types();
          });
        });
  }



  getRawAttributeOptionList()
  {
      this.raw_material.attribute_option = '';

      this.rawattributeOptionList = this.rawattributeTypeList.filter(x => x.attr_type === this.raw_material.attribute_type)[0]['optionList'];
      console.log(this.rawattributeOptionList);
  }

  disabled:any = false;

  getRawSalePrice()
  {

      console.log(this.raw_material);
      console.log(this.rawmeasurementList);

      this.raw_material.qty = 1;
      var x = this.rawmeasurementList.filter(x=>x.unit_of_measurement === this.raw_material.measurement)[0];
      this.raw_material.rate = x['sale_price'];
      this.raw_material.stock_qty = x['stock_qty'];
      this.raw_material.stock_total = x['stock_total'];
      this.raw_material.measurement_id = x['id'];
      
      console.log(x);
      
      console.log(x['stock_total']);
      


    this.measurementTypes = this.measurementTypes_temp;


      for (let i = 0; i <   this.measurementTypes_temp.length; i++) {

        console.log(this.measurementTypes_temp[i].name);
console.log( x['unit_of_measurement']);


         if( x['unit_of_measurement'].includes(this.measurementTypes_temp[i].name) ){
           console.log(this.measurementTypes_temp[i]);
           if( this.measurementTypes_temp[i].name.includes('box')  ||this.measurementTypes_temp[i].name.includes('pc') ){
              this.disabled = false;
              this.measurementTypes = [];
              this.measurementTypes.push( {'name': 'box'} );
              this.measurementTypes.push( {'name': 'pc'} );
            
              this.raw_material.raw_required_Measurement = this.measurementTypes_temp[i].name;
              break;
           }else{
            this.disabled = true;
            this.raw_material.raw_required_Measurement = this.measurementTypes_temp[i].name;
            break;

           }
             
         }
    
        
      }

      console.log(this.raw_material.rate);


  }



  finish_good:any = {};
  raw_material :any = {};


  rawMatrialList:any = [];

  addRawMatrialList(f)
  {
    console.log(this.raw_material);

    this.rawMatrialList.push( this.raw_material );
    console.log(this.rawMatrialList);

    this.raw_material={};
    f.resetForm();
  
  }

  remove(i)
  {
    this.rawMatrialList.splice(i,1 );

    // f.resetForm();
  
  }

  savingData:any = false;
  saveRawProductList()
  {
    this.savingData = true;

       console.log(this.finish_good);
       console.log(this.rawMatrialList);
       

        this.db.post_rqst( {'raw': this.rawMatrialList , 'finish_good': this.finish_good , 'login_id': this.ses.users.id } , 'stock/saveRawProductList')
        .subscribe((result) => {
           
          this.savingData = false;
          this.router.navigate(['/finish-material']);

        }, error => {
          this.savingData = false;
           
        });
  }




}
