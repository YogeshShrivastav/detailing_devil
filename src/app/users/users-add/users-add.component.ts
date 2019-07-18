import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';


@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
})
export class UsersAddComponent implements OnInit {
user: any = {};

  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute,
              private router: Router,  public dialog: DialogComponent) {
  }
  ngOnInit() {
    this.get_data();
  }

  loading_list = false;

  roles: any = [];
  get_data(){
    this.loading_list = true;

    this.db.post_rqst(  {'franchise_id' : this.db.datauser.franchise_id }, 'franchises/get_rol')
    .subscribe((data:any) => { 
      console.log(data);
      this.roles=data.data.roles;
      console.log(this.roles);
      this.loading_list = false;
      
    },err => { this.dialog.retry().then((result) => { this.get_data(); });  });

  }
  
temp:any='';
  saveUser(f){
    this.loading_list = true;

         
    const tmp = new ConvertArray().transform( f._directives);
    console.log( tmp );
    
    tmp.login_id = this.db.datauser.id;
    tmp.franchise_id = this.db.datauser.franchise_id || 0;
    tmp.location_id = this.db.datauser.location_id || 0;
    

    this.db.insert_rqst(  {'user': tmp }, 'franchises/saveUser')
    .subscribe((data:any) => { 
    this.loading_list = false;

      this.temp = data; 
      if(this.temp.data.msg == 'Success'){
        this.router.navigate(['/users-list']);
      }else if(this.temp.data.msg == 'Exist'){
        this.dialog.error('User already Exist! with same email/username');
      }
      },err => { this.dialog.retry().then((result) => {  });  });
   
  }
  


}
