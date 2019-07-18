import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { DatabaseService } from 'src/app/_services/DatabaseService';

@Component({
  selector: 'app-outgoing-tabs',
  templateUrl: './outgoing-tabs.component.html'
})
export class OutgoingTabsComponent implements OnInit {

  constructor(public db : DatabaseService,private route : ActivatedRoute) { }

  franchise_id:any = '';
  stock_id:any = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.franchise_id =      params['franchise_id'];
      this.stock_id =      params['stock_id'];
      
    });
  }

}