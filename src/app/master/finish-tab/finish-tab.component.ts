import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { DatabaseService } from 'src/app/_services/DatabaseService';

@Component({
  selector: 'app-finish-tab',
  templateUrl: './finish-tab.component.html',
})
export class FinishTabComponent implements OnInit {

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