import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';



@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html'
})
export class AddVendorComponent implements OnInit {
  form: any = {};
  data: any = [];
  contactData: any = [];
  vDealData: any = [];
  productslists: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  //cities: any = [];
  cities: Observable<any[]>;
  //pincodes: any = [];
  pincodes: Observable<any[]>;
  myControl: FormControl;
  formData: any = {};
  nexturl: any;
  temp: any;
  sendingData = false;
  loading_list = false;
 
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,  public dialog: DialogComponent,public ses: SessionStorage) {       
    

    
  }

  ngOnInit() {
    this.getCountryList();
    this.getProductlist();
  }

  getProductlist(){ 
  this.loading_list = true;   
  this.db.get_rqst(  '', 'vendors/getProducts')
  .subscribe(data => {  
    this.data = data;
    this.productslists = this.data.data.data; 
    this.loading_list = false;  
    //console.log(this.productslists);
  },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getProductlist(); }); });
  }
  
  getCountryList(){
    this.loading_list = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.countries = this.data.data.countries;
      this.form.country_id = 99;
      this.getStateList();
      this.loading_list = false;
      //console.log(this.data);
    },err => {console.log(err);   this.loading_list = false; this.dialog.retry().then((result) => { this.getCountryList(); }); }); 
  }

  getStateList(){
    if(this.form.country_id == 99){ 
    this.loading_list=true;
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
    if(this.form.country_id == 99){ 
      this.loading_list = true;
    this.db.post_rqst({'state_name':this.form.state}, 'vendors/getDistrict')
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
    if(this.form.country_id == 99){ 
      this.loading_list=true;
    this.db.post_rqst({'district_name':this.form.district}, 'vendors/getCity')
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

  saveVendor() {    
  this.sendingData = true;
  this.formData.name = this.form.company || '';
  this.formData.email = this.form.email || '';
  this.formData.phone = this.form.mobile || '';
  this.formData.landline =  this.form.landline || '';
  this.formData.address = this.form.address || '';  
  this.formData.pin =  this.form.pincode || '';
  this.formData.state = this.form.state || '';
  this.formData.city = this.form.city || '';
  this.formData.district =  this.form.district || '';
  this.formData.country = this.form.country_id || '';
  this.formData.pan =  this.form.pan_no || '';
  this.formData.gst =  this.form.gst_no || '';
  this.formData.created_by =  this.ses.users.id;

  console.log(this.formData);
  console.log(this.form);
  for (let ii = 0; ii < this.productslists.length; ii++) { 
    if(this.productslists[ii].deal==true){
      //console.log(this.productslists[ii].pro_id);
      this.vDealData.push({v_deal: this.productslists[ii].pro_id,name:this.productslists[ii].product_name});
    }    
  }
   if(this.contactData.length)
   {
    if(this.vDealData.length){
      this.loading_list = true;
      this.formData.vcDetailData = this.contactData;
      this.formData.vpDealData = this.vDealData;

      this.db.insert_rqst( this.formData, 'vendors/save')
        .subscribe(data => {
          this.loading_list = false;
          this.sendingData = false;

          if(data['data'].msg == 'Success' ){
            this.dialog.success('Success');
            this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/vendors';
            this.router.navigate([this.nexturl]);
            
          }else if(data['data'].msg == 'Exist' ){
            this.dialog.error('gst no. already exists');
          
          }else{
              this.dialog.error('Problem occured ');
              
          }
            this.temp = data;
            //if (this.temp.data.vendor) {
              
                //console.log(this.nexturl);
            //} else { this.dialog.error( 'Problem occurred! Please Try again'); }
          },err => {console.log(err);  this.sendingData = false; this.loading_list = false; this.dialog.retry().then((result) => {  }); });

      }else { this.dialog.warning('Please checked atleast one Product'); this.sendingData = false; }
    }else { this.dialog.warning('Please Add atleast one Contact Info'); this.sendingData = false; }  

  }




storeVendordetailData(contact_name, mobile1, mobile2) {
  if(contact_name && (mobile1 || mobile2)) {
     if(Number(mobile1) && Number(mobile2)) {
       this.contactData.push({contact_name: contact_name, mobile1: mobile1, mobile2: mobile2});
       this.form.name1 = this.form.mobile1 = this.form.mobile2 = null;
     } else {this.dialog.warning( 'Please Enter a valid Mobile Number');}
   }
   else { this.dialog.warning( 'Please add Contact Name and Mobile to add Vendor Contacts'); }
}
removeVendordetailData(index) {
  this.contactData.splice(index, 1);
} 

MobileNumber(event: any) {
    
  const pattern = /[0-9\+\-\ ]/;
  let inputChar = String.fromCharCode(event.charCode);
  if (event.keyCode != 8 && !pattern.test(inputChar)) {
    event.preventDefault();
  }
}

}