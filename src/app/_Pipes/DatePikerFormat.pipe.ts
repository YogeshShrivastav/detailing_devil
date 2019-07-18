import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'pickerFormat'})

export class DatePikerFormat implements PipeTransform  {
   
   transform(date:any,format:any = 'YYYY-MM-DD'):any {
      console.log( moment(date).format('YYYY-MM-DD') );
              
        if(date){ return moment(date).format('YYYY-MM-DD'); }
        return '';
    }

}