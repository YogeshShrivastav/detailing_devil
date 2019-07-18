import { Component, OnInit,Inject } from '@angular/core';
import {MAT_DIALOG_DATA , MatDialogRef} from '@angular/material';
import { SessionStorage } from 'src/app/_services/SessionService';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { ActivatedRoute,Router } from '@angular/router';
import { ConvertArray } from '../../../_Pipes/ConvertArray.pipe';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/dialog/dialog.component';


@Component({
    selector: 'app-add-jobcard-rawmaterial',
    templateUrl: './add-jobcard-rawmaterial.component.html'
})
export class AddJobcardRawmaterialComponent implements OnInit {
    raw_form: any={};
    loading_list = false;
    brandsdata:any ;
    productsdata: any ;
    attr_typedata: any ;
    attr_optiondata: any ;
    tmp:any;
    cart_data: any=[] ;
    uom_data : any ;
    card_id: any;
    franchise_id: any;
    measures:any=[];
    
    
    constructor(@Inject(MAT_DIALOG_DATA) public data: any,public db : DatabaseService,private route : ActivatedRoute,private router: Router,public matDialog : MatDialog , public dialog : DialogComponent,public ses : SessionStorage,public dialogRef: MatDialogRef<AddJobcardRawmaterialComponent>) { 
        console.log(data);
        this.card_id = data.card_id;
        this.franchise_id = data.franchise_id;
        console.log(this.franchise_id);
        
    }
    
    ngOnInit() {
        this.raw_form.category = 'Product';
        this.get_allbrands();
    }
    
    
    categoryList:any = [];
    // getCategoryList()
    //   {
    
    //       this.db.post_rqst(  '', 'sales/getCategoryList')
    //       .subscribe((result: any) => {
    //           // this.loading_list = true;
    //           console.log(result);
    //           this.categoryList = result['data']['categoryList'];
    //           console.log(this.categoryList);        
    //       },err => {  this.dialog.retry().then((result) => { this.getCategoryList(); });   });
    //   }
    
    
    
    
    get_allbrands()
    {
        this.loading_list = true;
        this.productsdata=[];
        this.attr_typedata=[];
        this.attr_optiondata=[];
        this.measures=[];
        this.raw_form.qty = 0;
        this.db.post_rqst(  this.raw_form, 'customer/getallbrands/'+this.franchise_id)
        .subscribe(d => {
            this.tmp = d;
            console.log(  this.tmp );
            this.brandsdata = this.tmp.brands;  
            console.log(this.brandsdata);
            this.loading_list = false;
        },err => {  this.dialog.retry().then((result) => { 
            this.get_allbrands();      
            console.log(err); });  
        });
    }
    
    get_selected_brand(brand_name:any)
    {
        this.productsdata=[];
        this.attr_typedata=[];
        this.attr_optiondata=[];
        this.measures=[];
        this.raw_form.qty = 0;
        
        console.log(brand_name);
        this.raw_form.product_name = '';
        this.loading_list = true;
        this.db.post_rqst(  this.raw_form, 'customer/get_brand_wise_product?brand=' + brand_name +'&franchise_id='+this.franchise_id)
        .subscribe(d => {
            this.tmp = d;
            this.loading_list = false;
            console.log(  this.tmp );
            this.productsdata = this.tmp.products;  
            console.log(this.productsdata);      
        },err => {  this.dialog.retry().then((result) => { 
            this.get_selected_brand(brand_name);      
            console.log(err); });  
        });
    }
    
    
    temp_product_id:  any;
    get_selected_product(product)
    {
        this.raw_form.qty = 0;
        
        this.temp_product_id  = product;
        console.log(product);
        this.loading_list = true;
        this.db.get_rqst(  '', 'customer/get_prdct_wise_attr?product=' + product +'&franchise_id='+this.franchise_id+ '&brand_name='+this.raw_form.brand_name+ '&category='+this.raw_form.category)
        .subscribe(d => {
            this.tmp = d;
            this.loading_list = false;
            console.log(  this.tmp );
            this.measures = this.tmp.measures;
            if(this.measures.length == 1)
            {
                this.raw_form.current_stock = this.measures[0].current_stock;
                this.raw_form.uom = this.measures[0].uom;
                this.raw_form.stock_id = this.measures[0].id;
                console.log(this.raw_form.stock_id);
                
            }
            
            console.log(this.measures);
        },err => {  this.dialog.retry().then((result) => { 
            this.get_selected_product(product);      
            console.log(err); });  
        });
    }
    
    get_selected_measures(value:any){
        for(var i = 0 ; i < this.measures.length; i++)
        {
            if(value == this.measures[i].uom)
            {
                this.raw_form.current_stock = this.measures[i].current_stock;
                this.raw_form.stock_id = this.measures[i].id;
                
            }
        }
    }
    
    // get_selected_attrtype(attr_type_id)
    // {
    //   console.log(attr_type_id);
    //   console.log(this.temp_product_id);
    //   this.loading_list = false;
    //   this.db.get_rqst(  '', 'customer/get_attrtype_wise_attroption?attr_type_id=' + attr_type_id + '&prod_id=' + this.temp_product_id)
    //   .subscribe(d => {
    //     this.tmp = d;
    //     this.loading_list = true;
    //     console.log(  this.tmp );
    //     this.attr_optiondata = this.tmp.attroptions;  
    //     console.log(this.attr_optiondata);
    //   },err => {  this.dialog.retry().then((result) => { 
    //     this.get_selected_attrtype(attr_type_id);      
    //     console.log(err); });  
    //    });
    // }
    
    addtocart(form:any)
    {
        console.log(form);
        const tmp = new ConvertArray().transform( form._directives);
        console.log( tmp );
        tmp.category = 'Product';
        tmp.stock_id = this.raw_form.stock_id;
        
        if(this.cart_data.length == 0)
        {
            this.cart_data.push(tmp);
        }
        else
        {
            for(var i=0;i<this.cart_data.length;i++)
            {
                    if(this.cart_data[i].brand_name == tmp.brand_name && this.cart_data[i].category == tmp.category && this.cart_data[i].product_name == tmp.product_name && this.cart_data[i].uom == tmp.uom && this.cart_data[i].current_stock == tmp.current_stock)
                    {


                            if( (parseFloat(this.cart_data[i].qty) + parseFloat(tmp.qty) ) > tmp.current_stock ){

                                    this.dialog.success('Stock Down! already added');
                                    return;

                            }else{

                                    console.log('in2');
                                    this.cart_data[i].qty += parseFloat(tmp.qty);
                                    console.log(this.cart_data);
                                    form.reset();
                                    return;

                            }
                        
                        
                    
                    }
            }
            
            
            
            this.cart_data.push(tmp);
            
            
            
            
            
            
        }
        console.log(this.cart_data);
        form.reset();
    }
    
    removeCartData(index)
    {
        this.cart_data.splice(index,1);
    }
    
    saveraw_material()
    {
        
        this.loading_list = true;
        this.db.insert_rqst({'cart' : this.cart_data ,'created_by': this.ses.users.id , 'franchise_id' :this.franchise_id} , 'customer/saveraw_material/' + this.card_id)
        .subscribe(d => {
            this.loading_list = false;
            this.dialogRef.close('true');
        },err => {   this.loading_list = false; this.dialog.retry().then((result) => {  this.saveraw_material();    console.log(err); });   });
    }
    
}
