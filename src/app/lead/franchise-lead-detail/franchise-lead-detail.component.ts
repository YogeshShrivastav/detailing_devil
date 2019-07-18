import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import { ConvertFranchiseComponent } from '../convert-franchise/convert-franchise.component';
import { AddFranchiseLocationComponent } from '../franchise-location-add/add-franchise-location.component';
import { CreateFollowupComponent } from '../../followup/create-followup/create-followup.component';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './franchise-lead-detail.component.html'
})
export class FranchiseLeadDetailComponent implements OnInit {
  form: any = {};
  data: any = [];
  myControl: FormControl;
  formData: any = {};
  lead_id;
  lead: any = [];
  countries: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  pincodes: any = [];
  follow_ups: any = [];
  cnt_id:any;
  loading_list = false;
  enable_contact = false;
  enable_email = false;
  enable_address = false;
  enable_country = false;
  enable_state = false;
  enable_city = false;
  enable_district = false;
  enable_pin_code = false;
  enable_company_name = false;
  enable_business_type = false;
  enable_business_loc = false;
  enable_year_of_est = false;
  enable_city_apply_for = false;
  enable_automotive_exp = false;
  enable_source = false;
  enable_profile = false;
  enable_user_assign = false;
  enable_name:any = false;
  mode: any = '1';
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
              public matDialog: MatDialog,  public dialog: DialogComponent) {
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.lead_id = this.db.crypto(params['id'] ,false);
    
    if (this.lead_id) { this.getLeadDetails(this.lead_id); }
    this.getUserList();

  });
  }


  user_list=[];
  getUserList(){
    this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
    .subscribe(data => {
      this.data = data;
      console.log(this.data);
      this.user_list = this.data.data.user;      
      console.log(this.user_list);
      this.loading_list = true;
    },err => {  this.dialog.retry().then((result) => { this.getUserList(); });   });
  }




  openConvertFranchiseDialog() {
    console.log(this.lead.location_id );
    
    if(this.lead.location_id == '0'){
    
      const dialogRef = this.matDialog.open(AddFranchiseLocationComponent,{
        data: {
          type: 'franchise' , l_id: this.lead_id,country_id: this.lead.country_id
        }
      }); 
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
        if(result){
          this.router.navigate(['/franchise-convert/'+this.db.crypto(this.lead_id)]);
          // this.openConvertFranchiseDialog1();
        }
        this.getLeadDetails(this.lead_id);
      });

    }else{
      this.router.navigate(['/franchise-convert/'+this.db.crypto(this.lead_id)]);
      
    }
    
  }

  openConvertFranchiseDialog1() {    
    const dialogRef1 = this.matDialog.open(ConvertFranchiseComponent,{
      data: {
        type: 'franchise' , l_id: this.lead_id
      }
    }); 
    dialogRef1.afterClosed().subscribe(result => {
      this.getLeadDetails(this.lead_id);
    });
   
  }

  openCreateFollowupDialog(status:any='') {


    const dialogRef = this.matDialog.open(CreateFollowupComponent, {
      data: {
        type: 'franchise' , l_id: this.lead_id, status: status
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result) {
        //  this.getLeadDetails(this.lead_id);
      // }
      this.getLeadDetails(this.lead_id);

    });



  }
  
  getConsumerFormOptions() {
    this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
      .subscribe(data => {
        this.data = data;
        //this.vehicle_types = this.data.data.vehicle_types;
        this.countries = this.data.data.countries;       
      },err => {  this.dialog.retry().then((result) => { this.getConsumerFormOptions(); });   });
    //console.log(this.countries);
    this.loading_list = true;
  }

  agent_assign:any = [];
  remarks:any = [];
  previous_status: any = '';
  follow_ups_status: any = '';
  
  getLeadDetails(lead_id) {
    this.loading_list = false;
    this.follow_ups_status =   this.previous_status;
    this.db.get_rqst(  '', 'franchise_leads/details/' + lead_id)
      .subscribe(data => {
        this.data = data;
        this.lead = this.data.data.lead;
        this.follow_ups = this.data.data.follow_ups;
        this.agent_assign = this.data.data.agent_assign;
        this.remarks = this.data.data.remarks;
        console.log( this.remarks );

        this.previous_status = this.lead.lead_status;

        console.log('leadsdata');        
        console.log(this.data);
        console.log(this.data.data.lead.country_id);
       
        this.getConsumerFormOptions();
        this.lead.country=parseInt(this.data.data.lead.country_id);
        this.cnt_id=this.data.data.lead.country_id;
        this.lead.pin=parseInt(this.data.data.lead.pincode);
        if(this.data.data.lead.country_id == '99'){
          //this.getCountryList();
          this.getStateList();
          this.getDistrictList(); 
          this.getCityList();
        }
        // if(this.lead) {
          this.loading_list = true;
        // }
      },err => {  this.dialog.retry().then((result) => { this.getLeadDetails(lead_id); });   });
  }

  assignSalesAgent() {
    this.formData.remark = this.lead.remark ? this.lead.remark : '';
    this.formData.user_assign = this.agent_assign.length ? this.agent_assign : [];
    this.formData.user_id = this.ses.users.id;
    this.formData.l_id = this.lead_id;
    this.db.insert_rqst(this.formData, 'franchise_leads/franchiseAssignSalesAgent').subscribe(data => {

      this.getLeadDetails(this.lead_id);
      this.loading_list = true;
      this.enable_user_assign = false;
    },err => {  this.dialog.retry().then((result) => { });   });
  }

  updateLead() {
    this.loading_list = false;
    this.formData.l_id = this.lead_id;
    this.formData.contact_no = this.lead.contact_no ? this.lead.contact_no : '';
    this.formData.email = this.lead.email_id ? this.lead.email_id : '';
    this.formData.address = this.lead.address ? this.lead.address : '';
    this.formData.country = this.lead.country ? this.lead.country : '';
    this.formData.state = this.lead.state ? this.lead.state : '';
    this.formData.city = this.lead.city ? this.lead.city : '';
    this.formData.district = this.lead.district ? this.lead.district : '';
    this.formData.pincode = this.lead.pin ? this.lead.pin : '';
    this.formData.company_name = this.lead.company_name ? this.lead.company_name : '';
    this.formData.contact_no = this.lead.contact_no ? this.lead.contact_no : '';
    this.formData.business_type = this.lead.business_type ? this.lead.business_type : '';
    this.formData.profile = this.lead.profile ? this.lead.profile : '';
    this.formData.name = this.lead.name ? this.lead.name : '';
    this.formData.user_assign =  '';
    this.formData.business_loc = this.lead.business_loc ? this.lead.business_loc : '';
    this.formData.city_apply_for = this.lead.city_apply_for ? this.lead.city_apply_for : '';
    this.formData.year_of_est = this.lead.year_of_est ? this.lead.year_of_est : '';
    this.formData.automotive_exp = this.lead.automotive_exp ? this.lead.automotive_exp : '';
    this.formData.source = this.lead.source ? this.lead.source : '';
    this.formData.user_id = this.ses.users.id;
    console.log(this.formData);
    this.db.post_rqst(this.formData, 'franchise_leads/update/'+ this.db.datauser.id ).subscribe(data => {
   
 
   
      this.loading_list = true;

      if(data['data'].msg == 'Success' ){
        this.dialog.success('Successfully updated!');
        this.disableFilelds();
        this.getLeadDetails(this.lead_id);
        
      }else if(data['data'].msg == 'Exist' ){
        this.dialog.error('contact no. already exists');
      
      }else{
          this.dialog.error('Problem occured ');
          
      }

      },err => { this.loading_list = true; this.dialog.retry().then((result) => { this.updateLead( ); });   });
  }
  disableFilelds() {
    this.enable_contact = false;
    this.enable_email = false;
    this.enable_address = false;
    this.enable_country = false;
    this.enable_state = false;
    this.enable_city = false;
    this.enable_district = false;
    this.enable_pin_code = false;
    this.enable_company_name = false;
    this.enable_business_type = false;
    this.enable_business_loc = false;
    this.enable_year_of_est = false;
    this.enable_city_apply_for = false;
    this.enable_automotive_exp = false;
    this.enable_source = false;
    this.enable_profile = false;
    this.enable_name = false;
  }

  deleteLead(l_id) {
    this.dialog.delete('Lead').then((result) => {
      if(result) {
    this.loading_list = false;

        this.db.post_rqst({l_id: l_id}, 'franchise_leads/remove')
          .subscribe(data => {
            this.data = data;
            this.loading_list = true;
            if (this.data.data.r_lead) { this.router.navigate(['leads']); }
          },err => {  this.dialog.retry().then((result) => { this.deleteLead(l_id); });   });
      }
    });
  }


  updateFranchiseLeadStatus(status) {

    console.log( this.lead.previous_status );
    console.log( this.lead.status );
    
    
    this.loading_list = false;
    this.formData.l_id = this.lead_id;
    this.formData.lead_status = status;
    this.formData.login_id = this.db.datauser.id;
    this.db.post_rqst(this.formData, 'franchise_leads/status/update')
      .subscribe(data => {
        this.data = data;
        this.loading_list = true;
        this.getLeadDetails(this.lead_id);
        // this.openCreateFollowupDialog(status);
      },err => { this.loading_list = true; this.dialog.retry().then((result) => { this.updateFranchiseLeadStatus(status); });   });
  }

  numeric_Number(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    // console.log(event.keyCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  getCountryList(){
    this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getcountry')
    .subscribe(data => {
      this.data = data;
      this.loading_list = true;
      this.countries = this.data.data.countries;
      if(this.data.data.lead.country_id = 99){
        this.getStateList();
      }
      //console.log(this.data);
    },err => {  this.dialog.retry().then((result) => { this.getCountryList(); });   });
  }

  getStateList(){

    if(this.lead.country == 99){ 
      this.loading_list = false;
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
    if(this.lead.country == 99){
      this.loading_list = false; 
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
    if(this.lead.country == 99){ 
      this.loading_list = false;
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
  
}
