import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {SessionStorage} from '../../_services/SessionService';
import {DialogComponent} from '../../dialog/dialog.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-purchase',
  templateUrl: './add-purchase.component.html'
})
export class AddPurchaseComponent implements OnInit {  
  options = {};
  vendor: any = [];
  loader: any = '';
  current_page = 1;
  search: any = '';
  loading_list = false;  
  purchase_form:any = {};
  data:any = {};
  
  constructor(public db: DatabaseService, public dialog: DialogComponent, public router: Router,public ses: SessionStorage) {
  }
  
  ngOnInit() {
    const elems = document.querySelectorAll('select');
    this.GetVendorList();

  }
  
  
  GetVendorList() {  
    this.loading_list = true;  
    this.db.get_rqst('' , 'purchase/getVendor?page=' + this.current_page + '&s=' + this.search)
    .subscribe((result: any) => {
    this.loading_list = false;  

      console.log(result);
      this.vendor = result['data']['vendors']['data'];
      console.log(this.vendor);        
    },error => {this.loading_list = false;  this.dialog.retry().then((result) => {  this.GetVendorList(); }); });
        
    //console.log(this.ses.users.username);   
  }
  
  clear(){
    this.getCaegoryList();
    this.purchase_list = [];
 console.log( this.purchase_list);
    
}
  
  categoryList:any = [];
  getCaegoryList()
  {

    this.brand = [];
    this.product = [];
    this.measurement = [];

    // this.purchase_form.vendor_id = vendor_id;
      this.loading_list = true;
 

      // this.loading_list = false;
      this.db.get_rqst(  '', 'purchase/getVendorCategory/'+this.purchase_form.vendor_id)
      .subscribe((result: any) => {
          this.loading_list = false;
          // this.loading_list = true;
          console.log(result);
          this.categoryList = result['data']['vendors_category'];
          console.log(this.categoryList);        
      },err => {  this.loading_list = false;  this.dialog.retry().then((result) => { this.getCaegoryList(); });   });
  }

  
  brand:any = [];
  
  GetVendorBrand()
  {
    this.product = [];
    this.measurement = [];
    this.loading_list = true;
    this.db.post_rqst(  {'item': this.data } , 'purchase/getVendorBrand/'+this.purchase_form.vendor_id)
    .subscribe((result: any) => {
    this.loading_list = false;

      console.log(result);
      this.brand = result['data']['vendors_brand'];
      console.log(this.brand);        
    },error => {this.loading_list = false;  this.dialog.retry().then((result) => {  this.GetVendorBrand(); }); });
  }
  
  
  
  
  product:any = [];
  
  GetProduct()
  {
    this.loading_list = true;
    console.log(this.data);
    this.db.post_rqst( {'item': this.data } , 'purchase/getProduct/'+this.purchase_form.vendor_id)
    .subscribe((result: any) => {
    this.loading_list = false;

      console.log(result);
      this.product = result['data']['products'];
      console.log(this.product);        
    },error => {this.loading_list = false;  this.dialog.retry().then((result) => {  this.GetProduct(); }); });
  }
  
  
  measurement:any = [];
  
  GetMeasurement()
  {
    this.loading_list = true;
    this.data.product_name = this.product.filter(p=>p.id === this.data.product_id)[0]['product_name'];
    this.data.hsn_code = this.product.filter(p=>p.id === this.data.product_id)[0]['hsn_code'];

    this.db.post_rqst( this.data , 'purchase/getMeasurement')
    .subscribe((result: any) => {
    this.loading_list = false;
      this.measurement = result['data']['measurement'];
      console.log( this.measurement);
      
      this.getAttributeTypeList();
    },error => {this.loading_list = false;  this.dialog.retry().then((result) => {  this.GetMeasurement(); }); });


  }


  attributeTypeList:any = [];
  
  getAttributeTypeList()
  {
    this.loading_list = true;
    this.db.post_rqst( {'item': this.data }  , 'purchase/getAttributeTypeList')
    .subscribe((result: any) => {
    this.loading_list = false;
    this.attributeTypeList = result['data']['attributeTypeList'];
    console.log( this.attributeTypeList );
    this.data.attribute_option = '';
    this.data.attribute_type = '';
    },error => {this.loading_list = false;  this.dialog.retry().then((result) => {  this.getAttributeTypeList(); }); });
  }


  attributeOptionList:any = [];


  getAttributeOptionList()
  {
      this.data.attribute_option = '';

      this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.data.attribute_type)[0]['optionList'];
      console.log(this.attributeOptionList);
  }
  
  


  
  
  GetPurchasePrice()
  {
    console.log(this.data);    
    console.log(this.measurement);    
    this.data.rate = this.measurement.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['purchase_price'];    
    console.log(this.data.rate);
    this.data.qty = 1;
    this.data.amount = this.data.rate;
  }
  
  
  GetAmount(qty,rate)
  {
    console.log(qty);
    console.log(rate);    
    this.data.amount = qty * rate;
    console.log(this.data);    
  }  
  
  purchase_list:any = [];
    AddItem(f:any = '')
  {
    // this.purchase_list.push(this.data);
    console.log(this.purchase_list);   
    this.purchase_form.item_total_temp = 0; 
    
    if(this.purchase_list.length == 0)
    {
        this.purchase_list.push(this.data);
        console.log(this.data);
        
    }
    else
    {
        for(let i=0;i<this.purchase_list.length;i++)
        {
            if(this.data.product_id == this.purchase_list[i].product_id && this.data.brand_name == this.purchase_list[i].brand_name && this.data.measurement == this.purchase_list[i].measurement )
            {
             
              this.purchase_list[i].product_id =  this.data.product_id;
              this.purchase_list[i].category = this.data.category;
              this.purchase_list[i].product_name = this.data.product_name;
              this.purchase_list[i].brand_name = this.data.brand_name;
              this.purchase_list[i].hsn_code = this.data.hsn_code;
              this.purchase_list[i].measurement = this.data.measurement;
              this.purchase_list[i].rate = this.data.rate;
              this.purchase_list[i].qty = parseInt(this.data.qty) + parseInt(this.purchase_list[i].qty);
              this.purchase_list[i].amount = this.data.amount;
              this.purchase_list[i].attribute_option = this.data.attribute_option;
              this.purchase_list[i].attribute_type = this.data.attribute_type;
              break;    

            }
            else if(i == this.purchase_list.length - 1)
            {
                this.purchase_list.push(this.data);    
                break;    
            }
        }
    }

    for(var j=0; j<this.purchase_list.length; j++)
    {
      this.purchase_form.item_total_temp  = parseFloat(this.purchase_list[j].amount) + parseInt(this.purchase_form.item_total_temp);      
    } 



    this.purchase_form.item_total = parseFloat(this.purchase_form.item_total_temp).toFixed(2);    
    
  console.log(this.purchase_list);    
  this.data = {};
  if(f)
  f.resetForm();

  }
  
  RemoveItem(index,amount)
  {
    this.purchase_form.item_total = parseFloat(this.purchase_form.item_total) - amount;  
    console.log(index);
    this.dialog.delete('Item Data !').then((result) => {
      console.log(result);
      if(result){
        this.purchase_list.splice(index,1);
        this.dialog.success('Item has been deleted.');
      }
    },error => { this.dialog.retry().then((result) => {  this.RemoveItem(index,amount); }); });   
  }
  sendingData:any;
  submit_po()
  {
    this.loading_list = true;
    this.sendingData = true;
    // this.purchase_form.item_data = this.purchase_list;
    console.log(this.purchase_form);
    console.log(this.purchase_list);    
    this.purchase_form.date_created =  this.purchase_form.date_created  ? this.db.pickerFormat( this.purchase_form.date_created )  : '';

    this.db.insert_rqst( {'data':this.purchase_form,'item':this.purchase_list,'created_by': this.ses.users.id,'created_by_type': this.ses.users.username} , 'purchase/addOrder')
    .subscribe((result: any) => {
      this.sendingData = false;
      this.loading_list = false;
      console.log(result);
        if(result)
        {
          this.router.navigate(['/purchases']);
        }
      },error => {    this.sendingData = false; this.loading_list = false;this.dialog.retry().then((result) => {   }); });
  } 
  
}
