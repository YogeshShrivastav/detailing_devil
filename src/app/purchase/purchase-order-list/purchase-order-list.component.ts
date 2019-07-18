import { Component, OnInit , ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';


@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html'
})
export class PurchaseOrderListComponent implements OnInit {
  loading: any;
  po_id: any;
  data: any;
  isInvoiceDataExist = false;
  search: any = '';
  source: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  leads: any = [];
  current_page = 1;
  total_order:any;
  last_page: number ;
  searchData = true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) {
  }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
    this.getPurchaseOrderList();
  }

  orders:any= [];
  
  redirect_previous() {
    this.current_page--;
    this.getPurchaseOrderList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getPurchaseOrderList();
  }

  
  filter:any = {};

  filtering : any = false;

  getPurchaseOrderList() {

    this.isInvoiceDataExist = false;
    this.loading_list = true;
          
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';

    
    if( this.filter.date || this.filter.search || this.filter.status)this.filtering = true;

  
    this.db.post_rqst( { 'filter': this.filter }, 'purchase?page=' + this.current_page )
      .subscribe(data => {
        //console.log(data);
        this.loading_list = false;
        
        this.data = data['data']['purchesorderList'];
        this.orders = this.data.data;
        this.current_page = this.data.current_page;
        this.last_page = this.data.last_page;
        this.total_order = this.data.total;
        if (this.search && (this.orders.length < 1)) { this.searchData = false; }
        if (this.search && (this.orders.length > 0)) { this.searchData = true; }
      },error => {
        this.loading_list = false;
        this.dialog.retry().then((result) => {  this.getPurchaseOrderList(); }); });
  }
  deletePurchaseorder(po_id) {   
    this.dialog.delete('Purchase Order').then((result) => {
     if(result) {
        this.db.post_rqst({po_id: po_id}, 'purchase/remove')
          .subscribe(data => {
            this.data = data;            
            this.getPurchaseOrderList();                  
            });
       }
    });  
 }
  orderListReverse(){
    this.orders=this.orders.reverse();
  }


  formData = new FormData();

  
  fileChange(event) {
    
    this.formData.set('image data', event.target.files[0], event.target.files[0].name);
    this.formData.set('x', 'k');
    
    this.db.fileData( this.formData, 'stock/imageTest')
    .subscribe(data => {
   console.log( data );
               
      });

    }


}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];

