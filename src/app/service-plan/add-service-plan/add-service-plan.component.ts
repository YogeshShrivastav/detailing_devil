import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

export class VehicleType {
  constructor(public name: string) { }
}
export class PlanName {
  constructor(public name: string) { }
}

export class CategoryType {
  constructor(public name: string) { }
}

@Component({
  selector: 'app-add-service-plan',
  templateUrl: './add-service-plan.component.html'
  // styleUrls: ['./add-service-plan.component.scss']
})
export class AddServicePlanComponent implements OnInit {
  form: any = {};
  data: any = [];
  myControl: FormControl;
  filteredVehicleTypes: Observable<any[]>;
  vehicle_types: VehicleType[] = [];
  filteredPlanNames: Observable<any[]>;
  filteredCategoryTypes: Observable<any[]>;
  plan_names: PlanName[] = [];
  formData: any = {};
  nexturl: any;
  temp: any;
  visitType = [];
  visitData: any = [];
  sendingData = false;
  num_of_visits_options = [1, 2, 3, 4, 5];
  year_options = [2015, 2016, 2017, 2018];
  category_types: CategoryType[] = [];
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router,  public dialog: DialogComponent) {
    this.formOptions();
  }
  ngOnInit() {
  }
  // VehicleType
  refreshFilterVehicleType() {
    this.myControl = new FormControl();
    this.filteredVehicleTypes = this.myControl.valueChanges
      .pipe(startWith(''), map(vehicleType => vehicleType ? this.filterVehicleTypes(vehicleType) : this.vehicle_types.slice()));
  }
  filterVehicleTypes(name: string) {
    return this.vehicle_types.filter(vehicleType => vehicleType.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  // end Vehicle type
  refreshFilterCategoryType() {
    this.myControl = new FormControl();
    this.filteredCategoryTypes = this.myControl.valueChanges
      .pipe(startWith(''), map(categoryType => categoryType ? this.filterCategoryTypes(categoryType) : this.category_types.slice()));
  }
  filterCategoryTypes(name: string) {
    return this.category_types.filter(categoryType => categoryType.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  // Plan name
  refreshFilterPlanName() {
    this.myControl = new FormControl();
    this.filteredPlanNames = this.myControl.valueChanges
      .pipe(startWith(''), map(planName => planName ? this.filterPlanNames(planName) : this.plan_names.slice()));
  }
  filterPlanNames(name: string) {
    return this.plan_names.filter(planName => planName.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  // end plan name

loading_list = false;

  formOptions() {
    this.loading_list = true;
    this.db.get_rqst( '', 'service_plans/form_options/get')
      .subscribe(data => {
        this.loading_list = false;

        this.data = data;
        this.data.data.category_types.forEach(category_type => {
          this.category_types.push({name: category_type.name.toString()});
        });
        this.data.data.vehicle_types.forEach(vehicle_type => {
          this.vehicle_types.push({name: vehicle_type.name.toString()});
        });
        this.data.data.plan_names.forEach(plan_name => {
          this.plan_names.push({name: plan_name.name.toString()});
        });
        this.refreshFormOption();
      },err => {  this.loading_list = false;  this.dialog.retry().then((result) => {  this.formOptions();  });  });
  }
  refreshFormOption() {

    this.refreshFilterCategoryType();
    this.refreshFilterVehicleType();
    this.refreshFilterPlanName();
  }
  setVisitType(value) {
    this.visitType = [];
    while (value > 0) {
      this.visitType.push(value);
      value--;
    }
  }
  storeVisitData(visit_type, raw_materials) {
    if(visit_type) {
      this.visitData.push({visit_type: visit_type, raw_materials: raw_materials.split(',')});
      this.form.visit_type = this.form.material_consumptions = null;
    }
    else this.dialog.error( 'Please add visit_type');
  }
  removeVisitData(index) {
    this.visitData.splice(index, 1);
  }
  saveServicePlan() {
    this.loading_list = true; 
    this.sendingData = true;
    this.formData.vehicle_type = this.form.vehicle_type ;
    this.formData.category_type = this.form.category_type;
    this.formData.plan_name = this.form.plan_name;
    this.formData.num_of_visits = this.form.num_of_visits || 0;
    this.formData.invoice_name = this.form.invoice_name || '';
    this.formData.price = this.form.price || '';
    this.formData.sac = this.form.sac || '';
    this.formData.gst = this.form.gst || '';
    this.formData.year = this.form.year || 0;

    this.formData.interval_value = this.form.interval_value || '';
    this.formData.interval_type = this.form.interval_type || '';

    this.formData.description = this.form.description || '';
    this.formData.visitData =  this.visitData || [];
    this.db.post_rqst( this.formData, 'service_plans/save')
      .subscribe(data => {
        this.loading_list = false; 
        this.temp = data;
        if (this.temp.data.service_plans) {
          this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/service_plans';
          this.router.navigate([this.nexturl]);
        } else {
          this.dialog.error( 'Problem occurred! Please Try again');
        }
      },err => {  this.loading_list = false;  this.dialog.retry().then((result) => {  this.saveServicePlan();  });  });

  }
}
