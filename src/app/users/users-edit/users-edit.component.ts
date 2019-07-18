import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import { ConvertArray } from '../../_Pipes/ConvertArray.pipe';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
})
export class UsersEditComponent implements OnInit {
  user: any = {};
  loading_list:any = false;
  
  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute,
    private router: Router,  public dialog: DialogComponent) {
      
    }
    user_id = 0;
    ngOnInit() {
      
      
      this.route.params.subscribe(params => {
        this.user_id = params['id'];
     
      if (this.user_id) { 
        this.getUser();
        this.getRol();
      }
    });
    }
    
    roles: any = [];
    getRol(){
      this.loading_list = true;
      
      this.db.post_rqst(  {'franchise_id' : this.db.datauser.franchise_id }, 'franchises/get_rol')
      .subscribe((data:any) => { 
        console.log(data);
        this.roles=data.data.roles;
        console.log(this.roles);
        this.loading_list = false;
        
      },err => { this.dialog.retry().then((result) => { this.getRol(); });  });
    }
    
    getUser(){
      this.loading_list = true;
      this.db.post_rqst(  {'user':  this.user_id }, 'franchises/getUser')
      .subscribe((data:any) => { 
        this.loading_list = false;
        this.temp = data; 
        this.user = this.temp.data.user;
        this.user.role = parseInt( this.temp.data.user.access_level );
        console.log(this.user.role);
        
      },err => { this.dialog.retry().then((result) => { this.getUser(); });  });
    }
    
    
    temp:any = '';
    updateUser(f){
      this.loading_list = true;
      
      
      const tmp = new ConvertArray().transform( f._directives);
      console.log( tmp );
      
      tmp.login_id = this.db.datauser.id;
      tmp.id = this.user.id;
      
      
      
      this.db.insert_rqst(  {'user': tmp }, 'franchises/updateUser')
      .subscribe((data:any) => { 
        this.loading_list = false;
        console.log(data);
        
        this.temp = data; 
        if(this.temp.data.msg == 'Success'){
          this.router.navigate(['/users-list']);
        }else if(this.temp.data.msg == 'Exist'){
          this.dialog.error('User already Exist! with same email/username');
        }
      },err => { this.dialog.retry().then((result) => {  });  });
    }
    

    data:any = [];
    email_valid:any = '';
    CheckEmail()
    {
      console.log(this.user);
      console.log(this.user.email);
      this.db.post_rqst({'data':this.user},'franchises/checkexist')
      .subscribe((data:any)=>{
        console.log(data);
        this.data = data;
        this.email_valid = this.data.data.exist;
        console.log(this.email_valid);
      },err => { this.dialog.retry().then((result) => { this.CheckEmail(); });  });
      
      
    }
    
    
  }
  