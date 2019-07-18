import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-received-purchase-order',
  templateUrl: './received-purchase-order.component.html'
})
export class ReceivedPurchaseOrderComponent implements OnInit {
  purchase_id;
  loading_list = false;
  vendor_name;
  created_by;
  purchase_form:any = {};
  pending_items_detail: any = [];
  pendingReceiveItemValid: any= true;
  formData: any = {};

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) { }
  
  ngOnInit() {   
      this.route.params.subscribe(params => {
      this.purchase_id = params['id'];
      console.log(this.purchase_id);        
    
    if (this.purchase_id) {
      this.getPurchaseDetails(this.purchase_id); 
    }
  });
  }
  itemdetail:any = [];
  orderdetail:any = [];  
  tmp:any = {};  
  getPurchaseDetails(purchase_id) {
    this.loading_list = false;
    this.db.get_rqst(  '', 'purchase/details/' + purchase_id)
    .subscribe(data => {
      //console.log(data);
      this.tmp = data;
      this.orderdetail = this.tmp.data.orderdetail;
      this.itemdetail = this.tmp.data.itemdetail;      
      this.created_by = this.tmp.data.usernam;
      // console.log('*****DATA*****');    
      // console.log('****item detail****');
      // console.log(this.itemdetail);
      this.loading_list = true;
    },error => {
  
              this.dialog.retry().then((result) => {  this.getPurchaseDetails(purchase_id); }); });
  }

  add_receive_order_detail()
  {
    this.loading_list = false;

   console.log(this.purchase_form);
   console.log(this.itemdetail);
   this.purchase_form.invoice_date = this.db.pickerFormat(this.purchase_form.invoice_date);

   this.formData = this.purchase_form;
   console.log(this.formData);
   this.formData['invoice_date']=this.formData['invoice_date'] || '';
   this.formData['invoice_amt']=this.formData['invoice_amt'] || '';
   this.formData['receive_note']=this.formData['receive_note'] || '';
   this.formData['purchase_order_id']=this.orderdetail.id;
   this.formData['vendor_id']=this.orderdetail.vendor_id;
   this.formData['created_by']=this.orderdetail.created_by;
   this.formData['created_by_type']=this.orderdetail.created_by_type;



   this.formData.items = this.itemdetail;
   this.db.insert_rqst(this.formData,'purchase/save_po_receive')
    .subscribe((result:any) => {
      console.log(result); 
      var temp_route = '/purchases/'+this.purchase_id+'/details/';
      //this.router.navigate(['/purchases']);
      this.router.navigate([temp_route]); 
    this.loading_list = true;

    },err=>{ this.loading_list = true; this.dialog.retry().then((result) => {  }); });
    
  }
  
   fildata = new FormData();

  fileChange(event) {
    this.fildata.append( 'doc', event.target.files[0]);
    console.log(this.fildata);
console.log( event.target.files[0]);

    this.db.fileData(this.formData,'purchase/fil')
    .subscribe((r) => {
      console.log(r);
      
     

    },err=>{ this.loading_list = true; this.dialog.retry().then((result) => {  }); });
      

  }


  numeric_Number(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    // console.log(event.keyCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  
  

  reject_qty;
  accept_qty;
  pending;
  val_accept(i:any)
  {

    if( this.itemdetail[i].pending_qty >= this.itemdetail[i].accept_qty){
      this.itemdetail[i].accept_qty = this.itemdetail[i].accept_qty;
    }else{      
      this.itemdetail[i].accept_qty = this.itemdetail[i].pending_qty;
    }
    //this.pending_items_detail[i].accept_qty = parseInt(this.pending_items_detail[i].pending_qty) - parseInt(reject_qty);
    this.val_reject(i);
  }

  val_reject(i:any)
  {

    if( this.itemdetail[i].reject_qty >= (this.itemdetail[i].pending_qty-this.itemdetail[i].accept_qty)){
      this.itemdetail[i].reject_qty = (this.itemdetail[i].pending_qty-this.itemdetail[i].accept_qty);
    }else{      
      this.itemdetail[i].reject_qty = this.itemdetail[i].reject_qty;
    }
    //this.pending_items_detail[i].accept_qty = parseInt(this.pending_items_detail[i].pending_qty) - parseInt(reject_qty);
    this.val_accept(i);
  }

}
