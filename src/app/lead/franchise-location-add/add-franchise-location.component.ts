import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';

@Component({
  selector: 'app-franchise-location-add',
  templateUrl: './add-franchise-location.component.html'
})
export class AddFranchiseLocationComponent implements OnInit {
   l_id: any=[];
   lead_type: any=[];
   country_id: any=[];
   loading_list = true;
   locations: any = [{}];
   franchise: any ={};
   sendingData:any = false;
   constructor(public db: DatabaseService, private route: ActivatedRoute, public ses: SessionStorage,
    private router: Router,  public dialog: DialogComponent,
    @Inject(MAT_DIALOG_DATA) public lead_data: any, public dialogRef: MatDialogRef<AddFranchiseLocationComponent>) { 
     console.log('data');
     console.log(this.lead_data);
     this.l_id = lead_data.l_id;
     this.lead_type = lead_data.type;
     this.country_id = lead_data.country_id;
    }

  ngOnInit() {
    this.getLocations();
  }
  

  savingData = true;
  data:any;
  getLocations() {
    this.loading_list = false;    
    if(!this.country_id){
      this.dialog.warning('Country Required!');
        this.dialogRef.close(false);
      return
    }
    //console.log(this.franchiseForm.country_id);    
    this.db.get_rqst( '', 'franchises/locations/'+this.country_id)
    .subscribe(data => {
      this.loading_list = true;
      this.data = data;
      console.log(data);
      
      this.locations = this.data.data.l;
      console.log(  this.locations);
    },err => {     this.loading_list = true; this.dialog.retry().then((result) => { this.getLocations(); });   });
  }
  saveLocation(){
    this.loading_list = false; 
    console.log(this.franchise.location_id);
    this.db.post_rqst({'franchise_id':this.l_id,'location_id':this.franchise.location_id}, 'franchise_leads/location_update').subscribe(data => {
      this.data = data;
      if(this.data){
        console.log('success');
        this.dialogRef.close(this.data);
      } 
      this.loading_list = true;
    },err => {     this.loading_list = true; this.dialog.retry().then((result) => { this.saveLocation(); });   });
  }
}
