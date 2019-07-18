import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {AttrType, Brand, Measurement, Product} from '../../product/add-product/add-product.component';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';

export class FranchisePlan {
  constructor(public name: string) { }
}
@Component({
  selector: 'app-add-franchise-plan',
  templateUrl: './add-franchise-plan.component.html'
  // styleUrls: ['./add-franchise-plan.component.scss']
})
export class AddFranchisePlanComponent implements OnInit {
  form: any = {};
  data: any = [];
  myControl: FormControl;
  brands: any = [];
  plans: FranchisePlan[] = [];
  filteredPlans: Observable<any[]>;
  formData: any = {};
  nexturl: any;
  temp: any;
  accessoriesData: any = [];
  products: any = [];
  product_attrs: any = [];
  initial_stock: any = [];
  sendingData = false;
  loading_list = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,  public dialog: DialogComponent) {
    
  }

  ngOnInit() {
    this.formOptions();
    this.getCaegoryList();
  }
  refreshFilterPlan() {
    this.myControl = new FormControl();
    this.filteredPlans = this.myControl.valueChanges
      .pipe(startWith(''), map(plan => plan ? this.filterPlans(plan) : this.plans.slice()));
  }
  filterPlans(name: string) {
    return this.plans.filter(plan => plan.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  // storeAccessoriesData(accessories) {
  //   accessories.split(',').forEach(accessories_name => {
  //     this.accessoriesData.push({accessories_name: accessories_name});
  //   });
  //   this.form.accessories = null;
  // }
  // removeAccessoriesData(index) {
  //   this.accessoriesData.splice(index, 1);
  // }
  formOptions() {
    this.loading_list = true;
    this.db.get_rqst( {'type':''}, 'franchise_plans/form_options/get')
      .subscribe(data => {
    this.loading_list = false;

        this.data = data;
        this.data.data.plan_names.forEach(plan_name => {
          this.plans.push({name: plan_name.name.toString()});
        });
        // this.data.data.brands.forEach(brand => {
        //   this.brands.push({name: brand.name.toString()});
        // });

        this.refreshFormOption();
      },err => { this.loading_list = false;  this.dialog.retry().then((result) => { this.formOptions(); });   });
  }
  refreshFormOption() {
    this.refreshFilterPlan();
  }


      
  categoryList:any = [];
  getCaegoryList()
  {
    this.form.brand = '';
    this.form.product = '';
    this.form.unit = '';
    
    this.categoryList = [];

    this.brands = [];
    this.products =[];
    this.attributeTypeList =[];
    this.attributeOptionList =[];


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
    this.form.brand = '';
    this.form.product = '';
    this.form.unit = '';
    

    this.brands = [];
    this.products =[];
    this.attributeTypeList =[];
    this.attributeOptionList =[];
    
    this.loading_list = true;
      
      this.db.post_rqst(  {'category':this.form } , 'sales/getBrandByCategory')
      .subscribe((result: any) => {
        this.loading_list = false;
        
          console.log(result);
          this.brands = result['data']['brandList'];
          for (let i = 0; i < this.brands.length; i++) {
            this.brands[i].name = this.brands[i].brand_name;
            
          }
          console.log(this.brands);
          
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getBrandList(); });   });
  }


  getProducts()
  {

    this.form.product = '';
    this.form.unit = '';
    

    this.products =[];
    this.attributeTypeList =[];
    this.attributeOptionList =[];

    this.form.brand_name = this.form.brand;
    this.loading_list = true;

        this.db.post_rqst( this.form , 'sales/getProduct')
        .subscribe((result) => {
    this.loading_list = false;
        
            console.log(result);
            this.products = result['data']['productList'];
console.log( this.products );

            for (let i = 0; i < this.products.length; i++) {
              this.products[i].name = this.products[i].product_name;
              this.products[i].hsn_code = this.products[i].hsn_code || '';
              this.products[i].id = this.products[i].id || '';
              
            }

          },err => {   this.loading_list = false; this.dialog.retry().then((result) => { this.getProducts(); });   });
  }




all_product_attrs:any = [];
  getProductAttr(brand, product, category) {


    this.form.unit = '';
    

    this.attributeTypeList =[];
    this.attributeOptionList =[];


    const product_id = this.products.filter(x => x.name === product)[0]['id'];


    this.loading_list = true;
    this.product_attrs = [];
    this.db.get_rqst( '' , 'franchise_plans/product_attrs/get?brand=' + brand + '&product=' + product + '&category=' + category+ '&product_id=' + product_id )
      .subscribe(data => {
        console.log(data);
        
        this.loading_list = false;
        this.data = data;
        this.all_product_attrs = this.data.data.product_attrs;
        this.data.data.product_attrs.forEach(product_attr => {
          this.product_attrs.push({unit: product_attr.unit.toString()});
        });
        this.attributeTypeList = data['data']['attributeList'];

        this.form.attribute_option  = '';
        this.form.attribute_type    = '';

      },err => {   this.loading_list = false; this.dialog.retry().then((result) => { this.getProductAttr(brand, product, category); });   });
  }


  attributeOptionList = [];
  attributeTypeList = [];

  getAttributeOptionList()
  {
      this.data.attribute_option = '';

      this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.form.attribute_type)[0]['optionList'];
      console.log(this.attributeOptionList);
  }



  storeInitialStock(category, brand, product, unit, quantity,s:any) {

    const hsn_code = this.products.filter(p =>  p.name === product )[0].hsn_code;
    const uom_id = this.all_product_attrs.filter(p =>  p.unit === unit )[0].id;
    console.log(uom_id);
    console.log(this.all_product_attrs);
    

    if(this.initial_stock.length == 0)
    {
      this.initial_stock.push({category: category ? category : '', brand: brand ? brand : '', product: product ? product : '', hsn_code: hsn_code ? hsn_code : '', unit: unit ? unit : '', uom_id: uom_id ? uom_id : '',
      quantity: quantity ? quantity : '','attribute_option': this.form.attribute_option,'attribute_type': this.form.attribute_type });
      this.form.attribute_option  
      this.form.attribute_type    
    }else{

      for(let i=0;i<this.initial_stock.length;i++)
      {
          if(category == this.initial_stock[i].category && brand == this.initial_stock[i].brand && product == this.initial_stock[i].product && unit == this.initial_stock[i].unit )
          {
              this.initial_stock[i].quantity =  parseInt(quantity)+parseInt(this.initial_stock[i].quantity);
              break;
          }
          else if(i == this.initial_stock.length - 1)
          {
            this.initial_stock.push({category: category ? category : '', brand: brand ? brand : '', product: product ? product : '', hsn_code: hsn_code ? hsn_code : '', unit: unit ? unit : '', uom_id: uom_id ? uom_id : '',
            quantity: quantity ? quantity : '','attribute_option': this.form.attribute_option,'attribute_type': this.form.attribute_type});
              break;   
          }

      }



    }


    this.form.brand = this.form.product = this.form.unit = this.form.quantity = this.form.attribute_option = this.form.attribute_type = null;

    s.resetForm();
    
  }

  removeInitialStock(index) {
    this.initial_stock.splice(index, 1);
  }
  saveFranchisePlan() {
    this.loading_list = true;

    if(!(this.form.brand && this.form.product && this.form.unit && this.form.quantity)) {
      // if (!this.form.accessories) {
        this.sendingData = true;
        this.formData.plan = this.form.plan;
        this.formData.price = this.form.price;
        this.formData.description = this.form.description;
        // this.formData.accessories = this.accessoriesData;
        this.formData.initial_stock = this.initial_stock;
        this.db.insert_rqst(this.formData, 'franchise_plans/save')
          .subscribe(data => {
        this.loading_list = false;
        this.sendingData = false;


            this.temp = data;
            if (this.temp.data.franchise_plan) {
              this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/franchise_plans';
              this.router.navigate([this.nexturl]);
            } else {
              this.dialog.error('Problem occurred! Please Try again');
            }
          },err => {   this.loading_list = false;  this.sendingData = false; this.dialog.retry().then((result) => {  });   });
      // }
    }
  }


}
