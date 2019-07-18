import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'converToWord'})

export class NumericWords implements PipeTransform  {
    
    transform(amount:any = '',value:any = ''):any {
        
        if(!amount)return '';   
        const numWords = require('num-words');
        
        return numWords( parseInt(amount) );
        
        
        
    }
    
}