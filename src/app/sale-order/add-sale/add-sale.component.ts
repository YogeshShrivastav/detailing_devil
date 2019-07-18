import { Component, OnInit } from '@angular/core';
import {DialogComponent} from '../../dialog/dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../_services/DatabaseService';

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html'
})
export class AddSaleComponent implements OnInit {

  franchiseList: any = [];

  data:any = {};

  brandList:any = [];
  productList : any = [];
  measurementList: any = [];
  attributeTypeList: any = [];
  attributeOptionList: any = [];

  orderItemList: any = [];

  loader: any = '';
  current_page = 1;
  search: any = '';
  franchise_id:any='';

  orderData: any = {};
  loading_list = false;

    constructor(public db: DatabaseService,
                public dialog: DialogComponent,
                private route: ActivatedRoute,
                private router: Router) { }

    ngOnInit() {
        this.route.params.subscribe(params => {

            console.log(params);
              this.franchise_id = this.db.crypto(params['id'],false) || '';
              this.orderData.franchise_id = this.db.crypto(params['id'],false) || '';
          
    
          if (this.franchise_id) { 
              this.getFranchiseList(this.franchise_id); 
          } else {
              this.getFranchiseList(0);
          }

      this.getCaegoryList();

    });
    }

    getFranchiseList(franchise_id) {

          this.loading_list = true;
        
          this.db.get_rqst('' , 'sales/getFranchise/'+ franchise_id)
          .subscribe((result: any) => {
              console.log(result);
              this.franchiseList = result['data']['franchisesList'];

              this.loading_list = false;
              console.log(this.franchiseList);

            },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getFranchiseList(franchise_id); });   });
    }

   categoryList:any = [];
    getCaegoryList()
    {
        this.loading_list = true;
        this.data.product_id = '';
        this.data.measurement = '';
        this.data.rate = '';
        this.data.attribute_type = '';
        this.data.attribute_option = '';
        this.brandList = [];

        this.productList = [];
        this.measurementList = [];
        this.attributeTypeList = [];
        this.attributeOptionList = [];

        // this.loading_list = false;
        this.db.post_rqst(  '', 'sales/getCategoryList')
        .subscribe((result: any) => {
            this.loading_list = false;
            // this.loading_list = true;
            console.log(result);
            this.categoryList = result['data']['categoryList'];
            console.log(this.categoryList);        
        },err => {  this.loading_list = false;  this.dialog.retry().then((result) => { this.getCaegoryList(); });   });
    }



  
    getBrandList()
    {
        this.loading_list = true
        ;
        this.data.product_id = '';
        this.data.measurement = '';
        this.data.rate = '';
        this.data.attribute_type = '';
        this.data.attribute_option = '';
        this.productList = [];
        this.measurementList = [];
        this.attributeTypeList = [];
        this.attributeOptionList = [];

        // this.loading_list = false;
        console.log(this.data.category);
        
        this.db.post_rqst(  {'category':this.data } , 'sales/getBrandByCategory')
        .subscribe((result: any) => {
            this.loading_list = false;
            console.log(result);
            this.brandList = result['data']['brandList'];
            console.log(this.brandList);        
        },err => {   this.loading_list = false; this.dialog.retry().then((result) => { this.getBrandList(); });   });
    }

  
    getProductList()
    {
        this.loading_list = true;
          this.data.product_id = '';
          this.data.measurement = '';
          this.data.rate = '';
          this.data.attribute_type = '';
          this.data.attribute_option = '';
          this.productList = [];
          this.measurementList = [];
          this.attributeTypeList = [];
          this.attributeOptionList = [];
        //   this.loading_list = false;
          this.db.post_rqst( this.data , 'sales/getProduct')
          .subscribe((result) => {
            this.loading_list = false;
              console.log(result);
              this.productList = result['data']['productList'];
            },err => {   this.loading_list = false; this.dialog.retry().then((result) => { this.getProductList(); });   });
    }

    
    getMeasurementList()
    {
          this.loading_list = true;
          this.data.measurement = '';
          this.data.rate = '';
          this.db.post_rqst( this.data , 'sales/getMeasurement')
          .subscribe((result: any) => {
                this.loading_list = false;
                console.log(result);
                this.measurementList = result['data']['measurementList'];
                console.log(this.measurementList);    
                this.data.attribute_option = '';
                this.data.attribute_type = '';
                      
                this.attributeTypeList = result['data']['attributeList'];
                console.log(this.attributeTypeList);
            },err => {  this.loading_list = false; this.dialog.retry().then((result) => { this.getMeasurementList(); });   });
    }


    getAttributeOptionList()
    {
        this.data.attribute_option = '';

        this.attributeOptionList = this.attributeTypeList.filter(x => x.attr_type === this.data.attribute_type)[0]['optionList'];
        console.log(this.attributeOptionList);
    }
    
    
    getSalePrice()
    {
        console.log(this.data);
        console.log(this.measurementList);

        this.data.qty = 1;
        this.data.rate = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['sale_price'];
        this.data.unit_of_measurement = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['unit_of_measurement'];
        this.data.description = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['description'];
        this.data.uom = this.measurementList.filter(x=>x.unit_of_measurement === this.data.measurement)[0]['id'];
        console.log(this.data.rate);
    }
    

    getAmount(qty,rate)
    {
          console.log(qty);
          console.log(rate);
          
          this.data.amount = qty * rate;
          console.log(this.data);
    }  
    

    AddItem(s:any)
    {
        this.loading_list = true;
        // let temp_qty;
        // if(this.orderItemList.length == 0)
        // {
        //     temp_qty = this.data.qty;
        // }
        // else
        // {
        //     for(let i=0;i<this.orderItemList.length;i++)
        //     {
        //         if(this.data.product_id == this.orderItemList[i].product_id)
        //         {
        //             temp_qty = parseInt(this.orderItemList[i].qty) + this.data.qty;
        //         }
        //         else if(i == this.orderItemList.length - 1)
        //         {
        //             temp_qty = this.data.qty;
        //         }
        //     }
        // }
        // console.log(temp_qty);

        this.data.amount =  this.data.qty * this.data.rate;
        this.data.discount = this.data.discount || 0;
        this.data.discounted_amount = this.data.amount * (this.data.discount / 100) || 0;

        this.data.gross_amount = this.data.amount - this.data.discounted_amount;

        const productItem = this.productList.filter(product =>  product.id === this.data.product_id)[0];

        console.log(productItem);

        this.data.product_name = productItem.product_name;
        this.data.hsn_code = productItem.hsn_code;

        this.data.gst = productItem.gst;

        this.data.gst_amount = this.data.gross_amount * (this.data.gst / 100);

        this.data.item_final_amount = this.data.gross_amount + this.data.gst_amount;

        // this.orderItemList.push(this.data);

        if(this.orderItemList.length == 0)
        {
            this.orderItemList.push(this.data);
        }
        else
        {
            for(let i=0;i<this.orderItemList.length;i++)
            {
                if(this.data.product_id == this.orderItemList[i].product_id && this.data.brand_name == this.orderItemList[i].brand_name && this.data.measurement == this.orderItemList[i].unit_of_measurement )
                {
                    this.orderItemList[i].qty =  parseInt(this.data.qty)+parseInt(this.orderItemList[i].qty);
                    this.orderItemList[i].amount = this.data.amount;
                    this.orderItemList[i].discount = this.data.discount;
                    this.orderItemList[i].discounted_amount = this.data.discounted_amount;
                    this.orderItemList[i].gross_amount = this.data.gross_amount;
                    this.orderItemList[i].gst = this.data.gst;
                    this.orderItemList[i].gst_amount = this.data.gst_amount;
                    this.orderItemList[i].item_final_amount = this.data.item_final_amount;
                    this.orderItemList[i].attribute_option = this.data.attribute_option;
                    this.orderItemList[i].attribute_type = this.data.attribute_type;
                    break;
                }
                else if(i == this.orderItemList.length - 1)
                {
                    this.orderItemList.push(this.data);     
                    break;   
                }
            }
        }

        this.data = {};

        console.log(this.orderItemList);

        this.calculateNetOrderTotal();

        this.productList = [];
        this.measurementList = [];
        this.attributeTypeList = [];
        this.attributeOptionList = [];

        console.log(this.orderItemList);
        console.log(this.data);

      s.resetForm();
      this.loading_list = false;
    }
    
    RemoveItem(index)
    {
        console.log(index);
        this.dialog.delete('Item Data !').then((result) => {
            console.log(result);
            if(result){
               this.orderItemList.splice(index,1);

               this.calculateNetOrderTotal();
               this.dialog.success('Item has been deleted.');
            }
        });
    }



    calculateNetOrderTotal() {

        this.orderData.netSubTotal = 0;
        this.orderData.netDiscountAmount = 0;
        this.orderData.netGstAmount = 0;
        this.orderData.netAmount = 0;
        this.orderData.netTotalQty = 0;
        this.orderData.netTotalItem = 0;
        
        for (let j = 0; j < this.orderItemList.length; j++)
        {
            console.log(this.orderItemList[j].qty);
            
            this.orderData.netTotalQty += this.orderItemList[j].qty;
            this.orderData.netSubTotal += this.orderItemList[j].amount;
            this.orderData.netDiscountAmount += this.orderItemList[j].discounted_amount;
            this.orderData.netGstAmount += this.orderItemList[j].gst_amount;
            this.orderData.netAmount += this.orderItemList[j].item_final_amount;
        }
        this.orderData.netTotalItem += this.orderItemList.length;

        this.orderData.netGrossAmount = this.orderData.netSubTotal - this.orderData.netDiscountAmount;

        console.log(this.orderData);
    }

    savingData:any= false;
    submit_sales_order()
    {
        this.loading_list = true;
        this.savingData = true;
        console.log(this.orderData);
        console.log(this.orderItemList);

        this.orderData.itemList = this.orderItemList;
        this.orderData.created_by = this.db.datauser.id;

        this.db.insert_rqst( this.orderData , 'sales/saveOrder')
        .subscribe((result: any) => {
            this.savingData = false;
            this.loading_list = false;
              console.log(result);
              if (this.franchise_id) { 
                this.router.navigate(['/franchise-orders/'+this.db.crypto(this.franchise_id)]);
            } else {
              this.router.navigate(['/sale-order-list']);
            }

        },err => {   this.loading_list = false; this.savingData = false; this.dialog.retry().then((result) => {    });
    });
}

}
