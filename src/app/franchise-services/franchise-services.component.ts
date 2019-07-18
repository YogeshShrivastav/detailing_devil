import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../dialog/dialog.component';
import {SessionStorage} from '../_services/SessionService';
import { FranchiseServicesPaymantComponent } from '../franchise-services-paymant/franchise-services-paymant.component';

@Component({
  selector: 'app-franchise-services',
  templateUrl: './franchise-services.component.html'
})
export class FranchiseServicesComponent implements OnInit {
  
  franchise_id;
  loading_list = false;
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
    }
    
    ngOnInit() {
      this.route.params.subscribe(params => {
        
        this.franchise_saleinvoice();
      });
    }
    
    current_page = 1;
    last_page: number ;
    total_leads = 0;
    filter:any = {};
    filtering:any = false;
    search: any = '';
    source: any = '';
    ing_page = false;
    loader: any = false;
    searchData = true;
    
    redirect_previous() {
      this.current_page--;
      this.franchise_saleinvoice();
    }
    redirect_next() {
      if (this.current_page < this.last_page) { this.current_page++; }
      else { this.current_page = 1; }
      this.franchise_saleinvoice();
    }
    
    frchise:any;
    invoice:any = [];
    data: any;
    
    tmp:any = {};
    tmp2:any = {};
    franchiseOrderForm:any = {};
    
    
    salesInvoiceList:any = [];
    
    
    
    franchise_saleinvoice(){
      
      this.loading_list = true;
      
      this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
      if(  this.filter.date || this.filter.status ||  this.filter.search || this.filter.service_status)this.filtering = true;
      
      this.db.post_rqst( {'filter':this.filter , 'franchise_id' : '' }, 'stockdata/get_franchise_service?page='+this.current_page )
      .subscribe(data => {
        
        this.loading_list = false;
        console.log(data);
        
        this.data = data['data']['serviceList'];
        this.invoice = this.data.data;
        this.current_page = this.data.current_page;
        this.last_page = this.data.last_page;
        this.total_leads = this.data.total;
        
        if (this.search && (this.invoice.length < 1)) { this.searchData = false; }
        if (this.search && (this.invoice.length > 0)) { this.searchData = true; }
        
        console.log(this.invoice);
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.franchise_saleinvoice(); }); });
    }
    
    
    
    GetSaleInvoice(action:any)
    {
      console.log(action);   
      this.loading_list = true;
      this.db.post_rqst(  {'franchise_id':this.franchise_id,'action':action}, 'franchises/franchise_invoice_asper_status')
      .subscribe((result)=>{
        this.tmp2 = result;
        this.loading_list = false;
        console.log(this.tmp2);
        this.invoice = this.tmp2['data']['orderinvs'];
        console.log(this.invoice);
      },err => {   this.loading_list = false; this.dialog.retry().then((result) => { 
        this.GetSaleInvoice(action);      
        console.log(err); });  
      });
    }
    
    service_cancel(id) {
      this.dialog.delete('services').then((result) => {
        if (result) {
          this.loading_list =true;
          
          this.db.insert_rqst(  { 'id': id}, 'sales/service_invoice_cancel')
          .subscribe(data => {
            this.loading_list =false;
            this.dialog.success('services Cancelled successfully');
            this.salesInvoiceList();
          },err => {  this.dialog.retry().then((result) => { 
            this.loading_list =false;
          });   });
          
          
          
        }
        
      });
      
    }

    openReceivePaymentDialog(franchise_id, customer_id,  invoice_id) {
      const dialogRef = this.matDialog.open(FranchiseServicesPaymantComponent, {
        data: {
          franchise_id: franchise_id,
          customer_id: customer_id,
          invoice_id: invoice_id
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {  this.franchise_saleinvoice(); }
      });
  }
}
  