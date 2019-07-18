import { Component, OnInit, Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(private snacker: MatSnackBar) { }
  
  ngOnInit() {
  }
  
  
  test(msg: any) {
    alert(msg);
  }
  
  delete(msg: any, conf:any = 'Yes, delete it!', cancel:any = 'No, keep it', pre_msg:any = 'You will not be able to recover this ') {
    return Swal({
      title: 'Are you sure?',
      text: pre_msg + msg,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: conf,
      cancelButtonText: cancel
    }).then((result) => {
      if (result.value) {
        return true;
        // For more information about handling dismissals please visit
        // https://sweetalert2.github.io/#handling-dismissals
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Swal(
        //   'Cancelled',
        //   'Your ' + msg + ' data is safe :)',
        //   'error'
        // )
        return false;
      }
    });
  }
  
  
  retry() {
    return Swal({
      title: 'Something went Wrong',
      text: 'Somethng went wrong! May be internet disconnected',
      type: 'warning',
      confirmButtonText: 'Retry',
    }).then((result) => {
      if (result.value) {
        return true;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return false;
      }
    });
  }
  
  
  
  alert(type:any, title:any, msg:any){ Swal({ type: type, title: title, text: msg}) }
  
  
  success( msg: any) {
    {this.snacker.open(msg, '', 
  {
    duration: 2000, 
    panelClass: ['success-snackbar'],
    horizontalPosition: this.horizontalPosition,
    verticalPosition: this.verticalPosition, 
  });
}
    
  }
  
  warning(msg: any) {this.snacker.open(msg, '', 
  {
     duration: 2000,  
    panelClass: ['warning-snackbar'],
     horizontalPosition: this.horizontalPosition,
    verticalPosition: this.verticalPosition, 
  });
  }
  error(msg: any) {this.snacker.open(msg, '', 
  {
    duration: 2000, 
    panelClass: ['error-snackbar'],
    horizontalPosition: this.horizontalPosition,
    verticalPosition: this.verticalPosition, 
  });
}
}
