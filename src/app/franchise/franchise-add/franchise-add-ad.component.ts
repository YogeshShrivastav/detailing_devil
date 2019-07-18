import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';
import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { BrowserStack } from 'protractor/built/driverProviders';



@Component({
  selector: 'app-franchise-add-ad',
  templateUrl: './franchise-add-ad.component.html'
})
export class FranchiseAddAdComponent implements OnInit {
  
  lead_id;
  loading_list = false;
  franchiseForm: any = {};
  savingData = false;
  temp:any;
  data: any = [];
  franch_stock: any = {};
  accessories: any = [];
  initial_stock: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  corespond = false;
  //cities: Observable<any[]>;
  pincodes: any = [];
  
  corr_districts: any = [];
  corr_pincodes: any = [];
  
  ship_districts: any = [];
  ship_pincodes: any = [];
  franchise_id:any;
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
    }
    
    ngOnInit() {
      this.route.params.subscribe(params => {
        this.franchise_id = this.db.crypto(params['franchise_id'],false) || 0;
        console.log(this.franchise_id );
        
        if (this.franchise_id) {
          this.get_franchise_detail();
        }
        this.getServicePlan();
        //this.getLocations();
        this.formOptions();
        //this.get_brand();
        this.getCaegoryList();
        this.franchiseForm.country_id = '99';
        this.franch_stock.franchise_id = '';
        this.getCountryList();
      });
    }
    
    get_franchise_detail(){
      this.db.get_rqst( '', 'franchises/details/'+this.franchise_id)
      .subscribe(data => {
        console.log(data);
        this.franchiseForm = data.frchise;
        this.franchiseForm.email = data.frchise.email_id;
        this.franchiseForm.pan_no = data.frchise.company_pan_no;
        this.franchiseForm.location_id = data.frchise.loc_id;
        this.franchiseForm.pincode = parseInt(data.frchise.pincode);
        this.franchiseForm.cors_pincode = parseInt(data.frchise.cors_pincode);
        this.franchiseForm.ship_pincode = parseInt(data.frchise.ship_pincode);
        this.getLocations();
        if(data.frchise.state)
        {
          this.getDistrictList(1);
          this.getCityList(1);
        }
        if(data.frchise.cors_state)
        {
          this.getDistrictList(2);
          this.getCityList(2);
        }
        if(data.frchise.ship_state)
        {
          this.getDistrictList(3);
          this.getCityList(3);
        }
      },err => {  this.dialog.retry().then((result) => { 
        console.log(err); });  
      });
    }
    
    formOptions() {
      this.db.get_rqst( '', 'franchises/country')
      .subscribe(data => {
        this.data = data;
        this.countries = this.data.data.country;        
        console.log( this.countries);                
        this.refreshFormOption();
      },err => {  this.dialog.retry().then((result) => { 
        this.formOptions();      
        console.log(err); });  
      });
    }
    refreshFormOption() {
      
    }
    
    correspondence_address(e){    
      if(e){
        this.corespond = true;
        this.franchiseForm.cors_country_id = '';
        this.franchiseForm.cors_state = '';
        this.franchiseForm.cors_district = '';
        this.franchiseForm.cors_city = '';
        this.franchiseForm.cors_pincode = '';
        this.franchiseForm.cors_address = '';
      }else{
        this.corespond = false;
        this.franchiseForm.cors_country_id = this.franchiseForm.country_id;
        this.franchiseForm.cors_state = this.franchiseForm.state;
        this.franchiseForm.cors_district = this.franchiseForm.district;
        this.franchiseForm.cors_city = this.franchiseForm.city;
        this.franchiseForm.cors_pincode = this.franchiseForm.pincode;
        this.franchiseForm.cors_address = this.franchiseForm.address;
      }
    }
    locations: any = [];
    getLocations() {
      this.loading_list = true;      
      console.log(this.franchiseForm.country_id);      
      this.db.get_rqst( '', 'franchises/locations/'+this.franchiseForm.country_id)
      .subscribe(data => {
        this.loading_list = false;        
        this.data = data;
        this.locations = this.data.data.l;
        console.log(  this.locations);        
      },err => {  this.dialog.retry().then((result) => { 
        this.getLocations();      
        console.log(err); });  
      });
    }
    
    clear_plan(){
      if( this.franch_stock.franchise_plan == ''  ){
        this.franch_stock.plan_id = '';
        this.stock = []
        this.plan_data = {}
        this.accessories = [];
      }      
    }
    
    
    service_plans: any= [];
    getServicePlan() {
      this.loading_list = false;
      this.db.get_rqst( '', 'franchises/service_plans')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.service_plans = this.data.data.plans;
        console.log(this.service_plans);
      },err => {  this.dialog.retry().then((result) => { 
        this.getServicePlan();      
        console.log(err); });  
      });
    }
    
    check_email()
    {
      console.log();
      this.db.post_rqst({'email':this.franchiseForm.email2}, 'franchises/check_email')
      .subscribe(resp=>{
        console.log(resp);
        
      })
      
    }
    
    
    saveFranchiseLead(form:any) {
      console.log(this.corespond);
      this.savingData = true;
      
      console.log(form);
      
      const tmp = new ConvertArray().transform( form._directives);
      if(this.corespond == false)
      {
        tmp.cors_country_id = tmp.country_id;
        tmp.cors_state = tmp.state;
        tmp.cors_district = tmp.district;
        tmp.cors_city = tmp.city;
        tmp.cors_pincode = tmp.pincode;
        tmp.cors_address = tmp.address;
      }
      console.log( tmp );
      this.savingData = true;
      tmp.type = '2';
      tmp.edit_franchise_id = this.franchise_id;
      tmp.created_by = this.ses.users.id;
      
      tmp.training_start = tmp.training_start ? this.db.pickerFormat(tmp.training_start) :'';
      tmp.training_end = tmp.training_end  ? this.db.pickerFormat(tmp.training_end) : '';
      tmp.associated_date =   tmp.associated_date ? this.db.pickerFormat(tmp.associated_date) : '';
      
      this.db.post_rqst( {'tmp':tmp}, 'franchises/add')
      .subscribe(data => {
        this.savingData = false;
        
        if(data['data'].msg == 'Success' )
        {
          if(this.franchise_id)
          {
            this.router.navigate(['franchise-detail/'+this.db.crypto(this.franchise_id)]);
          }else{
            this.temp = data;
            console.log( this.temp );
            if (this.temp.data.franchise_id) {
              this.franch_stock.franchise_id = this.temp.data.franchise_id;
            }
          }
          this.dialog.success( 'Franchise successfully updated');
          if( data['data'].prefix_edit )
          {
            setTimeout(()=>{
              this.dialog.success( 'Pre fix of sales invoice successfully updated');
            }, 5000);
          }
        }
        else if(data['data'].msg == 'Exist' )
        {
          this.dialog.error( 'Email already exists');
        }
        else if(data['data'].msg == 'Prefix Exist' )
        {
          this.dialog.error( 'Prefix. already exists');
        }
        else
        {
          this.dialog.error( 'Problem occured ');
        }
      },err => {  this.dialog.retry().then((result) => { 
        this.saveFranchiseLead(form);      
        console.log(err); });  
      });
    }
    
    
    
    plan_data: any = {};
    stock: any = [];
    get_stock() {
      console.log(this.franch_stock.plan_id);
      this.loading_list = false;
      this.db.get_rqst( '', 'franchises/get_stock/' + this.franch_stock.plan_id)
      .subscribe(data => {
        this.data = data;
        console.log(data);
        this.loading_list = true;
        this.stock = this.data.data.data;
        this.plan_data = this.data.data.plans;
        this.accessories = this.data.data.accessories;
        console.log(this.accessories);        
      },err => {  this.dialog.retry().then((result) => { 
        this.get_stock();      
        console.log(err); });  
      });
    }
    
    remove(i:any,x:any) {
      console.log(this.stock[i][0]);
      this.stock[i][0].splice(x,1);
    }
    
    delete_product(i:any) {
      console.log(this.stock[i]);
      this.stock.splice(i,1);
      console.log(this.stock);
      
    }
    
    
    
    categoryList:any = [];
    getCaegoryList()
    {
      this.addProduct.product_id = '';
      this.addProduct.measurement = '';
      this.addProduct.rate = '';
      this.addProduct.attribute_type = '';
      this.addProduct.attribute_option = '';
      this.products = [];
      this.units= [];
      // this.attributeTypeList = [];
      // this.attributeOptionList = [];
      // this.loading_list = false;
      this.db.post_rqst(  '', 'sales/getCategoryList')
      .subscribe((result: any) => {
        // this.loading_list = true;
        console.log(result);
        this.categoryList = result['data']['categoryList'];
        console.log(this.categoryList);        
      },err => {  this.dialog.retry().then((result) => { this.getCaegoryList(); });   });
    }
    
    
    
    addProduct:any  = {};
    brands:any  = [];
    // get_brand() {
    
    //   this.db.post_rqst( '', 'franchises/get_brand')
    //   .subscribe(data => {
    //     this.temp = data;
    //     this.brands = this.temp.brands;
    
    //   });
    
    // }
    
    getBrandList()
    {
      
      this.addProduct.product_id = '';
      this.addProduct.measurement = '';
      this.addProduct.rate = '';
      this.addProduct.attribute_type = '';
      this.addProduct.attribute_option = '';
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
    
    
    
    
    products:any  = [];
    get_products() {
      this.loading_list = false;
      this.db.post_rqst( this.addProduct , 'franchises/get_products')
      .subscribe(data => {
        this.temp = data;
        this.products = this.temp.products;
        console.log(this.products);
        this.loading_list = true;
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
    
    
    
    attributeTypeList = [];
    attributeOptionList = [];
    
    getAttributeOptionList()
    {
      this.addProduct.attribute_option = '';
      
      this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.addProduct.attribute_type)[0]['optionList'];
      console.log(this.attributeOptionList);
    }
    
    addProductItem(f:any){      
      this.savingData = true;      
      var exist = false;
      for (let index = 0; index < this.stock.length; index++) {
        console.log(this.stock[index][1].brand);        
        if( this.stock[index][1].category == this.addProduct.category &&  this.stock[index][1].brand == this.addProduct.brand && this.stock[index][1].product == this.addProduct.product ){
          exist = true;          
        }        
        if(exist){
          console.log(this.stock[index][0]);
          var unit_exist = false;
          for (let index1 = 0; index1 < this.stock[index][0].length; index1++) {
            console.log('in');            
            console.log(this.stock[index][0][index1].unit_measurement);            
            if(this.stock[index][0][index1].unit_measurement == this.addProduct.unit_measurement){
              console.log('unitexist');
              //alert('exist');
              this.stock[index][0][index1].quantity=parseInt(this.stock[index][0][index1].quantity) + parseInt(this.addProduct.quantity);
              console.log(this.stock[index][0][index1]);
              unit_exist =true;
              break;
            }            
          }
          if(unit_exist){
            
            f.resetForm();
            
            break;
          }
          this.stock[index][0].push( this.addProduct );
          this.addProduct = {};
          f.resetForm();          
        }        
      }
      
      if(!exist){
        this.add_product(f);
      }
      console.log( this.stock);      
      this.savingData = false;      
    }
    
    add_product(f:any) {
      const stock_temp = [];
      stock_temp.push( [this.addProduct] );
      stock_temp.push({'category': this.addProduct.category,'brand': this.addProduct.brand,'product': this.addProduct.product ,'hsn_code': this.addProduct.hsn_code ,'attribute_type': this.addProduct.attribute_type ,'attribute_option': this.addProduct.attribute_option });
      console.log(stock_temp);
      console.log(this.stock);
      this.stock.push( stock_temp );      
      console.log(this.stock);
      this.addProduct = {};
      f.resetForm();      
    }
    
    storeInitialStock(category,brand, product, unit, quantity) {
      this.initial_stock.push({category: category ? category : '',brand: brand ? brand : '', product: product ? product : '', unit: unit ? unit : '',
      quantity: quantity ? quantity : ''});
      this.addProduct.brand = this.addProduct.product = this.addProduct.unit = this.addProduct.quantity = null;
    }
    
    submit_initial_stock(){
      console.log( this.stock );
      this.savingData = true;
      
      
      
      
      console.log(this.ses.users);      
      this.db.post_rqst( {'franchise_id': this.franch_stock.franchise_id,'login_id': this.ses.users.id, 'plan_data': this.plan_data, 'isPlanSelected': this.franch_stock.franchise_plan, 'accessories': this.accessories, 'stock': this.stock } , 'franchises/addInitialStock')
      .subscribe(data => {
        console.log(data);        
        this.savingData = false;
        this.router.navigate(['/franchise-list']);        
      },err => { 
        this.dialog.retry().then((result) => { 
          this.submit_initial_stock();      
          console.log(err); });  
        }); 
      }
      
      getCountryList(){
        this.loading_list = false;
        this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
        .subscribe(data => {
          this.data = data;
          this.countries = this.data.data.countries;
          this.franchiseForm.country_id = 99;
          this.franchiseForm.cors_country_id = 99;  
          this.franchiseForm.ship_country_id = 99;       
          this.getLocations();
          this.getStateList();
          this.loading_list = true;
          console.log(this.data);
        },err => {  this.dialog.retry().then((result) => { 
          this.getCountryList();      
          console.log(err); });  
        }); 
      }
      
      getStateList(){
        this.loading_list = false;
        if(this.franchiseForm.country_id == 99){ 
          this.db.get_rqst('', 'vendors/getStates')
          .subscribe(data => {  
            this.data = data;
            this.states = this.data.data.states;
            this.loading_list = true;  
            console.log("states");
            //console.log(this.data);
            console.log(this.states);
          },err => {  this.dialog.retry().then((result) => { 
            this.getStateList();      
            console.log(err); });  
          });
        }
      }
      getDistrictList(val){
        if(this.franchiseForm.country_id == 99){ 
          this.loading_list = false;
          let st_name;
          if(val == 1)
          {
            st_name = this.franchiseForm.state;
          }
          else if(val == 1)
          {
            st_name = this.franchiseForm.cors_state;
          }
          else
          {
            st_name = this.franchiseForm.ship_state;
          }
          this.db.post_rqst({'state_name':st_name}, 'vendors/getDistrict')
          .subscribe(data => {  
            this.data = data;
            this.loading_list = true;
            if(val == 1)
            {
              this.districts = this.data.data.districts;  
            }
            else if(val == 2)
            {
              this.corr_districts = this.data.data.districts;  
            }
            else
            {
              this.ship_districts = this.data.data.districts;  
            }
            console.log("District");
            console.log(this.data);
            console.log(this.districts);
            console.log(val);
            console.log(this.franchiseForm);
          },err => {  this.dialog.retry().then((result) => { 
            this.getDistrictList(val);      
            console.log(err); });  
          });
        }
      }
      getCityList(val){   
        if(this.franchiseForm.country_id == 99){ 
          this.loading_list = false;
          let dist_name;
          if(val == 1)
          {
            dist_name = this.franchiseForm.district;
          }
          else if(val == 1)
          {
            dist_name = this.franchiseForm.cors_district;
          }
          else
          {
            dist_name = this.franchiseForm.ship_district;
          }
          console.log(dist_name);
          
          this.db.post_rqst({'district_name':dist_name}, 'vendors/getCity')
          .subscribe(data => {  
            this.data = data;
            console.log(this.data);
            
            this.loading_list = true;
            this.cities = this.data.data.cities;
            if(val == 1)
            {
              this.pincodes = this.data.data.pins;  
            }
            else if(val == 2)
            {
              this.corr_pincodes = this.data.data.pins;  
            }
            else
            {
              this.ship_pincodes = this.data.data.pins;  
            }
            console.log("city & pincodes");
            console.log(this.cities);
            console.log(this.pincodes);
          },err => {  this.dialog.retry().then((result) => { 
            this.getCityList(val);      
            console.log(err); });  
          });
        }
      }
      
      
      
      
      numeric_Number(event: any) {
        const pattern = /[0-9\+\-\ ]/;
        let inputChar = String.fromCharCode(event.charCode);
        // console.log(event.keyCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
          event.preventDefault();
        }
      }
      
      
    }
    