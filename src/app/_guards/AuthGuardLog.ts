import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {SessionStorage} from '../_services/SessionService';
import { DatabaseService } from '../_services/DatabaseService';

@Injectable()
export class AuthGuardLog implements CanActivate {
   users: any = [];
   constructor(private router: Router, public ses: SessionStorage, public db: DatabaseService) { }

   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
            this.ses.getSe().subscribe(
              data => {
               this.users = data;
               },
               error => {
                  console.log('error');
            });


      if (this.users.logged) {

                   // this.ses.users.logged = false;

            var home_page = '';
            if(   this.users.access_level == 1  ){
            home_page = '/dashboard';

            }else if(  this.users.access_level == 3  ){
            home_page = '/leads';

            }else if(  this.users.access_level == 2  ){
            home_page = '/invoice-payment-list';
          
            }else if(   this.users.access_level == 4   ){
            home_page = '/purchases';

            }else if(   this.users.access_level == 5   ){
            home_page = '/franchise-dashboard/'+  this.db.crypto(this.users.franchise_id);

            }else if(   this.users.access_level == 6 ){
            home_page = '/franchise-leads/'+  this.db.crypto(this.users.franchise_id);

            }else if(   this.users.access_level == 8 ){
            home_page = '/franchise-jobcard-list/'+  this.db.crypto(this.users.franchise_id);

            }else{
      
            this.ses.logoutSession();

                  return;
            }

 
        this.router.navigate([ home_page ]);


        this.db.can_active = '1';
        return false;
       } else {
            this.db.can_active = '';
            return true;
       }
      }
}

