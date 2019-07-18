import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';

export class Category {
    constructor(public name: string) { }
}


@Component({
  selector: 'app-service-add',
  templateUrl: './service-add.component.html'
})
export class ServiceAddComponent implements OnInit {

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
  sendingData = false;
  constructor(public db: DatabaseService, private route: ActivatedRoute,
              private router: Router,  public dialog: DialogComponent) {
    this.formOptions();
  }
  ngOnInit() {
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

          const isUnitExist = this.unitData.findIndex(unit => {
              return unit.value_of_duration === value_of_duration && unit.unit_of_duration === unit_of_duration;
          });

          console.log(isUnitExist);

          if(isUnitExist === -1) {

              this.unitData.push({value_of_duration: value_of_duration, unit_of_duration: unit_of_duration, price: price , description: description });


              this.form.value_of_duration = this.form.unit_of_duration = this.form.price =  this.form.description = null;
          } else {
              this.dialog.error( 'This Duration Already Exist!');
          }



   } else { this.dialog.error( 'Please add Duration and price to add unit data'); }

  }

  removeUnitData(index) {
    this.unitData.splice(index, 1);
  }
  


  saveService() {
    if( this.unitData.length > 0 ) {
          this.sendingData = true;

          this.formData.category = this.form.category || '';
          this.formData.service_name = this.form.service_name || '';
          this.formData.unitData = this.unitData || [];
          this.formData.gst = this.form.gst || '';
          this.formData.sac = this.form.sac_code || '';
          this.formData.login_id = this.db.datauser.id

          this.db.insert_rqst( {'data':this.formData ,'unitData': this.formData.unitData}, 'stockdata/saveService')
            .subscribe(d => {
                  this.sendingData = false;
                  this.router.navigate(['/service-list']);

              }, error => {   this.sendingData = false;
                this.dialog.retry().then((result) => { this.saveService(); });
          });

    } else { this.dialog.warning( 'Please add plus icon to store duration data! Please Try again'); }
  }
}
