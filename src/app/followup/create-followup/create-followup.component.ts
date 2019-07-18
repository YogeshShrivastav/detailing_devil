import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-create-followup',
  templateUrl: './create-followup.component.html'
})
export class CreateFollowupComponent implements OnInit {
  form: any = {};
  l_id: any;
  temp: any;
  lead_type: any;
  status: any = '';
  followUpTypes = ['Call', 'Meeting','Demo','Appointment'];
  nextFollowUpTypes = ['Call', 'Meeting','Demo','Appointment'];
  sendingData = false;
  formData: any = {};
  followUpSaveUrl: any;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
             private router: Router,  public dialog: DialogComponent,
              @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<CreateFollowupComponent>) {
    this.l_id = lead_data.l_id; this.lead_type = lead_data.type; this.status = lead_data.status; }

  ngOnInit() {
  }
  saveFollowUp() {
    this.sendingData = true;
    this.formData.l_id = this.l_id;
    this.formData.follow_type = this.form.follow_type ? this.form.follow_type : '';
    this.formData.next_follow_type = this.form.next_follow_type ? this.form.next_follow_type : '';
    this.formData.description = this.form.description ? this.form.description : '';
    this.formData.next_follow_date = this.form.next_follow_date ? this.form.next_follow_date : '';
    this.formData.user_id = this.ses.users.id;
    this.formData.access_level = this.ses.users.access_level;
    this.formData.franchise_id = this.ses.users.franchise_id;
    this.formData.status = this.status ? this.status : '';

    console.log(this.formData.next_follow_date);
    if(this.formData.next_follow_date ){

    var c = moment(this.formData.next_follow_date );
    console.log(c.format('Y-M-D'));
    
    this.formData.next_follow_date = c.format('Y-M-D') ;
  }
    
    if(this.lead_type == 'franchise') { this.followUpSaveUrl = 'franchise_follow_ups/save'; }
    if(this.lead_type == 'consumer') { this.followUpSaveUrl = 'consumer_follow_ups/save'; }
    this.db.post_rqst( this.formData, this.followUpSaveUrl)
      .subscribe(data => {
        this.temp = data;
        this.sendingData = false;
        if (this.temp.data.follow_ups) {
          this.dialogRef.close(this.temp.data.follow_ups);
        }
      },err => {  this.dialog.retry().then((result) => { this.saveFollowUp(); });   });
  }

  
}
