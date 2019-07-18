import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import { AddCompanyModelComponent } from '../add-company-model/add-company-model.component';
import {MatDialog} from '@angular/material';
import { AddCarModelComponent } from '../add-car-model/add-car-model.component';

@Component({
  selector: 'app-car-model-list',
  templateUrl: './car-model-list.component.html',
})
export class CarModelListComponent implements OnInit {

  loading: any;
  data: any;
  search: any = '';
  loading_page = false;
  loading_list = false;
  loader: any = false;
  current_page = 1;
  last_page: number ;
  searchData = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public db: DatabaseService, public dialog: DialogComponent,public matDialog: MatDialog ) { this.getCarModelList(); }
  ngOnInit() {
  
    this.loading_page = true;
  }
  redirect_previous() {
    this.current_page--;
    this.getCarModelList();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getCarModelList();
  }



  company_list:any = [];
  getCarModelList() {
    this.loading_list = false;

    this.db.get_rqst(  '', 'carmodel?page=' + this.current_page)
      .subscribe(data => {
        this.data = data;
        console.log(this.data);
        this.company_list = this.data.data.carmodel;
        this.loading_list = true;
      },err => {
            this.dialog.retry().then((result) => { this.getCarModelList(); });
      });
  }


//   deleteCompany(company:any) {
//     console.log(company);
//     this.dialog.delete('Company').then((result) => {
//       if(result) {
//         this.db.post_rqst({company: company}, 'carmodel/remove')
//           .subscribe(data => {
//             this.data = data;
//             console.log(this.data);
//             this.getCarModelList();
//             // if (this.data.data.r_product) { this.deleteCompany(company); }
//           });
//        }
//     },err => {
//       this.dialog.retry().then((result) => { this.deleteCompany(company); });
// });
//   }


  openAddCompanyDialog() {
    const dialogRef = this.matDialog.open(AddCompanyModelComponent, {
      data:{
        t:''
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result) { this.getCarModelList();  }
      this.getCarModelList();  
    });
  }


  
  openAddCarDialog(id) {
    const dialogRef = this.matDialog.open(AddCarModelComponent, {
      data: {
        car_id: id
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) { this.getCarModelList();  }
    });
  }

  deletecar(car:any) {
    console.log(car);
    this.dialog.delete('car').then((result) => {
      if(result) {
        this.db.post_rqst({'car': car}, 'carmodel/removeCar')
          .subscribe(data => {
            this.data = data;
            console.log(this.data);
            this.getCarModelList();
            // if (this.data.data.r_product) { this.deleteCompany(company); }
          });
       }
    },err => {
      this.dialog.retry().then((result) => { this.deletecar(car); });
});
  }
  deleteCompany(company:any) {
    console.log(company);
    this.dialog.delete('Company').then((result) => {
      if(result) {
        this.db.post_rqst({'company': company}, 'carmodel/removeCompany')
          .subscribe(data => {
            this.data = data;
            console.log(this.data);
            this.getCarModelList();
            // if (this.data.data.r_product) { this.deleteCompany(company); }
          });
       }
    },err => {
      this.dialog.retry().then((result) => { });
});
  }

  



}








