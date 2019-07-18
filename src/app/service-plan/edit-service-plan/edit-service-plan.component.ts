import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {DatabaseService} from '../../_services/DatabaseService';
import {DialogComponent} from '../../dialog/dialog.component';
import {map, startWith} from 'rxjs/operators';
import {CategoryType, PlanName, VehicleType} from '../add-service-plan/add-service-plan.component';

@Component({
  selector: 'app-edit-service-plan',
  templateUrl: './edit-service-plan.component.html'
  // styleUrls: ['./edit-product.component.scss']
})

export class EditServicePlanComponent implements OnInit {
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
  newVisitData: any = [];
  service_plan_id: any;
  vehicle_type: any;
  plan_name: any;
  num_of_visits: any;
  price: any;
  year: any;
  description: any;
  num_of_visits_options = [1, 2, 3, 4, 5];
  sendingData = false;
  loading_data = false;
  year_options = [2015, 2016, 2017, 2018];
  category_types: CategoryType[] = [];
  constructor(public db: DatabaseService, private router: Router,  public dialog: DialogComponent, private route: ActivatedRoute) {
    this.formOptions();
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.service_plan_id = params['id'];
    
    if (this.service_plan_id) { this.servicePlanData(this.service_plan_id); }
  });
  }
  servicePlanData(s_p_id) {
  this.loading_data = true;
    
    this.db.get_rqst( '', 'service_plans/' + s_p_id + '/edit')
      .subscribe(data => {
        this.loading_data = false; 
        this.data = data;
        this.form.vehicle_type = this.data.data.service_plan.vehicle_type;
        this.form.category_type = this.data.data.service_plan.category_type;
        this.form.plan_name = this.data.data.service_plan.plan_name;
        this.form.num_of_visits = this.data.data.service_plan.number_of_visits;
        this.form.invoice_name = this.data.data.service_plan.invoice_name;
        this.setVisitType(this.form.num_of_visits);
        this.form.price = this.data.data.service_plan.price;
        this.form.sac = this.data.data.service_plan.sac;
        this.form.gst = this.data.data.service_plan.gst;
        this.form.year = this.data.data.service_plan.year;
        this.form.interval_value = parseInt( this.data.data.service_plan.interval_value );
        this.form.interval_type = this.data.data.service_plan.interval_type;
        this.form.description = this.data.data.service_plan.description;
        this.data.data.visit_type.forEach(obj => {
        if (this.data.data.raw_materials.length >= 1) {
          this.data.data.raw_materials.forEach(options => {
              if (obj.visit_type_id == options[0].service_visit_type_id) {
              this.storeVisitData(obj.visit_type, options[0].raw_materials, obj.visit_type_id);
            }
          });
        } else {
          this.storeVisitData(obj.visit_type, '', obj.visit_type_id);
        }
        this.data.data.visit_type.forEach(obj => {
          var index = this.visitType.indexOf(obj.visit_type);
          if (index > -1) {
            this.visitType.splice(index, 1);
          }
        });
      });
    },err => {  this.loading_data = false;  this.dialog.retry().then((result) => {  this.servicePlanData(s_p_id);  });  });

  }



  refreshFilterVehicleType() {
    this.myControl = new FormControl();
    this.filteredVehicleTypes = this.myControl.valueChanges
      .pipe(startWith(''), map(vehicleType => vehicleType ? this.filterVehicleTypes(vehicleType) : this.vehicle_types.slice()));
  }
  filterVehicleTypes(name: string) {
    return this.vehicle_types.filter(vehicleType => vehicleType.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  refreshFilterCategoryType() {
    this.myControl = new FormControl();
    this.filteredCategoryTypes = this.myControl.valueChanges
      .pipe(startWith(''), map(categoryType => categoryType ? this.filterCategoryTypes(categoryType) : this.category_types.slice()));
  }
  filterCategoryTypes(name: string) {
    return this.category_types.filter(categoryType => categoryType.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  refreshFilterPlanName() {
    this.myControl = new FormControl();
    this.filteredPlanNames = this.myControl.valueChanges
      .pipe(startWith(''), map(planName => planName ? this.filterPlanNames(planName) : this.plan_names.slice()));
  }
  filterPlanNames(name: string) {
    return this.plan_names.filter(planName => planName.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  formOptions() {
  this.loading_data = true;

    this.db.get_rqst( '', 'service_plans/form_options/get')
      .subscribe(data => {
  this.loading_data = false;

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
      },err => {  this.loading_data = false;  this.dialog.retry().then((result) => {  this.formOptions();  });  });

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
  resetVisitType(value) {
    var index = this.visitType.indexOf(value);
    if (index > -1) {
      this.visitType.splice(index, 1);
    }
  }
  storeVisitData(visit_type, raw_materials, visit_type_id = '') {
    if ((visit_type || raw_materials) && visit_type_id) {
      this.visitData.push({visit_type: visit_type,
        raw_materials: raw_materials ? raw_materials.split(',') : '',
        visit_type_id: visit_type_id });
    }
    if ((visit_type || raw_materials) && !visit_type_id) {
      this.visitData.push({visit_type: visit_type,
        raw_materials: raw_materials ? raw_materials.split(',') : ''});
      this.newVisitData.push({visit_type: visit_type,
        raw_materials: raw_materials ? raw_materials.split(',') : ''});
    }
    this.form.visit_type = this.form.material_consumptions = null;
  }
  removeVisitData(index, visit_id = null) {
    if(visit_id) {
      this.loading_data = false;
      this.dialog.delete('Service').then((result) => {
        if (result) {
          this.db.post_rqst( {'visit_id': visit_id}, 'service_plans/visit_data/remove')
              .subscribe(data => {
                this.data = data;
                this.visitData.splice(index, 1);
                this.loading_data = false;
              },err => {  this.loading_data = false;  this.dialog.retry().then((result) => {  this.removeVisitData(index, visit_id );  });  });

      }
    });
  } else {
    this.visitData.splice(index, 1);
  }
  }
  updateServicePlan() {
    this.sendingData = true;
    this.formData.service_plan_id = this.service_plan_id;
    this.formData.vehicle_type = this.form.vehicle_type;
    this.form.category_type = this.form.category_type;
    this.formData.plan_name = this.form.plan_name || '';
    this.formData.num_of_visits = this.form.num_of_visits || '';
    this.formData.invoice_name = this.form.invoice_name || '';
    this.formData.price = this.form.price || '';
    this.formData.sac = this.form.sac || '';
    this.formData.gst = this.form.gst || '';
    this.formData.year = this.form.year || '';
    this.formData.interval_value = this.form.interval_value || '';
    this.formData.interval_type = this.form.interval_type || '';
    this.formData.description = this.form.description || '';
    this.formData.visitData =  this.newVisitData || '';
    this.db.post_rqst( this.formData, 'service_plans/update')
      .subscribe(data => {
        this.loading_data = false;
        this.temp = data;
        if (this.temp.data.service_plans) {
          this.nexturl = this.route.snapshot.queryParams['returnUrl'] || '/service_plans';
          this.router.navigate([this.nexturl]);
        } else {
          this.dialog.error( 'Problem occurred! Please Try again');
        }
      },err => {  this.loading_data = false;  this.dialog.retry().then((result) => {  this.updateServicePlan();  });  });
  }
}
