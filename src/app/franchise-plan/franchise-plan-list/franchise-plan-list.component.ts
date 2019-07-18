import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-franchise-plan-list',
  templateUrl: './franchise-plan-list.component.html'
  // styleUrls: ['./franchise-plan-list.component.scss']
})
export class FranchisePlanListComponent implements OnInit {
  loading: any;
  franchise_plans: any;
  accessories: any = [];
  initial_stocks: any = [];
  data: any;
  search: any = '';
  loading_list: any = false;
  loading_page = false;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  searchData = true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getFranchisePlanList(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loading_page = true;
  }
  redirect_previous() {
    this.current_page--;
    this.getFranchisePlanList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getFranchisePlanList();
  }
  getFranchisePlanList() {
    this.loading_list = false;
    this.db.get_rqst(  '', 'franchise_plans?page=' + this.current_page + '&s=' + this.search)
      .subscribe(data => {
        this.data = data;
        this.current_page = this.data.data.franchise_plans.current_page;
        this.last_page = this.data.data.franchise_plans.last_page;
        this.franchise_plans = this.data.data.franchise_plans.data;
        if(this.search && this.franchise_plans.length < 1) { this.searchData = false; }
        else { this.searchData = true; }
        this.accessories = this.data.data.accessories;
        this.initial_stocks = this.data.data.initial_stocks;
        this.loading_list = true;
      });
  }

  deleteFranchisePlan(f_id) {
    this.dialog.delete('Franchise').then((result) => {
      if(result) {
        this.db.post_rqst({f_id: f_id}, 'franchise_plans/remove')
          .subscribe(data => {
            this.data = data;
            if (this.data.data.r_franchise) { this.getFranchisePlanList(); }
          });
      }
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
