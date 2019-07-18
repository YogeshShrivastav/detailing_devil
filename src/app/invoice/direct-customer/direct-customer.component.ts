import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import * as moment from 'moment';

import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';



@Component({
  selector: 'app-direct-customer',
  templateUrl: './direct-customer.component.html',
})
export class DirectCustomerComponent implements OnInit {

franchise_id:any = '';

  constructor(public db: DatabaseService, private route: ActivatedRoute,   public dialog: DialogComponent,
     @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<DirectCustomerComponent>) {
    }

  ngOnInit() {
    this.cust_data.ship_country_id = 99;
    this.cust_data.country_id = 99;
    this.ship_getCountryList();
    this.getCountryList();
  }

cust_data:any = {};
loading_list:any = false;
  saveDirectCustomer(f) {
    this.loading_list = true;
   
    this.cust_data = new ConvertArray().transform( f._directives);

    this.cust_data.access_level = this.db.datauser.access_level;
    this.cust_data.created_by = this.db.datauser.id;

    console.log(this.cust_data );
  
    this.db.insert_rqst( {'lead':this.cust_data},'sales/direct_customer')
      .subscribe(d => {
        this.loading_list = false;
        if(d['data'].msg == 'Success' ){
          this.dialogRef.close('true');
          this.dialog.success('Direct Customer Added Successfully!');
        }else if(d['data'].msg == 'Exist' ){
          this.dialog.warning('Direct Customer Already Exist with same Contact No.!');

        }
          
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  });   });
  }



  countries:any = [];
  getCountryList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(d => {
      console.log(d);
      
      this.countries = d['data'].countries;      
      this.getStateList();
      //this.getLocations();
      this.loading_list = false;
      //console.log(this.data);
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getCountryList(); });   });
  }


  states: any = [];
  getStateList(){
    this.loading_list = true;
    if(this.cust_data.country_id == 99 || this.cust_data.country_id == 99){ 
    this.db.get_rqst('', 'vendors/getStates')
    .subscribe(d => {  
      this.loading_list = false;
      this.states = d['data'].states;  
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getStateList(); });   });
   }
  }

  districts:any = [];
  getDistrictList(){
    this.loading_list = true;
    if(this.cust_data.country_id == 99 || this.cust_data.country_id == 99){ 
    this.db.post_rqst({'state_name':this.cust_data.state?this.cust_data.state:this.cust_data.state }, 'vendors/getDistrict')
    .subscribe(d => {  
      this.loading_list = false;
      this.districts = d['data'].districts;  

    },err => {  this.loading_list = false;  this.dialog.retry().then((result) => { this.getDistrictList(); });   });
   }
  }

  cities:any = [];
  pincodes:any = [];
  getCityList(){  
    this.loading_list = true; 
    if(this.cust_data.country_id == 99 || this.cust_data.country_id == 99){ 
    this.db.post_rqst({'district_name':this.cust_data.district?this.cust_data.district:this.cust_data.district}, 'vendors/getCity')
    .subscribe(d => {  
      this.loading_list = false;
      this.cities = d['data'].cities;
      this.pincodes = d['data'].pins;  
    
    },err => {  this.dialog.retry().then((result) => { this.getCityList(); });   });
   }
  }


  /////////////    ghip address    ////////////////////



  

  ship_countries:any = [];
  ship_getCountryList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(d => {
      console.log(d);
      
      this.ship_countries = d['data'].countries;      
      this.ship_getStateList();
      //this.getLocations();
      this.loading_list = false;
      //console.log(this.data);
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.ship_getCountryList(); });   });
  }


  ship_states: any = [];
  ship_getStateList(){
    this.loading_list = true;
    if(this.cust_data.ship_country_id == 99 || this.cust_data.ship_country_id == 99){ 
    this.db.get_rqst('', 'vendors/getStates')
    .subscribe(d => {  
      this.loading_list = false;
      this.ship_states = d['data'].states;  
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.ship_getStateList(); });   });
   }
  }

  ship_districts:any = [];
  ship_getDistrictList(){
    this.loading_list = true;
    if(this.cust_data.ship_country_id == 99 || this.cust_data.ship_country_id == 99){ 
    this.db.post_rqst({'state_name':this.cust_data.ship_state }, 'vendors/getDistrict')
    .subscribe(d => {  
      this.loading_list = false;
      this.ship_districts = d['data'].districts;  

    },err => {  this.loading_list = false;  this.dialog.retry().then((result) => { this.ship_getDistrictList(); });   });
   }
  }

  ship_cities:any = [];
  ship_pincodes:any = [];
  ship_getCityList(){  
    this.loading_list = true; 
    if(this.cust_data.ship_country_id == 99 || this.cust_data.ship_country_id == 99){ 
    this.db.post_rqst({'district_name': this.cust_data.ship_district }, 'vendors/getCity')
    .subscribe(d => {  
      this.loading_list = false;
      this.ship_cities = d['data'].cities;
      this.ship_pincodes = d['data'].pins;  
    
    },err => {  this.dialog.retry().then((result) => { this.ship_getCityList(); });   });
   }
  }




}
