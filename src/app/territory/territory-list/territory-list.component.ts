
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-territory-list',
  templateUrl: './territory-list.component.html'
})
export class TerritoryListComponent implements OnInit {
  loading_list = false;
  current_page = 1;
  last_page: number ;
  locations:any = [];
  franchises:any = [];
  data: any;
  search: any = '';
  loading_page= true;
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent ) {
    this.loading_page= true;
   }
  ngOnInit() {
    this.getLocationList();
    this.dataSource.paginator = this.paginator;
    
  }
  redirect_previous() {
    this.current_page--;
    this.getLocationList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getLocationList();
  }
  
  getLocationList() {
    this.loading_list = true;
    this.db.get_rqst(  '', 'vendors/locations?page=' + this.current_page + '&s=' + this.search)
      .subscribe(data => {
        this.loading_list = false;       
        this.data = data;    
        this.current_page = this.data.data.location.current_page;
        this.last_page = this.data.data.location.last_page;    
        this.locations = this.data.data.location.data;
        this.franchises = this.data.data.franchiselist;
        console.log(this.data);
        console.log(this.franchises);        
        console.log(this.locations); 
      },err => { this.dialog.retry().then((result) => { this.getLocationList(); }); });
 }

 deleteLocations(l_id) {
  this.dialog.delete('Location').then((result) => {
   if(result) {
      this.db.post_rqst({l_id: l_id}, 'vendors/locationremove')
        .subscribe(data => {
          this.data = data;            
          this.getLocationList();             
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