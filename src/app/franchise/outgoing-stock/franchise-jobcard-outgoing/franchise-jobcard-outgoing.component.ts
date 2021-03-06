import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {SessionStorage} from '../../../_services/SessionService';
import { ConsumptionStockViewComponent } from '../../../franchise/consumption/consumption-stock-view/consumption-stock-view.component';

@Component({
  selector: 'app-franchise-jobcard-outgoing',
  templateUrl: './franchise-jobcard-outgoing.component.html'
})
export class FranchiseJobcardOutgoingComponent implements OnInit {

  loading: any;
  products: any = [];
  unit_prices: any = [];
  attr_types: any = [];

  stock_total: any = [];
  stock_qty: any = [];

  attr_options: any = [];
  data: any;

  loading_list: any = false;

  stock_id:any = '';
  franchise_id: any = '';

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.stock_id = this.db.crypto(params['stock_id'],false);

    
    if (this.stock_id &&  this.franchise_id) {
       this.getProductDetail(); 
      }

    });
  }

  product:any = {};
  raw_data:any = [];
  unit:any = {};
  getProductDetail() {
    this.loading_list = true;
    this.db.post_rqst(  { 'stock_id':this.stock_id , 'franchise_id': this.franchise_id  }, 'stockdata/franchise_jobcard_outgoing')
      .subscribe(d => {
        console.log(d);
        
        this.loading_list = false;
        // this.product = d['data'].prod;
        this.raw_data = d['data'].items;
        this.unit = d['data'].unit;

      },err => {
        this.loading_list = false;

            this.dialog.retry().then((result) => {
            });
      });
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


}