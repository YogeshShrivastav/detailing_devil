import { Component, OnInit } from '@angular/core';
// import {MatPaginator, MatTableDataSource} from '@angular/material';
import {DatabaseService} from '../_services/DatabaseService';
import {DialogComponent} from '../dialog/dialog.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
})
export class OrganizationComponent implements OnInit {
  id:any = [];

  constructor(public db: DatabaseService, public dialog: DialogComponent )          {  }


  ngOnInit() {
    this.getOrganizationList();
  //   this.deleteorganization(id);
  // }
  }

  loading_list = false;

   
  organization_list:any = [];
  getOrganizationList() {
    this.loading_list = true;

    this.db.post_rqst(  '', 'organization')
      .subscribe(data => {
        this.organization_list = data['data'].organization_list;
        this.loading_list = false;
      },err => { this.dialog.retry().then((result) => { this.loading_list = false; this.getOrganizationList(); }); });
  }


 
  data:any = [];
  deleteorganization(id) {
    console.log(id);
    
    this.dialog.delete('organization').then((result) => {
      if (result) {

        this.db.post_rqst({'id': id},'organization/deleteorganization')
        .subscribe((data: any) => {
          this.data = data;
         this.getOrganizationList(); 
        });
      }
  })
}
} 
  

 
      