import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-jobcard-list-ad',
  templateUrl: './jobcard-list-ad.component.html'
})
export class JobcardListAdComponent implements OnInit {

  lead_id:any;
  loading_list:boolean = false;
  job_card:any=[];

  constructor(public db: DatabaseService, public ses: SessionStorage, private route: ActivatedRoute, private router: Router) { 
    
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.lead_id = this.db.crypto(params['id'],false);
      this.get_data();
    });
  }

  get_data(){
    console.log(this.lead_id);
    this.db.get_rqst(  '', 'jobcard/getList/'+this.lead_id)
  .subscribe((data:any) => { 
    console.log(data);    
    this.job_card = data.data.jc_data;
    this.loading_list = true;
   });
  }

  // jc_detail(id,franchise_id){
  //   this.router.navigate(['/franchise/customer_details/'+id+''+franchise_id]);
  // }

  jc_delete(id:any){
    this.loading_list = false;
    this.db.get_rqst(  '', 'jobcard/deleteJC/'+id)
    .subscribe((data:any) => { 
      console.log(data);    
      this.get_data();
     });
  }
}
