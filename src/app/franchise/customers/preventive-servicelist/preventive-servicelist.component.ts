import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-preventive-servicelist',
  templateUrl: './preventive-servicelist.component.html'
})
export class PreventiveServiceListComponent implements OnInit {

  id;
  loading_list = false;
  franchise_id;
  preventive_servicelist:any = [];
  tmp:any;
  csm:any;
  data:any;
  csm_id;
  srv_id;
  isInvoiceDataExist = false;
  search: any = '';
  source: any = '';
  loading_page = false;
  loader: any = false;
  leads: any = [];
  
  total_order:any;

  searchData = true;


  constructor(public db : DatabaseService,private route : ActivatedRoute,private router: Router,public ses : SessionStorage,public matDialog : MatDialog , public dialog : DialogComponent) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id =this.db.crypto(params['id'],false);
      this.franchise_id = this.db.crypto(params['franchise_id'],false);
      this.getCustomerService();
    });
  }

  current_page = 1;
  last_page: number ;
  total_leads = 0;
  filter:any = {};
  filtering:any = false;

  
  redirect_previous() {
    this.current_page--;
    this.getCustomerService();
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getCustomerService();
  }



  getCustomerService() 
  {
    this.isInvoiceDataExist = false;
    this.loading_list = true;
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if(  this.filter.date || this.filter.search)this.filtering = true;

    this.db.post_rqst( {'filter':this.filter, 'id':this.id}, 'customer/customer_pre_srvclist?page='+this.current_page)
    .subscribe(d => {
      this.loading_list = false;
      this.data = d['data'].list;
      this.preventive_servicelist = this.data.data;
      this.current_page = this.data.current_page;
      this.last_page = this.data.last_page;

      console.log(  this.preventive_servicelist );
    },err => { this.loading_list = false; this.dialog.retry().then((result) => { this.getCustomerService();      console.log(err); }); });
  }
  
  create_job_card(csm_id,srv_id)
  {
    this.loading_list = false;
    this.db.get_rqst(  '', 'consumer_leads/details/' + csm_id)
      .subscribe(data => {
        this.data = data;
        this.csm = this.data.data.lead;
        console.log(this.data);
        if(this.csm) {                  
          this.db.set_fn(this.csm);
          this.router.navigate(['/addjobcard/'+ this.db.crypto(csm_id)+'/'+this.db.crypto(srv_id)+'/'+this.db.crypto(this.franchise_id)]);
        }
      }); 
      this.loading_list = true;  
  }

}
