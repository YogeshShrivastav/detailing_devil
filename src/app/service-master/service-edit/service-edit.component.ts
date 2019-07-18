import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import { log } from 'util';

export class Category {
    constructor(public name: string) { }
}

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-edit.component.html'
})
export class ServiceEditComponent implements OnInit {

  form: any = {};
  data: any = [];

  measurementTypes:any = [];
  myControl: FormControl;
  filteredCategory: Observable<any[]>;
  category: Category[] = [];

  unitData: any = [];
  attrData: any = [];
  formData: any = {};
  nexturl: any;
  temp: any;
  service_id: any;
  visitData: any = [];
  sendingData = false;
  loading_data = true;
  constructor(public db: DatabaseService, private route: ActivatedRoute,
              private router: Router,  public dialog: DialogComponent) {
    this.formOptions();
  }
  ngOnInit() {

    this.route.params.subscribe(params => {
      this.service_id = params['id'];
   
    if (this.service_id) { this.serviceData(); }
  });
  }
itemlist:any = {};
  serviceData() {
    this.loading_data = false;

    this.db.get_rqst( '', 'stockdata/' + this.service_id + '/edit')
      .subscribe(data => {
        console.log(data);
        this.loading_data = true;

          this.form = data.data.product;
          this.itemlist = data.data.itemlist
         
         }, error => {
        this.loading_data = true;

        this.dialog.retry().then((result) => {
          this.serviceData();
      });

      });
  }
  refreshFilterCategory() {
  this.myControl = new FormControl();
  this.filteredCategory = this.myControl.valueChanges
    .pipe(startWith(''), map(c => c ? this.filterBrands(c) : this.category.slice()));
  }
  filterBrands(name: string) {
    return this.category.filter(brand => brand.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  formOptions() {

    this.db.post_rqst( '', 'stockdata/getServiceCategory')
        .subscribe(d => {
            console.log(d);

            
            this.category =  d.category;
          this.refreshFormOption();
        }, error => {
      });
  }
  refreshFormOption() {
    this.refreshFilterCategory();

  }

  storeUnitData(value_of_duration, unit_of_duration, price:any = 0,  description:any = '') {

    if(value_of_duration && unit_of_duration &&  price ) {

          const isUnitExist = this.itemlist.findIndex(unit => {
            console.log(unit);
            console.log(value_of_duration);
            console.log(unit_of_duration);
              return unit.value_of_duration === value_of_duration && unit.unit_of_duration === unit_of_duration;
          });

          console.log(isUnitExist);

          if(isUnitExist === -1) {

              this.itemlist.push({value_of_duration: value_of_duration, unit_of_duration: unit_of_duration, price: price , description: description });

              this.form.value_of_duration = this.form.unit_of_duration = this.form.price =  this.form.description = null;
         
console.log(this.itemlist);

            } else {
              this.dialog.error( 'This Duration Already Exist!');
          }



   } else { this.dialog.error( 'Please add Duration and price to add unit data'); }

  }

  removeAttrData(index,id) {
    if(id) {
      console.log('in' );
      console.log(id);
      
      this.loading_data = false;
      this.dialog.delete('Product Attribute').then((result) => {
        if(result) {
          this.db.post_rqst({'id': id}, 'stockdata/visit_data/remove')
            .subscribe(data => {
             this.itemlist.splice(index, 1);
              
            }, error => {
            });
          }
      });
    } else {
      this.itemlist.splice(index, 1);
    }
  }
  


  saveService() {
    if( this.itemlist.length > 0 ) {
          this.sendingData = true;

          this.formData.category = this.form.category || '';
          this.formData.service_name = this.form.service_name || '';
          this.formData.gst = this.form.gst || '';
          this.formData.sac = this.form.sac || '';
          this.formData.login_id = this.db.datauser.id
          this.formData.id = this.form.id;
          
          console.log(this.formData);

          this.db.post_rqst( { 'data': this.formData, 'itemlist': this.itemlist }, 'stockdata/update')
          .subscribe(d => {
              this.router.navigate(['/service-list']);
          }, error => {   this.sendingData = false; this.dialog.retry().then((result) => { this.saveService(); });
          });

        } else { this.dialog.warning( 'Please add plus icon to store duration data! Please Try again'); }
    
  }
}