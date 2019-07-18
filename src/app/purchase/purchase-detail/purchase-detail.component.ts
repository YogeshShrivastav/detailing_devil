import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';



@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html'
})
export class PurchaseDetailComponent implements OnInit {
  purchase_id;
  loading_list = false;
  vendor_name;
  created_by;
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
    }
    
    ngOnInit() {      
      this.route.params.subscribe(params => {
        this.purchase_id = this.db.crypto(params['id'],false);
        console.log(this.purchase_id);        
     
      if (this.purchase_id) {
        this.getPurchaseDetails(this.purchase_id); 
      }
    });
    }
    orderdetail:any = [];
    itemdetail:any = [];
    orderreceive:any = [];
    allitem:any = [];
    v_contact:any =[];
    vp_log:any =[];
    tmp:any = {};
    form: any = {};
    qty;
    receiveqty;
    getPurchaseDetails(purchase_id) {
      this.loading_list = false;
      this.db.get_rqst(  '', 'purchase/details/' + purchase_id)
      .subscribe(data => {
        console.log(data);
        this.tmp = data;
        this.orderdetail = this.tmp.data.orderdetail;
        this.itemdetail = this.tmp.data.itemdetail;
        this.v_contact = this.tmp.data.v_con;
        this.vp_log = this.tmp.data.v_log;
        this.created_by = this.tmp.data.usernam;
        this.orderreceive = this.tmp.data.pid_receive;
        this.allitem = this.tmp.data.all_receive_item;
        this.qty = this.tmp.data.itemdetailqty;
        this.receiveqty = this.tmp.data.itemdetailqty;
        // console.log('*****DATA*****');
        // console.log(this.orderreceive);
        // console.log('****order detail****');
        // console.log(this.allitem);
        // console.log(this.orderdetail);
        // console.log('****item detail****');
        // console.log(this.itemdetail);
        // console.log('****contacts****');
        // console.log(this.v_contact);
        // console.log('****order log****');
        // console.log(this.vp_log);
        // console.log('****order creator****');
        // console.log(this.created_by);
        
        this.form.name=this.orderdetail.name;
        this.form.mobile = this.orderdetail.phone;
        this.form.landline = this.orderdetail.landline;
        this.form.address = (this.orderdetail.address)+(' ')+(this.orderdetail.city)+(' ')+(this.orderdetail.district)+(' ')+(this.orderdetail.state)+(' ')+(this.orderdetail.country);
        this.loading_list = true;
      },error => {
  
        this.dialog.retry().then((result) => {  this.getPurchaseDetails(purchase_id); }); });
    }
    
  }
  