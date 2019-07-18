import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ValidateJobcardCustomer} from '../jobcard-popup/validate-customer.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-jobcard-list',
  templateUrl: './jobcard-list.component.html'
})
export class JobcardFranchiseListComponent implements OnInit {

  franchise_id;
  loading_list = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) { }



  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
     
      if (this.franchise_id) {
         this.jobcards();
        }
      });
  }

  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;
  search: any = '';
  searchData = true;
  data: any;

  redirect_previous() {
  this.current_page--;
  this.jobcards();
}
redirect_next() {
  if (this.current_page < this.last_page) { this.current_page++; }
  else { this.current_page = 1; }
  this.jobcards();
}


  openValidatecustomerDialog() {    
    const dialogRef = this.matDialog.open(ValidateJobcardCustomer,{
      data: {
         f_id: this.franchise_id
      }
    }); 
    dialogRef.afterClosed().subscribe(result => {
      //this.getLeadDetails(this.lead_id);
    });
  }

  
  jobcardslist:any = [];
  
  jobcards(){
    this.loading_list = true;

    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.search)this.filtering = true;


    this.db.post_rqst(  {'filter':this.filter , 'franchise_id':this.franchise_id}, 'franchises/franchise_jobcard_lists?page='+this.current_page )
    .subscribe(data => {

      this.loading_list = false;
      console.log(data);
      
    this.data = data['data']['jobsc'];
    this.jobcardslist = this.data.data;
    this.current_page = this.data.current_page;
    this.last_page = this.data.last_page;
    
    if (this.search && (this.jobcardslist.length < 1)) { this.searchData = false; }
    if (this.search && (this.jobcardslist.length > 0)) { this.searchData = true; }

    },err => {  this.dialog.retry().then((result) => { 
      this.jobcards();      
      console.log(err); });  
    });
    
  }



     
  CancelJobCard(id){
    console.log(id);
    
    this.loading_list = true;
    this.db.insert_rqst( '', 'customer/CancelJobCard/' + id + '/' + this.franchise_id + '/' +this.db.datauser.id)
    .subscribe(d => {
    this.loading_list = false;
      console.log(d);
      if(d == 'EXIST'){
        this.dialog.warning('Already Bill Created!');
        return;
      }
      this.dialog.success('Job Card Cancelled!');

      this.jobcards();
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  }); });
  }
  



}
