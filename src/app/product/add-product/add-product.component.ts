import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';

export class Brand {
    constructor(public name: string) { }
}
export class Product {
  constructor(public name: string) { }
}
export class Measurement {
  constructor(public name: string) { }
}
export class AttrType {
  constructor(public name: string) { }
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
})
export class AddProductComponent implements OnInit {
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
  formData: any = {};
  nexturl: any;
  temp: any;
  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute,
              private router: Router,  public dialog: DialogComponent) {
    this.formOptions();
  }
  ngOnInit() {
  }
  refreshFilterBrand() {
  this.myControl = new FormControl();
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

    this.db.post_rqst( {'type': 'Product'}, 'products/form_options/get')
        .subscribe(data => {
          this.data = data;

          console.log(this.data);
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

          console.log(this.measurementTypes);
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
  storeUnitData(measurement, measurement_value, sale_price, purchase_price, description) {

    if(measurement && measurement_value && (sale_price || purchase_price)) {
      if((Number(sale_price) && Number(measurement_value) && Number(purchase_price)) || (Number(sale_price) && !purchase_price) ||
        (!sale_price && Number(purchase_price))) {

          const isUnitExist = this.unitData.findIndex(unit => {
              return unit.measurement === measurement && unit.measurement_value === measurement_value;
          });

          console.log(isUnitExist);

          if(isUnitExist === -1) {

              this.unitData.push({measurement: measurement, measurement_value: measurement_value, sale_price: (sale_price?sale_price:''), purchase_price: (purchase_price?purchase_price:''),description:(description?description:'')});

              this.form.measurement = '';

              this.form.measurement = this.form.measurement_value = this.form.sale_price = this.form.purchase_price = this.form.description = null;
          } else {
              this.dialog.error( 'This measurement Already Exist!');
          }


      }  else { this.dialog.error( 'Please Enter a valid integer for sale price and purchase price'); }

   } else { this.dialog.error( 'Please add Measurement and purchase/sale price to add unit data'); }

  }

  removeUnitData(index) {
    this.unitData.splice(index, 1);
  }
  
  storeAttrData(attr_type, attr_options) {
    if(attr_type) {

      
      this.attrData.push({attr_type: attr_type, attr_options: attr_options.split(',')});
      console.log(this.attrData);
      
      this.form.attr_type = this.form.attr_options = null;
    } else { this.dialog.error( 'Please add Measurement to add unit data'); }
  }
  removeAttrData(index) {
    this.attrData.splice(index, 1);
  }
  saveProduct() {
    if(this.form.measurement == null) {
      if(this.form.attrtype == null) {
          this.sendingData = true;
          this.formData.category = 'Product';
          this.formData.brand = this.form.brand || '';
          this.formData.product = this.form.product || '';
          this.formData.unitData = this.unitData || [];
          this.formData.attrData = this.attrData || [];
          this.formData.stock_alert = this.form.stock_alert || '';
          this.formData.gst = this.form.gst || '';
          this.formData.hsn_code = this.form.hsn_code || '';
          this.db.post_rqst( this.formData, 'products/save')
            .subscribe(data => {
                this.temp = data;
                if (this.temp.data.product) {
                    this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/products';
                    this.router.navigate([this.nexturl]);
                } else { this.dialog.error( 'Problem occurred! Please Try again'); }
              }, error => {
                this.dialog.retry().then((result) => { this.saveProduct(); });
          });
      } else { this.dialog.warning( 'Please add plus icon to store attr data! Please Try again'); }
    } else { this.dialog.warning( 'Please add plus icon to store unit data! Please Try again'); }
  }
}
