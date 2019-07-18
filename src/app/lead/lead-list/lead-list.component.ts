import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import { AssignLeadComponent } from '../assign-lead/assign-lead.component';
import { AssignUserComponent } from '../assign-user/assign-user.component';
import { log } from 'util';
import { AssignLeadUserComponent } from '../assign-lead-user/assign-lead-user.component';
import { SessionStorage } from 'src/app/_services/SessionService';


@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html'
})
export class LeadListComponent implements OnInit {
  loading: any;
  data: any;
  search: any = '';
  source: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  leads: any = [];
  current_page = 1;
  last_page: number ;
  searchData = true;
  total_franchise_leads = 0;
  total_consumer_leads = 0;
  lead_type = 'franchise';
  login_data:any={};
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ,public matDialog: MatDialog,public ses: SessionStorage) {
    this.showLeadList(this.lead_type);
    this.login_data = this.ses.getSe();
    this.login_data = this.login_data.value;
    console.log(this.login_data);
    
  }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
  }
  
  showLeadList(type) {
    this.lead_type = type;
    if(this.lead_type == 'franchise') { 
      this.getFranchiseLeadList('refresh'); 
    }
    if(this.lead_type == 'consumer'){
      this.getConsumerLeadList('refresh'); 
      this.ddgetUserList(); 
    }
  }
  
  
  redirect_franchise_previous(lead_type) {
    this.current_page--;
    this.getFranchiseLeadList();
  }
  redirect_franchise_next(lead_type) {
    if (this.current_page < this.last_page) { this.current_page++; } else { this.current_page = 1; }
    this.getFranchiseLeadList();
  }
  redirect_consumer_previous(lead_type) {
    this.current_page--;
    this.getConsumerLeadList();
  }
  redirect_consumer_next(lead_type) {
    if (this.current_page < this.last_page) { this.current_page++; } else { this.current_page = 1; }
    this.getConsumerLeadList();
  }
  
  
  filter:any = {};
  cites:any = [];
  assign_user_list:any = [];
  user_assign_search: any = '';
  filtering:any = false;

  getFranchiseLeadList(action:any='') 
  {
    console.log(action);
    
    if(action == 'refresh')
    {
      this.filter = {};
      this.user_assign_search = '';
      this.filtering = false;
      console.log('refresh');
    }
    
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if( this.user_assign_search ||  this.filter.source  ||  this.filter.lead_status ||  this.filter.city  ||  this.filter.date ||  this.filter.lead_source_type )this.filtering = true;
    console.log(this.filtering);
    this.loading_list = false;
    this.db.post_rqst({'filter' : this.filter,'user_assign_search':this.user_assign_search,  'login': this.db.datauser}, 'franchise_leads?page=' + this.current_page)
    .subscribe(data => {
      console.log(this.data );
      
      this.data = data;
      this.current_page = this.data.data.leads.current_page;
      this.last_page = this.data.data.leads.last_page;
      this.total_franchise_leads = this.data.data.leads.total;
      this.total_consumer_leads = this.data.data.total_consumer_leads;
      this.leads = this.data.data.leads.data;
      this.cites = this.data.data.cites;
      console.log(this.cites);
      
      this.leads.map((item)=>{
        item.check = false;
        
        
      });
      this.assign_user_list = this.data.data.assign_user_list;
      console.log(this.data);
      if (this.search && (this.leads.length < 1)) { this.searchData = false; }
      if (this.search && (this.leads.length > 0)) { this.searchData = true; }
      this.loading_list = true;
    },err => {  this.loading_list = true; this.dialog.retry().then((result) => { this.getFranchiseLeadList(action); });   });
  }
  
  
  
  deleteFranchiseLead(l_id) {
    this.dialog.delete('Lead').then((result) => {
      if (result) {
        this.db.post_rqst({l_id: l_id}, 'franchise_leads/remove')
        .subscribe(data => {
          this.data = data;
          if (this.data.data.r_lead) { this.getFranchiseLeadList(); }
        });
      }
    });
  }
  
  
  dduser_list=[];
  ddgetUserList(){
    // this.loading_list = false;
    this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
    .subscribe(data => {
      this.data = data;
      console.log(this.data);
      this.dduser_list = this.data.data.user;      
      console.log(this.dduser_list);
      // this.loading_list = true;
    },err => {  this.dialog.retry().then((result) => { this.ddgetUserList(); });   });
  }
  
  
  consumer_cites = [];
  assign_franchise_list = [];
  consumer_user_assign_search: any = '';
  
  getConsumerLeadList(action:any='') {
    
    if(action == 'refresh')
    {
      this.filter = {};
      this.filtering = false;
      this.consumer_user_assign_search = '';
    }
    
    // if(this.filter.mobile){
    //   this.filter.master = '';
    // }
    // if(this.filter.master){
    //   this.filter.mobile = '';
    // }
    
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    
    
    if( this.consumer_user_assign_search || this.filter.lead_status  ||  this.filter.franchise_id ||  this.filter.source ||  this.filter.city ||  this.filter.date  ||  this.filter.lead_source_type )this.filtering = true;
    
    this.loading_list = false;
    console.log(this.filter);
    this.db.post_rqst({'filter' : this.filter,  'login': this.db.datauser, 'consumer_user_assign_search': this.consumer_user_assign_search }, 'consumer_leads?page=' + this.current_page)
    .subscribe(data => {
      this.data = data;
      this.current_page = this.data.data.leads.current_page;
      this.last_page = this.data.data.leads.last_page;
      this.total_consumer_leads = this.data.data.leads.total;
      this.total_franchise_leads = this.data.data.total_franchise_leads;
      this.leads = this.data.data.leads.data;
      this.consumer_cites = this.data.data.cites;
      console.log( this.consumer_cites );
      
      this.assign_franchise_list = this.data.data.assign_franchise_list;
      
      
      console.log(this.data);
      this.leads.map((item)=>{
        item.check = false;
      });
      if (this.search && this.leads.length < 1) { this.searchData = false; }
      if (this.search && this.leads.length > 0) { this.searchData = true; }
      this.loading_list = true;
    },err => {  this.loading_list = true; this.dialog.retry().then((result) => { this.getConsumerLeadList(action); });   });
  }
  orderListReverse(){
    this.leads=this.leads.reverse();
  }
  
  deleteConsumerLead(l_id) {
    this.dialog.delete('Lead').then((result) => {
      if (result) {
        this.db.post_rqst({l_id: l_id}, 'consumer_leads/remove')
        .subscribe(data => {
          this.data = data;
          if (this.data.data.r_lead) { this.getConsumerLeadList(); }
        });
      }
    });
  }
  
  
  
  /// ASSIGN FRANCHISE SECTION START
  FranchiseArr:any = [];
  GetFranchiseArray(event,index:any,action:any='')
  {
    console.log(event.checked);
    console.log(index);
    
    if(action == 'all')
    {
      if(event.checked == true)
      {
        this.leads.map((item)=>{
          item.check = true;
        }); 
      }
      else{
        this.leads.map((item)=>{
          item.check = false;
        }); 
      }
      
      
    }else{
      
      this.leads[index].check = !this.leads[index].check;
    }
    
    
    this.FranchiseArr = this.leads.reduce((results, item) => {
      if (item.check == true) results.push(item.id);
      return results;
    }, []);
    
    console.log(this.FranchiseArr);
    
  }
  
  
  openAssignUserDialog() {
    console.log(this.ConsumerArr);
    const dialogRef = this.matDialog.open(AssignUserComponent, {
      data: {
        franchise_id: this.FranchiseArr
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.getFranchiseLeadList('refresh'); }
    });
  }
  
  /// ASSIGN FRANCHISE SECTION END
  
  
  /// ASSIGN FRANCHISE SECTION START
  ConsumerArr:any = [];
  GetConsumerArray(event,index:any,action:any='')
  {
    console.log(event.checked);
    console.log(index);
    
    if(action == 'all')
    {
      if(event.checked == true)
      {
        this.leads.map((item)=>{
          item.check = true;
        }); 
      }
      else{
        this.leads.map((item)=>{
          item.check = false;
        }); 
      }
      
      
    }else{
      
      this.leads[index].check = !this.leads[index].check;
    }
    
    
    this.ConsumerArr = this.leads.reduce((results, item) => {
      if (item.check == true) results.push(item.id);
      return results;
    }, []);
    
    console.log(this.ConsumerArr);
    
  }
  
  
  openAssignLeadDialog() {
    console.log(this.ConsumerArr);
    const dialogRef = this.matDialog.open(AssignLeadComponent, {
      data: {
        lead_id: this.ConsumerArr
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.getConsumerLeadList('refresh'); }
    });
  }
  
  
  open_assign_user_dialog() {
    console.log(this.ConsumerArr);
    const dialogRef2 = this.matDialog.open(AssignLeadUserComponent, {
      data: {
        lead_id: this.ConsumerArr
      }
    });
    dialogRef2.afterClosed().subscribe(result => {
      if (result) {  this.getConsumerLeadList('refresh'); }
    });
  }
  
  /// ASSIGN FRANCHISE SECTION END
  
  
  
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];




