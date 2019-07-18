import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../../_services/SessionService';
import { CreateFollowupComponent } from '../../../followup/create-followup/create-followup.component';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
})
export class CustomerEditComponent implements OnInit {

  form: any = {};
  data: any = [];
  myControl: FormControl;
  formData: any = {};
  lead_id;
  lead: any = [];
  follow_ups: any = [];
  vehicle_types: any = [];
  //countries: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  pincodes: any = [];
  
  service_plans: any = [];
  locations: any = []; 
  loading_list = true;
  enable_first_name = false;
  enable_last_name = false;
  enable_phone = false;
  enable_email = false;
  enable_car_model = false;
  enable_address = false;
  enable_message = false;
  enable_service_plan_name = false;
  enable_interested_in = false;
  enable_category = false;
  enable_location = false;
  enable_franchise = false;
  enable_source = false;
  enable_country = false;
  enable_state = false;
  enable_district = false;
  enable_city = false;
  enable_pin_code = false;
  
  enable_company_name = false;
  enable_company_contact_no = false;
  enable_gstin = false;
  enable_company_address = false;
  enable_user_assign = false;
  enable_franchise_sales_manager_assign = false;
  mode: any = '1';
  franchise_id;
  id;
  e_id;
  

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
    }
    ngOnInit() {
      this.route.params.subscribe(params => {
        this.lead_id = this.db.crypto(params['id'],false);
        this.franchise_id = this.db.crypto(params['franchise_id'],false);

        if (this.lead_id) { 
          this.getLeadDetails(this.lead_id);
          this.getConsumerFormOptions();
          this.getUserList();
          this.ddgetUserList();
          this.getCompanyCountryList();
        }
        
      });
     
      
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
    
    franchise_list:any = [];
    getFranchiseList(){  
      this.loading_list = false; 
      this.db.post_rqst({'pincode':this.lead.pincode}, 'consumer_leads/getFranchise')
      .subscribe(data => {  
        this.data = data;
        this.loading_list = true;
        console.log(this.db.datauser);
        
        if(this.db.datauser.franchise_id){
          this.franchise_list = [{'id':this.db.datauser.franchise_id, 'name': this.db.datauser.first_name, 'location_name': this.db.datauser.location_name}]
        }else{
          this.franchise_list = this.data.data.franchise_list;
          
        }
        console.log("*******FRANCHISE LIST******");
        console.log(this.franchise_list);
      },err => {  this.dialog.retry().then((result) => { this.getCityList(); });   });
    }
    
    
    // change_franchise(){
    
    // }

    jobcard_forward(){
          if(this.lead.franchise_id){
            this.router.navigate(['/addjobcard/'+this.lead_id+'/0/'+this.lead.franchise_id]); 
        }else{
            this.dialog.warning('Please Assign Franchise!'); 
        } 
    }
    
    openCreateFollowupDialog(status:any = '') {

      if(status == 'convert'){
            if(this.lead.franchise_id){
                this.router.navigate(['/addjobcard/'+this.lead_id+'/0/'+this.lead.franchise_id]); 
            }else{
                this.dialog.warning('Please Assign Franchise!'); 
                this.getLeadDetails(this.lead_id); 
            } 

        return;
       }

      const dialogRef = this.matDialog.open(CreateFollowupComponent, {
        data: {
          type: 'consumer' , l_id: this.lead_id , status: status
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        // if (result) {   }

        this.getLeadDetails(this.lead_id);

      });
    }
    getConsumerFormOptions() {
      this.loading_list = false;
      this.db.get_rqst( '', 'consumer_leads/form_options/get')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.vehicle_types = this.data.data.vehicle_types;
        // this.countries = this.data.data.countries;
      },err => {  this.dialog.retry().then((result) => { this.getConsumerFormOptions(); });   });
    }
    getServicePlan(vehicle_type) {
      this.loading_list = false;
      this.db.get_rqst( '', 'consumer_leads/service_plans/get?v_type=' + vehicle_type)
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.service_plans = this.data.data.service_plans;
      },err => {  this.dialog.retry().then((result) => { this.getServicePlan(vehicle_type); });   });
    }
    
    agent_assign:any = [];
    remarks:any = [];
    consumers_remarks:any = [];
    getLeadDetails(lead_id) {
      console.log(lead_id);
      
      this.loading_list = false;
      this.db.get_rqst(  '', 'consumer_leads/details/' + lead_id)
      .subscribe(data => {
        console.log(data);
        
        this.data = data;
        this.lead = this.data.data.lead;

        if( !this.lead ){ 
          this.dialog.warning('This Consumer Lead has been Deleted!'); 
          this.router.navigate(['/leads']);
          return;
        }
        this.getServicePlan(this.lead.vehicle_type);        
        this.follow_ups = this.data.data.follow_ups;
        
        this.agent_assign = this.data.data.agent_assign;
        this.remarks = this.data.data.remarks;
        this.consumers_remarks = this.data.data.consumers_remarks;
        
        console.log(this.consumers_remarks );
        
        this.lead.company_country=parseInt(this.data.data.lead.company_country_id);
        this.lead.company_pincode=parseInt(this.data.data.lead.company_pincode);

        this.lead.country=parseInt(this.data.data.lead.country_id);
        this.lead.pin=parseInt(this.data.data.lead.pincode);

        console.log('lead data');        
        console.log(this.lead);
        this.getCountryList(); 
        // this.getLocations();      
        this.getFranchiseList();
        
        if( this.lead.country == 99){
          this.getStateList();
          this.getDistrictList(); 
          this.getCityList();
        }
        this.lead.company_country = this.lead.company_country_id;
        if( this.lead.company_country == 99){
          this.getCompanyStateList();
          this.getCompanyDistrictList(); 
          this.getCompanyCityList();
        }

        console.log(this.data);
        //if(this.lead) {
        this.loading_list = true;
        //}
      },err => {  this.dialog.retry().then((result) => { this.getLeadDetails(lead_id); });   }); 
      
    }
    
    assignFranchiseSalesAgent() {
      this.formData.franchise_remark = this.lead.franchise_remark ? this.lead.franchise_remark : '';
      this.formData.franchise_sales_manager_assign = this.lead.franchise_sales_manager_assign ? this.lead.franchise_sales_manager_assign : '';
      this.formData.user_id = this.ses.users.id;
      this.formData.l_id = this.lead_id;
      
      this.loading_list = false;
      
      this.db.insert_rqst({'temp':this.formData }, 'consumer_leads/consumerAssignFranchiseSalesAgent').subscribe(data => {
        this.enable_user_assign = false;
        this.getLeadDetails(this.lead_id);
        this.mode = '2';

        this.dialog.success('Sales agent assign Successfully!');
        this.loading_list = true;
      },err => {      this.loading_list = true; this.dialog.retry().then((result) => { });   });
    }
    
    
    
    assignSalesAgent() {
      this.formData.remark = this.lead.remark ? this.lead.remark : '';
      this.formData.user_assign = this.agent_assign.length ? this.agent_assign : [];
      this.formData.user_id = this.ses.users.id;
      this.formData.l_id = this.lead_id;
      this.loading_list = false;
      
      this.db.insert_rqst(this.formData, 'franchise_leads/consumerAssignSalesAgent').subscribe(data => {
        this.enable_user_assign = false;
        this.getLeadDetails(this.lead_id);
        this.dialog.success('Sales agent assign Successfully!');
        this.mode = '2';
        this.loading_list = true;
      },err => {      this.loading_list = true; this.dialog.retry().then((result) => { });   });
    }
    
    
    updateLead() {
      this.loading_list = false;
      this.formData.l_id = this.lead_id;
      this.formData.vehicle_type = this.lead.vehicle_type ? this.lead.vehicle_type : '';
      this.formData.service_plan_id = this.lead.service_plan_id ? this.lead.service_plan_id : '';
      this.formData.country_id = this.lead.country ? this.lead.country : '';
      this.formData.state = this.lead.state ? this.lead.state : '';
      this.formData.district = this.lead.district ? this.lead.district : '';
      this.formData.city = this.lead.city ? this.lead.city : '';
      this.formData.pincode = this.lead.pin ? this.lead.pin : '';

      this.formData.company_country_id = this.lead.company_country ? this.lead.company_country : '';
      this.formData.company_state = this.lead.company_state ? this.lead.company_state : '';
      this.formData.company_district = this.lead.company_district ? this.lead.company_district : '';
      this.formData.company_city = this.lead.company_city ? this.lead.company_city : '';
      this.formData.company_pincode = this.lead.company_pincode ? this.lead.company_pincode : '';
      
      this.formData.franchise_id = this.lead.franchise_id ? this.lead.franchise_id : '';
      
      if(this.formData.franchise_id){
        this.formData.location_id = this.franchise_list.filter((x) => x.id === this.formData.franchise_id)[0].location_id;
      }else{
        this.formData.location_id = 0;
      }
      
      this.formData.source = this.lead.source ? this.lead.source : '';
      this.formData.interested_in = this.lead.interested_in ? this.lead.interested_in : '';
      this.formData.category = this.lead.category ? this.lead.category : '';
      this.formData.first_name = this.lead.first_name ? this.lead.first_name : '';
      this.formData.last_name = this.lead.last_name ? this.lead.last_name : '';
      this.formData.phone = this.lead.phone ? this.lead.phone : '';
      this.formData.email = this.lead.email ? this.lead.email : '';
      this.formData.car_model = this.lead.car_model ? this.lead.car_model : '';
      this.formData.address = this.lead.address ? this.lead.address : '';
      this.formData.message = this.lead.message ? this.lead.message : '';
      
      this.formData.company_name = this.lead.company_name ? this.lead.company_name : '';
      this.formData.company_contact_no = this.lead.company_contact_no ? this.lead.company_contact_no : '';
      this.formData.gstin = this.lead.gstin ? this.lead.gstin : '';
      this.formData.company_address = this.lead.company_address ? this.lead.company_address : '';
      this.formData.franchise_sales_manager_assign = this.lead.franchise_sales_manager_assign ? this.lead.franchise_sales_manager_assign : '';
      
      this.formData.user_id = this.ses.users.id;
      console.log(this.formData);
      this.db.post_rqst(this.formData, 'consumer_leads/update_customer').subscribe(data => {
        this.loading_list = true;
        console.log(data);
        if(data == 'COMPANY DETAILS REQUIRE')
        {
          this.dialog.error('COMPANY DETAILS REQUIRED');
          return;
        }
        
        if(data['data'].msg == 'Success' ){
          this.dialog.success('Successfully updated!');
          this.disableFilelds();
          this.getLeadDetails(this.lead_id);
          this.router.navigate(['franchise/customer_details/'+ this.db.crypto(this.franchise_id) + '/'+ this.db.crypto(this.lead_id) ]);
        }else if(data['data'].msg == 'Exist' ){
          this.dialog.error('contact no. already exists');
        
        }else{
            this.dialog.error('Problem occured ');
            
        }
      },err => {  this.loading_list = true; this.dialog.retry().then((result) => { this.updateLead(); });   }); 
      
      
    }
    
    
    disableFilelds() {
      this.enable_first_name = false;
      this.enable_last_name = false;
      this.enable_phone = false;
      this.enable_email = false;
      this.enable_car_model = false;
      this.enable_address = false;
      this.enable_message = false;
      this.enable_service_plan_name = false;
      this.enable_interested_in = false;
      this.enable_category = false;
      this.enable_location = false;
      this.enable_franchise = false;
      this.enable_source = false;
      this.enable_country = false;
      this.enable_state = false;
      this.enable_district = false;
      this.enable_city = false;
      this.enable_pin_code = false;
      
      this.enable_company_name = false;
      this.enable_company_contact_no = false;
      this.enable_gstin = false;
      this.enable_company_address = false;
      this.enable_franchise_sales_manager_assign = false;
      this.enable_user_assign = false;
    }
    
    deleteLead(l_id) {
      this.dialog.delete('Lead').then((result) => {
        if (result) {
      this.loading_list = false;

          this.db.post_rqst({l_id: l_id}, 'consumer_leads/remove')
          .subscribe(data => {
            this.data = data;
            this.loading_list = true;
            if (this.data.data.r_lead) { this.router.navigate(['leads']); }
          },err => {  this.dialog.retry().then((result) => { this.deleteLead(l_id); });   }); 
        }
      });
    }
    
    updateConsumerLeadStatus(status) {
      this.formData.l_id = this.lead_id;
      this.formData.login_id = this.db.datauser.id;
      this.formData.lead_status = status;
      this.loading_list = false;
      if(status == 'booked'){
        this.openCreateFollowupDialog();
      }
      this.db.post_rqst(this.formData, 'consumer_leads/status/update')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        
        // this.getLeadDetails(this.lead_id);
      },err => {  this.dialog.retry().then((result) => { this.updateConsumerLeadStatus(status); });   }); 
    }
    
    create_job_card(){
      this.db.set_fn(this.lead);
      this.router.navigate(['addjobcard/'+ this.db.crypto(this.lead_id)]);
    }
    
    list_job_card(){
      this.router.navigate(['listjobcard/'+ this.db.crypto(this.lead_id)]);
    }
    
    numeric_Number(event: any) {
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
      // console.log(event.keyCode);
      if (event.keyCode != 8 && !pattern.test(inputChar)) {
        event.preventDefault();
      }
    }



    /////////////    COMPANY   ADDRESS    /////////////////
    

    company_countries : any = [];
    company_states : any = [];
    company_districts : any = [];
    company_cities : any = [];
    company_pincodes : any = [];
    

    getCompanyCountryList(){
      this.loading_list = false;
      this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.company_countries = this.data.data.countries;
        console.log(data);
        console.log(this.lead.company_countries);
        
        if( this.lead.compant_country= 99){
          this.getCompanyStateList();
        }
        //console.log(this.data);
      },err => {  this.dialog.retry().then((result) => { this.getCompanyCountryList(); });   }); 
    }
    
    getCompanyStateList(){
      this.loading_list = false;
      if(this.lead.country == 99){ 
        this.db.get_rqst('', 'vendors/getStates')
        .subscribe(data => {  
          this.data = data;
          this.loading_list = true;
          this.company_states = this.data.data.states;  
          console.log("states");
          //console.log(this.data);
          console.log(this.company_states);
        },err => {  this.dialog.retry().then((result) => { this.getCompanyStateList(); });   });
      }
    }

    getCompanyDistrictList(){
      this.loading_list = false;
      if(this.lead.company_country == 99){ 
        this.db.post_rqst({'state_name':this.lead.company_state}, 'vendors/getDistrict')
        .subscribe(data => {  
          this.data = data;
          this.loading_list = true;
          this.company_districts = this.data.data.districts;  
          console.log("District");
          console.log(this.data);
          console.log(this.company_districts);
        },err => {  this.dialog.retry().then((result) => { this.getDistrictList(); });   });
      }
    }

    getCompanyCityList(){   
      this.loading_list = false;
      if(this.lead.country== 99){ 
        this.db.post_rqst({'district_name':this.lead.company_district}, 'vendors/getCity')
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
    
    


    ////////////////     ADDRESS    ////////////////

    

    

    
    getCountryList(){
      this.loading_list = false;
      this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.countries = this.data.data.countries;
        console.log(data);
        console.log(this.lead.country);
        
        if( this.lead.country= 99){
          this.getStateList();
        }
        //console.log(this.data);
      },err => {  this.dialog.retry().then((result) => { this.getCountryList(); });   }); 
    }
    
    getStateList(){
      this.loading_list = false;
      if(this.lead.country == 99){ 
        this.db.get_rqst('', 'vendors/getStates')
        .subscribe(data => {  
          this.data = data;
          this.loading_list = true;
          this.states = this.data.data.states;  
          console.log("states");
          //console.log(this.data);
          console.log(this.states);
        },err => {  this.dialog.retry().then((result) => { this.getStateList(); });   });
      }
    }
    getDistrictList(){
      this.loading_list = false;
      if(this.lead.country == 99){ 
        this.db.post_rqst({'state_name':this.lead.state}, 'vendors/getDistrict')
        .subscribe(data => {  
          this.data = data;
          this.loading_list = true;
          this.districts = this.data.data.districts;  
          console.log("District");
          console.log(this.data);
          console.log(this.districts);
        },err => {  this.dialog.retry().then((result) => { this.getDistrictList(); });   });
      }
    }
    getCityList(){   
      this.loading_list = false;
      if(this.lead.country== 99){ 
        this.db.post_rqst({'district_name':this.lead.district}, 'vendors/getCity')
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
    
    
    
  }