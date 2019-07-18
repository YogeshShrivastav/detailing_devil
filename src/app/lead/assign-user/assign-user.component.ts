import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import * as moment from 'moment';

@Component({
  selector: 'app-assign-user',
  templateUrl: './assign-user.component.html',
})
export class AssignUserComponent implements OnInit {
  form: any = {};
  franchise_id: any = [];
  temp: any;
  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
    private router: Router,  public dialog: DialogComponent,
    @Inject(MAT_DIALOG_DATA) public franchise_data: any, public dialogRef: MatDialogRef<AssignUserComponent>)
    {
      this.franchise_id = franchise_data.franchise_id;
      console.log('****FRANCHISE ID ARRAY***');
      console.log(this.franchise_id);
    }
    
    ngOnInit() {
      this.getUserList();
    }
    data:any = [];
    user_list=[];
    getUserList(){
      this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
      .subscribe(data => {
        this.data = data;
        console.log(this.data);
        this.user_list = this.data.data.user;      
        console.log('****USER LIST****');
        console.log(this.user_list);
      },err => {  this.dialog.retry().then((result) => { this.getUserList(); });   });
    }
    
    user_assign:any = [];
    assignSalesAgent() {
      this.form.remark = this.form.remark ? this.form.remark : '';
      this.form.user_assign = this.form.user_assign.length ? this.form.user_assign : [];
      this.form.user_id = this.ses.users.id;
      this.form.l_id = this.franchise_id;

      this.sendingData = true;
      console.log(this.form);

      this.db.insert_rqst(this.form, 'franchise_leads/multipleFranchiseAssignSalesAgent').subscribe(data => {
        this.sendingData = false;
        // if (this.temp.data.user) {
          this.dialogRef.close(true);
        // }
      },err => { this.sendingData = false; this.dialog.retry().then((result) => { });   });
    }
    
    saveUser() {
      this.sendingData = true;
      this.form.franchise_id = this.franchise_id;
      console.log(this.form);
      this.db.post_rqst( {'data' :this.form}, 'franchise_leads/assign_user')
      .subscribe(data => {
        this.temp = data;
        this.sendingData = false;
        console.log(this.temp);
        if (this.temp.data.user) {
          this.dialogRef.close(this.temp.data.user);
        }
      },err => {  this.dialog.retry().then((result) => { this.saveUser(); });   });
    }
  }
  