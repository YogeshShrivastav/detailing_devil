import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from './../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from './../dialog/dialog.component';
import {SessionStorage} from './../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-franchise-services-paymant',
  templateUrl: './franchise-services-paymant.component.html',
})
export class FranchiseServicesPaymantComponent implements OnInit {
  
  franchise_id:any = '';
  customer_id:any = '';
  invoice_id:any = '';
  constructor(
    public db: DatabaseService,
    private route: ActivatedRoute,
    public ses: SessionStorage,
    private router: Router,
    public dialog: DialogComponent,
    
    @Inject(MAT_DIALOG_DATA) public lead_data: any,
    public dialogRef: MatDialogRef<FranchiseServicesPaymantComponent>) 
    {
      this.franchise_id = lead_data.franchise_id; this.customer_id = lead_data.customer_id; this.invoice_id = lead_data.invoice_id;
    }
    
    ngOnInit() {
      console.log(this.invoice_id);
      
      this.getServicePendingPayment();
    }
    
    sendingData  = false;
    formData:any = {};
    receive_payments() {
      this.sendingData = true;
      this.formData.franchise_id = this.franchise_id;
      this.formData.customer_id = this.customer_id;
      this.formData.invoice_id = this.invoice_id;
      this.formData.receive_payment = this.formData.receive_payment ? this.formData.receive_payment : '';
      this.formData.balance_amount = this.formData.balance_amount ? this.formData.balance_amount : '';
      this.formData.balance = this.formData.balance ? this.formData.balance : '';
      
      this.formData.due_terms = ( this.formData.balance_amount > 0  && this.formData.due_terms ) ? this.db.pickerFormat(this.formData.due_terms) : '';
      
      this.formData.payment_date = this.formData.payment_date   ? this.db.pickerFormat(this.formData.payment_date) : '';
      
      this.formData.note = this.formData.note ?  this.formData.note  : '';
      
      this.formData.user_id = this.ses.users.id;
      console.log(this.formData );
      
      
      
      this.db.insert_rqst( {'data': this.formData } , 'sales/service_payment_receiving')
      .subscribe(data => {
        this.sendingData = false;
        
        this.dialog.success('Rayment Received Successfully')
        this.dialogRef.close(true);
        
      },err => {     this.sendingData = false; this.dialog.retry().then((result) => {   }); });
    }
    
    payment_cal()
    {
      this.formData.balance_amount = this.formData.balance - this.formData.receive_payment;
      if(this.formData.receive_payment > this.formData.balance)
      {
        this.formData.receive_payment = this.formData.balance;
        this.formData.balance_amount = 0;
      }
      this.formData.due_terms =  this.formData.balance_amount > 0 ? this.formData.due_terms : '';
    }
    
    getServicePendingPayment() {
      this.sendingData = true;
      this.formData.franchise_id = this.franchise_id;
      this.formData.invoice_id = this.invoice_id;
      
      this.db.post_rqst( {'data':this.formData}, 'sales/getServicePendingPayment')
      .subscribe(data => {
        console.log(data);
        this.sendingData = false;
        
        this.formData = data['data'].payment;
        
      },err => {  this.dialog.retry().then((result) => { this.getServicePendingPayment();  }); });
    }
    
    
  }
  