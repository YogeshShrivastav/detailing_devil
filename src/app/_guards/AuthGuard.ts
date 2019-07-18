import { Injectable } from '@angular/core';
import { Router, RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {SessionStorage} from '../_services/SessionService';
import { DatabaseService } from '../_services/DatabaseService';
import { JwtHelperService } from '@auth0/angular-jwt';
import {DialogComponent} from './../dialog/dialog.component';


@Injectable()
export class AuthGuard implements CanActivate {
    users: any = [];
    constructor(private router: Router, public ses: SessionStorage, public db: DatabaseService ,  public dialog: DialogComponent) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const expectedRole = route.data.expectedRole || [];

console.log(expectedRole);

        this.ses.getSe().subscribe(
            data => {
                this.users = data;
            },
            error => {
                console.log('err');
            });
            console.log( this.users.access_level);
            console.log(expectedRole.indexOf( this.users.access_level ) > -1 ) ;
            
            
            if (this.users.token && this.users.logged  && ( !expectedRole.length  || expectedRole.indexOf( this.users.access_level ) > -1 ) )  {
              const helper = new JwtHelperService();
              // const decodedToken = helper.decodeToken(this.users.token);
              // const expirationDate = helper.getTokenExpirationDate(this.users.token);
              const isExpired = helper.isTokenExpired(this.users.token);
              if(!isExpired) {
                this.db.datauser = this.users;
                this.db.can_active = '1';
                return true;
              }
            }

            if (this.users.token && this.users.logged )  {
              const helper = new JwtHelperService();
              // const decodedToken = helper.decodeToken(this.users.token);
              // const expirationDate = helper.getTokenExpirationDate(this.users.token);
              const isExpired = helper.isTokenExpired(this.users.token);
              if(!isExpired) {
                this.db.datauser = this.users;
                this.db.can_active = '1';

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
          
          
                      }

                      this.dialog.error('You have No permission to access page!');

                      this.router.navigate([ home_page ]);


                return true;
              }
            }


              this.db.can_active = '';
              this.db.datauser = {};
              this.users = {};
              this.users.logged = false;
              this.users.token = '';
              this.db.can_active = '';
              this.db.datauser = {};
              localStorage.removeItem('users');
              this.router.navigate([''], { queryParams: { returnUrl: state.url }});
        }
    }
