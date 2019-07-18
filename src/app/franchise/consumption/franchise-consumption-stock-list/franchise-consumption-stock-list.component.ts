import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {SessionStorage} from '../../../_services/SessionService';
import { log } from 'util';
import { ConsumptionStockViewComponent } from '../consumption-stock-view/consumption-stock-view.component';
import { FranchiseConsumptionStockAddComponent } from '../franchise-consumption-stock-add/franchise-consumption-stock-add.component';


@Component({
  selector: 'app-franchise-consumption-stock-list',
  templateUrl: './franchise-consumption-stock-list.component.html'
})
export class FranchiseConsumptionStockListComponent implements OnInit {

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) { }
  franchise_id;
  loading_list = false;
  ngOnInit() {
      this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      console.log(this.franchise_id);   
      if (this.franchise_id) {
        this.getFranchiseOrderList(); 
       }
    });
  }

  assumption_stock:any = [];
  tmp:any;
  tmp2:any;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  searchData = true;
  total_leads = 0;

  redirect_previous() {
    this.current_page--;
    this.getFranchiseOrderList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getFranchiseOrderList();
  }


  getFranchiseOrderList() {
    this.loading_list = true;
    this.db.post_rqst( { 'franchise_id': this.franchise_id,'type': 'Franchise'}, 'stockdata/getAssumptionStock?page=' + this.current_page )
    .subscribe(d => {
      console.log(d);
      
     this.assumption_stock = d['data'].assumption_stock.data;
     this.current_page = d['data'].assumption_stock.current_page;
     this.last_page = d['data'].assumption_stock.last_page;
     this.total_leads = d['data'].assumption_stock.total;


     console.log(  this.assumption_stock );
     this.loading_list = false;
    },err => {  this.loading_list = false; this.dialog.retry().then((result) => { 
      this.getFranchiseOrderList();      
      console.log(err); });  
     });
  }

  GetSaleOrder(action:any)
  {
    console.log(action);
    this.loading_list = true;
    this.db.post_rqst(  {'franchise_id':this.franchise_id,'action':action}, 'franchises/franchise_saleorder_asper_status')
      .subscribe((result)=>{
        this.tmp2 = result;
        this.loading_list = false;
        console.log(this.tmp2);
        this.assumption_stock = this.tmp2['data']['ordersale'];
        console.log(this.assumption_stock);
      },err => {  this.dialog.retry().then((result) => { 
        this.GetSaleOrder(action);      
        console.log(err); });  
       });
  }
  orderListReverse(){
    this.assumption_stock=this.assumption_stock.reverse();
  }


  openDetail(id) {
    const dialogRef = this.matDialog.open(ConsumptionStockViewComponent, {
      width: '1024px',
      data: {
        id: id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
     
    });
  }


  addStock() {
    const dialogRef = this.matDialog.open(FranchiseConsumptionStockAddComponent, {
      width: '1024px',data: { franchise_id : this.franchise_id ,type:'Franchise'}
    });

    dialogRef.afterClosed().subscribe(r => {
      if(r){
        this.getFranchiseOrderList();
      }
    });
  }

  cancel_consumption(id) {
    this.dialog.delete('Consumption Stock').then((result) => {
            if (result) {
              this.loading_list =true;
            
              this.db.insert_rqst( { 'id': id }, 'stockdata/cancel_consumption')
              .subscribe((result)=>{ 
                this.loading_list =false;
                this.getFranchiseOrderList();

                this.dialog.success('Successfully consumption stock cancel');
              },err => {  this.dialog.retry().then((result) => { 
                this.loading_list =false;
                console.log(err); });  
              });
          }
          
    });

}
}