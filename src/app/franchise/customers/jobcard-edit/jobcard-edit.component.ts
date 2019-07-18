import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';
import { AddJobcardRawmaterialComponent } from '../add-jobcard-rawmaterial/add-jobcard-rawmaterial.component';
import { log } from 'util';

@Component({
  selector: 'app-jobcard-edit',
  templateUrl: './jobcard-edit.component.html',
})
export class JobcardEditComponent implements OnInit {
  
  jc_id;
  customer_id;
  cardplans:any=[];
  cardinvoices: any =[];
  cardraw_material: any = [];
  franchise_id;
  franchise_name;
  loading_list = false;
  detail:any = {};
  tmp:any;
  all_plans:any=[];
  price:any={inv_price:0,gst_price:0,sub_price:0,disc_percent:0,disc_price:0,item_price:0};
  disc_input:boolean=false;
  
  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jc_id = this.db.crypto(params['jc_id'],false);
      this.customer_id = this.db.crypto(params['customer_id'],false);
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      
      this.getCardDeatil();
      this.get_car_company();
      this.getDetail();
      if(this.franchise_id)this.get_data();
    });
  }
  
  getCardDeatil() 
  {
    this.loading_list = true;
    this.db.get_rqst(  '', 'customer/cust_jobcardetail/' + this.customer_id + '/' + this.jc_id)
    .subscribe(d => {
      this.loading_list = false;
      
      this.tmp = d;
      this.detail = this.tmp.detail;  
     
    },err => {  this.dialog.retry().then((result) => { this.getCardDeatil(); console.log(err); }); });
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
      this.get_car_model();
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_car_company(); });   });
  }
  
  // isCompany:any=false;
  // is_company_check(args)
  // {
  //   if(!args)
  //   {
  //     this.db.post_rqst({'jc_id':this.jc_id}, 'jobcard/check_is_company')
  //     .subscribe((data:any) => { 
  //       console.log(data);
  //       if(data == 'Company not exists')
  //       {
  //         this.dialog.error("Company detail does not exist");
  //         this.isCompany = false;
  //         return;
  //       }
  //     },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  });   });
  //   }else{
  //   }
    
  // }
  
  change_vehicle()
  {
    console.log("test");
    
  }

  car_model_list = [];
  get_car_model(){
    this.loading_list = true;
    
    this.db.post_rqst({'company': this.detail.make }, 'jobcard/car_model_list')
    .subscribe((data:any) => { 
      console.log(data);
      
      this.car_model_list=data.data.car_model_list;
      console.log(this.car_model_list);
      this.loading_list = false;
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.get_car_model(); });   });
  }
  
  
  technician_arr:any=[];
  v_type_arr:any=[];
  
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
  
  
  
  lead_data:any;
  vehicle_info:any=[];
  temp :any;
  getDetail(){
    this.loading_list = true;
    
    this.db.post_rqst(  {'lead_id': this.customer_id, 'f_id': 0 } , 'franchises/getDetail')
    .subscribe((data:any) => { 
      this.loading_list = false;
      
      this.temp = data;
      console.log(this.temp);
      
      if(this.temp.isExist){
        console.log(this.temp);
        this.lead_data = this.temp.consumer;
        this.vehicle_info = this.temp.vehicles_info;
      }
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getDetail(); });   });
  }

  update_detail()
  {
    console.log("called");
    console.log(this.detail);
    this.loading_list = true;
    
    this.db.post_rqst({'data':this.detail}, 'jobcard/update_jobCard')
    .subscribe((data:any) => { 
      console.log(data);
      if(data == 'SUCCESS')
      this.dialog.success("Job Card Successfully Updated !");
      this.loading_list = false;
      this.router.navigate(['franchise/customer_jobcard-detail/'+this.db.crypto((this.franchise_id),true)+'/'+this.db.crypto((this.customer_id),true)+'/'+this.db.crypto((this.jc_id),true) ])

      // this.update_detail()
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { ; });   });
  }
}
