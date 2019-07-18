import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { DatabaseService } from 'src/app/_services/DatabaseService';

@Component({
  selector: 'app-item-tab',
  templateUrl: './item-tab.component.html',
})
export class ItemTabComponent implements OnInit {

  constructor(public db : DatabaseService,private route : ActivatedRoute) { }

finish_good_id = '';
finish_good_item_id = '';
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.finish_good_id =      params['id'];
      this.finish_good_item_id = params['unit_id'];
    });
  }

}