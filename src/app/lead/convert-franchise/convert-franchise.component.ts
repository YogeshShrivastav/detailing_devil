import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-convert-franchise',
  templateUrl: './convert-franchise.component.html'
})
export class ConvertFranchiseComponent implements OnInit {
   l_id:any=[];
   lead_type:any=[];
   dataPlan:any=[];
   plan_data: any = {};
   stock: any = [];
   accessories:any = [];
   dataStock:any = [];
   franch_stock:any = {};
   temp:any=[];
   addProduct:any  = {};
   brands:any  = [];
   products:any  = [];
   units:any  = [];
   loading_list = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
    private router: Router,  public dialog: DialogComponent,
    @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<ConvertFranchiseComponent>) { 
     console.log('data');
     console.log(this.lead_data.l_id);
     this.l_id = lead_data.l_id;
     this.lead_type = lead_data.type;
    }

  ngOnInit() {
    this.getServicePlan();
  }

  service_plans: any= [];
  getServicePlan() {
    this.loading_list = false;
    this.db.get_rqst( '', 'franchises/service_plans')
    .subscribe(data => {
      this.dataPlan = data;
      this.service_plans = this.dataPlan.data.plans;
      this.loading_list = true;
      //console.log(this.service_plans);
    },err => {  this.dialog.retry().then((result) => { this.getServicePlan(); });   });
  }

 
  get_stock() {
    //console.log(this.franch_stock.plan_id);    
    this.loading_list = false;
    this.db.get_rqst( '', 'franchises/get_stock/' + this.franch_stock.plan_id)
    .subscribe(data => {
      this.dataStock = data;
      this.stock = this.dataStock.data.data;
      this.plan_data = this.dataStock.data.plans;
      this.accessories = this.dataStock.data.accessories;
      //console.log('Stock');
      this.loading_list = true;
      //console.log(this.dataStock);      
    },err => {  this.dialog.retry().then((result) => { this.get_stock(); });   });
  }

  savingData = true;
  
  convert_lead_to_franchise(){
     this.savingData = true;    
     this.db.post_rqst( 
       {'franchise_id': this.l_id,'login_id': this.ses.users.id, 'plan_data': this.plan_data , 'isPlanSelected': true , 'accessories': this.accessories, 'stock': this.stock }, 'franchises/convertLeadtoFranchise')
     .subscribe(data => {
      this.savingData = false;
      var temp = data;
      console.log( temp ); 
      if (this.temp) {
        this.dialogRef.close();
      }
       this.router.navigate(['/franchise-detail/'+this.l_id]);            
      },err => {  this.dialog.retry().then((result) => { this.convert_lead_to_franchise(); });   });
  }
}
