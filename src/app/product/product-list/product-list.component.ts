import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
  // styleUrls: ['./product-list.component.scss']
})


export class ProductListComponent implements OnInit {
  loading: any;
  products: any = [];
  unit_prices: any = [];
  attr_types: any = [];
  attr_options: any = [];
  data: any;
  search: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  searchData = true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getProductList(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
  }
  redirect_previous() {
    this.current_page--;
    this.getProductList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getProductList();
  }
  getProductList() {
    this.loading_list = false;
    const typ = 'Product';

    this.db.get_rqst( '', 'products?page=' + this.current_page + '&s=' + this.search + '&t=' + typ)
      .subscribe(data => {
        console.log(data);
        this.data = data;
        this.current_page = this.data.data.products.current_page;
        this.last_page = this.data.data.products.last_page;
        this.products = this.data.data.products.data;
        if(this.search && this.products.length < 1) { this.searchData = false; }
        else { this.searchData = true; }
        this.unit_prices = this.data.data.unit_prices;
        this.attr_types = this.data.data.attr_types;
        this.attr_options = this.data.data.attr_options;
        this.loading_list = true;
      },err => {
            this.dialog.retry().then((result) => { this.getProductList(); });
      });
  }
  deleteProduct(p_id) {
    this.dialog.delete('Product').then((result) => {
      if(result) {
        this.db.post_rqst({p_id: p_id}, 'products/remove')
          .subscribe(data => {
            this.data = data;
            this.getProductList();
          });
       }
    },err => {
      this.dialog.retry().then((result) => { this.deleteProduct(p_id); });
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




