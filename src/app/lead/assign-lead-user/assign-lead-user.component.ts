import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-assign-lead-user',
  templateUrl: './assign-lead-user.component.html',
})
export class AssignLeadUserComponent implements OnInit {
  
  lead_id: any = [];
  sendingData = false;
  constructor(public db:DatabaseService,public dialog:DialogComponent,@Inject(MAT_DIALOG_DATA) public franchise_data: any, public dialogRef: MatDialogRef<AssignLeadUserComponent>,public ses: SessionStorage)
  {
    this.lead_id = franchise_data.lead_id;
    console.log('****FRANCHISE ID ARRAY***');
    console.log(this.lead_id);
  }
   
  
  loading_list = true;
  data: any = [];
  formData: any = {};
  form:any={};
  ngOnInit() {
    this.ddgetUserList();
  }

  dduser_list=[];
  ddgetUserList()
  {
    this.loading_list = false;
    this.sendingData = true;
    this.db.get_rqst( '', 'consumer_leads/form_options/getuser')
    .subscribe(data => {
      this.data = data;
      this.sendingData = false;
      console.log(this.data);
      this.dduser_list = this.data.data.user;      
      console.log(this.dduser_list);
      this.loading_list = true;
    },err => {  this.dialog.retry().then((result) => { this.ddgetUserList(); });   });
  }
  
  assignSalesAgent() {
    this.formData.remark = this.form.remark ? this.form.remark : '';
    this.formData.user_assign = this.form.agent_assign.length ? this.form.agent_assign : [];
    this.formData.user_id = this.ses.users.id;
    this.formData.l_id = this.lead_id;
    this.loading_list = false;
    console.log(this.formData);
    
    this.db.insert_rqst(this.formData, 'franchise_leads/consumerAssignSalesAgentBulk').subscribe(data => {
      this.dialog.success('Sales agent assign Successfully!');
      this.loading_list = true;
      this.dialogRef.close(true);
    },err => {this.loading_list = true; this.dialog.retry().then((result) => { });   });
  }
}
