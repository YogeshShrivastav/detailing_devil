import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {SessionStorage} from '../../../_services/SessionService';
import { ConsumptionStockViewComponent } from '../../../franchise/consumption/consumption-stock-view/consumption-stock-view.component';


@Component({
  selector: 'app-consumption-stock-outgoing',
  templateUrl: './consumption-stock-outgoing.component.html'
})
export class ConsumptionStockOutgoingComponent implements OnInit {

  prod_id:any = '';

  loading: any;
  products: any = [];
  unit_prices: any = [];
  attr_types: any = [];

  stock_total: any = [];
  stock_qty: any = [];

  attr_options: any = [];
  data: any;

  loading_list: any = false;
  unit_id: any = '';
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.prod_id = params['id'];
      this.unit_id = params['unit_id'];

    
    if (this.prod_id) {
       this.getProductDetail(); 
      }

    });
  }

  product:any = {};
  raw_data:any = [];
  unit:any = {};
  getProductDetail() {
    this.loading_list = true;
    this.db.post_rqst(  { 'id':this.prod_id,  'unit_id':this.unit_id  }, 'sales/consumption_outgoing')
      .subscribe(d => {
        this.loading_list = false;
        this.raw_data = d['data'].items;
        this.product = d['data'].prod;
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