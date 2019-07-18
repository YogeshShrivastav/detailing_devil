import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';
import { AddJobcardRawmaterialComponent } from '../add-jobcard-rawmaterial/add-jobcard-rawmaterial.component';
import { log } from 'util';

@Component({
  selector: 'app-jobcard-detail',
  templateUrl: './jobcard-detail.component.html'
})
export class JobcardDetailComponent implements OnInit {
  
  custid;
  cartid;
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
      this.custid = this.db.crypto(params['id'],false);
      this.cartid = this.db.crypto(params['cardid'],false);
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.franchise_name = this.db.franchise_name;
      
      if( this.cartid && this.custid)  this.getCardDeatil(); 
      if( this.franchise_id)this.get_franchies_prefix(); 
      
    });
  }
  
  discount_per_count(i){
    if( this.all_plans[i].disc_percent > 0 ){
      this.all_plans[i].discount = parseInt( this.all_plans[i].price ) * ( this.all_plans[i].disc_percent / 100);
      this.all_plans[i].discount = this.all_plans[i].discount ? this.all_plans[i].discount.toFixed(2) : 0;
    }else{
      this.all_plans[i].discount = 0 ;
      this.all_plans[i].disc_percent  = 0;
    }
    
    this.cal_gst(i);
    
  }
  
  discount_amt_count(i){
    if(  this.all_plans[i].discount > 0 ){
      this.all_plans[i].disc_percent =   ( this.all_plans[i].discount /  this.all_plans[i].price  ) * 100 ;
      this.all_plans[i].disc_percent =  this.all_plans[i].disc_percent ? this.all_plans[i].disc_percent.toFixed(2) : 0;
      
    }else{
      this.all_plans[i].discount = 0 ;
      this.all_plans[i].disc_percent  = 0;
    }
    
    this.cal_gst(i);
    
    
  }
  
  
  addToCart(){
    console.log( this.detail.freePlan );
    
    for(var l = 0; l < this.all_plans.length; l++)
    {
      if(this.detail.freePlan.indexOf( this.all_plans[l].plan_name ) > '-1'){
        this.all_plans[l].checked = true;
        this.all_plans[l].conted = false;
        this.cal_gst();
        break;
      }
    }
  }
  
  
  item_price:any = 0;
  disc_price:any = 0;
  sub_amount:any = 0;
  gst_price:any =  0;
  inv_price:any =  0;
  igst_price:any  = 0;
  cgst_price:any  = 0;
  sgst_price:any  = 0;
  
  igst_per:any  = 0;
  cgst_per:any  = 0;
  sgst_per:any  = 0;
  dis_per:any  = 0;
  
  i_gst_count:any  = 0;
  c_s_gst_count:any  = 0;
  dis_per_count:any  = 0;
  
  plan_category_array = [];
  plan_cat_count:any = 0;
  all_category_array = [];
  
  cal_gst(i:any = '-1'){
    this.detail.category_type = [];
    this.item_price = 0;
    this.disc_price = 0;
    this.sub_amount = 0;
    this.gst_price = 0;
    this.inv_price  = 0;
    this.igst_price  = 0;
    this.cgst_price  = 0;
    this.sgst_price  = 0;
    this.igst_per  = 0;
    this.cgst_per  = 0;
    this.sgst_per  = 0;
    this.dis_per = 0;
    this.i_gst_count  = 0;
    this.c_s_gst_count  = 0;
    this.dis_per_count  = 0;
    this.plan_category_array = [];
    this.all_category_array = [];
    this.plan_cat_count = 0;
    
    for(var l = 0; l < this.all_plans.length; l++)
    {
      this.all_category_array.push(this.all_plans[l].category_type);
      this.all_category_array = Array.from(new Set(this.all_category_array));
      
      if(this.all_plans[l].checked == false && this.all_plans[l].plan_start_date == '0000-00-00')
      {
        this.plan_category_array.push(this.all_plans[l].category_type);
      }
      
      this.plan_category_array = Array.from(new Set(this.plan_category_array));
      
      if(this.all_plans[l].checked == true && this.all_plans[l].plan_start_date == '0000-00-00')
      {
        
        this.detail.category_type.push(this.all_plans[l].category_type);
        this.detail.category_type = Array.from(new Set(this.detail.category_type))
        
        console.log( this.all_plans[l].extra_discount );
        console.log('0: '+this.all_plans[l].discount);
        console.log('o.1:  '+this.all_plans[l].disc_percent);
        
        this.all_plans[l].extra_discount = this.all_plans[l].extra_discount || 0;
        
        
        if( i =='-1')
        {
          this.all_plans[l].disc_percent -= parseInt( this.all_plans[l].extra_discount ); 
          
          this.all_plans[l].disc_percent += parseInt( this.price.extra_discount  );
          
          console.log('1:  '+this.all_plans[l].disc_percent);
          
          this.all_plans[l].extra_discount = parseInt( this.price.extra_discount );
          
          this.all_plans[l].discount = ( this.all_plans[l].price ) * ( this.all_plans[l].disc_percent  / 100);
          
          console.log('2: '+this.all_plans[l].discount);
          
          this.all_plans[l].discount = this.all_plans[l].discount ? this.all_plans[l].discount.toFixed(2) : 0;
          
          console.log('3: '+this.all_plans[l].discount);
          
        }
        this.all_plans[l].sub_amount =  Math.round( parseInt(this.all_plans[l].price ) -  parseInt( this.all_plans[l].discount ) );
        
        console.log( this.db.franchise_state  );
        console.log( this.detail.state  );
        
        if( this.detail.state == this.db.franchise_state ){
          
          this.all_plans[l].cgst_per = this.all_plans[l].gst/2;
          this.all_plans[l].sgst_per = this.all_plans[l].gst/2;
          this.all_plans[l].igst_per = 0;
          
          if( this.all_plans[l].sgst_per && this.all_plans[l].cgst_per){
            this.c_s_gst_count++;
            this.cgst_per  =    this.cgst_per + this.all_plans[l].sgst_per;
            this.sgst_per  =    this.sgst_per + this.all_plans[l].cgst_per;
          }
          
          this.all_plans[l].cgst_amt = Math.round( this.all_plans[l].sub_amount * ( this.all_plans[l].cgst_per / 100) );
          this.all_plans[l].sgst_amt = Math.round( this.all_plans[l].sub_amount * ( this.all_plans[l].sgst_per / 100) );
          this.all_plans[l].igst_amt = 0;
          
          this.all_plans[l].item_gst_amt = Math.round( this.all_plans[l].cgst_amt +  this.all_plans[l].sgst_amt + this.all_plans[l].igst_amt );
          
          this.all_plans[l].amount = Math.round( this.all_plans[l].cgst_amt +  this.all_plans[l].sgst_amt +  this.all_plans[l].sub_amount );
          
          
          
        }
        else
        {
          this.all_plans[l].cgst_per = 0;
          this.all_plans[l].sgst_per = 0;
          this.all_plans[l].igst_per = this.all_plans[l].gst;
          
          if( this.all_plans[l].igst_per ){
            this.i_gst_count++;
            this.igst_per  = this.igst_per + this.all_plans[l].igst_per;
          }
          
          this.all_plans[l].cgst_amt = 0;
          this.all_plans[l].sgst_amt = 0;
          this.all_plans[l].igst_amt = Math.round( this.all_plans[l].sub_amount * ( this.all_plans[l].igst_per / 100) );
          this.all_plans[l].item_gst_amt = Math.round( this.all_plans[l].cgst_amt +  this.all_plans[l].sgst_amt + this.all_plans[l].igst_amt );
          
          this.all_plans[l].amount = Math.round( this.all_plans[l].igst_amt +  this.all_plans[l].sub_amount );
        }
        
        
        this.all_plans[l].disc_percent = this.all_plans[l].disc_percent || 0;
        this.all_plans[l].conted = this.all_plans[l].conted  || false;
        this.all_plans[l].discount = this.all_plans[l].discount || 0;
        this.all_plans[l].item_gst_amt = this.all_plans[l].item_gst_amt || 0;
        
        this.item_price =   Math.round(  parseInt( this.item_price ) + parseInt(this.all_plans[l].price) );
        this.disc_price =   Math.round(  parseInt( this.disc_price ) + parseInt( this.all_plans[l].discount ) );
        this.dis_per   =      this.dis_per  + this.all_plans[l].disc_percent;
        
        if(this.all_plans[l].discount > 0){
          this.dis_per_count++;
        }else{
          
        }
        
        this.sub_amount =   Math.round(  parseInt( this.sub_amount ) + parseInt( this.all_plans[l].sub_amount)  );
        
        this.gst_price   =   Math.round(  parseInt( this.gst_price  ) + parseInt( this.all_plans[l].item_gst_amt ) );
        this.igst_price  =   Math.round(  parseInt( this.igst_price  ) + parseInt( this.all_plans[l].igst_amt ) );
        this.cgst_price  =   Math.round(  parseInt( this.cgst_price  ) + parseInt( this.all_plans[l].cgst_amt ) );
        this.sgst_price  =   Math.round(  parseInt( this.sgst_price  ) + parseInt( this.all_plans[l].sgst_amt ) );
        
        
        
        this.inv_price  =   Math.round(  parseInt( this.inv_price   ) + parseInt(this.all_plans[l].amount) );
        
        if(this.detail.freePlan && this.detail.freePlan.indexOf( this.all_plans[l].plan_name ) > '-1'){
          this.detail.freePlan.splice( this.detail.freePlan.indexOf( this.all_plans[l].plan_name ) , 1);
        }
      }
      
    }
    
    for(var l = 0; l < this.all_plans.length; l++)
    {
      if( this.detail.category_type.findIndex(x=> x == this.all_plans[l].category_type ) > -1 ){
        
        this.all_plans[l].disable_plan = true;
      }else{
        this.all_plans[l].disable_plan = false;
        
      }
    }
    
    if(this.detail.category_type.length == 0){
      this.price.extra_discount = 0;
    }
    
    
    this.price.item_price =  this.item_price;
    this.price.disc_price =  this.disc_price ;
    
    this.price.dis_per =   ( this.price.disc_price /   this.price.item_price  ) * 100 ;
    this.price.dis_per =  this.price.dis_per  ? this.price.dis_per.toFixed(2) : 0;
    
    this.price.sub_amount =  this.sub_amount;
    this.price.gst_price =  this.gst_price;
    this.price.igst_price  = this.igst_price;
    this.price.cgst_price  = this.cgst_price;
    this.price.sgst_price  = this.sgst_price;
    this.price.inv_price =  this.inv_price;
    
    if(this.price.received > 0 ){
      if(this.price.received <= this.price.inv_price){
        this.price.balance =  this.price.inv_price - this.price.received;
        
      }else{
        this.price.received = 0;
        this.price.balance = this.price.inv_price;
      }
    }else{
      this.price.balance = this.price.inv_price;
      this.price.received = 0;
    }
    
    this.price.igst_per  = this.igst_per ? ( this.igst_per  / this.i_gst_count ) : 0;
    this.price.cgst_per  = this.cgst_per ? (this.cgst_per / this.c_s_gst_count ): 0;
    this.price.sgst_per  = this.sgst_per ? ( this.sgst_per /  this.c_s_gst_count ) : 0;
    console.log( this.all_plans);
    
  }
  
  getCardDeatil() 
  {
    this.loading_list = true;
    this.db.get_rqst(  '', 'customer/cust_jobcardetail/' + this.custid + '/' + this.cartid)
    .subscribe(d => {
      this.loading_list = false;
      
      this.tmp = d;
      console.log(  this.tmp );
      this.detail = this.tmp.detail;  
      this.cardplans = this.tmp.plan_info;
      this.cardinvoices = this.tmp.card_invoices;      
      this.cardraw_material = this.tmp.items;  
      this.all_plans = this.tmp.vehicle_type_plans;
      
      this.detail.category_type = [];
      
      this.price.payment_mode = '';
      this.price.item_price = 0;
      this.price.disc_price = 0;
      this.price.sub_amount = 0;
      this.price.gst_price = 0;
      this.price.igst_price  = 0;
      this.price.cgst_price  = 0;
      this.price.sgst_price  = 0;
      
      this.price.igst_per  = 0;
      this.price.cgst_per  = 0;
      this.price.sgst_per  = 0;
      
      this.price.extra_discount  = 0;
      this.price.amount = 0;
      this.price.received_amount = 0;
      
      for(var l = 0; l < this.all_plans.length; l++)
      {
        this.all_plans[l].plan_end_date = '0000-00-00';
        this.all_plans[l].plan_start_date = '0000-00-00';
        this.all_plans[l].sub_amount  = this.all_plans[l].price;
        this.all_plans[l].discount  = 0;
        this.all_plans[l].checked  = this.all_plans[l].checked || false;
        this.all_plans[l].extra_discount = 0;
      }
      
      if(this.detail.status == 'Open')
      {
        for(var i = 0; i < this.cardplans.length; i++)
        {
          for(var j = 0; j < this.all_plans.length; j++)
          {
            if(this.cardplans[i].service_name == this.all_plans[j].plan_name)
            {
              this.all_plans[j].plan_end_date = this.cardplans[i].plan_end_date;
              this.all_plans[j].plan_start_date = this.cardplans[i].plan_start_date;
              this.all_plans[j].checked = true;
              console.log( this.all_plans[j]);
              if(this.all_plans[j].plan_end_date != '0000-00-00')
              {
                this.all_plans[j].disable = true;
                this.all_plans[j].checked = false;
              }else{
                this.all_plans[j].disable = false;
                
              }
            }
          }
        }
      }
      else
      {
        this.all_plans = this.cardplans;
        this.all_plans.map((item)=>{
          item.plan_name = item.service_name
        });
      }
      this.cal_gst();
      console.log(this.detail);
      console.log(this.all_plans);
    },err => {  this.dialog.retry().then((result) => { this.getCardDeatil(); console.log(err); }); });
  }
  
  
  
  calc_all_price(){
    this.price.item_price = 0;
    for(var j = 0; j < this.all_plans.length; j++)
    {
      if(this.all_plans[j].checked == true && this.all_plans[j].plan_start_date == '0000-00-00')
      {
        console.log(j);
        
        this.price.item_price = parseInt(this.price.item_price) + parseInt(this.all_plans[j].price);
      }
    }
    this.price.disc_price = (this.price.item_price * this.price.disc_percent)/100;
    this.price.sub_price = this.price.item_price - parseInt(this.price.disc_price);
    this.price.gst_price = parseInt(this.price.sub_price)*(this.price.gst / 100);
    this.price.inv_price = parseInt(this.price.sub_price) + parseInt(this.price.gst_price);
  }
  
  toggle_input(){
    this.disc_input = !this.disc_input;
    if(this.price.disc_percent < 0)
    {
      return;
    }
    this.calc_all_price();
  }
  
  openAddJobcardRawmaterialDialog(card_id) 
  {
    console.log(card_id); 
    
    const dialogRef = this.matDialog.open(AddJobcardRawmaterialComponent, {
      width: '1000px',
      data: {card_id: card_id, franchise_id: this.franchise_id}
    });
    dialogRef.afterClosed().subscribe(r => {
      if(r)this.get_job_material(card_id);
    });
  }
  
  get_job_material(card_id)
  {
    
    this.loading_list = true;
    this.db.post_rqst( '', 'customer/get_rew_matrial/'+card_id)
    .subscribe(d => {
      this.cardraw_material = d['items'].items;
      this.loading_list = false;
    },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); this.get_job_material(card_id);     });    });
  }
  
  
  
  close_job_card(id:any){
    this.loading_list = true;
    this.db.post_rqst(  {'name':this.detail.first_name +' '+ this.detail.last_name}, 'customer/close_job_card/' + id + '/' + this.franchise_id + '/' +this.db.datauser.id)
    .subscribe(d => {
      this.loading_list = false;
      
      console.log(d);
      this.getCardDeatil();
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.close_job_card(id); }); });
  }
  
  change_plan(index:any){
    this.all_plans[index].checked = !this.all_plans[index].checked;
    this.all_plans[index].plan_start_date = '0000-00-00';
    this.all_plans[index].plan_end_date = '0000-00-00';
    console.log(this.all_plans);
    this.calc_all_price();
  }
  
  create_invoice()
  {
    this.price.date_created =  this.price.date_created ? this.db.pickerFormat(this.price.date_created) :'';
    this.loading_list = true;
    let inv_item =[];
    for(var j = 0; j < this.all_plans.length; j++)
    {
      if(this.all_plans[j].checked)
      {
        inv_item.push(this.all_plans[j]);
      }
    }
    console.log(this.db.datauser);
    
    this.db.insert_rqst( {'cust_id':this.custid,'jc_id':this.cartid, 'login':this.db.datauser ,'created_by':this.ses.users.id,'jc_inv':this.price,'jc_inv_item':inv_item,'detail':this.detail,'reg_no':this.detail.regn_no,'franchise_id':this.franchise_id} , 'jobcard/saveinvoice')
    .subscribe((data:any) => {
      this.loading_list = false;
      console.log(data);

      if( data == 'Date is Grater' ){
        this.dialog.error('DATE IS GRATER! ');
        return;
      }

      this.price.payment_mode = '';
      this.price.item_price = 0;
      this.price.disc_price = 0;
      this.price.sub_amount = 0;
      this.price.gst_price = 0;
      this.price.amount = 0;
      this.price.received_amount = 0;
      this.getCardDeatil();  
      this.dialog.success('Invoice Created Successfully!');
      
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { }); });
    
    
  }
  
  pre_fix: any = '';
  get_franchies_prefix()
  {
    
    this.loading_list = true;
    this.db.post_rqst( {'franchise_id':this.franchise_id}, 'franchises/get_franchise_refix')
    .subscribe(d => {
      console.log(d);
      
      this.pre_fix = d.prefix.pre_fix;
      this.loading_list = false;
    },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); this.get_franchies_prefix();  });    });
  }
  
  
  
  
  changeAddress()
  {
    this.loading_list = true;
    this.db.post_rqst( {'franchise_id':this.franchise_id , 'id':this.detail.id , 'isCompany' : this.detail.isCompany }, 'customer/changeAddress')
    .subscribe(d => {
      this.loading_list = false;      

      if( d == 'ERROR' ){
        this.detail.isCompany = 0;
        this.dialog.warning('Company Details Does Not Exist! ');
        return;
      }
      this.dialog.success('Cunsumer Address Changed Successfully! ');
      this.getCardDeatil(); 
    },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); });    });
  }
  
  
}
