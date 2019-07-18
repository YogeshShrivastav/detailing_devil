
import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import * as $ from 'jquery';

@Component({
  selector: 'app-territory-detail',
  templateUrl: './territory-detail.component.html'
})
export class TerritoryDetailComponent implements OnInit {

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
  location_id;  
  locationdetails :any = [];
  pinarrey:any = [];
  stateinput;
  districtinput;
  cityinput;


  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,  public dialog: DialogComponent,public ses: SessionStorage) {           
     
  }
  

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.location_id = params['id'];
    
    if (this.location_id) {
       this.getLocationDetail(this.location_id);
       this.getCountryList();
       this.getFranchiseList();

    } 
  });
    
  }

 

  getLocationDetail(location_id){
    this.loading_list = true; 
    this.db.get_rqst(  '', 'vendors/franchise_consumerlocationDetails/' + location_id)
    .subscribe(data => {
    this.data = data;
  
    this.locationdetails = this.data.data.location;
    this.form.location_name = this.locationdetails['location_name'];
    this.form.assign_to_franchise = this.locationdetails['assign_to_franchise'];
    this.form.country_id = parseInt(this.locationdetails['country_id']);
    this.country_name = this.locationdetails['country_name'];
    if(this.locationdetails['country_id']=='99'){
     this.getStateList();
     this.country_name = "India"; 
     var statearrey = (this.locationdetails['state']).split(",");
   
     var len=statearrey.length;
     for(var i=0;i<len-1;i++){
       if(statearrey[i]){
        //this.storestate(statearrey[i]);
        this.getDistrictList(statearrey[i],true);
       }      
     }

     
          

     var distarrey = (this.locationdetails['district']).split(",");
  
     var len1 = distarrey.length;
     for(var i=0;i<len1-1;i++){
        if(distarrey[i]){
        //this.storedistrict(statearrey[0],distarrey[i]);
        this.getCityList(statearrey[0],distarrey[i],true);
        }      
     }
     
     var cityarrey = (this.locationdetails['city']).split(",");

     var len2 = cityarrey.length;
     for(var i=0;i<len2-1;i++){
        if(cityarrey[i]){
        this.storecity2(cityarrey[i]);        
        }      
     }     
     var pinarrey = (this.locationdetails['pincode']).split(",");

     var len3 = pinarrey.length;
     for(var i=0;i<len3-1;i++){
        if(pinarrey[i]){                   
        this.storepincode(pinarrey[i],true);     
        }      
     }

    }else{
      this.form.state = this.locationdetails['state'];
      this.form.district = this.locationdetails['district'];
      this.form.pincode = this.locationdetails['pincode'];
      this.form.city = this.locationdetails['city'];
    }
    this.loading_list = false;        
    });
    
    

    //this.form.checkboxState = 'ANDAMAN & NICOBAR ISLANDS';
    
}


  getFranchiseList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'vendors/getfranchsielist')
    .subscribe(data => {
      this.data = data;
      this.franchises = this.data.data.franchises; 
      this.loading_list = false;     
    },err => { this.dialog.retry().then((result) => { this.getFranchiseList(); }); });
  }
  getCountryList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.countries = this.data.data.countries;
      if(this.form.country_id == 99)
      {
      this.country_name = "India";
      this.getStateList();
      }
      this.loading_list = false;
    },err => { this.dialog.retry().then((result) => { this.getCountryList(); }); }); 
  }

  

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
      this.loading_list = false;
   
      this.datastateupdate();
    },err => { this.dialog.retry().then((result) => { this.getStateList(); }); }); 
   }
  }

  removeDist(stateinput){
   var x = this.districts.findIndex(items => items.state_name === stateinput);
   if(x  != '-1')this.districts.splice(x, 1);
   var len=this.cities2.length;
   var len2= len;

   if(len > 0){
     for(var ll=0;ll<len;ll++){               
       if(this.cities2[ll].state_name == stateinput){       
         if(this.cities2[ll].city_name){ 
           var y = this.form_citylist.findIndex(items => items.city_name === this.cities2[ll].city_name);
           if(y  != '-1')this.form_citylist.splice(x, 1);
         }        
         var leng = this.cities2[ll].pincodes.length;
         if(leng > 0){
         for(var kk=0;kk<leng;kk++){
          
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

  }
  getDistrictList(stateinput,e){
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

      this.dataupdatedistrict();      
      this.loading_list = false;
    },err => { this.dialog.retry().then((result) => { this.districtList(stateinput); }); }); 
   }
  }



  removeCity(districtinput){

    var len=this.cities2.length;
    for(var ll=0;ll<len;ll++){
    var x = this.cities2.findIndex(items => items.district_name === districtinput);
    if(x  != '-1')this.cities2.splice(x, 1);
    }

   }
   getCityList(stateinp,districtinput,e){
    if(e){
    this.getcitylist(stateinp,districtinput);
    this.storedistrict(stateinp,districtinput);
    }else{
    this.removeCity(districtinput);
    this.removeDistrictListData(districtinput);
    }
  }
  getcitylist(stateinp,districtinput){  
   this.loading_list = true; 
   if(this.form.country_id == 99){ 
   this.db.post_rqst({'district_name':districtinput}, 'vendors/getCity')
   .subscribe(data => {  
     this.data = data;
     //this.cities.push(  { 'city':districtinput,'pincodes':  } ); 
     this.cities = this.data.data.cities;  

     for(var kk=0;kk < this.cities.length;kk++){
      this.getPincodeList(this.cities[kk].city,stateinp,districtinput);  
     }
     this.loading_list = false;
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

       this.dataupdatapincodes();
     
       });
    }
    
  return 1 ;
 }
  
  storestate(state_name) {
    if(state_name) {
        this.form_statelist.push({state_name: state_name});  
 
     }     
  }
  removeStateListData(state_name) {    
    var x = this.form_statelist.findIndex(items => items.state_name === state_name);
    if(x  != '-1')this.form_statelist.splice(x, 1);
   
  } 

  storedistrict(stateinp,district_name) {
    if(district_name) {
        this.form_districtlist.push({'state_name':stateinp,'district_name':district_name});  
   
    }     
  }

  removeDistrictListData(district_name) {
    var x = this.form_districtlist.findIndex(items => items.district_name === district_name);
    if(x  != '-1')this.form_districtlist.splice(x, 1);
  
  } 
  storecity2(city_name)
  {
    this.form_citylist.push({city_name: city_name});  
  }
  storecity(city_name,e,idx) {
    if(city_name) {
      if(e){
        
        this.form_citylist.push({city_name: city_name});
        var pins = this.cities2[idx].pincodes;
     

          for (let index = 0; index < pins.length; index++) {
            this.storepincode( pins[index].pincode, true);

            this.cities2[idx].pincodes[index].pincodeCheck = true;
          }

  
      }else{
        var x = this.form_citylist.findIndex(items => items.city_name === city_name);
        if( x != '-1')this.form_citylist.splice(x, 1);

        var pins = this.cities2[idx].pincodes;

        for (let index = 0; index < pins.length; index++) {
          this.storepincode( pins[index].pincode, false);
          this.cities2[idx].pincodes[index].pincodeCheck = false;          
        }
        

      }             
     }     
  }

  storepincode(pincode,e) {
    if(pincode) {
      if(e){
        this.form_pincodelist.push({pin_code: pincode});  
      }else{
        var x = this.form_pincodelist.findIndex(items => items.pin_code === pincode);
        if(x  != '-1')this.form_pincodelist.splice(x, 1);
      }             
     }     
  }  


  updateLocation(){

    this.form.id= this.location_id;
    this.form.country_name = this.country_name;
    this.form.created_by =  this.ses.users.id;
    this.form.assign_to_franchise = this.form.assign_to_franchise || '';
    if(this.form.country_id == 99){
      this.form.state = this.form_statelist;
      this.form.district = this.form_districtlist;
      this.form.city = this.form_citylist;
      this.form.pincode = this.form_pincodelist;
    }    
    this.db.post_rqst( this.form, 'vendors/updateLocation')
        .subscribe(data => {
            this.temp = data;          
                this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/territory-list';
                this.router.navigate([this.nexturl]);          
          }, error => {
    }); 
    
    
  }

  datastateupdate(){
    for(var i=0;i<this.form_statelist.length;i++){
     for(var ji=0;ji<this.states.length;ji++){
       if(this.form_statelist[i].state_name== this.states[ji].state_name){
         this.states[ji].state_value=true;
       }        
     }
    }
 }

 dataupdatedistrict(){
  for(var i=0;i<this.form_districtlist.length;i++){
   for(var ji=0;ji<this.districts.length;ji++){
     for(var ki=0;ki<this.districts[ji].district.length;ki++){
      if(this.form_districtlist[i].district_name== this.districts[ji].district[ki].district_name){
        this.districts[ji].district[ki].district_value=true;
      }    
     }        
   }
  }
 }

 dataupdatapincodes(){

  for(var i=0;i<this.form_citylist.length;i++){
   for(var ji=0;ji<this.cities2.length;ji++){
     if(this.form_citylist[i].city_name == this.cities2[ji].city_name){
     this.cities2[ji].city_value=true;
    } 
   }
  }


  for(var i=0;i<this.form_pincodelist.length;i++){
    for(var ji=0;ji<this.cities2.length;ji++){
      for(var ki=0;ki<this.cities2[ji].pincodes.length;ki++){
        if(this.form_pincodelist[i].pin_code == this.cities2[ji].pincodes[ki].pincode){
        this.cities2[ji].pincodes[ki].pincode_value=true;
        } 
      }
    }
  }

 }

}
