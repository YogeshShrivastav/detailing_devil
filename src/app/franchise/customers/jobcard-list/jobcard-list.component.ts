import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';

import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-jobcard-list',
  templateUrl: './jobcard-list.component.html'
})
export class JobcardListComponent implements OnInit {

  id;
  franchise_id;
  loading_list = false;
  card_list:any = [];
  tmp:any;
  temp: any = {};
  consumer: any = {};
  consumer1: any = {};
  isInvoiceDataExist = false;
  data: any;
  search: any = '';
  searchData = true;

  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }

  ngOnInit() {
    this.route.params.subscribe(params => {

      this.id = this.db.crypto(params['id'],false);
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.getCustomerJobcards();    
        
    });
  }


  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;

  
  redirect_previous() {
    this.current_page--;
    this.getCustomerJobcards();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getCustomerJobcards();
  }

  getCustomerJobcards() {
    this.isInvoiceDataExist = false;
    this.loading_list = true;

    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.search || this.filter.status)this.filtering = true;

    this.db.post_rqst(   {'filter':this.filter , 'id':this.id}, 'customer/customer_jobcards?page='+this.current_page)
    .subscribe(d => {

      this.loading_list = false;

      this.data = d['data'].cardlist;
      this.card_list = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;

      console.log(  this.card_list );

    });
    this.db.post_rqst( {'franchise_id':this.franchise_id,'cust_id':this.id}, 'franchise_leads/fetch_customer')
      .subscribe(data => {
          this.temp = data;
          this.loading_list = false;
          this.consumer = this.temp.consumers;         
          //console.log(this.consumer);               
        },err => { this.loading_list = false; this.dialog.retry().then((result) => { this.getCustomerJobcards();      console.log(err); }); });

  }

  create_job_card(){
    this.consumer1=this.consumer[0];
    // console.log(this.consumer1.id);
    console.log(this.franchise_id);
    this.db.set_fn(this.consumer1);
    this.router.navigate(['addjobcard/'+this.db.crypto(this.id)]);  
  }





    
  CancelJobCard(id){
    console.log(id);
    
    this.loading_list = true;
    this.db.insert_rqst( '', 'customer/CancelJobCard/' + id + '/' + this.franchise_id + '/' +this.db.datauser.id)
    .subscribe(d => {
    this.loading_list = false;

    if(d == 'EXIST'){
      this.dialog.warning('Already Bill Created!');
      return;
    }
    this.dialog.success('Job Card Cancelled!');



      console.log(d);
      
      this.getCustomerJobcards();
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  }); });
  }
  



}
