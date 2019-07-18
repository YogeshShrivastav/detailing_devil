import { Pipe, PipeTransform } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Pipe({ name: 'crypt'})

export class Crypto implements PipeTransform  {


  password: string='1234567890';

   transform(textToConvert:any, encryptMode: any = true):any {
//////////////////


// //encrypt
// var rawStr = textToConvert;
// var wordArray = CryptoJS.enc.Utf8.parse(rawStr);
// var base64 = CryptoJS.enc.Base64.stringify(wordArray);
// console.log('encrypted:', base64);

// //decrypt
// var parsedWordArray = CryptoJS.enc.Base64.parse(base64);
// var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
// console.log("parsed:",parsedStr);





    //////////////
     var x = '';
    if (textToConvert.toString().trim() === "") {
      x = "Please give the input";
      return;
    }
    else {
      if (encryptMode) {
        var wordArray = CryptoJS.enc.Utf8.parse(textToConvert);
        return  CryptoJS.enc.Base64.stringify(wordArray);

        //  x = CryptoJS.AES.encrypt( CryptoJS.enc.Utf8.parse( textToConvert.toString().trim() ), this.password.trim()).toString();
      }
      else {
       
        var parsedWordArray = CryptoJS.enc.Base64.parse(textToConvert);
        return  parsedWordArray.toString(CryptoJS.enc.Utf8);
        // x = CryptoJS.AES.decrypt(textToConvert.toString().trim(), this.password.trim()).toString(CryptoJS.enc.Utf8);

      }
    }
    // return x;
     
  }

   
}