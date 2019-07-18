import { Component,Inject, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-add-company-model',
  templateUrl: './add-company-model.component.html',
})
export class AddCompanyModelComponent implements OnInit {

  constructor(
    public db: DatabaseService, 
   public dialog: DialogComponent,
   @Inject(MAT_DIALOG_DATA)  public lead_data: any, public dialogRefc: MatDialogRef<AddCompanyModelComponent>) {}
 

  ngOnInit() {
  }
  sendingData = false;
  loading_list:any = false;
  car: any = {};
  saved: any = false;

  saveCompany(){
      this.loading_list = true;
  
      this.db.post_rqst(  {'car':this.car }, 'carmodel/addCompany')
        .subscribe(data => {
          this.loading_list = false;
          this.saved = false;
          this.dialog.success('Vehicle Added Successfully');
          this.dialogRefc.close('true');
        },err => { this.dialog.retry().then((result) => { this.loading_list = false;  }); });
  
  }

}
