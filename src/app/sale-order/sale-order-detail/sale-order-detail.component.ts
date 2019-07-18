import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';


@Component({
  selector: 'app-sale-order-detail',
  templateUrl: './sale-order-detail.component.html'
})
export class SaleOrderDetailComponent implements OnInit {

  loading: any;
  orderDetail: any = [];
  orderItemDetail: any = {};
  orderInvoiceList: any = {};
  data: any;

  order_id;
  loading_list = true;

  current_page = 1;
  last_page: number ;

  constructor(public db: DatabaseService,
              private route: ActivatedRoute, 
              public dialog: DialogComponent,
              private router: Router) {   
              }

  ngOnInit() {

      this.route.params.subscribe(params => {
        this.order_id = this.db.crypto(params['id'],false) || '';
        if( this.order_id ) this.salesOrderDetail(); 

      });
  }




  

  salesOrderDetail() {
console.log(this.order_id);
    this.loading_list = false;

    this.db.get_rqst(  '', 'sales/getSalesOrder/' + this.order_id)
      .subscribe(data => {
        this.loading_list = true;

        this.orderDetail = data['data']['orderdetail']; 
        if( !this.orderDetail ){ 
          this.dialog.warning('This Order has been Deleted!'); 
          this.router.navigate(['/sale-order-list']);
          return;
        }
        this.orderItemDetail = data['data']['itemdetail'];
        this.orderInvoiceList = data['data']['orderInvoiceList'];
        console.log(data);
        console.log(this.orderDetail);
        console.log(this.orderItemDetail);
      },err => {  this.dialog.retry().then((result) => { this.salesOrderDetail(); });   });
}


  reject_order() {
    this.dialog.delete('Reject Order !','Confirm', 'Cancel','').then((result) => {
      console.log(result);
      if(result){
      this.loading_list = false;
      this.db.post_rqst(  { 'login':this.db.datauser , 'id' : this.order_id} , 'sales/reject_order')
      .subscribe(data => {
      this.loading_list = true;
      this.salesOrderDetail();
      this.dialog.error('Order Rejected Successfully');
  });
      }
});
}





}
