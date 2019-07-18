import { Component, OnInit, Renderer2  } from '@angular/core';
import {SessionStorage} from '../_services/SessionService';
import {Router} from '@angular/router';
import {DatabaseService} from './../_services/DatabaseService';
import {DialogComponent} from './../dialog/dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  status = false;
  username: string;
  avatar: string;
  constructor(private renderer: Renderer2, private router: Router, public ses: SessionStorage, public db: DatabaseService , public dialog: DialogComponent) { }
  ngOnInit() {
    this.username = this.ses.users.username;
    if(this.ses.users.avatar) this.avatar = this.ses.users.avatar;
    else this.avatar = 'assets/img/avtar.jpg';
  }
  toggleHeader() {
    this.status = !this.status;
    if (this.status) {
      this.renderer.addClass(document.body, 'active');
    } else {
      this.renderer.removeClass(document.body, 'active');
    }
  }
  logout(): void {
    this.ses.logoutSession();
    this.router.navigate(['']);
  }




  keyword = 'full_name';
  data:any = [];
 
 
  selectEvent(item) {

    if(item.type == '1' )
    this.router.navigate(['/consumer_leads/details/'+ this.db.crypto(item.id )]);
    if(item.type == '2' )
    this.router.navigate(['/franchise/customer_details/'+  this.db.crypto(item.franchise_id)+'/'+  this.db.crypto(item.id )]);

  }
 
  onChangeSearch(val: string) {
      this.db.post_rqst(  {'search': val, 'login': this.db.datauser  }, 'customer/getConsumer')
      .subscribe(d => {
      this.data = d.users;

      console.log(  this.data );


      },err => {  this.dialog.retry().then((result) => { this.onChangeSearch(val); });   });


  }
  
  onFocused(e){
    // do something when input is focused
  }




  navigater(item) {
    console.log(item);
    
    if(item.title == "Franchise sales invoice" || item.title == "Direct Customer sales invoice" )
    this.router.navigate(['/order-invoice-detail/' + this.db.crypto(item.table_id )]);

    if(item.title == "Franchise sales order" )
    this.router.navigate(['/sale-order-detail/' +  this.db.crypto(item.table_id )]);

    if(item.title == "Status Changes" && item.table == "consumers" )
    this.router.navigate(['/franchise_leads/details/' +  this.db.crypto(item.table_id )]);

    if(item.title == "Status Changes" && item.table == "franchises" )
    this.router.navigate(['/consumer_leads/details/' +  this.db.crypto(item.table_id )]);

    /////////////////// YOGESH  //////////////////////////////////

    if(item.title == "New converted Franchise" && item.table == "franchises" )
    this.router.navigate(['/franchise-dashboard/' +  this.db.crypto(item.table_id )]);

    if(item.title == "New lead created" && item.table == "consumers" )
    this.router.navigate(['/consumer_leads/details/' +  this.db.crypto(item.table_id )]);

    if(item.title == "New lead created" && item.table == "franchises" )
    this.router.navigate(['/franchise_leads/details/' +  this.db.crypto(item.table_id )]);

    /////////////////////////////////////////////////////////////////

    if(item.title == "Assign Sales Agents " && item.table == "franchises" )
    this.router.navigate(['/franchise_leads/details/' +  this.db.crypto(item.table_id )]);


    if(item.title == "Assign Sales Agents " && item.table == "consumers" )
    this.router.navigate(['/consumer_leads/details/' +  this.db.crypto(item.table_id )]);


    if(item.title == "Schedule FollowUp" && item.table == "franchises" )
    this.router.navigate(['/franchise_leads/details/' +  this.db.crypto(item.table_id )]);


    if(item.title == "Schedule FollowUp" && item.table == "consumers" )
    this.router.navigate(['/consumer_leads/details/' +  this.db.crypto(item.table_id )]);


    if(item.title == "lead remark" && item.table == "franchises" )
    this.router.navigate(['/franchise_leads/details/' +  this.db.crypto(item.table_id )]);


    if(item.title == "lead remark" && item.table == "consumers" )
    this.router.navigate(['/consumer_leads/details/' +  this.db.crypto(item.table_id )]);

   
  }



}
