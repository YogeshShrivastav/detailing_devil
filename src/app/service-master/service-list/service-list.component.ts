import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html'
})
export class ServiceListComponent implements OnInit {
  
  loading: any;
  sevice: any = [];
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
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getFranchiseService(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }
  redirect_previous() {
    this.current_page--;
    this.getFranchiseService();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getFranchiseService();
  }
  filter:any = {};
  filtering:any = '';
  getFranchiseService() {
    this.loading_list = true;

    if(this.filter.search )this.filtering = true;

    this.db.post_rqst(  {'filter':this.filter }, 'stockdata/getFranchiseService?page=' + this.current_page)
      .subscribe(d => {
        this.loading_list = false;
console.log(d);
        this.sevice = d.sevice.data;
        this.current_page = d.sevice.current_page;
        this.last_page = d.sevice.last_page;
        console.log(this.sevice );
        
      },err => { this.loading_list = false;
            this.dialog.retry().then((result) => { this.getFranchiseService(); });
      });
  }

  p_id:any = {};
  deleteProduct(p_id) {
    this.dialog.delete('Product').then((result) => {
      if(result) {
        this.db.post_rqst({'p_id':p_id}, 'stockdata/remove')
          .subscribe(data => {
            this.data = data;
            this.getFranchiseService();
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




