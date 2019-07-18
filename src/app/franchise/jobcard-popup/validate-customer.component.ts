import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-validate-customer',
  templateUrl: './validate-customer.component.html'
})
export class ValidateJobcardCustomer implements OnInit {
  validateForm: any = {};
  f_id;
  savingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
    private router: Router,  public dialog: DialogComponent,
     @Inject(MAT_DIALOG_DATA) public frn_data: any, public dialogRef: MatDialogRef<ValidateJobcardCustomer>){
     
      this.f_id = frn_data.f_id; 

      }

  ngOnInit() {
  }
  temp: any = {};
  consumer: any = {};
  consumer1: any = {};

  identifyCustomer(){
    //console.log(this.validateForm.contact_no);
    //console.log(this.f_id);
    this.savingData = true;
    this.db.post_rqst( {'franchise_id':this.f_id,'mobile':this.validateForm.contact_no}, 'franchises/validate_customer')
        .subscribe(data => {
          console.log(data);
          
          this.temp = data;
          if( this.temp.isExist ){
            this.consumer = this.temp.consumers; 
            console.log(this.consumer);
            
          }
          this.savingData = false;
        },err => {  this.dialog.retry().then((result) => { 
          this.identifyCustomer();      
          console.log(err); });  
        });
  }

  create_job_card_lead(){
   
       this.router.navigate(['/addjobcard/'+this.db.crypto( this.consumer.id )+'/'+0+'/'+this.db.crypto( this.f_id )  ]);  
    this.dialogRef.close();

  }

  addLead(){
    this.router.navigate(['/leads/add']);  
    this.dialogRef.close();
  }


  detail(){
    this.router.navigate(['/franchise/customer_details/'+this.db.crypto( this.f_id )+'/'+this.db.crypto( this.consumer.id )  ]);  
    this.dialogRef.close();
}


  leadDetail(){
    this.router.navigate(['/consumer_leads/details/'+this.db.crypto( this.consumer.id )  ]);  
    this.dialogRef.close();
  }


}
