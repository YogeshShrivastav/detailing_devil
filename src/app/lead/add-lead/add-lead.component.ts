import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';
import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';


@Component({
  selector: 'app-add-lead',
  templateUrl: './add-lead.component.html'
})
export class AddLeadComponent implements OnInit {
  franchiseForm: any = {};
  consumerForm: any = {};
  data: any = [];
  myControl: FormControl;
  nexturl: any;
  temp: any;
  savingData = false;
  loading_list = true;
  formData: any = {};
  type: string;
  lead_type: string;
  country_id;
  //countries: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  //cities: Observable<any[]>;
  pincodes: any = [];
  locations: any = [];
  vehicle_types: any = [];
  service_plans: any = [];
  typeurl: any ='';
  constructor(public db: DatabaseService, private route:   ActivatedRoute,
              private router: Router,  public dialog: DialogComponent, public ses: SessionStorage) { 
                this.franchiseForm.country_id = 99;
                this.consumerForm.country_id = 99;
                this.consumerForm.company_country_id = 99;
              }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.typeurl = params['type'];
      
      
      if (this.typeurl=='consumer') {
      this.lead_type='consumer'; 
      this.changeLeadType('consumer'); 
      }

      if(this.db.datauser.access_level == 5 || this.db.datauser.access_level == 6 ){
      this.lead_type='consumer'; 
      this.changeLeadType('consumer'); 
      }

      this.getCountryList();      
      this.getUserList();      
      this.getCompanyCountryList();

    });
  }



  changeLeadType(type) {
    this.loading_list=false;
    this.lead_type = type;
    console.log(this.lead_type);
    this.getConsumerFormOptions();
    this.loading_list=true;
    this.getFranchiseList();
  }


  getConsumerFormOptions() {
    this.loading_list=false;
    if(this.lead_type === 'consumer') {
      this.db.get_rqst( '', 'consumer_leads/form_options/get')
        .subscribe(data => {
          this.data = data;
          this.loading_list=true;
          this.vehicle_types = this.data.data.vehicle_types;
          this.countries = this.data.data.countries;
          this.getStateList();
          this.getCompanyStateList();
          this.ddgetUserList();

          //console.log(this.data);
        },err => {  this.dialog.retry().then((result) => { this.getConsumerFormOptions(); });   });  
    }else{
      this.db.get_rqst( '', 'consumer_leads/form_options/get')
        .subscribe(data => {
          this.data = data;
          this.loading_list=true;
          //this.vehicle_types = this.data.data.vehicle_types;
          this.countries = this.data.data.countries;          
          this.getStateList();
          this.getUserList();
          this.ddgetUserList();
          //console.log(this.data);
        },err => {  this.dialog.retry().then((result) => { this.getConsumerFormOptions(); });   }); 
    }
  }

  getServicePlan(vehicle_type) {
    console.log(vehicle_type);
    this.loading_list=false;
    this.db.get_rqst( '', 'consumer_leads/service_plans/get?v_type=' + vehicle_type)
      .subscribe(data => {
        this.data = data;
        this.service_plans = this.data.data.service_plans;
        console.log(  this.service_plans);
        this.loading_list=true;
      },err => {  this.dialog.retry().then((result) => { this.getServicePlan(vehicle_type); });   });
  }

  franch_user_assign:any = [];
  saveFranchiseLead(form:any) {
    this.savingData = true;
    console.log(form);    
    const tmp = new ConvertArray().transform( form._directives);
    tmp.user_id = this.ses.users.id;
    console.log( tmp );   
    this.db.post_rqst( {'tmp': tmp }, 'franchise_leads/save')
      .subscribe(data => {
        this.temp = data;
        this.savingData = false;
        if (this.temp.data.msg=='Success') {
            if(this.franch_user_assign.length > 0){
              this.assignFranvhiseSalesAgent(this.temp.data.lead);
            }else{
              this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/leads';
              this.router.navigate([this.nexturl]);
            }
          this.dialog.success('Lead added successfully ');
            
        } else  if (this.temp.data.msg=='Exist'){
          this.dialog.error('Lead with same contact no. already exists');
        }else{
          this.dialog.error('something went wrong');
        }
      },err => {  this.dialog.retry().then((result) => { this.saveFranchiseLead(form); });   });
  }


  
  assignFranvhiseSalesAgent(id) {
    this.franchiseForm.remark = 'Self Created';
    this.franchiseForm.user_assign = this.franch_user_assign ? this.franch_user_assign : [];
    this.franchiseForm.user_id = this.ses.users.id;
    this.franchiseForm.l_id = id;
    this.savingData = true;

    this.db.insert_rqst(this.franchiseForm, 'franchise_leads/franchiseAssignSalesAgent').subscribe(data => {
    this.savingData = false;
    this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/leads';
    this.router.navigate([this.nexturl]);

  },err => {  this.savingData = false; this.dialog.retry().then((result) => { });   });
  }

  
  consumer_user_assign:any = [];

  saveConsumerLead(f:any) {


    this.savingData = true;      
    const tmp = new ConvertArray().transform( f._directives);
    tmp.user_id = this.ses.users.id;
    tmp.access_level = this.ses.users.access_level;
    this.consumerForm.franchise_sales_manager_assign = this.consumerForm.franchise_sales_manager_assign || '';
    if(tmp.franchise_id){    
      tmp.location_id = this.franchise_list.filter((x) => x.id === tmp.franchise_id)[0].location_id;
    }else{
      tmp.location_id = 0;
    }

  if(this.db.datauser.access_level == 6){
  this.consumerForm.franchise_sales_manager_assign = this.db.datauser.id;
}

    tmp.type = 1;
    console.log( tmp );

    this.db.post_rqst( {'tmp':tmp } , 'consumer_leads/save')
      .subscribe(data => {
        this.temp = data;
        this.savingData = false; 
        if (this.temp.data.msg=='Success') {
     
              if(this.db.datauser.franchise_id){
                  this.nexturl = '/franchise-leads/'+this.db.datauser.franchise_id;
                  if( this.consumerForm.franchise_sales_manager_assign ){
                    this.assignFranchiseSalesAgent(this.temp.data.lead);
                  }else{
                    this.router.navigate([this.nexturl]);
                  }

              }else{
                  this.nexturl = '/leads';
                  if( this.consumer_user_assign.length > 0){
                    this.assignConsumerSalesAgent(this.temp.data.lead);
                  }else{
                    this.router.navigate([this.nexturl]);
                  }
              }
               
     
       
      }else{ 
        this.dialog.error('Lead with same contact no. already exists');
    }
  }
      ,err => {  this.dialog.retry().then((result) => { this.saveConsumerLead(f); });   });
  }



  assignConsumerSalesAgent(id) {
    this.consumerForm.remark = 'Self Created';
    this.consumerForm.user_assign = this.consumer_user_assign ? this.consumer_user_assign : [];
    this.consumerForm.user_id = this.ses.users.id;
    this.consumerForm.l_id = id;
    this.savingData = true;

    this.db.insert_rqst(this.consumerForm, 'franchise_leads/consumerAssignSalesAgent').subscribe(data => {
    this.savingData = false;
    // this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/leads';
    this.router.navigate([this.nexturl]);

  },err => {  this.savingData = false; this.dialog.retry().then((result) => { });   });
  }


  assignFranchiseSalesAgent(id) {
    this.consumerForm.franchise_remark = 'Self Created';
    this.consumerForm.franchise_sales_manager_assign = this.consumerForm.franchise_sales_manager_assign ? this.consumerForm.franchise_sales_manager_assign : '';
    this.consumerForm.user_id = this.ses.users.id;
    this.consumerForm.l_id = id;
    
    this.loading_list = false;
    
    this.db.insert_rqst({'temp':this.consumerForm }, 'consumer_leads/consumerAssignFranchiseSalesAgent').subscribe(data => {

      this.dialog.success('Sales agent assign Successfully!');
    this.router.navigate([this.nexturl]);

      this.loading_list = true;
    },err => {      this.loading_list = true; this.dialog.retry().then((result) => { });   });
  }
  



  numeric_Number(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    // console.log(event.keyCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  
  dduser_list=[];
    ddgetUserList(){
      this.loading_list = false;
      this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
      .subscribe(data => {
        this.data = data;
        console.log(this.data);
        this.dduser_list = this.data.data.user;      
        console.log(this.dduser_list);
        this.loading_list = true;
      },err => {  this.dialog.retry().then((result) => { this.ddgetUserList(); });   });
    }

        
    user_list=[];
    getUserList(){
      this.loading_list = false;
      console.log(this.db.datauser);
      
      this.db.post_rqst( { 'login': this.db.datauser }, 'consumer_leads/franchise_sale_users')
      .subscribe(data => {
        this.data = data;
        // console.log(this.data);
        this.user_list = this.data.data.user;      
        console.log(this.user_list);
        this.loading_list = true;
      },err => {  this.dialog.retry().then((result) => { this.getUserList(); });   });
    }
    

  getCountryList(){
    this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.countries = this.data.data.countries;      
      //this.getStateList();
      //this.getLocations();
      this.loading_list = true;
      //console.log(this.data);
    },err => {  this.dialog.retry().then((result) => { this.getCountryList(); });   });
  }



  getStateList(){
    this.loading_list = false;
    if(this.franchiseForm.country_id == 99 || this.consumerForm.country_id == 99){ 
    this.db.get_rqst('', 'vendors/getStates')
    .subscribe(data => {  
      this.loading_list = true;
      this.data = data;
      this.states = this.data.data.states;  
      console.log("states");
      //console.log(this.data);
      console.log(this.states);
    },err => {  this.dialog.retry().then((result) => { this.getStateList(); });   });
   }
  }


  getDistrictList(){
    this.loading_list = false;
    if(this.franchiseForm.country_id == 99 || this.consumerForm.country_id == 99){ 
    this.db.post_rqst({'state_name':this.franchiseForm.state?this.franchiseForm.state:this.consumerForm.state }, 'vendors/getDistrict')
    .subscribe(data => {  
      this.loading_list = true;
      this.data = data;
      this.districts = this.data.data.districts;  
      console.log("District");
      console.log(this.data);
      console.log(this.districts);
    },err => {  this.dialog.retry().then((result) => { this.getDistrictList(); });   });
   }
  }


  getCityList(){  
    this.loading_list = false; 
    if(this.franchiseForm.country_id == 99 || this.consumerForm.country_id == 99){ 
    this.db.post_rqst({'district_name':this.franchiseForm.district?this.franchiseForm.district:this.consumerForm.district}, 'vendors/getCity')
    .subscribe(data => {  
      this.data = data;
      this.loading_list = true;
      this.cities = this.data.data.cities;
      this.pincodes = this.data.data.pins;  
      console.log("city & pincodes");
      console.log(this.cities);
      console.log(this.pincodes);
    },err => {  this.dialog.retry().then((result) => { this.getCityList(); });   });
   }
  }





  ////////////////////  COMPANY ADDRESS    ///////////////




company_countries:any = [];

  getCompanyCountryList(){
    this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.company_countries = this.data.data.countries;      
      //this.getStateList();
      //this.getLocations();
      this.loading_list = true;
      //console.log(this.data);
    },err => {  this.dialog.retry().then((result) => { this.getCompanyCountryList(); });   });
  }


company_states : any = [];
  getCompanyStateList(){
    this.loading_list = false;
    if(this.franchiseForm.country_id == 99 || this.consumerForm.company_country_id == 99){ 
    this.db.get_rqst('', 'vendors/getStates')
    .subscribe(data => {  
      this.loading_list = true;
      this.data = data;
      this.company_states = this.data.data.states;  
      console.log("states");
      //console.log(this.data);
      console.log(this.company_states);
    },err => {  this.dialog.retry().then((result) => { this.getCompanyStateList(); });   });
   }
  }

  company_districts: any  =[];
  getCompanyDistrictList(){
    this.loading_list = false;
    if(this.franchiseForm.country_id == 99 || this.consumerForm.company_country_id == 99){ 
    this.db.post_rqst({'state_name':this.franchiseForm.state?this.franchiseForm.state:this.consumerForm.company_state }, 'vendors/getDistrict')
    .subscribe(data => {  
      this.loading_list = true;
      this.data = data;
      this.company_districts = this.data.data.districts;  
      console.log("District");
      console.log(this.data);
      console.log(this.company_districts);
    },err => {  this.dialog.retry().then((result) => { this.getCompanyDistrictList(); });   });
   }
  }

  company_cities: any = [];
  company_pincodes: any = [];
  getCompanyCityList(){  
    this.loading_list = false; 
    if(this.franchiseForm.country_id == 99 || this.consumerForm.company_country_id == 99){ 
    this.db.post_rqst({'district_name':this.franchiseForm.district?this.franchiseForm.district:this.consumerForm.company_district}, 'vendors/getCity')
    .subscribe(data => {  
      this.data = data;
      this.loading_list = true;
      this.company_cities = this.data.data.cities;
      this.company_pincodes = this.data.data.pins;  
      console.log("city & pincodes");
      console.log(this.company_cities);
      console.log(this.company_pincodes);
    },err => {  this.dialog.retry().then((result) => { this.getCompanyCityList(); });   });
   }
  }




  //////////////     END   ////////////

  franchise_list:any = [];
  getFranchiseList(){  
    this.loading_list = false; 
    if(this.consumerForm.country_id == 99){ 
    this.db.post_rqst({'pincode':this.consumerForm.pincode}, 'consumer_leads/getFranchise')
    .subscribe(d => {
      this.loading_list = true;
      if(this.db.datauser.franchise_id){
        this.franchise_list = [{'id':this.db.datauser.franchise_id, 'name': this.db.datauser.first_name, 'location_name': this.db.datauser.location_name, 'location_id': this.db.datauser.location_id}]
        this.consumerForm.franchise_id = this.db.datauser.franchise_id;
        this.consumerForm.location_id = this.db.datauser.location_id;
      }else{
        this.franchise_list = d['data'].franchise_list;
      }

      },err => {  this.dialog.retry().then((result) => { this.getFranchiseList(); });   });
   }
  }
  getLocationId()
  {
    this.consumerForm.location_id = this.franchise_list.filter((x) => x.id === this.consumerForm.franchise_id)[0].location_id;

  }
  

}
