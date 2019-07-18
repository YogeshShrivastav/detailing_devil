import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  // styleUrls: ['./edit-organization.component.scss']
})
export class EditOrganizationComponent implements OnInit {
  data: any = [];
  states: any = [];
  districts: any = [];
  countries: any = [];
  country_id: any ={};
  state: any = [];
  pincodes: any = [];
  cities: any = [];
  sendingData : any = '';
  
  constructor(public db: DatabaseService, public dialog: DialogComponent , private route: ActivatedRoute , public router:Router)          {  }

organization:any = {};

id:any = '';
ngOnInit() {
 
  this.route.params.subscribe(params => {
    this.id = params['id'];
  
  if (this.id) { this.getOrganizationdetail(); }
});
}
loading_list :any = false;
getOrganizationdetail() {
  this.loading_list = true;

  this.db.post_rqst(  {'org_id':this.id}, 'organization/getEdit')
    .subscribe(d => {
      this.organization = d['data'].organization;
      console.log(      this.organization );
      this.getCountryList();
      this.getDistrictList();
      this.organization.pincode = parseInt( this.organization.pincode );
      this.getCityList();
      this.loading_list = false;
    }
    ,err => { this.dialog.retry().then((result) => { this.loading_list = false; this.getOrganizationdetail(); }); });
}

updateUser(f){
  this.loading_list = true;   
  const tmp = new ConvertArray().transform( f._directives);
  tmp.id = this.organization.id;
  this.db.post_rqst(  {'org': tmp  }, 'organization/updateUser')
  .subscribe((d) => { 
    this.loading_list = false;
    if(d['data'].msg == 'Success'){
      this.dialog.success('updated succcesfully');
      console.log( this.file );
      
      if(this.file){
        this.upload_file( this.organization.id );
      }

      this.router.navigate(['/organization']);
      return;

    }else{
      this.dialog.error('Organization Already Exist');
    }

    
  },err => {  this.loading_list = false; this.dialog.retry().then((result) => {   }); });

}




upload_file(id){

  console.log( this.file );
  
        
  if(!this.file.name){
    this.router.navigate(['/organization']);
    return;
  }
  
  
  this.formData.append('org', this.file, this.file.name);

  this.formData.append('org_id', id);
  
  this.db.fileData( this.formData, 'fil')
  .subscribe(d => {  
    this.router.navigate(['/organization']);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => {  }); });
  
}



getCountryList(){
  this.loading_list = true;
  this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
  .subscribe(data => {
    this.data = data;
    this.countries = this.data.data.countries;
    this.getStateList();
    this.loading_list = false;
    //console.log(this.data);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getCountryList(); }); }); 
};
getStateList(){
  this.loading_list=true;
  if(this.organization.country_id == 99){ 
  this.db.get_rqst('', 'vendors/getStates')
  .subscribe(data => {
    this.loading_list= false;  
    this.data = data;
    this.states = this.data.data.states;  
    console.log("states");
    //console.log(this.data);
    console.log(this.states);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getStateList(); }); }); 
 }
}
getDistrictList(){
  if(this.organization.country_id == 99){ 
    this.loading_list = true;
  this.db.post_rqst({'state_name':this.organization.state}, 'vendors/getDistrict')
  .subscribe(data => {  
    this.loading_list = false;
    this.data = data;
    this.districts = this.data.data.districts;  
    console.log("District");
    console.log(this.data);
    console.log(this.districts);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getDistrictList(); }); }); 
 }
}
getCityList(){   
  if(this.organization.country_id == 99){ 
    this.loading_list=true;
  this.db.post_rqst({'district_name':this.organization.district}, 'vendors/getCity')
  .subscribe(data => {  
    this.loading_list=false;
    this.data = data;
    this.cities = this.data.data.cities;
    this.pincodes = this.data.data.pins;  
    console.log("city & pincodes");
    console.log(this.cities);
    console.log(this.pincodes);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getCityList(); }); });
 }
}


formData = new FormData();
file:any = {};
profilefileChange(event) {
  this.file = event.target.files[0], event.target.files[0].name;
  
}



}

