
import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-territory-add',
  templateUrl: './territory-add.component.html'
})
export class TerritoryAddComponent implements OnInit {

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,  public dialog: DialogComponent,public ses: SessionStorage) {           
    this.getCountryList();
    this.getFranchiseList();
  }

  ngOnInit() {
  }

  drop_me:any = '-1';
  form: any = {};
  data: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  cities2: any = [];
  fetchcondition: any = {};
  franchises:any = [];
  //cities: Observable<any[]>;
  pincodes: any = [];
  form_statelist: any = [];
  form_districtlist: any = [];
  form_citylist: any = [];
  form_pincodelist: any =[];
  nexturl: any;
  temp: any;
  country_name;
  loading_list = false;

  getFranchiseList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'vendors/getfranchsielist')
    .subscribe(data => {
      this.data = data;
      this.franchises = this.data.data.franchises; 
      this.loading_list = false;     
      // console.log(this.data);
    },err => { this.dialog.retry().then((result) => { this.getFranchiseList(); }); });
  }
  getCountryList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.countries = this.data.data.countries;
      this.form.country_id = 99;
      this.country_name = "India";
      this.getStateList();
      this.loading_list = false;
      //console.log(this.data);
    },err => { this.dialog.retry().then((result) => { this.getCountryList(); }); }); 
  }
  stateinput;
  districtinput;
  cityinput;

  set_country_name(cn){
    this.country_name=cn;
  }
  getStateList(){    
    if(this.form.country_id == 99){ 
    this.loading_list = true;
    this.db.get_rqst('', 'vendors/getStates')
    .subscribe(data => {  
      this.data = data;
      this.states = this.data.data.states;  
      // console.log("states");
      this.loading_list = false;
      //console.log(this.data);
      // console.log(this.states);
    },err => { this.dialog.retry().then((result) => { this.getStateList(); }); }); 
   }
  }

  removeDist(stateinput){
   var x = this.districts.findIndex(items => items.state_name === stateinput);
   if(x  != '-1')this.districts.splice(x, 1);

       
   var len=this.cities2.length;
   var len2= len;
  //  console.log(this.cities2.length);
   console.log('before');    
  //  console.log(this.cities2);
    
   if(len > 0){

     for(var ll=0;ll<len;ll++){               
      //  console.log(this.cities2[ll].city_name);
      //  console.log(this.cities2[ll].pincodes); 
       if(this.cities2[ll].state_name == stateinput){       
         if(this.cities2[ll].city_name){ 
           var y = this.form_citylist.findIndex(items => items.city_name === this.cities2[ll].city_name);
           if(y  != '-1')this.form_citylist.splice(x, 1);
         }        
         var leng = this.cities2[ll].pincodes.length;
         if(leng > 0){
         for(var kk=0;kk<leng;kk++){
          //  console.log(this.cities2[ll].pincodes[kk].pincode);            
           if(this.cities2[ll].pincodes[kk].pincode){
             var z = this.form_pincodelist.findIndex(items => items.pin_code === this.cities2[ll].pincodes[kk].pincode);
             if(z  != '-1')this.form_pincodelist.splice(x, 1); 
           }
         } 
        }
       }
     }

     
     for(var mm=len-1;mm>=0;mm--){  
       if(this.cities2[mm].state_name == stateinput){      
         var x = this.cities2.findIndex(items => items.state_name === stateinput);
         if(x  != '-1')this.cities2.splice(x, 1);
       }        
     }

   } 
  //  console.log('after');    
  //  console.log(this.cities2);

  }
  getDistrictList(stateinput,e){
    //console.log(e);
    // alert(e);
    if(e){
    this.districtList(stateinput);
    this.storestate(stateinput);
    }else{
    this.removeDist(stateinput);
    this.removeStateListData(stateinput);
    }
  }

  districtList(stateinput){    
    this.loading_list = true;
    if(this.form.country_id == 99){ 
    this.db.post_rqst({'state_name':stateinput}, 'vendors/getDistrict')
    .subscribe(data => {  
      this.data = data;
      this.districts.push(  { 'state_name':stateinput, 'district': this.data.data.districts } ); 
      // console.log("District"); 
      // console.log(this.districts);      
      this.loading_list = false;
    },err => { this.dialog.retry().then((result) => { this.districtList(stateinput); }); }); 
   }
  }



  removeCity(districtinput){
    // console.log("before = ");
    // console.log(this.cities2);
    var len=this.cities2.length;
    for(var ll=0;ll<len;ll++){
    var x = this.cities2.findIndex(items => items.district_name === districtinput);
    if(x  != '-1')this.cities2.splice(x, 1);
    }
    // console.log("after=");
    // console.log(this.cities2);
   }
   getCityList(stateinp,districtinput,e){
    //console.log(e);
     //alert(e);
     //console.log(stateinp);
     
    if(e){
    this.getcitylist(stateinp,districtinput);
    this.storedistrict(stateinp,districtinput);
    }else{
    this.removeCity(districtinput);
    this.removeDistrictListData(districtinput);
    }
  }
  getcitylist(stateinp,districtinput){  
   //console.log(districtinput); 
   this.loading_list = true; 
   if(this.form.country_id == 99){ 
   this.db.post_rqst({'district_name':districtinput}, 'vendors/getCity')
   .subscribe(data => {  
     this.data = data;
     //this.cities.push(  { 'city':districtinput,'pincodes':  } ); 
     this.cities = this.data.data.cities;  
     //console.log("city");
     //console.log(this.cities);
     //console.log(this.pincodes);
     //console.log('Length');
    //console.log(this.cities.length);
     for(var kk=0;kk < this.cities.length;kk++){
      //console.log(this.cities[kk].city);
      this.getPincodeList(this.cities[kk].city,stateinp,districtinput);  
     }
     this.loading_list = false;
     //this.getPincodeList(this.cities[0].city);
     });
    }
   }
 
 getPincodeList(cityinput,stet,distic){
   if(this.form.country_id == 99){ 
     this.db.post_rqst({'city_name':cityinput}, 'vendors/getPincodes')
     .subscribe(data => {  
       this.data = data;
       this.cities2.push({ 'state_name':stet,'district_name':distic,'city_name':cityinput,'pincodes': this.data.data.pins } ); 
       this.pincodes = this.data.data.pins;  
      //  console.log("pincodes");
      //  console.log(this.cities2);
       //console.log(this.pincodes);
       });
    }
  return 1 ;
 }
  
  storestate(state_name) {
    if(state_name) {
        this.form_statelist.push({state_name: state_name});  
        // console.log('statelist');
        // console.log(this.form_statelist);     
     }     
  }
  removeStateListData(state_name) {    
    var x = this.form_statelist.findIndex(items => items.state_name === state_name);
    if(x  != '-1')this.form_statelist.splice(x, 1);
    // console.log('removestatelist');
    // console.log(this.form_statelist);
  } 

  storedistrict(stateinp,district_name) {
    if(district_name) {
        this.form_districtlist.push({'state_name':stateinp,'district_name':district_name});  
        // console.log('districtlist');
        // console.log(this.form_districtlist);     
    }     
  }

  removeDistrictListData(district_name) {
    var x = this.form_districtlist.findIndex(items => items.district_name === district_name);
    if(x  != '-1')this.form_districtlist.splice(x, 1);
    // console.log('removedistrictlist');
    // console.log(this.form_districtlist);
  } 

  storecity(city_name,e,idx) {
    if(city_name) {
      if(e){
        
        this.form_citylist.push({city_name: city_name});  

        var pins = this.cities2[idx].pincodes;
        // console.log(pins);

          for (let index = 0; index < pins.length; index++) {
            this.storepincode( pins[index].pincode, true);
            // console.log(pins[index].pincode);
            this.cities2[idx].pincodes[index].pincodeCheck = true;
          }

        // console.log('citylist');
        // console.log(this.form_citylist);
      }else{
        var x = this.form_citylist.findIndex(items => items.city_name === city_name);
        if( x != '-1')this.form_citylist.splice(x, 1);
        // console.log('removecitylist');
        // console.log(this.form_citylist);

        var pins = this.cities2[idx].pincodes;

        for (let index = 0; index < pins.length; index++) {
          this.storepincode( pins[index].pincode, false);
          // console.log(pins[index].pincode);          
          this.cities2[idx].pincodes[index].pincodeCheck = false;          
        }
        

      }             
     }     
  }

  storepincode(pincode,e) {
    // console.log(pincode);
    // console.log(e);
      
    if(pincode) {
      if(e){
        this.form_pincodelist.push({pin_code: pincode});  
        // console.log('citylist');
        // console.log(this.form_pincodelist);
      }else{
        var x = this.form_pincodelist.findIndex(items => items.pin_code === pincode);
        if(x  != '-1')this.form_pincodelist.splice(x, 1);
        // console.log('removecitylist');
        // console.log(this.form_pincodelist);
      }             
     }     
  }
   


  saveLocation(){

    this.form.country_name = this.country_name;
    this.form.created_by =  this.ses.users.id;
    this.form.assign_to_franchise = this.form.assign_to_franchise || '';
    if(this.form.country_id == 99){
      this.form.state = this.form_statelist;
      this.form.district = this.form_districtlist;
      this.form.city = this.form_citylist;
      this.form.pincode = this.form_pincodelist;
    }
    
    // console.log(this.form);
    
    this.db.post_rqst( this.form, 'vendors/savelocation')
        .subscribe(data => {
            this.temp = data;
            //if (this.temp.data.vendor) {
                this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/territory-list';
                this.router.navigate([this.nexturl]);
                //console.log(this.nexturl);
            //} else { this.dialog.error( 'Problem occurred! Please Try again'); }
          },err => { this.dialog.retry().then((result) => { this.saveLocation(); }); }); 
  }

}
