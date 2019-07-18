import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {SessionStorage} from '../../_services/SessionService';
import {CreateFollowupComponent} from '../../followup/create-followup/create-followup.component';


@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
})
export class AppointmentComponent implements OnInit {


  franchise_id;
  loading_list = false;

  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,
    public matDialog: MatDialog,  public dialog: DialogComponent) {
}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      console.log(this.franchise_id );
    
    if (this.franchise_id) {
        this.showAppointmentFollowUps();
      }
    });
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
    this.followup_type = 'pending';
    this.getFollowUpList(this.followup_type);
  }

  
  showAppointmentFollowUps() {
    this.followup_type = 'appointment';

    this.getFollowUpList(this.followup_type);
  }

  // showDoneFollowUps() {
  //   this.followup_type = 'done';
  //   this.getFollowUpList(this.followup_type);
  // }

  showUpcomingFollowUps() {
    this.followup_type = 'upcoming';
    this.getFollowUpList(this.followup_type);
  }

  

  followups:any = [];
  tmp:any = {};


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
  frachise_total_appointment_follow_ups = 0;

  followup_type = 'pending';


  
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

  status:any = '';
  getFollowUpList(status:any = 'pending') {
    this.loading_list = true;
    console.log(this.db.franchise_location);
    this.status = status;
    this.db.post_rqst(  {'franchise_id':this.franchise_id}, 'franchises/fanchisesAppoinment?page=' + this.current_page + '&status=' + status + '&s=' + this.search)
    .subscribe(d => {
      console.log(d);
     this.loading_list = false;
     this.data = d;
    //  this.current_page = this.data.data.follow_ups.current_page;
    //  this.last_page = this.data.data.follow_ups.last_page;
    //  this.total_done_follow_ups = this.data.data.total_done_follow_ups;
    //  this.total_pending_follow_ups = this.data.data.total_pending_follow_ups;
    //  this.total_upcoming_follow_ups = this.data.data.total_upcoming_follow_ups;
     this.follow_ups = this.data.data.follow_ups;

    //  this.frachise_total_appointment_follow_ups = this.data.data.frachise_total_appointment_follow_ups;

      // this.followups = this.tmp.followups;
    //  console.log(  this.data );
  },err => {  this.dialog.retry().then((result) => { 
    this.getFollowUpList(status);      
    console.log(err); });  
  });
  }

}
