import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {map, startWith} from 'rxjs/operators';
import {AttrType, Brand, Measurement, Product} from '../accessory-add/accessory-add.component';

@Component({
  selector: 'app-accessory-edit',
  templateUrl: './accessory-edit.component.html',
})
export class AccessoryEditComponent implements OnInit { 

  form: any = {};
  data: any = [];

  measurementTypes:any = [];
  myControl: FormControl;
  filteredBrands: Observable<any[]>;
  brands: Brand[] = [];
  products: Product[] = [];
  filteredProducts: Observable<any[]>;
  measurements: Measurement[] = [];
  filteredMeasurements: Observable<any[]>;
  attrTypes: AttrType[] = [];
  filteredAttrTypes: Observable<any[]>;
  unitData: any = [];
  attrData: any = [];
  newUnitData: any = [];
  newAttrData: any = [];
  formData: any = {};
  nexturl: any;
  temp: any;
  product_id: any;
  sendingData = false;
  loading_data = true;
  constructor(public db: DatabaseService, private router: Router,
             public dialog: DialogComponent, private route: ActivatedRoute) {
    this.formOptions();
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.product_id = params['id'];
   
    if (this.product_id) { this.productData(); }
  });
  }
  productData() {
    this.loading_data = false;

    this.db.get_rqst( '', 'products/' + this.product_id + '/edit')
      .subscribe(data => {
        this.loading_data = true;

          this.data = data;

          this.form.category = this.data.data.product.category;
          this.form.brand = this.data.data.product.brand_name;
          this.form.product = this.data.data.product.product_name;
          this.form.stock_alert = this.data.data.product.stock_alert;
          this.form.gst = this.data.data.product.gst;
          this.form.hsn_code = this.data.data.product.hsn_code;
          this.data.data.product_units.forEach(obj => {

            const unitArr = obj.unit_of_measurement.split(' ');
            console.log(unitArr);
            this.storeUnitData(unitArr[1], unitArr[0], obj.sale_price, obj.purchase_price, obj.unit_id,obj.description);
          });
          this.data.data.product_attr.forEach(obj => {
            if(this.data.data.attr_options.length >= 1) {
              this.data.data.attr_options.forEach(options => {
              if(obj.attr_id == options[0].attr_type_id) {
                this.storeAttrData(obj.attr_type, options[0].attr_option, obj.attr_id);
              }
            });
            }
            else {
              this.storeAttrData(obj.attr_type, '', obj.attr_id);
            }
          });
         }, error => {
        this.loading_data = true;

        this.dialog.retry().then((result) => {
          this.productData();
      });

      });
  }
  refreshFilterBrand() {
    this.myControl = new FormControl();
    console.log('1' + this.brands);
    this.filteredBrands = this.myControl.valueChanges
      .pipe(startWith(''), map(brand => brand ? this.filterBrands(brand) : this.brands.slice()));
  }
  filterBrands(name: string) {
    return this.brands.filter(brand => brand.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  refreshFilterProduct() {
    this.myControl = new FormControl();
    this.filteredProducts = this.myControl.valueChanges
      .pipe(startWith(''), map(product => product ? this.filterProducts(product) : this.products.slice()));
  }
  filterProducts(name: string) {
    return this.products.filter(product => product.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  refreshFilterMeasurement() {
    this.myControl = new FormControl();
    this.filteredMeasurements = this.myControl.valueChanges
      .pipe(startWith(''), map(measurement => measurement ? this.filterMeasurements(measurement) : this.measurements.slice()));
  }
  filterMeasurements(name: string) {
    return this.measurements.filter(measurement => measurement.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  refreshFilterAttrType() {
    this.myControl = new FormControl();
    this.filteredAttrTypes = this.myControl.valueChanges
      .pipe(startWith(''), map(attrType => attrType ? this.filterAttrTypes(attrType) : this.attrTypes.slice()));
  }
  filterAttrTypes(name: string) {
    return this.attrTypes.filter(attrType => attrType.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  formOptions() {
    this.db.post_rqst( {'type': 'Accessory'}, 'products/form_options/get')

      .subscribe(data => {
        this.data = data;
        this.data.data.brands.forEach(brand => {
          this.brands.push({name: brand.name.toString()});
        });
        this.data.data.products.forEach(product => {
          this.products.push({name: product.name.toString()});
        });
        this.data.data.unit_measurements.forEach(measurement => {
          this.measurements.push({name: measurement.name.toString()});
        });
        this.data.data.attr_type.forEach(attr_type => {
          this.attrTypes.push({name: attr_type.name.toString()});
        });

        this.measurementTypes = this.data.data.measurement_types;
        
        this.refreshFormOption();
      }, error => {
      });
  }
  refreshFormOption() {
    this.refreshFilterBrand();
    this.refreshFilterProduct();
    this.refreshFilterMeasurement();
    this.refreshFilterAttrType();
  }
  storeUnitData(measurement, measurement_value, sale_price, purchase_price, description:any='',  unit_id = null ) {

    console.log(measurement, measurement_value, sale_price, purchase_price, unit_id);
    console.log('1');

    if(measurement && measurement_value && (sale_price || purchase_price)) {

        if ((measurement ||  measurement_value || sale_price || purchase_price)  && unit_id) {


                  const isUnitExist = this.unitData.findIndex(unit => {
                    return unit.measurement === measurement && unit.measurement_value === measurement_value;
                });

                console.log(isUnitExist);

                if(isUnitExist === -1) {


                      this.unitData.push({measurement: measurement, measurement_value: measurement_value, sale_price: sale_price, purchase_price: purchase_price ,description: ( description ? description : '' )  ,
                    unit_id: unit_id});

                } else {
                    this.dialog.error( 'This measurement Already Exist!');
               }
            
        }


        if ((measurement ||  measurement_value || sale_price || purchase_price) && !unit_id) {

         console.log(measurement, measurement_value, sale_price, purchase_price, unit_id);
         console.log('2');

          if((Number(sale_price) && Number(measurement_value) && Number(purchase_price)) || (Number(sale_price) && !purchase_price) ||
            (!sale_price && Number(purchase_price))) {

            const isUnitExist = this.unitData.findIndex(unit => {
              console.log(unit.measurement);
              console.log(measurement);

              console.log(unit.measurement_value);
              console.log(measurement_value);

              
                return unit.measurement === measurement && parseInt(  unit.measurement_value ) === parseInt( measurement_value );
            });

            console.log(isUnitExist);
  
            if(isUnitExist === -1) {

              this.unitData.push({measurement: measurement, measurement_value: measurement_value, sale_price: ( sale_price ? sale_price : sale_price ) , purchase_price: ( purchase_price ? purchase_price : '' ) ,description: ( description ? description : '' ) });

              this.newUnitData.push({measurement: measurement, measurement_value: measurement_value,
              sale_price:  ( sale_price ? sale_price : sale_price ) , purchase_price: ( purchase_price ? purchase_price : '' ) , description: ( description ? description : '' )});
              this.form.measurement = this.form.measurement_value = this.form.sale_price = this.form.purchase_price = null;

            } else {
                 this.dialog.error( 'This measurement Already Exist!');
            }

          } else { this.dialog.error( 'Please Enter a valid integer for sale price and purchase price'); }
        }

      

    } else { this.dialog.error( 'Please add Measurement and purchase/sale price to add unit data'); }
  }
  removeUnitData(index, unit_id) {
    if(unit_id) {
      this.loading_data = false;
      this.dialog.delete('Product Attribute').then((result) => {
       this.loading_data = true;
        
        if(result) {
        console.log(result);

          this.db.post_rqst({'unit_id': unit_id}, 'products/unit_data/remove')
          .subscribe(data => {
            this.unitData.splice(index, 1);
             
           }, error => {
           });
         }
     });
   } else {
    this.loading_data = true;

     this.unitData.splice(index, 1);
   }
 }
  storeAttrData(attr_type, attr_options, attr_id = null) {
    if(attr_type) {
      if ((attr_type || attr_options) && attr_id) {
        this.attrData.push({attr_type: attr_type,
          attr_options: attr_options ? attr_options.split(',') : '',
          attr_id: attr_id });
      }
      if ((attr_type || attr_options) && !attr_id) {
      this.attrData.push({attr_type: attr_type,
        attr_options: attr_options ? attr_options.split(',') : ''});
      this.newAttrData.push({attr_type: attr_type,
        attr_options: attr_options ? attr_options.split(',') : ''});
      }
      this.form.attr_type = this.form.attr_options = null;
    }
    else this.dialog.error( 'Please add Measurement to add unit data');
  }
  removeAttrData(index, attr_id = null) {
    if(attr_id) {
      this.loading_data = false;
      this.dialog.delete('Product Attribute').then((result) => {
        if(result) {
          this.db.post_rqst({'attr_id': attr_id}, 'products/attr_data/remove')
            .subscribe(data => {
              this.data = data;
              if (this.data.data.r_attr_data) {
                this.loading_data = true;
                this.attrData.splice(index, 1);
              }
            }, error => {
            });
          }
      });
    } else {
      this.attrData.splice(index, 1);
    }
  }
  updateProduct() {
    if(this.form.measurement == null) {
      if(this.form.attrtype == null) {
        this.sendingData = true;
        this.formData.product_id = this.product_id;
        this.formData.category = this.form.category;
        this.formData.brand = this.form.brand;
        this.formData.gst = this.form.gst || '';
        this.formData.stock_alert = this.form.stock_alert || '';
        this.formData.hsn_code = this.form.hsn_code || '';
        this.formData.product = this.form.product;
        this.formData.unitData = this.newUnitData;
        this.formData.attrData =  this.newAttrData;
        this.db.post_rqst( this.formData, 'products/update')
          .subscribe(data => {
            this.temp = data;
            if (this.temp.status == 'success') {
              this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/accessory-list';
              this.router.navigate([this.nexturl]);
            } else {
              this.dialog.error( 'Problem occurred! Please Try again');
            }
          }, error => {
            this.dialog.retry().then((result) => { this.updateProduct(); });
        });
      } else { this.dialog.warning( 'Please add plus icon to store attr data! Please Try again'); }
    } else { this.dialog.warning( 'Please add plus icon to store unit data! Please Try again'); }
  }
}
