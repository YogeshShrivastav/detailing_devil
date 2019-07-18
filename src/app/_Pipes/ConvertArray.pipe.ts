import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arrObj'})

export class ConvertArray implements PipeTransform  {
   
   transform(array_data:any):any {
      let x = {};
      array_data.forEach(element => {
         x[element.name] = element.value || '';
      });
      return x;
   }
}