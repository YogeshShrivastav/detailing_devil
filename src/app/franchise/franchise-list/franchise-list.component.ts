import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import { log } from 'util';

@Component({
  selector: 'app-franchise-list',
  templateUrl: './franchise-list.component.html'
})
export class FranchiseListComponent implements OnInit {



  loading: any;
  data: any;
  search: any = '';
  isInvoiceDataExist = false;
  source: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  leads: any = [];
  current_page = 1;
  last_page: number ;
  searchData = true;
  total_leads = 0;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);


  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getLeadList(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
  }

  locations: any = [];

 
 
  redirect_previous() {
    this.current_page--;
    this.getLeadList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getLeadList();
  }

  filter:any = {};

  filtering : any = false;


  getLeadList() {

    this.isInvoiceDataExist = false;
    this.loading_list = false;
    //this.db.get_rqst( '', 'sales/getInvoicePayment')

          
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    
    if( this.filter.date || this.filter.location_id )this.filtering = true;


    this.db.post_rqst(  {  'filter': this.filter , 'login':this.db.datauser}, 'franchises?page=' + this.current_page + '&s=' + this.search + '&source=' + this.source)
      .subscribe(data => {
        console.log(data);
        
        this.data = data;
        this.current_page = this.data.data.leads.current_page;
        this.last_page = this.data.data.leads.last_page;
        this.total_leads = this.data.data.leads.total;
        this.leads = this.data.data.leads.data;
        this.locations= this.data.data.locations;


        // for (let x = 0; x < this.leads.length; x++) {
        //   this.leads[x].counsumres = 0;
        //   this.leads[x].leads = 0;
        //   const types =  this.leads[x].types;
        //   console.log( types );
        //   if(types){
        //   var arr = types.split(',');
        //     console.log(arr);
        //     for (let i = 0; i < arr.length; i++) {
             
        //       if(arr[i] == '2'){
        //         this.leads[x].counsumres++;
        //         console.log( this.leads[x].counsumres);
                
        //       }
              

        //       if(arr[i] == '1'){
        //         this.leads[x].leads++;
        //         console.log( this.leads[x].leads);
                
        //       }
              

        //     }
            
        //   }
          
        // }
        
        if(this.search && this.leads.length < 1) { this.searchData = false; }
        if(this.search && this.leads.length > 1) { this.searchData = true; }
        this.loading_list = true;
      },err => { 
        this.dialog.retry().then((result) => { 
        this.getLeadList();      
        console.log(err);
       });  
      });
  }

  deleteLead(l_id) {
    this.dialog.delete('franchises').then((result) => {
      if(result) {
    this.loading_list = false;

        this.db.post_rqst({l_id: l_id}, 'franchises/remove')
          .subscribe(data => {
            this.loading_list = true;
            this.data = data;
            if (this.data.data.r_lead) { this.getLeadList(); }
          },err => {  this.dialog.retry().then((result) => { 
            this.deleteLead(l_id);      
            console.log(err); });  
          });
      }
    });
  }
  
  orderListReverse(){
    this.leads=this.leads.reverse();
  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];