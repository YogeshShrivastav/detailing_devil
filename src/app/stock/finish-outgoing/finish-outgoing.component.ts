import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-finish-outgoing',
  templateUrl: './finish-outgoing.component.html',
})
export class FinishOutgoingComponent implements OnInit {

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
    this.db.post_rqst(  { 'id':this.prod_id,  'unit_id':this.unit_id , 'category':'Product' }, 'sales/accessory_outgoing')
      .subscribe(data => {
        this.loading_list = false;
        this.data = data;
        this.product = this.data.data.prod;
        this.raw_data = this.data.data.items;
console.log( this.data.data);

        console.log(this.product);
        
        this.unit = this.data.data.unit;
        console.log(data);

      },err => {
        this.loading_list = false;

            // this.dialog.retry().then((result) => {
            //     this.getProductDetail();
            // });
      });
  }
  // deleteProduct(p_id) {
  //   this.dialog.delete('Product').then((result) => {
  //     if(result) {
  //       this.db.post_rqst({p_id: p_id}, 'products/remove')
  //         .subscribe(data => {
  //           this.data = data;
  //           if (this.data.data.r_product) { this.getProductDetail(); }
  //         });
  //      }
  //   });
  // }
}