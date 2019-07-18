import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'strRplce'})

export class StrReplace implements PipeTransform  {
   
   transform(str:any):any {
    

    if( str.includes('Box') ) {
        var x = str.split(" ");
        str = x[1]+' ('+x[0]+' pc)';
    } 
    return str;
    
   }
}