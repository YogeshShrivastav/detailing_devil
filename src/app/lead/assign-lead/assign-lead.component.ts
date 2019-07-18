import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-assign-lead',
  templateUrl: './assign-lead.component.html',
})
export class AssignLeadComponent implements OnInit {
  form: any = {};
  lead_id: any = [];
  temp: any;
  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
    private router: Router,  public dialog: DialogComponent,
    @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<AssignLeadComponent>)
    {
      this.lead_id = lead_data.lead_id;
      console.log('****LEAD ID ARRAY***');
      console.log(this.lead_id);
    }
    
    ngOnInit() {
      this.GetFranchiseList();
    }
    
    data:any = [];
    franchise_list:any = [];
    GetFranchiseList(){  
      this.db.post_rqst({}, 'consumer_leads/getFranchise')
      .subscribe(data => {  
        this.data = data;
        this.franchise_list = this.data.data.franchise_list;
        console.log("*******FRANCHISE LIST******");
        console.log(this.franchise_list);
      },err => {  this.dialog.retry().then((result) => { this.GetFranchiseList(); });   });
    }
    
    
    saveFranchise() {
      this.sendingData = true;
      this.form.lead_id = this.lead_id;
      console.log(this.form);
      
      if(this.form.franchise_id){
        this.form.location_id = this.franchise_list.filter((x) => x.id === this.form.franchise_id)[0].location_id;
      }else{
        this.form.location_id = 0;
      }
      
      if(this.form.franchise_id == 0)
      {
        console.log(this.form);
        this.db.post_rqst( {'data' :this.form}, 'consumer_leads/un_assign_franchise/'+this.db.datauser.id)
        .subscribe(data => {
          this.temp = data;
          this.sendingData = false;
          console.log(this.temp);
          if (this.temp.data.assign) {
            this.dialogRef.close(this.temp.data.assign);
          }
        },err => {  this.dialog.retry().then((result) => { this.saveFranchise(); });   });
      }
      else
      {
        this.db.post_rqst( {'data' :this.form}, 'consumer_leads/assign_franchise/'+this.db.datauser.id)
        .subscribe(data => {
          this.temp = data;
          this.sendingData = false;
          console.log(this.temp);
          if (this.temp.data.assign) {
            this.dialogRef.close(this.temp.data.assign);
          }
        },err => {  this.dialog.retry().then((result) => { this.saveFranchise(); });   });
      }
    }
  }
  