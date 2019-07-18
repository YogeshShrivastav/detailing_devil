import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-add-jobcard',
  templateUrl: './add-jobcard.component.html'
})
export class AddJobcardComponent implements OnInit {
  
  JobCardForm: FormGroup;
  technician_arr:any=[];
  v_type_arr:any=[];
  cat_type_arr:any=[];
  plan_name_arr:any=[];
  lead_id:any;
  preventive_id:any='0';
  lead_data:any;
  f_detail:any;
  loading_list = false;
  vehicle_info:any=[];
  franchise_id:any;
  
  constructor(public formBuilder: FormBuilder,public db: DatabaseService,public ses: SessionStorage,private route: ActivatedRoute,private router: Router,public dialog: DialogComponent )
  { 
    this.get_car_company();
    this.JobCardForm = this.formBuilder.group({ });
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
    this.loading_list = true;
      this.lead_id = this.db.crypto(params['id'],false);
      this.preventive_id = this.db.crypto(params['p_id'],false)|| '0';
      console.log(this.preventive_id);
      
      this.franchise_id = this.db.crypto(params['franchise_id'],false) || 0;

      if( this.lead_id)this.getDetail();
      if(this.franchise_id)this.get_data();
    });
  }
  
  get_data(){
    this.db.post_rqst(  {'franchise_id': this.franchise_id }, 'jobcard/getData')
    .subscribe((data:any) => { 
    this.loading_list = false;
    console.log(data);
    this.technician_arr=data.data.tech_data;
    this.v_type_arr=data.data.vehicle_type_data;
    console.log(this.technician_arr);
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_data(); });   });
  }
  
  
  temp :any;
  getDetail(){
    console.log(this.preventive_id);
  console.log(   this.lead_id );
  this.loading_list = true;
    
    this.db.post_rqst(  {'lead_id': this.lead_id, 'f_id': this.preventive_id } , 'franchises/getDetail')
    .subscribe((data:any) => { 
    this.loading_list = false;
      
      this.temp = data;
      console.log(this.temp);
      
      if(this.temp.isExist){
        console.log(this.temp);
        this.lead_data = this.temp.consumer;
        
        if(this.temp.isFExist){
          console.log(this.temp.f_detail);
          this.lead_data.reg_no =  this.temp.f_detail.regn_no;
          this.lead_data.modal_no =  this.temp.f_detail.model;
          this.JobCardForm = this.formBuilder.group({
            isCompany: '',
            date_created: '',
            name: [this.lead_data.first_name+' '+this.lead_data.last_name, Validators.compose([Validators.required])],
            email: this.lead_data.email,
            contact_no: [this.lead_data.phone, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
            address: this.lead_data.address,

            company_name: this.lead_data.company_name || '',
            company_contact_no: this.lead_data.company_contact_no || '',
            gstin: this.lead_data.gstin || '',
            company_address: this.lead_data.company_address || '',

            
            booking_id: '',
            vehicle_type: [this.temp.f_detail.vehicle_type || '', Validators.compose([Validators.required])],
            cat_type: [ this.temp.f_detail.category_type || '', Validators.compose([Validators.required])],
            make:  '',
            modal_no:  this.temp.f_detail.model || '' ,
            color: this.temp.f_detail.color || '',
            year: this.temp.f_detail.year || '',
            reg_no: [ this.temp.f_detail.regn_no || '', Validators.compose([Validators.required])],
            chasis_no:  this.temp.f_detail.chasis_no || '',
            srs: [ this.temp.f_detail.vehicle_condition || '', Validators.compose([Validators.required])],
            services: [[this.temp.f_detail.plan_name], Validators.compose([Validators.required])],
            technician: [ '' ],
            created_by:'',
            cust_id:'',
            isRepainted:  [this.temp.vehicles_info[0].isRepainted == 1 ? true : false ],
            isSingleStagePaint:  [this.temp.vehicles_info[0].isSingleStagePaint == 1 ? true : false ],
            isPaintThickness: [this.temp.vehicles_info[0].isPaintThickness == 1 ? true : false],
            isVehicleOlder: [this.temp.vehicles_info[0].isVehicleOlder == 1 ? true : false ] ,
            isDisclaimer: [this.temp.vehicles_info[0].isDisclaimer == 1 ? true : false ] ,
            registration_no: this.temp.vehicles_info[0].regn_no || ''
          });
          
        }else{
          this.lead_data.reg_no = '';
          this.lead_data.modal_no = '';
        
        this.vehicle_info = this.temp.vehicles_info;
        console.log(this.vehicle_info);
        
        console.log(this.lead_data);
        
        this.JobCardForm = this.formBuilder.group({
          isCompany: '',
          date_created: '',
          name: [this.lead_data.first_name+' '+this.lead_data.last_name, Validators.compose([Validators.required])],
          email: this.lead_data.email,
          contact_no: [this.lead_data.phone, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
          address: this.lead_data.address,

          company_name: this.lead_data.company_name,
          company_contact_no: this.lead_data.company_contact_no,
          gstin: this.lead_data.gstin ? this.lead_data.gstin : '',
          company_address: this.lead_data.company_address,


          booking_id: '',

          vehicle_type: [this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].vehicle_type : this.lead_data.vehicle_type, Validators.compose([Validators.required])],
          cat_type: [ this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].category_type :  this.lead_data.interested_in, Validators.compose([Validators.required])],
          make: this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].make : '',
          modal_no:  this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].model_no : this.lead_data.car_model ,
          color: this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].color : '',
          year: this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].year : '',
          reg_no: [ this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].regn_no : '', Validators.compose([Validators.required])],
          chasis_no: this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].chasis_no : '',
          srs: [ this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].vehicle_condition : '', Validators.compose([Validators.required])],
          services: [[this.lead_data.service_plan_name], Validators.compose([Validators.required])],
          technician: [ this.temp.vehicles_info.length > 0 ? this.temp.vehicles_info[0].technician : ''],
          
          created_by:'',
          cust_id:'',
          isRepainted:  [this.temp.vehicles_info.length > 0 ? (this.temp.vehicles_info[0].isRepainted == 1 ? true : false ) : '' ],
          isSingleStagePaint:  [ this.temp.vehicles_info.length > 0 ? ( this.temp.vehicles_info[0].isSingleStagePaint == 1 ? true : false ) : '' ],
          isPaintThickness: [ this.temp.vehicles_info.length > 0 ? ( this.temp.vehicles_info[0].isPaintThickness == 1 ? true : false ) : ''],
          isVehicleOlder: [ this.temp.vehicles_info.length > 0 ? ( this.temp.vehicles_info[0].isVehicleOlder == 1 ? true : false ) : ''] ,
          isDisclaimer: '' ,

          
          registration_no:  this.temp.vehicles_info.length > 0 ?  this.temp.vehicles_info[0].regn_no : ''
        });

      }
      console.log(this.JobCardForm.value);


        if(this.lead_data.vehicle_type != '')
        {
          this.get_category();
        }
        
        console.log(this.JobCardForm.value.make);
        
        if(this.JobCardForm.value.make){
          console.log('inn');
          
          this.get_car_model();
        }
      }
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getDetail(); });   });
  }
  
  
  get_category(){
    console.log(this.JobCardForm.value.vehicle_type);
    this.loading_list = true;
    this.JobCardForm.value.vehicle_type || [];
    this.plan_name_arr = [];
    this.cat_type_arr =  [];
    this.JobCardForm.value.cat_type || [];
    this.JobCardForm.value.services || [];

    this.db.post_rqst(  {'data':this.JobCardForm.value}, 'jobcard/getCategory')
    .subscribe((data:any) => { 
      console.log(data);
      this.cat_type_arr = data.data.cat_data;
      this.loading_list = false;

    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_category(); });   });
  }


  getPlan(){
    console.log(this.JobCardForm.value.vehicle_type);
    this.loading_list = true;
    this.JobCardForm.value.vehicle_type || '';
    this.JobCardForm.value.cat_type || [];

    for (let j = 0; j < this.plan_name_arr.length; j++) {
      
      if( this.JobCardForm.value.cat_type.findIndex(x=> x == this.plan_name_arr[j].category_type ) > '-1'){

      }else{
        var indx = this.JobCardForm.value.services.findIndex(x=> x == this.plan_name_arr[j].plan_name); 
        if(indx > '-1')
        this.JobCardForm.value.services.splice(indx,1);
      }

    }
    this.db.post_rqst(  {'data':this.JobCardForm.value}, 'jobcard/getPlan')
    .subscribe((data:any) => { 
      console.log(data);

      this.plan_name_arr = data.data.plan_data;
      console.log( this.plan_name_arr );
      this.loading_list = false;
      
      for (let i = 0; i < this.plan_name_arr.length; i++) {

        this.checkService('',this.plan_name_arr[i].category_type);
      }
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_category(); });   });
  }

  plan_disabled = '';
  category_disabled = '';
  checkService(plan_name : any,category_type){

    var count = 0;
    console.log(category_type);
    

    for (let j = 0; j < this.plan_name_arr.length; j++) {
  

      if(category_type == this.plan_name_arr[j].category_type){
        console.log(this.JobCardForm.value.services.findIndex(x=> x == this.plan_name_arr[j].plan_name ));
            var index =  this.JobCardForm.value.services.findIndex(x=> x == this.plan_name_arr[j].plan_name ); 
            if( index  > '-1' ){
              count++;
            this.plan_name_arr[j].disabled = false;
            }else{
              this.plan_name_arr[j].disabled = true;
            }
            console.log( this.JobCardForm.value.services );
      }
   
    }

    for (let j = 0; j < this.plan_name_arr.length; j++) {
      if(category_type == this.plan_name_arr[j].category_type){
          if(count == 0){
            this.plan_name_arr[j].disabled = false;
          }
      }

    }
  }


  
  company_list = [];
  get_car_company(){
    this.loading_list = true;
    
    this.db.post_rqst( '', 'jobcard/get_car_company')
    .subscribe((data:any) => { 
      console.log(data);
      this.company_list=data.data.company_list;
      console.log(this.company_list);
      this.loading_list = false;
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_car_company(); });   });
  }


  car_model_list = [];
  get_car_model(){
    this.loading_list = true;
    
    this.db.post_rqst(    {'company': this.JobCardForm.value.make }, 'jobcard/car_model_list')
    .subscribe((data:any) => { 
      console.log(data);
  
      this.car_model_list=data.data.car_model_list;
      console.log(this.car_model_list);
      this.loading_list = false;
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_car_model(); });   });
  }
  
  
  change_vehicle(){

    if(this.JobCardForm.value.registration_no == 'Add New'){
                
      this.JobCardForm.patchValue({
        vehicle_type: [],
        cat_type: [],
        make: '',
        modal_no: '',      
        color: '',      
        year: '',      
        reg_no: '',      
        chasis_no:'',      
        srs: '',      
        technician: [],  
        services: [],  
        registration_no : ''
      });

        return;
    }
    console.log(this.JobCardForm.value.registration_no);
    let i  = this.vehicle_info.reduce((results, item, index) => {
      if (item.regn_no == this.JobCardForm.value.registration_no) results = index;
      return results;
    }, []);
        
    this.JobCardForm.patchValue({
      vehicle_type: this.temp.vehicles_info[i].vehicle_type,
      cat_type: this.temp.vehicles_info[i].category_type || [],
      make: this.temp.vehicles_info[i].make,
      modal_no: this.temp.vehicles_info[i].model_no,      
      color: this.temp.vehicles_info[i].color,      
      year: this.temp.vehicles_info[i].year,      
      reg_no: this.temp.vehicles_info[i].regn_no,      
      chasis_no: this.temp.vehicles_info[i].chasis_no,      
      srs: this.temp.vehicles_info[i].vehicle_condition,      
      technician: this.temp.vehicles_info[i].technician,  
      registration_no : this.temp.vehicles_info[i].regn_no
    });
    console.log(this.JobCardForm.value);
  }
  
savingData = false;

  submit_form(){
    console.log(this.JobCardForm.value);
    console.log(this.ses.users.id);
    
    if(this.JobCardForm.invalid)
    {
      this.JobCardForm.get('name').markAsTouched();
      this.JobCardForm.get('vehicle_type').markAsTouched();
      this.JobCardForm.get('cat_type').markAsTouched();
      this.JobCardForm.get('reg_no').markAsTouched();
      this.JobCardForm.get('srs').markAsTouched();
      this.JobCardForm.get('services').markAsTouched();
      return;
    }

    this.JobCardForm.value.created_by = this.ses.users.id;
    this.JobCardForm.value.cust_id = this.lead_id;
    this.JobCardForm.value.preventive_id = this.preventive_id || '0';
    
    this.JobCardForm.value.modal_no =  this.JobCardForm.value.modal_no || '';
    this.JobCardForm.value.make =  this.JobCardForm.value.make || '';
    this.JobCardForm.value.cat_type =  this.JobCardForm.value.cat_type > 0 ? this.JobCardForm.value.cat_type : [];
    this.JobCardForm.value.color =  this.JobCardForm.value.color || '';
    this.JobCardForm.value.year =  this.JobCardForm.value.year || '';
    this.JobCardForm.value.services =  this.JobCardForm.value.services.length > 0 ? this.JobCardForm.value.services :  [];
    this.JobCardForm.value.srs =  this.JobCardForm.value.srs || '';
    this.JobCardForm.value.chasis_no =  this.JobCardForm.value.chasis_no || '';
    this.JobCardForm.value.technician =  this.JobCardForm.value.technician > 0 ? this.JobCardForm.value.technician : [];

    this.JobCardForm.value.isRepainted =  this.JobCardForm.value.isRepainted || '';
    this.JobCardForm.value.isSingleStagePaint =  this.JobCardForm.value.isSingleStagePaint || '';
    this.JobCardForm.value.isPaintThickness =  this.JobCardForm.value.isPaintThickness || '';
    this.JobCardForm.value.isVehicleOlder =  this.JobCardForm.value.isVehicleOlder || '';
    this.JobCardForm.value.isDisclaimer =  this.JobCardForm.value.isDisclaimer || '';
    this.JobCardForm.value.isCompany =  this.JobCardForm.value.isCompany || '';
    this.JobCardForm.value.date_created =  this.JobCardForm.value.date_created  ? this.db.pickerFormat( this.JobCardForm.value.date_created )  : '';

    console.log(this.JobCardForm.value);
    console.log(this.JobCardForm.value.services);

    this.db.insert_rqst( {'temp':this.JobCardForm.value,'cat_ype':this.JobCardForm.value.cat_type, 'services': this.JobCardForm.value.services, 'technician': this.JobCardForm.value.technician}, 'jobcard/save')
    .subscribe(data => {
    this.loading_list = false;
    this.savingData = false;

    if(data['data'].msg == 'NOT' ){
      this.dialog.warning('Date Created is Less than last Job creaed! ');
        return;
    }
      console.log(data['data'].id);
    if(data['data']){

    
        this.router.navigate(['/franchise/customer_jobcard-detail/'+this.db.crypto(this.franchise_id)+'/'+this.db.crypto(this.lead_id)+'/'+this.db.crypto(data['data'].id)]);
    }else{
      this.dialog.error('Somthing went wrong');
    } 
     
    
    
  },err => {  this.loading_list = false; this.savingData = false; this.dialog.retry().then((result) => { });   });  
  }
  
}
