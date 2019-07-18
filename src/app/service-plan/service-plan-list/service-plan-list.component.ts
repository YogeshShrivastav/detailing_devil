import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-service-plan-list',
  templateUrl: './service-plan-list.component.html'
  // styleUrls: ['./service-plan-list.component.scss']
})
export class ServicePlanListComponent implements OnInit {
  loading: any;
  products: any = [];
  service_plans: any = [];
  visit_types: any = [];
  raw_materials: any = [];
  data: any;
  search: any = '';
  loading_page = false;
  loading_list: any = false;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  num_of_visits: number;
  searchData = true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) { this.getServicePlanList(); }
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }
  redirect_previous() {
    this.current_page--;
    this.getServicePlanList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getServicePlanList();
  }
  getServicePlanList() {
    this.loading_list = true;
    this.db.get_rqst(  '', 'service_plans?page=' + this.current_page + '&s=' + this.search)
      .subscribe(data => {
        this.loading_list = false;
        this.data = data;
        this.current_page = this.data.data.service_plans.current_page;
        this.last_page = this.data.data.service_plans.last_page;
        this.service_plans = this.data.data.service_plans.data;
        if(this.search && this.service_plans.length < 1) this.searchData = false;
        else { this.searchData = true; }
        this.visit_types = this.data.data.visit_types;
        this.raw_materials = this.data.data.raw_materials;
        this.num_of_visits = this.data.data.service_plans.number_of_visits;
        this.loading_list = false;
      },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getServicePlanList(); }); }); 
  }

  deleteServicePlan(s_id) {
    this.loading_list = false;

    this.dialog.delete('Service').then((result) => {
      if(result) {
        this.db.post_rqst({s_id: s_id}, 'service_plans/remove')
          .subscribe(data => {
            this.loading_list = false;
            this.data = data;
            this.getServicePlanList();
          });
      }
    },err => {  this.loading_list = false;  this.dialog.retry().then((result) => {  this.deleteServicePlan(s_id);  });  });
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];
