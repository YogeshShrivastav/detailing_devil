import { Component, EventEmitter, Input,  OnInit, Output } from '@angular/core';

import {DatabaseService} from '../_services/DatabaseService';
import {DialogComponent} from '../dialog/dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SingleDataSet, Label } from 'ng2-charts';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
// import * as pluginDataLabels from 'chartjs-plugin-datalabels';
// import { Label } from 'ng2-charts';


export interface CalendarDate {
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
  worked?: boolean;
  cal_date?: boolean;
  appoint?: boolean;

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  attendaceDate = moment();
  dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  attendanceWeek: CalendarDate[][] = [];
  attendanceSortedDates: CalendarDate[] = [];
  @Input()  attendanceSelectedDates: CalendarDate[] = [];
  @Output()  attendanceOnSelectDate = new EventEmitter<CalendarDate>();
  

  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'line';
  public barChartLegend = true;
  // public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Consumer' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Franchise' }
  ];



    // Pie
    public pieChartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        datalabels: {
          formatter: (value, ctx) => {
            const label = ctx.chart.data.labels[ctx.dataIndex];
            return label;
          },
        },
      }
    };
    public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
    public pieChartData: SingleDataSet = [300, 500, 100];
    public pieChartType: ChartType = 'pie';
    public pieChartLegend = true;
    // public pieChartPlugins = [pluginDataLabels];



    public pieChartOptions2: ChartOptions = {
      responsive: true,
      plugins: {
        datalabels: {
          formatter: (value, ctx) => {
            const label = ctx.chart.data.labels[ctx.dataIndex];
            return label;
          },
        },
      }
    };
    public pieChartLabels2: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
    public pieChartData2: SingleDataSet = [300, 500, 100];
    public pieChartType2: ChartType = 'pie';
    public pieChartLegend2 = true;




  constructor(private route: ActivatedRoute,public db: DatabaseService, public dialog: DialogComponent ) { }

  ngOnInit() {
            this.dashboard_data(); 
            this.getFranchises();
  }


  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    const data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100),
      56,
      (Math.random() * 100),
      40];
    this.barChartData[0].data = data;
  }










    // // events
    // public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //   console.log(event, active);
    // }
  
    // public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //   console.log(event, active);
    // }
  
    changeLabels() {
      const words = ['hen', 'variable', 'embryo', 'instal', 'pleasant', 'physical', 'bomber', 'army', 'add', 'film',
        'conductor', 'comfortable', 'flourish', 'establish', 'circumstance', 'chimney', 'crack', 'hall', 'energy',
        'treat', 'window', 'shareholder', 'division', 'disk', 'temptation', 'chord', 'left', 'hospital', 'beef',
        'patrol', 'satisfied', 'academy', 'acceptance', 'ivory', 'aquarium', 'building', 'store', 'replace', 'language',
        'redeem', 'honest', 'intention', 'silk', 'opera', 'sleep', 'innocent', 'ignore', 'suite', 'applaud', 'funny'];
      const randomWord = () => words[Math.trunc(Math.random() * words.length)];
      this.pieChartLabels = Array.apply(null, { length: 3 }).map(_ => randomWord());
    }



    charts(){

      this.pieChartLabels = this.dashboard.chart_franhcise_counsumers_arr1;
      this.pieChartData = this.dashboard.chart_franhcise_counsumers_arr2;

      this.pieChartLabels2 = this.dashboard.chart_franhcise_profit_arr1;
      this.pieChartData2 = this.dashboard.chart_franhcise_profit_arr2;




      this.barChartLabels = this.dashboard.label;

      console.log(this.filter.graphType );

      this.barChartData =  [
        
        { data: this.dashboard.counsumer_lead_count, label: ( this.filter.graphType == 'Invoice' ) ? 'Order' : 'Consumer' },
        { data: this.dashboard.franchise_lead_count, label:  ( this.filter.graphType == 'Invoice' ) ? 'Invoice' : 'Franchise'  }
      ];




      // public pieChartData: SingleDataSet = [300, 500, 100];/
    }


  filter:any = {};
  loading_list:any = false;

  dashboard:any = {};
  dashboard_data() {
    this.loading_list = true;

    var dashboard = {'filter': this.filter , 'login':this.db.datauser };
    this.db.post_rqst( {'dashboard':  dashboard}, 'dashboard/dashboard_data' ).subscribe(d => {

      this.loading_list = false;
      this.dashboard = d['data'].bucket;
      console.log(  this.dashboard  );
      this.attendanceCalendar();

      this.charts();

   },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); this.dashboard_data(); }); 

    });
    }


franchise_list:any = [];
getFranchises(){
  
  this.loading_list = false;
  this.db.post_rqst( {'login':  this.db.datauser }, 'franchises/getFranchLoc' ).subscribe(d => {
    console.log(d);
    this.franchise_list = d.franchise;
},err => {  this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); this.getFranchises(); }); 

});
}

    

    appointments:any = [];
    appointment_detail(date){

      this.loading_list = true;

      console.log( this.db.franchise_location);
      
      this.appointments =[];
      console.log( this.filter.franchise);
      
     
      this.db.post_rqst( {'franchise_id':  this.filter.franchise || 0, 'appoint_cal_date': date.cal_date }, 'dashboard/get_followup' ).subscribe(d => {
  console.log(d);
  
        this.loading_list = false;
        this.appointments = d.appoinments;
        console.log(  this.appointments  );
  
  
  
     },err => {  this.loading_list = false; this.dialog.retry().then((result) => {  console.log(err); this.appointment_detail(date); }); 
  
      });

    }


         // date checkers

                     
         cal_date: any = '';
         appoint: any = '';
         isActive(date: moment.Moment ): boolean {
             return _.findIndex(this.dashboard.calender_appoinments, (d) => {
                 if (moment(date).isSame(d.next_follow_date, 'day')) {
                     this.cal_date = d.next_follow_date;
                     this.appoint = d.tll_fllup;
                     return true;
                 } else {
                     this.cal_date = '';
                     this.appoint = '';
                     return false;
                 }
             }) > -1;
         }
         

         isToday(date: moment.Moment): boolean {
          return moment().isSame(moment(date), 'day');
      }
      
      isSelected(date: moment.Moment, d: any): boolean {
          return _.findIndex(d, (selectedDate) => {
              return moment(date).isSame(selectedDate.mDate, 'day');
          }) > -1;
      }
      
      
      isSelectedMonth(date: moment.Moment, d: any): boolean {
          return moment(date).isSame(d, 'month');
      }
      
      select_date:any = '';
      selectDate(date: any): void {
          console.log(date);
          this.select_date = date;
          this.appointment_detail(date);
          
      }
          
            // actions from calendar 3
            
            attendanceSelectDate(date: CalendarDate): void {
              // this.userWorkHistoryDetail(date);
              console.log(date);
          }
          attendancePrevMonth(): void {
            this.attendaceDate = moment(this.attendaceDate).subtract(1, 'months');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')
              this.dashboard_data();
          }
          atendanceNextMonth(): void {
              this.attendaceDate = moment(this.attendaceDate).add(1, 'months');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')

              this.dashboard_data();
          }
          attendanceFirstMonth(): void {
              this.attendaceDate = moment(this.attendaceDate).startOf('year');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')

              this.dashboard_data();
          }
          attendanceLastMonth(): void {
              this.attendaceDate = moment(this.attendaceDate).endOf('year');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')

              this.dashboard_data();
          }
          attendancePrevYear(): void {
              this.attendaceDate = moment(this.attendaceDate).subtract(1, 'year');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')

              this.dashboard_data();
          }
          attendanceNextYear(): void {
              this.attendaceDate = moment(this.attendaceDate).add(1, 'year');
              this.filter.appoint_cal_date = moment(this.attendaceDate).format('YYYY-MM')

              this.dashboard_data();
          }



       ///////////////////////  Generate Calendar 3   /////////////
            
       attendanceCalendar(): void {
        const dates = this.attendanceFillDates(this.attendaceDate);
        const weeks: CalendarDate[][] = [];
        while (dates.length > 0) {
            weeks.push(dates.splice(0, 7));
        }
        this.attendanceWeek = weeks;
    }
    attendanceFillDates(currentMoment: moment.Moment): CalendarDate[] {
        const firstOfMonth = moment(currentMoment).startOf('month').day();
        const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
        const start = firstDayOfGrid.date();
        return _.range(start, start + 42)
        .map((date: number): CalendarDate => {
            const d = moment(firstDayOfGrid).date(date);
            return {
                today: this.isToday(d),
                selected: this.isSelected(d, this.attendanceSelectedDates),
                worked: this.isActive(d),
                cal_date: this.cal_date,
                appoint: this.appoint,
                mDate: d,
            };
        });
    }







}
