import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../../dialog/dialog.component';
import {SessionStorage} from '../../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-service-start',
  templateUrl: './service-start.component.html'
})
export class ServiceStartComponent implements OnInit {


  form: any = {};
  l_id: any;
  temp: any;
  service_id: any;
  status: any = '';
  followUpTypes = ['Call', 'Meeting','Demo','Appointment'];
  nextFollowUpTypes = ['Call', 'Meeting','Demo','Appointment'];
  sendingData = false;
  formData: any = {};
  followUpSaveUrl: any;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
             private router: Router,  public dialog: DialogComponent,
              @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<ServiceStartComponent>) {
              this.service_id = lead_data.service_id
            }

  ngOnInit() {
  }
  saveFollowUp() {
    this.sendingData = true;
    this.form.service_id = this.service_id;
    this.form.start_date = this.form.start_date ? this.db.pickerFormat(this.form.start_date) : '';


    this.db.insert_rqst( this.form, 'stockdata/update_service_start_date')
      .subscribe(data => {
        this.sendingData = false;
        this.dialogRef.close(true);
    
      },err => {  this.dialog.retry().then((result) => { });   });
  }

  
}
