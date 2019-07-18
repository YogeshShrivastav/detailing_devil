import { Component,Inject, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-add-car-model',
  templateUrl: './add-car-model.component.html',
})
export class AddCarModelComponent implements OnInit {

  constructor(public db: DatabaseService,
   public dialog: DialogComponent,
     @Inject(MAT_DIALOG_DATA)  public lead_data: any, public dialogRef: MatDialogRef<AddCarModelComponent>) { 
      this.car.company_name = lead_data.car_id;
     }
 
     car_id :any = ''; 
  ngOnInit() {
  }
  sendingData = false;
  loading_list:any = false;
  car: any = {};
  saveCar(){
      this.loading_list = true;
  console.log(this.car);
  
      this.db.post_rqst( {'car': this.car }, 'carmodel/saveCar')
        .subscribe(data => {
          this.dialogRef.close('true');
          this.dialog.success('Car Added Successfully');
          this.loading_list = false;
        },err => { this.dialog.retry().then((result) => { this.loading_list = false;  }); });
  
  }

}
