import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';
import { JobcardPaymentListComponent } from '../jobcard-payment-list/jobcard-payment-list.component';

@Component({
  selector: 'app-customerinvoice-list',
  templateUrl: './customerinvoice-list.component.html'
})
export class CustomerInvoiceListComponent implements OnInit {
  
  id;
  franchise_id;
  loading_list = false;
  invoicelist:any = [];
  isInvoiceDataExist = false;
  tmp:any;
  data: any;
  search: any = '';
  source: any = '';
  loading_page = false;
  loader: any = false;
  leads: any = [];
  
  total_order:any;
  
  searchData = true;
  
  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = this.db.crypto(params['id'],false) || 0;
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      console.log(this.id);
      console.log(this.franchise_id);
      
      if( this.franchise_id )this.getCustomerInvoice();    
    });
  }
  
  
  
  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;
  
  
  redirect_previous() {
    this.current_page--;
    this.getCustomerInvoice();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getCustomerInvoice();
  }
  
  openReceivePaymentDialog(franchise_id, invoice_id) {
    const dialogRef = this.matDialog.open(JobcardPaymentListComponent, {
      data: {
        franchise_id: franchise_id,
        invoice_id: invoice_id
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.getCustomerInvoice(); }
    });
  }
  
  getCustomerInvoice() {
    
    this.isInvoiceDataExist = false;
    this.loading_list = true;
    
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.search || this.filter.discount || this.filter.balance || this.filter.payment)this.filtering = true;
    
    
    
    this.db.post_rqst(  {'filter':this.filter, 'franchise_id':this.franchise_id, 'customer_id':this.id}, 'customer/customer_invoicelist?page='+this.current_page)
    .subscribe(d => {
      console.log(d);
      this.loading_list = false;
      
      this.data = d['data'].list;
      this.invoicelist = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;
      console.log(  this.invoicelist );
    },err => { this.loading_list = false; this.dialog.retry().then((result) => { this.getCustomerInvoice(); console.log(err); }); });
  }
  
  
  
  
  CancelJobCard(id){
    this.dialog.delete('Invoice Order').then((result) => {
      if (result) {
        this.loading_list =true;
        
        this.loading_list = true;
        this.db.insert_rqst( '', 'customer/CancelCustomerInvoice/' + id + '/' + this.franchise_id + '/' +this.db.datauser.id)
        .subscribe(d => {
          this.loading_list = false;
          console.log(d);
          // if(d == 'EXIST'){
          //   this.dialog.warning('Already Bill Created!');
          //   return;
          // }
          this.dialog.success('Bill Cancelled!');
          
          this.getCustomerInvoice();
        },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  }); });
      }
      
      
    });
    
  }
  
}
