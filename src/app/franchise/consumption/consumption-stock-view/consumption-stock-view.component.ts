import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {SessionStorage} from '../../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-consumption-stock-view',
  templateUrl: './consumption-stock-view.component.html'
})
export class ConsumptionStockViewComponent implements OnInit {

  
  stock: any = {};
  id: any;
  sendingData = false;
 items: any = [];
  constructor(public db: DatabaseService,   public dialog: DialogComponent,
              @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<ConsumptionStockViewComponent>) {
    this.id = lead_data.id;
  if(this.id){this.getAssumptionStockItem();}
  }

  ngOnInit() {
  }
  loading_list:any = false;
  getAssumptionStockItem() {
   this.sendingData = true;
   this.loading_list = true;
  
    this.db.post_rqst( {'id':this.id}, 'stockdata/getAssumptionStockItem')
      .subscribe(d => {
        console.log(d);
   this.loading_list = false;
        
        this.items = d['data'].assumption_stock_item;
        this.stock = d['data'].assumption_stock;
         this.sendingData = false;

      },err => { this.loading_list = false; this.sendingData = false; this.dialog.retry().then((result) => { });   });
  }

  
}
