import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {CreateFollowupComponent} from '../create-followup/create-followup.component';

@Component({
  selector: 'app-followup-list',
  templateUrl: './followup-list.component.html'
})
export class FollowupListComponent implements OnInit {
  loading_list = false;
  data: any;
  search: any = '';
  source: any = '';
  loading_page = false;
  loader: any = false;
  follow_ups: any = [];
  franchises: any = [];
  consumers: any = [];
  current_page = 1;
  last_page: number ;
  searchData = true;
  total_done_follow_ups = 0;
  total_pending_follow_ups = 0;
  total_upcoming_follow_ups = 0;
  total_upcoming_appointment_follow_ups = 0;
  filter:any = {};
  filtering:any = false;
  isInvoiceDataExist = false;
  
  followup_type = 'pending';
  constructor(public matDialog: MatDialog, public db: DatabaseService, public dialog: DialogComponent) {}

  ngOnInit() {
    this.getFollowUpList(this.followup_type);
  }
  redirect_previous() {
    this.current_page--;
    this.getFollowUpList(this.followup_type);
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; } else { this.current_page = 1; }
    this.getFollowUpList(this.followup_type);
  }
  showPendingFollowUps() {
    this.filter = {};
    this.followup_type = 'pending';
    this.getFollowUpList(this.followup_type);
  }
  showDoneFollowUps() {
    this.followup_type = 'done';
    this.filter = {};
    this.getFollowUpList(this.followup_type);
  }

  showAppointmentFollowUps() {
    this.filter = {};
    this.followup_type = 'appointment';

    this.getFollowUpList(this.followup_type);
  }


  showUpcomingFollowUps() {
    this.filter = {};
    this.followup_type = 'upcoming';
    this.getFollowUpList(this.followup_type);
  }


  openCreateFollowupDialog(l_id, l_type) {
    const dialogRef = this.matDialog.open(CreateFollowupComponent, {
      data: {
        l_id: l_id,
        type: l_type
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {  this.getFollowUpList(this.followup_type); }
    });
  }




  getFollowUpList(status) {
    this.isInvoiceDataExist = false;
    this.loading_list = true;
    this.filtering = false;
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.FollowupType || this.filter.NextFollowupType || this.filter.type)this.filtering = true;

    this.db.post_rqst(  { 'filter':this.filter, 'login':this.db.datauser}, 'follow_ups?page=' + this.current_page + '&status=' + status + '&s=' + this.search)
      .subscribe(data => {
    this.loading_list = false;
console.log(data);

        this.data = data;
        this.current_page = this.data.data.follow_ups.current_page;
        this.last_page = this.data.data.follow_ups.last_page;
        this.total_done_follow_ups = this.data.data.total_done_follow_ups;
        this.total_pending_follow_ups = this.data.data.total_pending_follow_ups;
        this.total_upcoming_follow_ups = this.data.data.total_upcoming_follow_ups;
        this.total_upcoming_appointment_follow_ups = this.data.data.total_upcoming_appointment_follow_ups;

        this.follow_ups = this.data.data.follow_ups.data;

        // if(this.followup_type == 'Pending' ){ this.follow_ups = this.follow_ups.filter(x=>x.follow_type === 'Appointment'); }


        console.log(this.data);
        console.log(this.follow_ups);

        if(this.search && this.follow_ups.length < 1) { this.searchData = false; }
        if(this.search && this.follow_ups.length > 1) { this.searchData = true; }
      },err => {  this.dialog.retry().then((result) => { this.getFollowUpList(status); });   });
  }

  deleteFollowUp(f_id) {
    this.dialog.delete('FollowUp').then((result) => {
      if(result) {
        this.db.post_rqst({f_id: f_id}, 'follow_ups/remove')
          .subscribe(data => {
            this.data = data;
            this.getFollowUpList(this.followup_type);});
      }
    });
  }

}
