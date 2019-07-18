<?php



namespace App\Http\Controllers\Admin;



// use Acme\Repositories\Franchises\FranchisesRepo;



use App\Http\Controllers\ApiController;



use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;


use DB;




class SalesOrderController extends ApiController

{



    public function salesOrderList(Request $request) {

        $per_page = 20;

        $filter = (Object)$request['filter'];



        $so = DB::table('sales_order');

        $so->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id');
        $so->leftJoin('users', 'franchises.created_by', '=', 'users.id');
        $so->where('del' ,'0');
        
        if(isset($filter->search) && $filter->search) {
            $s = $filter->search;
            $so ->where(function ($query) use ($s ) {
                $query->where('franchises.company_name','LIKE','%'.$s.'%')
                ->orWhere('sales_order.id','LIKE','%'.$s.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%');

            });
        }
        
        if(isset($filter->date) && $filter->date != '') $so->where('sales_order.date_created','LIKE','%'.$filter->date.'%');
       
        if(isset($filter->status) && $filter->status != '') $so->where('sales_order.order_status' ,$filter->status);

        

        $so->select('sales_order.*', 'franchises.name', 'franchises.company_name', 'franchises.contact_no','users.first_name as created_name');

        $so->orderBy('sales_order.id','Desc');

        $salesOrderList = $so->paginate($per_page);


      

         $totalorder=DB::table('sales_order')

         ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

         ->count();



         $pendingorder=DB::table('sales_order')

         ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

         ->where('sales_order.order_status','=','Pending')

         ->count();


        $approved_order=DB::table('sales_order')

                 ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

                 ->where('sales_order.order_status','=','Approved')

                 ->count();



        foreach ($salesOrderList as $key => $row) {



             $salesOrderList[$key]->created_by_type = ucwords($row->created_by_type);



             $itemList =  DB::table('sales_order_item')->where('sales_order_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();



             $salesOrderList[$key]->totalItem = $itemList->totalItem;

        }
    


        return $this->respond([



            'data' => compact('salesOrderList','totalorder','pendingorder','approved_order'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Fetch Sales Order List Successfully'



            ]);

    }







    
    public function assumption_list(Request $request) {

        $per_page = 15;

        $search = $request->s;

        $status = $request->st;

        $so = DB::table(' assumption_stock');

        $so->leftJoin('users', 'assumption_stock.created_by', '=', 'users.id');

        $so->select('sales_orassumption_stockder.*','users.first_name as created_name');

        $so->orderBy('assumption_stock.id','Desc');

        $salesOrderList = $so->paginate($per_page);


    }









    public function invoiceList(Request $request) 
    {
        $per_page = 20;

        $search = $request->s;
        $filter = (Object)$request['filter'];

        $so = DB::table('sales_invoice');

        $so->join('users', 'users.id', '=', 'sales_invoice.created_by');

        $so->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice.customer_id');

        $so->leftJoin('organization', 'organization.id', '=', 'sales_invoice.organization_id');

        $so->where('sales_invoice.del' ,'!=','1');

        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.company_name','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.invoice_id','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.order_id','LIKE','%'.$search.'%')
                ->orWhere('users.first_name','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->organization) && $filter->organization != '') $so->where('sales_invoice.organization_id','=',$filter->organization);
        if(isset($filter->type) && $filter->type != 'Customer' &&  $filter->type != '') $so->where('sales_invoice.franchise_id','!=','0');
        if(isset($filter->type) && $filter->type != 'Franchise'  &&  $filter->type != '') $so->where('sales_invoice.franchise_id','=','0');

        if(isset($filter->payment_status) && $filter->payment_status != '') $so->where('sales_invoice.payment_status','=', $filter->payment_status );

        if(isset($filter->invoice_status) && $filter->invoice_status != '') $so->where('sales_invoice.del' , $filter->invoice_status );


        $so->select('sales_invoice.*', 'franchises.name','users.first_name as created_name','organization.company_name as org_name',DB::raw('CASE WHEN sales_invoice.franchise_id != "0"  THEN franchises.company_name ELSE direct_customer.company_name END as company_name'),DB::raw('CASE WHEN sales_invoice.franchise_id != "0"  THEN franchises.contact_no ELSE direct_customer.contact_no END as contact_no'),DB::raw('CASE WHEN sales_invoice.franchise_id  THEN "Franchise" ELSE "Direct Customer" END as type'),DB::raw('CASE WHEN sales_invoice.del = "0"  THEN "Active" ELSE "Cancel" END as status'));

        $so->orderBy('sales_invoice.date_created','Desc');

        $so->orderBy('sales_invoice.invoice_series','Desc');

        $salesInvoiceList = $so->paginate($per_page);


        $so = DB::table('sales_invoice');

        $so->join('users', 'users.id', '=', 'sales_invoice.created_by');

        $so->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice.customer_id');

        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.company_name','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.invoice_id','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.order_id','LIKE','%'.$search.'%')
                ->orWhere('users.first_name','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->organization) && $filter->organization != '') $so->where('sales_invoice.organization_id','=',$filter->organization);
        if(isset($filter->type) && $filter->type != 'Customer' &&  $filter->type != '') $so->where('sales_invoice.franchise_id','!=','0');
        if(isset($filter->type) && $filter->type != 'Franchise'  &&  $filter->type != '') $so->where('sales_invoice.franchise_id','=','0');

        if(isset($filter->payment_status) && $filter->payment_status != '') $so->where('sales_invoice.payment_status','=', $filter->payment_status );



        $balance = $so->sum('sales_invoice.balance');



        $so = DB::table('sales_invoice');

        $so->join('users', 'users.id', '=', 'sales_invoice.created_by');

        $so->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice.customer_id');

        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.company_name','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.invoice_id','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.order_id','LIKE','%'.$search.'%')
                ->orWhere('users.first_name','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->type) && $filter->type != 'Customer' &&  $filter->type != '') $so->where('sales_invoice.franchise_id','!=','0');
        if(isset($filter->type) && $filter->type != 'Franchise'  &&  $filter->type != '') $so->where('sales_invoice.franchise_id','=','0');

        if(isset($filter->payment_status) && $filter->payment_status != '') $so->where('sales_invoice.payment_status','=', $filter->payment_status );

        $sum = $so->sum('sales_invoice.invoice_total');

        foreach ($salesInvoiceList as $key => $row) 
        {
            $itemList =  DB::table('sales_invoice_item')->where('sales_invoice_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();

            $salesInvoiceList[$key]->totalItem = $itemList->totalItem;
        }

        return $this->respond([
            'data' => compact('salesInvoiceList','sum','balance'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Fetch Sales Invoice List Successfully'
        ]);

    }





    public function getFranchiseList($franchise_id) {



        if($franchise_id == 0) {



            $franchisesList = DB::table('franchises')->where('status' ,'A')->where('type' ,'2')->select('*')->get();



        } else {



            $franchisesList = DB::table('franchises')->where('id' , $franchise_id)->where('status' ,'A')->select('*')->get();



        }





        return $this->respond([



            'data' => compact('franchisesList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Fetch Franchises List Successfully'



        ]);

    }





    public function getCategoryList()

    {



        $categoryList = DB::table('master_products')

        ->where('status', 'A')

        ->select('category')

        ->groupBy('category')

        ->get();



        return $this->respond([



            'data' => compact('categoryList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Product List Fetched Successfully.'



        ]);

    }







    public function getBrandByCategory(Request $request)

    {

        $d = (object)$request['category'];

        $brandList = DB::table('master_products')

        ->where('category',$d->category)

        ->where('status', 'A')

        ->orderBy('brand_name','ASC')

        ->select('brand_name')

        ->groupBy('brand_name')

        ->get();





        return $this->respond([



            'data' => compact('brandList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Brand List Fetched Successfully.'



        ]);



    }



    

    public function getBrandList(Request $request)

    {

     

        $brandList = DB::table('master_products')

        ->where('status', 'A')

        ->where('category', 'Product')

        ->orderBy('brand_name','ASC')

        ->select('brand_name')

        ->groupBy('brand_name')

        ->get();





        return $this->respond([



            'data' => compact('brandList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Brand List Fetched Successfully.'



        ]);



    }

















    public function getProductList(Request $request)

    {



        $productList = DB::table('master_products')->where('status', 'A')->where('brand_name',$request->brand_name)->where('category',$request->category)->groupBy('product_name')->get();



        return $this->respond([



            'data' => compact('productList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Product List Fetched Successfully.'



        ]);

    }







    public function getMeasurementList(Request $request)

    {



        $measurementList = DB::table('master_product_measurement_prices')->where('status', 'A')->where('sale_price', '!=' ,'')->where('product_id',$request->product_id)->get();





        foreach ($measurementList as $key => $row) {

             $measurementList[$key] = $row;



             if (strpos($row->unit_of_measurement, 'box') !== false) {

                   $measurementArr = explode(' ', $row->unit_of_measurement);

                   $measurementList[$key]->unit_of_measurement = $measurementArr[1].' ('.$measurementArr[0] . ' pc)';

             }

        }



        $attributeList = DB::table('master_product_attr_types')->where('status', 'A')->where('attr_type', '!=' ,'')->where('product_id', $request->product_id)->get();



        foreach ($attributeList as $key => $row) {



               $attributeOptionList = DB::table('master_product_attr_options')->where('status', 'A')->where('attr_option', '!=' ,'')->where('attr_type_id', $row->id)->get();



               $attributeList[$key]->optionList = $attributeOptionList;

        }







        return $this->respond([



            'data' => compact('measurementList', 'attributeList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Measurement List Get Successfully.'

        ]);



    }





    public function saveOrderData(Request $data) {



            $order = DB::table('sales_order')->insert([

                    'date_created' => date('Y-m-d H:i:s'),

                    'created_by' =>  $data->created_by,

                    'franchise_id' =>  $data->franchise_id,
 
                    'totalQty' =>  $data->netTotalQty,

                    'totalItem' =>  $data->netTotalItem,

                    'sub_total' =>  $data->netSubTotal,

                    'dis_amt' =>  $data->netDiscountAmount,

                    'gross_total' =>  $data->netGrossAmount,

                    'gst_amt' =>  $data->netGstAmount,

                    'order_total' =>  $data->netAmount,

                    'order_status' =>  'Pending'

            ]);



            $salesOrderId = DB::getPdo()->lastInsertId();





            foreach ($data->itemList as $key => $row) {



                    $orderItem = DB::table('sales_order_item')->insert([



                            'sales_order_id' => $salesOrderId,

                            'item_id' => $row['product_id'],

                            'category' => $row['category'],

                            'brand_name' => $row['brand_name'],

                            'item_name' =>  $row['product_name'],

                            'item_measurement_type' =>  $row['measurement'],

                            'uom_id' =>  $row['uom'],

                            'description' =>  $row['description'],

                            'hsn_code' =>  $row['hsn_code'],

                            'item_qty' =>  $row['qty'],

                            'delivered_qty' =>  0,

                            'item_rate' =>  $row['rate'],

                            'item_amount' =>  $row['amount'],

                            'discount' =>  $row['discount'],

                            'discount_amount' =>  $row['discounted_amount'],

                            'gross_amount' =>  $row['gross_amount'],

                            'gst' =>  $row['gst'],

                            'gst_amount' =>  $row['gst_amount'],

                            'item_total' =>  $row['item_final_amount'],

                            'item_attribute_type' =>  $row['attribute_type'],

                            'item_attribute_value' =>  $row['attribute_option']

                    ]);

            }


     $company_name = DB::table('franchises')->where('id', $data->franchise_id)->select('company_name')->first()->company_name;





          $msg =  $company_name.' (franchises) created new sales order #'.$salesOrderId.' by '.$this->get_name($data->created_by);


          $id =  $this->notification(['created_by'   =>  $data->created_by, 'table' =>  'sales_order', 'table_id' =>  $salesOrderId,
                'user_name' => $company_name  , 'title'   => 'Franchise sales order', 'msg'   => $msg ]);


        $so = DB::table('users')->where('access_level', '1')->select('id')->get();


        foreach ($so as $key => $value) {
         
          $this->setNotificationReceived( $id , $value->id,  $data->created_by);

          }

            return $this->respond([



                'data' => compact('salesOrderId'),



                'status' => 'success',



                'status_code' => $this->getStatusCode(),



                'message' => 'Sales Order Inserted Successfully.'



            ]);

    }





    public function getSalesOrderDetail($sales_order_id)

    {



        $orderdetail = DB::table('sales_order')

        ->leftJoin('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

        ->join('users', 'users.id', '=', 'sales_order.created_by')

        ->leftjoin('countries','franchises.ship_country_id','=','countries.id')

        ->where('sales_order.del', '0')

        ->where('sales_order.id',$sales_order_id)

        ->select('sales_order.*', 'franchises.created_at','franchises.company_name','franchises.name','franchises.contact_no','franchises.email_id','franchises.address','franchises.state','franchises.city','franchises.pincode','franchises.company_gstin','franchises.company_pan_no','franchises.year_of_est','franchises.ship_country_id','franchises.ship_state','franchises.ship_district','franchises.ship_city','franchises.ship_pincode','franchises.ship_address','countries.name as ship_country_name','users.first_name as created_name')

        ->first();








        $distinctBrandList = DB::table('sales_order_item')

            ->where('sales_order_item.del', '0')

            ->where('sales_order_item.sales_order_id',$sales_order_id)

            ->select('sales_order_item.brand_name')

            ->groupBy('brand_name')

            ->get();





        $itemdetail = array();



        foreach ($distinctBrandList as $key => $row) {



              $itemdetail[$key]['brand_name'] = $row->brand_name;



              $brandItemList = DB::table('sales_order_item')

                    ->leftJoin('master_product_measurement_prices','master_product_measurement_prices.id','=','sales_order_item.uom_id')

                    ->where('sales_order_item.del', '0')

                    ->where('sales_order_item.sales_order_id',$sales_order_id)

                    ->where('sales_order_item.brand_name',$row->brand_name)

                    ->groupBy('sales_order_item.id')

                    ->select('sales_order_item.*','master_product_measurement_prices.sale_qty')

                    ->get();



              $itemdetail[$key]['item_list'] = $brandItemList;

        }





        $invoice = DB::table('sales_invoice')

            ->where('sales_invoice.del', '0')

            ->where('sales_invoice.order_id',$sales_order_id)

            ->select('sales_invoice.*')

            ->get();





        $orderInvoiceList = array();

   




        return $this->respond([



            'data' => compact('orderdetail','itemdetail','orderInvoiceList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Order Detail Fetched Successfully.'



        ]);

    }







    public function getSalesInvoice($sales_invoice_id)
    {
        $invoicedetail = DB::table('sales_invoice')

            ->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id')

            ->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice.customer_id')

            ->leftJoin('countries', 'franchises.country_id', '=', 'countries.id')

            ->leftJoin('countries as countries2', 'direct_customer.country', '=', 'countries2.id')


            ->leftJoin('users', 'users.id', '=', 'sales_invoice.created_by')

            ->leftJoin('organization', 'organization.id', '=', 'sales_invoice.organization_id')

            ->leftJoin('countries as admin_country', 'organization.country_id', '=', 'admin_country.id')

            ->where('sales_invoice.del', '!=' ,'1')

            ->where('sales_invoice.id',$sales_invoice_id)

            ->select('sales_invoice.*'
            ,'sales_invoice.date_created as created_at'
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN "Franchises" ELSE "Direct Customer" END as type')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN countries.name ELSE countries2.name END as country_name')

            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.company_name ELSE direct_customer.company_name END as company_name')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.contact_no ELSE direct_customer.contact_no END as contact_no')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.name ELSE direct_customer.name END as name')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.email_id ELSE direct_customer.email_id END as email_id')

            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.address ELSE direct_customer.address END as address')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.state ELSE direct_customer.state END as state')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.city ELSE direct_customer.city END as city')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.pincode ELSE direct_customer.pincode END as pincode')


            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.ship_state ELSE direct_customer.ship_state END as ship_state')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.ship_district ELSE direct_customer.ship_district END as ship_district')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.ship_city ELSE direct_customer.ship_city END as ship_city')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.ship_address ELSE direct_customer.ship_address END as ship_address')
            ,DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.company_gstin ELSE direct_customer.company_gstin END as company_gstin')

            ,'organization.company_name as admin_company_name','organization.org_logo','organization.state as admin_state','organization.address as admin_address','organization.city as admin_city','users.first_name as created_name','organization.district as admin_district','organization.pincode as admin_pincode','admin_country.name as admin_country_name','organization.company_pan_no as admin_company_pan_no','organization.company_gstin as org_company_gstin','organization.aadhaar_no as admin_aadhaar_no','organization.bank_name as admin_bank_name','organization.account_no as admin_account_no','organization.account_type as admin_account_type','organization.ifsc_code as admin_ifsc_code','organization.branch_name as admin_branch_name','organization.bank_address as admin_bank_address','organization.company_pan_no as admin_company_pan_no','organization.company_name_in_bank as admin_company_name_in_bank')

            ->first();

        $itemdetail = DB::table('sales_invoice_item')

            ->where('sales_invoice_item.del', '0')

            ->where('sales_invoice_item.sales_invoice_id',$sales_invoice_id)

            ->get();

        $invoicePaymentList = DB::table('sales_invoice_payment')

            ->join('sales_invoice','sales_invoice.id','=','sales_invoice_payment.invoice_id')

            ->join('users','users.id','=','sales_invoice_payment.created_by')

            ->where('sales_invoice_payment.del', '0')

            ->where('sales_invoice_payment.invoice_id',$sales_invoice_id)

            ->select('sales_invoice_payment.*','sales_invoice.invoice_id as prfx_invoice_id','users.first_name')

            ->get();

        return $this->respond([
            'data' => compact('invoicedetail','itemdetail', 'invoicePaymentList'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Invoice Detail Fetched Successfully.'
            ]);
    }



    public function getServiceDetail($franchise_service_id)
    {
        $invoicedetail = DB::table('franchise_service')

            ->leftJoin('franchises', 'franchises.id', '=', 'franchise_service.franchise_id')

            ->leftJoin('countries', 'franchises.country_id', '=', 'countries.id')

            ->leftJoin('users', 'users.id', '=', 'franchise_service.created_by')

            ->leftJoin('organization', 'organization.id', '=', 'franchise_service.organization_id')

            ->leftJoin('countries as admin_country', 'organization.country_id', '=', 'admin_country.id')

            ->where('franchise_service.del', '0')

            ->where('franchise_service.id',$franchise_service_id)

            ->select('franchise_service.*'
            ,'franchise_service.date_created as created_at','countries.name','franchises.company_name','franchises.contact_no','franchises.name','franchises.email_id','franchises.address','franchises.state','franchises.city','franchises.pincode','franchises.ship_state','franchises.ship_district','franchises.ship_city','franchises.ship_address','organization.company_name as admin_company_name','organization.org_logo','organization.state as admin_state','organization.address as admin_address','organization.city as admin_city','users.first_name as created_name','organization.district as admin_district','organization.pincode as admin_pincode','admin_country.name as admin_country_name','organization.company_gstin','organization.company_pan_no as admin_company_pan_no','organization.aadhaar_no as admin_aadhaar_no','organization.bank_name as admin_bank_name','organization.account_no as admin_account_no','organization.account_type as admin_account_type','organization.ifsc_code as admin_ifsc_code','organization.branch_name as admin_branch_name','organization.bank_address as admin_bank_address','organization.company_pan_no as admin_company_pan_no','organization.company_name_in_bank as admin_company_name_in_bank')

            ->first();

            $itemdetail = DB::table('franchise_service_item')

            ->where('franchise_service_item.del', '0')

            ->where('franchise_service_item.franchise_service_id',$franchise_service_id)

            ->get();


            $invoicePaymentList = DB::table('franchise_service_payment')

                ->join('franchise_service','franchise_service.id','=','franchise_service_payment.invoice_id')

                ->join('users','users.id','=','franchise_service_payment.created_by')



                ->where('franchise_service_payment.del', '0')

                ->where('franchise_service_payment.invoice_id',$franchise_service_id)

                ->select('franchise_service_payment.*','franchise_service.invoice_id as prfx_invoice_id','users.first_name')

                ->get();


            return $this->respond([
                'data' => compact('invoicedetail','itemdetail', 'invoicePaymentList'),
                'status' => 'success',
                'status_code' => $this->getStatusCode(),
                'message' => 'Invoice Detail Fetched Successfully.'
            ]);

    }










    public function getInvoicePayment(Request $request) 
    {
        $per_page = 20;
        $search = $request->s;
        $filter = (Object)$request['filter'];

        $so = DB::table('sales_invoice_payment');
        $so->join('sales_invoice', 'sales_invoice.id', '=', 'sales_invoice_payment.invoice_id');
        $so->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice_payment.franchise_id');
        $so->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice_payment.customer_id');
        $so->join('users', 'users.id', '=', 'sales_invoice_payment.created_by');
        $so->where('sales_invoice_payment.del' ,'0');

        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.company_name','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice_payment.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->type) && $filter->type != 'Customer' && $filter->type != '') $so->where('sales_invoice.franchise_id','!=','0');
        if(isset($filter->type) && $filter->type != 'Franchise' && $filter->type != '') $so->where('sales_invoice.franchise_id','=','0');
        if(isset($filter->mode) && $filter->mode != '') $so->where('sales_invoice_payment.mode','LIKE','%'.$filter->mode.'%');

        $so->select('sales_invoice_payment.*',DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.company_name ELSE direct_customer.company_name END as company_name'),DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.contact_no ELSE direct_customer.contact_no END as contact_no'),DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.name ELSE direct_customer.name END as name'),DB::raw('CASE WHEN sales_invoice.franchise_id  THEN "Franchise" ELSE "Direct Customer" END as type'),'users.first_name','sales_invoice.invoice_id as prefix_invoice_id');

        $so->groupBy('sales_invoice_payment.id');
        $so->orderBy('sales_invoice_payment.id','Desc');

        $invoicePaymentList= $so->paginate($per_page);

        $so = DB::table('sales_invoice_payment');
        $so->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice_payment.franchise_id');
        $so->leftJoin('direct_customer', 'direct_customer.id', '=', 'sales_invoice_payment.customer_id');
        $so->join('sales_invoice', 'sales_invoice.id', '=', 'sales_invoice_payment.invoice_id');
        $so->join('users', 'users.id', '=', 'sales_invoice_payment.created_by');
        $so->where('sales_invoice_payment.del' ,'0');

        if($search)
        {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.company_name','LIKE','%'.$search.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$search.'%')
                ->orWhere('sales_invoice.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice_payment.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->type) && $filter->type != 'Customer' && $filter->type != '') $so->where('sales_invoice.franchise_id','!=','0');
        if(isset($filter->type) && $filter->type != 'Franchise' && $filter->type != '') $so->where('sales_invoice.franchise_id','=','0');
        if(isset($filter->mode) && $filter->mode != '') $so->where('sales_invoice_payment.mode','LIKE','%'.$filter->mode.'%');

        $so->select('sales_invoice_payment.*',DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.company_name ELSE direct_customer.company_name END as company_name'),DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.contact_no ELSE direct_customer.contact_no END as contact_no'),DB::raw('CASE WHEN sales_invoice_payment.franchise_id != "0"  THEN franchises.name ELSE direct_customer.name END as name'),DB::raw('CASE WHEN sales_invoice.franchise_id  THEN "Franchise" ELSE "Direct Customer" END as type'),'users.first_name','sales_invoice.invoice_id as prefix_invoice_id');
        $so->orderBy('sales_invoice_payment.id');

        $sum= $so->sum('sales_invoice_payment.amount');

        foreach($invoicePaymentList as $key => $row)
        {
            $invoicePaymentList[$key] = $row;
            $invoicePaymentList[$key]->created_by_type = ucwords($row->created_by_type);
            $dateCreated = date_Create($row->date_created);
            $invoicePaymentList[$key]->date_created = date_format($dateCreated, 'd-M-Y');
        }

        return $this->respond([
            'data' => compact('invoicePaymentList','sum'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Payment Detail Fetched Successfully.'
        ]);
    }



    public function getServicePayment(Request $request) 
    {
        $per_page = 20;
        $search = $request->s;
        $filter = (Object)$request['filter'];

        $so = DB::table('franchise_service_payment');
        $so->join('franchise_service', 'franchise_service.id', '=', 'franchise_service_payment.invoice_id');
        $so->leftJoin('franchises', 'franchises.id', '=', 'franchise_service_payment.franchise_id');
        $so->join('users', 'users.id', '=', 'franchise_service_payment.created_by');
        $so->where('franchise_service_payment.del' ,'0');

        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('franchise_service.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('franchise_service_payment.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->mode) && $filter->mode != '') $so->where('franchise_service_payment.mode','LIKE','%'.$filter->mode.'%');

        $so->select('franchise_service_payment.*','franchises.company_name','franchises.contact_no','franchises.name', 'users.first_name','franchise_service.invoice_id as prefix_invoice_id');

        $so->groupBy('franchise_service_payment.id');
        $so->orderBy('franchise_service_payment.id','Desc');

        $servicePaymentList= $so->paginate($per_page);

        $so = DB::table('franchise_service_payment');
        $so->leftJoin('franchises', 'franchises.id', '=', 'franchise_service_payment.franchise_id');
        $so->join('franchise_service', 'franchise_service.id', '=', 'franchise_service_payment.invoice_id');
        $so->join('users', 'users.id', '=', 'franchise_service_payment.created_by');
        $so->where('franchise_service_payment.del' ,'0');

        if($search)
        {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('franchise_service.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('franchise_service_payment.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->mode) && $filter->mode != '') $so->where('franchise_service_payment.mode','LIKE','%'.$filter->mode.'%');

        $so->select('franchise_service_payment.*','franchises.company_name','franchises.contact_no','franchises.name', 'users.first_name','franchise_service.invoice_id as prefix_invoice_id');
        $so->orderBy('franchise_service_payment.id');

        $sum= $so->sum('franchise_service_payment.amount');

        

        return $this->respond([
            'data' => compact('servicePaymentList','sum'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Payment Detail Fetched Successfully.'
        ]);
    }
    

    public function saveInvoice(Request $request) 
    {
        $data = (object)$request['data'];
       
        if(!$data->organization_id)return false;

        $date_created = date('Y-m-d');
        if( isset($data->date_created) && $data->date_created ){
            $date_created = $data->date_created;
        }

        $date_below = DB::table('sales_invoice')->where('organization_id',$request->data['organization_id'])->where('del','0')->max('date_created');
        
        if( $date_below && date('Y-m-d',strtotime($date_below)) > $date_created) 
        {
            return $this->respond('Date is Grater');
        }

        $invoice = DB::table('sales_invoice')->insert([

            'date_created' => $date_created,

            'created_by' => $data->login_id,

            'franchise_id' =>  $data->franchise_id,

            'customer_id' =>   isset($data->customer_id) ? $data->customer_id : '',

            'order_id' =>  $data->order_id,

            'organization_id' =>  $data->organization_id,

            'sub_total' =>  $data->itemTotal,

            'dis_per' =>  $data->netDiscountPer,

            'dis_amt' =>  $data->netDiscountAmount,

            'gross_total' =>  $data->netGrossAmount,

            'gst_amt' =>  $data->netGstAmount,

            'sgst_amt' =>  $data->sgst_amt,

            'cgst_amt' =>  $data->cgst_amt,

            'igst_amt' =>  $data->igst_amt,

            'igst_per' =>  $data->igst_per,

            'sgst_per' =>  $data->sgst_per,

            'cgst_per' =>  $data->cgst_per,

            'invoice_total' =>  $data->netAmount,

            'shiping_gst_per' =>  $data->shiping_gst_per,

            'shipping_gst' =>  $data->shippingWithGst,

            'shiping_cgst_per' =>  $data->shiping_cgst_per,

            'shiping_sgst_per' =>  $data->shiping_sgst_per,

            'shiping_igst_per' =>  $data->shiping_igst_per,

            'shipping_charges' =>  $data->shipping_charges,

            'received' =>  $data->receivedAmount,

            'balance' =>  $data->balance,

            'due_terms' =>  $data->due_terms,

            'payment_status' =>  $data->paymentStatus,

        ]);

        $salesInvoiceId = DB::getPdo()->lastInsertId();

        $organization = DB::table('organization')->where('id', $data->organization_id)->first();

        if (date('m') < 4) //Upto June 2014-2015
        {
            $financial_year = (date('y')-1) . '-' . date('y');
        } 
        else 
        {
            $financial_year = date('y') . '-' . (date('y') + 1); //After June 2015-2016
        }

        $invoice_series = 1;

        $prefix_year = $organization->invoice_prefix.''.$financial_year;

        $invoice_id = '';
        
        $p = DB::table('sales_invoice')->where('invoice_id','LIKE','%'.$prefix_year.'%')->orderBy('invoice_series','DESC')->first();

        if($p)
        {
            $invoice_series = $p->invoice_series + 1;
            $invoice_id = $prefix_year.'/'.$invoice_series;
        }
        else
        {
            $invoice_id = $prefix_year.'/1';
        }

        DB::table('sales_invoice')->where('id',$salesInvoiceId)->update([

            'invoice_prefix' => $organization->invoice_prefix,

            'invoice_id' => $invoice_id,

            'invoice_series' => $invoice_series,
        ]);

        foreach ($data->itemList as $key => $row) 
        {
            $invoiceItem = DB::table('sales_invoice_item')->insert([

                'sales_invoice_id' => $salesInvoiceId,

                'date_created' => $date_created,

                'item_id' => $row['product_id'],

                'uom_id' =>  $row['uom_id'],

                'category' => $row['category'],

                'brand_name' => $row['brand_name'],

                'item_name' =>  $row['product_name'],

                'item_measurement_type' =>  $row['measurement'],

                'description' =>  $row['description'],

                'hsn_code' =>  $row['hsn_code'],

                'item_qty' =>  $row['qty'],

                'delivered_qty' =>  $row['qty'],

                'item_rate' =>  $row['rate'],

                'item_amount' =>  $row['amount'],

                'discount' =>  $row['discount'],

                'discount_amount' =>  $row['discounted_amount'],

                'gross_amount' =>  $row['gross_amount'],

                'gst' =>  $row['gst'],

                'gst_amount' =>  $row['gst_amount'],

                'sgst_amt' =>  $row['sgst_amt'],

                'cgst_amt' =>  $row['cgst_amt'],

                'igst_amt' =>  $row['igst_amt'],

                'igst_per' =>  $row['igst_per'],

                'sgst_per' =>  $row['sgst_per'],

                'cgst_per' =>  $row['cgst_per'],

                'item_total' =>  $row['item_final_amount'],

                'item_attribute_type' =>  $row['attribute_type'],

                'item_attribute_value' =>  $row['attribute_option']

            ]);
            $up  = DB::table('master_product_measurement_prices')->where('product_id',$row['product_id'])->where('unit_of_measurement', $row['measurement'])->decrement('sale_qty',$row['qty']);

            if($data->franchise_id)
            {
                $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->first();

                if($exist_porduct) 
                {
                    $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->increment('current_stock',$row['qty']);
                } 
                else 
                {
                    $lead = DB::table('franchise_purchase_initial_stocks')->insert([

                        'date_created' => date('Y-m-d'),

                        'created_by' => $data->login_id,

                        'franchise_id' => $data->franchise_id,

                        'category' => $row['category'],

                        'brand' => $row['brand_name'],

                        'product' => $row['product_name'],

                        'hsn_code' => $row['hsn_code'],

                        'unit_measurement' => $row['measurement'],

                        'quantity' => $row['qty'],

                        'current_stock' => $row['qty'],

                    ]);
                }
                    
            }

                if($data->order_id)
                { 
                    if($row['id'] != '0') 
                    {
                        $orderDeliveryData = DB::table('sales_order_item')
                        ->where('sales_order_item.id',  $row['id'])
                        ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')
                        ->first();
                        $updatedDeliveryQty = $orderDeliveryData->delivered_qty + $row['qty'];
                        $result =  DB::table('sales_order_item')->where('id', $row['id'])->update(['delivered_qty' => $updatedDeliveryQty]);
                    }
            
                }
        }

        if($data->receivedAmount && $data->mode && $data->mode !='None' ) 
        {
            $payment = DB::table('sales_invoice_payment')->insert([

                'date_created' =>$date_created,

                'created_by' => $data->login_id,

                'customer_id' =>  isset($data->customer_id) ? $data->customer_id : '',

                'franchise_id' =>  $data->franchise_id,

                'invoice_id' =>  $salesInvoiceId,

                'amount' =>  $data->receivedAmount,

                'mode' =>  $data->mode,

            ]);
        }



        if($data->order_id)
        {
            $orderItemData = DB::table('sales_order_item')

                ->where('sales_order_item.sales_order_id', $data->order_id)

                ->where('sales_order_item.del', '0')

                ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')

                ->get();

            $isDeliveryLeft = false;

            foreach ($orderItemData as $key => $row) 
            {
                if($row->delivered_qty < $row->item_qty) 
                {
                    $isDeliveryLeft = true;
                }
            }

            if($isDeliveryLeft === false) 
            {
                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Approved']);
            } 
            else
            {
                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Pending']);
            }
        }



        if( isset($data->franchise_id) && $data->franchise_id )
        {
            $company_name = DB::table('franchises')->where('id', $data->franchise_id)->select('company_name')->first()->company_name;
            if(isset($data->order_id) && $data->order_id )
            {
                $msg =  $this->get_name($data->login_id).' generate invoice '.$invoice_id.' referred to order #'.$data->order_id.' for '.$company_name.' (franchises)';
            }
            else
            {
                $msg =  'Invoice '.$invoice_id.' created for '.$company_name.' franchises by '.$this->get_name($data->login_id);
            }
            $q = DB::table('users')->where('franchise_id',$data->franchise_id)->select('id')->first()->id;

            $id =  $this->notification(['created_by'   =>  $data->login_id, 'table' =>  'sales invoice', 'table_id' =>  $salesInvoiceId,
                'user_name' => $company_name  , 'title'   => 'Franchise sales invoice', 'msg'   => $msg ]);

            $this->setNotificationReceived( $id , $q,  $data->login_id);
        }



        if( isset($data->customer_id)  && $data->customer_id )
        {
            $company_name = DB::table('direct_customer')->where('id', $data->customer_id)->select('company_name')->first()->company_name;
            $msg =  'Invoice '.$invoice_id.' created for '.$company_name.' direct customer by '.$this->get_name($data->login_id);

            $id =  $this->notification(['created_by'   =>  $data->login_id, 'table' =>  'sales invoice', 'table_id' =>  $salesInvoiceId,
                    'user_name' => $company_name  , 'title'   => 'Direct Customer sales invoice', 'msg'   => $msg ]);
        }

        $so = DB::table('users')->where('access_level', '1')->select('id')->get();

        foreach ($so as $key => $value) {
        
        $this->setNotificationReceived( $id , $value->id,  $data->login_id);

        }

        return $this->respond([
            'data' => compact('salesInvoiceId'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Sales Invoice Inserted Successfully.'
        ]);

    }


    public function franchiseLoginCreate($data )
    {

        $f = DB::table('franchises')->where('id', $data->franchise_id )->update(['type'=>2]);
      
        $d = DB::table('franchises')->where('id', $data->franchise_id )->first();
      
        $u =  'Detailing'.rand(0000,9999);
      
        if($d->email_id)
        {
         $emil = $d->email_id;
        }else{
        $emil = $u;
        }
      
        $p =  'devil'.$data->franchise_id ;
      
        DB::table('users')->insert( [ 
      
          'created_at' => date('Y-m-d'),
          'created_by' => '1',
          'username' => $u,
          'email' => $emil,
          'password' => Hash::make($p),
          'visible_password' => $p,
          'first_name' =>$d->name,
          'phone' => $d->contact_no,
          'address' =>$d->address,
          'location_id' => $d->location_id,
          'franchise_id' => $d->id,
          'is_active' => 1,
          'access_level' => 5
        ]);

        $insertedUserId = DB::getPdo()->lastInsertId();        
    
        $company_name = DB::table('franchises')->where('id', $data->franchise_id)->select('company_name')->first()->company_name;
        
        $msg =  $company_name.' has converted to franshise by '.$this->get_name($data->login_id);
        
        $q = DB::table('users')->where('franchise_id',$data->franchise_id)->select('id')->first()->id;

        $id =  $this->notification(['created_by'   =>  $data->login_id, 'table' =>  'franchises', 'table_id' =>  $data->franchise_id,
            'user_name' => $company_name  , 'title'   => 'New converted Franchise', 'msg'   => $msg ]);
            
        $assigned_agent = DB::table('consumer_assign_sales_agent')->where('franchise_id',$data->franchise_id)->get();
        
        $tmp_arr = [];
        foreach($assigned_agent as $val)
        {
            $assigned_admin = DB::table('users')->where('id',$val->sales_agent_id)->select('access_level')->first()->access_level;
            if($assigned_admin == 1)
            {
                $tmp_arr[] = $val->sales_agent_id;
            }
            $this->setNotificationReceived( $id , $val->sales_agent_id,  $data->login_id);
        }

        
        $sys_admin = DB::table('users')->where('access_level','1')->select('id')->get();
        $i=0;
        foreach($sys_admin as $key)
        {
            if(!in_array($key->id,$tmp_arr))
            {
                $this->setNotificationReceived( $id , $key->id,  $data->login_id);
            }
        }
        
        $welcome_msg = 'Welcome to Detailing. We are very excited to have you as a part of our team.';

        $id =  $this->notification(['created_by'   =>  $data->login_id, 'table' =>  'users', 'table_id' =>  $insertedUserId,
        'user_name' => $company_name  , 'title'   => 'Welcome', 'msg'   => $welcome_msg ]);

        $this->setNotificationReceived( $id , $insertedUserId,  $data->login_id);
    }


    
    public function convert_to_franchise(Request $request)
    {
        $data = (object)$request['data'];
    
        $this->franchiseLoginCreate($data);

        $this->saveInvoice($request);
    }
      

    
    public function UpdateInvoice(Request $request) 
    {
        $data = (object)$request['data'];
        
        // print_r($request->all());
        // exit;
        if(!$data->organization_id)
        return $this->respond('Organization ID Missing!');
        
        $old_date = DB::table('sales_invoice')->where('id',$data->id )->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'))->first();
        
        
        if( isset($data->date_created) && $data->date_created ){
            $date_created = $data->date_created;
        }else{
            $date_created =  $old_date->date_created;
            
        }
        
        $exist_org = DB::table('sales_invoice')
        ->where('id',$data->id )
        ->where('organization_id',$data->organization_id )
        ->first();
        
        if( !$exist_org )
        { 
            $organization = DB::table('organization')->where('id',  $data->organization_id )->first();

            $old_sales = DB::table('sales_invoice')->where('id', $data->id)->first();

            $tags = explode('/',$old_sales->invoice_id);

            $new_prefix = $organization->invoice_prefix . $tags[ sizeof($tags) - 2 ];

            $new_sales_order = DB::table('sales_invoice')->where('invoice_id','LIKE','%'.$new_prefix.'%')->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'),'invoice_series')->orderBy('invoice_series','DESC')->first();
            
            if($new_sales_order )
            {
                if($new_sales_order->date_created <=  $date_created)
                {
                    $invoice_series = $new_sales_order->invoice_series + 1;
                    $invoice_id = $new_prefix.'/'.$invoice_series;
                }
                else
                {
                    return $this->respond('Invoice Date grater than already created invoice("'.$new_sales_order->date_created .'")');
                }
            }else{
                
                $invoice_id =   $new_prefix .'/1';
                $invoice_series = 1;
            }
            DB::table('sales_invoice')->where('id', $data->id )->update([

                'invoice_prefix' => $organization->invoice_prefix,

                'invoice_id' => $invoice_id,

                'invoice_series' => $invoice_series,
            ]);
        }
        else
        {
            $date_below = DB::table('sales_invoice')->where('organization_id',$data->organization_id)->where('invoice_series','=', $data->invoice_series-1)->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'))->first();

            $date_above = DB::table('sales_invoice')->where('organization_id',$data->organization_id)->where('invoice_series','=', $data->invoice_series+1)->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'))->first();

            if(isset($date_above->date_created) && isset($date_below->date_created ))
            {
                if(($date_above->date_created < $data->date_created) || ($date_below->date_created > $data->date_created))
                {
                    return $this->respond('GREATER DATE '); 
                }
            }
            else if(isset($date_above->date_created) && (date('Y-m-d',strtotime($date_above->date_created)) < $data->date_created))
            {
                return $this->respond('GREATER DATE FROM '.$date_above->date_created ); 
            }
            else if(isset($date_below->date_created) && ($date_below->date_created > $data->date_created))
            {
                return $this->respond('GREATER DATE FROM '.$date_below->date_created ); 
            }
        }

        $invoice = DB::table('sales_invoice')->where('id',$data->id )->update([

            'date_created' => $date_created,

            'updated_date' => date('Y-m-d'),

            'updated_by' => $data->login_id,

            'organization_id' =>  $data->organization_id,

            'sub_total' =>  $data->itemTotal,

            'dis_per' =>  $data->netDiscountPer,

            'dis_amt' =>  $data->netDiscountAmount,

            'gross_total' =>  $data->netGrossAmount,

            'gst_amt' =>  $data->netGstAmount,

            'sgst_amt' =>  $data->sgst_amt,

            'cgst_amt' =>  $data->cgst_amt,

            'igst_amt' =>  $data->igst_amt,

            'igst_per' =>  $data->igst_per,

            'sgst_per' =>  $data->sgst_per,

            'cgst_per' =>  $data->cgst_per,

            'invoice_total' =>  $data->netAmount,

            'shiping_gst_per' =>  $data->shiping_gst_per,

            'shipping_gst' =>  $data->shippingWithGst,

            'shiping_cgst_per' =>  $data->shiping_cgst_per,

            'shiping_sgst_per' =>  $data->shiping_sgst_per,

            'shiping_igst_per' =>  $data->shiping_igst_per,

            'shipping_charges' =>  $data->shipping_charges,

            'due_terms' =>  $data->due_terms,

            'payment_status' =>  $data->paymentStatus,

            'balance' =>  $data->balance
        ]);

        $itm = (array)$data->itemList;

        foreach ($itm as $key => $row) 
        {
            $row = (array)$row;

            $invitem  = DB::table('sales_invoice_item')->where('id',$row['id'])->first();

            if( isset($invitem) && $invitem &&  $invitem->item_qty  <  $row['qty']){

                $qt =  $row['qty'] - $invitem->item_qty  ;
                DB::table('master_product_measurement_prices')->where('id',$invitem->uom_id )->decrement('sale_qty', $qt);

                DB::table('franchise_purchase_initial_stocks')
                ->where('franchise_id', $data->franchise_id )
                ->where('category',$row['category'] )
                ->where('brand',$row['brand_name'] )
                ->where('product',$row['item_name'] )
                ->where('unit_measurement',$row['measurement'] )
                ->increment('current_stock', $qt);
            }

            if( isset($invitem) && $invitem && $invitem->item_qty  >  $row['qty']){
                $qt =  $invitem->item_qty  -  $row['qty'];
                    DB::table('master_product_measurement_prices')->where('id',$invitem->uom_id )->increment('sale_qty', $qt);
                
                    DB::table('franchise_purchase_initial_stocks')
                ->where('franchise_id', $data->franchise_id )
                ->where('category',$row['category'] )
                ->where('brand',$row['brand_name'] )
                ->where('product',$row['item_name'] )
                ->where('unit_measurement',$row['measurement'] )
                ->decrement('current_stock', $qt);
            }

            if($row['id'])
            {
                $invoiceItem = DB::table('sales_invoice_item')->where('id',$row['id'])->update([

                    'updated_date' => date('Y-m-d'),

                    'date_created' => $date_created,

                    'updated_by' => $data->login_id,
                    
                    'item_amount' =>  $row['amount'],

                    'item_qty' =>  $row['qty'],

                    'discount' =>  $row['discount'],

                    'discount_amount' =>  $row['discounted_amount'],

                    'gross_amount' =>  $row['gross_amount'],

                    'gst' =>  $row['gst'],

                    'gst_amount' =>  $row['gst_amount'],

                    'sgst_amt' =>  $row['sgst_amt'],

                    'cgst_amt' =>  $row['cgst_amt'],

                    'igst_amt' =>  $row['igst_amt'],

                    'igst_per' =>  $row['igst_per'],

                    'sgst_per' =>  $row['sgst_per'],

                    'cgst_per' =>  $row['cgst_per'],

                    'item_total' =>  $row['item_final_amount']

                ]);


            }

            if(  $row['id'] == 0 || $row['id'] == '0' )
            {
                $invoiceItem = DB::table('sales_invoice_item')->insert([
                    'sales_invoice_id' => $data->id,
                    'date_created' => $date_created,
                    'item_id' => $row['product_id'],
                    'uom_id' =>  $row['uom_id'],
                    'category' => $row['category'],
                    'brand_name' => $row['brand_name'],
                    'item_name' =>  $row['product_name'],
                    'item_measurement_type' =>  $row['measurement'],
                    'description' =>  $row['description'],
                    'hsn_code' =>  $row['hsn_code'],
                    'item_qty' =>  $row['qty'],
                    'delivered_qty' =>  $row['qty'],
                    'item_rate' =>  $row['rate'],
                    'item_amount' =>  $row['amount'],
                    'discount' =>  $row['discount'],
                    'discount_amount' =>  $row['discounted_amount'],
                    'gross_amount' =>  $row['gross_amount'],
                    'gst' =>  $row['gst'],
                    'gst_amount' =>  $row['gst_amount'],
                    'sgst_amt' =>  $row['sgst_amt'],
                    'cgst_amt' =>  $row['cgst_amt'],
                    'igst_amt' =>  $row['igst_amt'],
                    'igst_per' =>  $row['igst_per'],
                    'sgst_per' =>  $row['sgst_per'],
                    'cgst_per' =>  $row['cgst_per'],
                    'item_total' =>  $row['item_final_amount'],
                    'item_attribute_type' =>  $row['attribute_type'],
                    'item_attribute_value' =>  $row['attribute_option']
                ]);

                DB::table('master_product_measurement_prices')->where('id', $row['uom_id'] )->decrement('sale_qty', $row['qty'] );

                $exist = DB::table('franchise_purchase_initial_stocks')
                ->where('franchise_id', $data->franchise_id )
                ->where('category',$row['category'] )
                ->where('brand',$row['brand_name'] )
                ->where('product',$row['product_name'] )
                ->where('unit_measurement',$row['measurement'] )
                ->first();

                if(  $exist )
                {
                    DB::table('franchise_purchase_initial_stocks')
                    ->where('franchise_id', $data->franchise_id )
                    ->where('category',$row['category'] )
                    ->where('brand',$row['brand_name'] )
                    ->where('product',$row['product_name'] )
                    ->where('unit_measurement',$row['measurement'] )
                    ->increment('current_stock', $row['qty']);
                }

                if(  !$exist ){
                    $lead = DB::table('franchise_purchase_initial_stocks')->insert([
                        'date_created' => date('Y-m-d'),
                        'created_by' => $data->login_id,
                        'franchise_id' => $data->franchise_id,
                        'category' => $row['category'],
                        'brand' => $row['brand_name'],
                        'product' => $row['product_name'],
                        'hsn_code' => $row['hsn_code'],
                        'unit_measurement' => $row['measurement'],
                        'current_stock' => $row['qty'],
                    ]);
                }
            }
        }
            
        $inv = DB::table('sales_invoice')->where('id', $data->id)->first();

        if( $data->receivedAmount  &&  ( (int)$inv->received < (int)$data->receivedAmount ) && $data->mode && $data->mode != 'None' )
        {
            $payment = DB::table('sales_invoice_payment')->insert([

                'date_created' => date('Y-m-d H:i:s'),

                'created_by' =>   $data->login_id,

                'customer_id' =>  $inv->customer_id,

                'franchise_id' =>  $inv->franchise_id,

                'invoice_id' =>  $data->id,

                'amount' =>  (int)( $data->receivedAmount - $inv->received  ),

                'mode' =>    $data->mode

            ]);

                
            DB::table('sales_invoice')->where('id', $data->id)->update([
                'received' => $data->receivedAmount,
                'balance' => $data->balance
            ]);
        }
        else if( $data->refund  &&  (  (int)$data->refund )  ) 
        {
            DB::table('sales_invoice')->where('id', $data->id)->update([
                'received' => (int)$data->receivedAmount - (int)$data->refund,
                'refund' => $data->refund,
                'balance' => $data->balance
            ]);
        
            DB::table('sales_invoice_payment')->insert([

                'date_created' => date('Y-m-d H:i:s'),

                'created_by' =>   $data->login_id,

                'franchise_id' =>  $inv->franchise_id,

                'invoice_id' =>  $inv->id,

                'amount' =>  (int)( $data->receivedAmount - $inv->received  ),

                'refund_amount' =>  (int)( $data->refund  ),

                'mode' =>    $data->mode

            ]);

        } 
        else if( $data->receivedAmount  &&  ( (int)$inv->received == (int)$data->receivedAmount )  ) 
        {
            DB::table('sales_invoice')->where('id', $data->id)->update([
            'balance' => $data->balance
            ]);
        }

        return $this->respond('Invoice updated Successfully!');
    }


    public function UpdateServiceInvoice(Request $request) 
    {
        $data = (object)$request['data'];
        
        if(!$data->organization_id)
        return $this->respond('Organization ID Missing!');
        
        $old_date = DB::table('franchise_service')->where('id',$data->id )->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'))->first();
        
        
        if( isset($data->date_created) && $data->date_created ){
            $date_created = $data->date_created;
        }else{
            $date_created =  $old_date->date_created;
            
        }
        
        $exist_org = DB::table('franchise_service')
        ->where('id',$data->id )
        ->where('organization_id',$data->organization_id )
        ->first();
        
        if( !$exist_org )
        { 
            $organization = DB::table('organization')->where('id',  $data->organization_id )->first();

            $old_sales = DB::table('franchise_service')->where('id', $data->id)->first();

            $tags = explode('/',$old_sales->invoice_id);

            $new_prefix = $organization->invoice_prefix . $tags[ sizeof($tags) - 2 ];

            $new_sales_order = DB::table('franchise_service')->where('invoice_id','LIKE','%'.$new_prefix.'%')->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'),'invoice_series')->orderBy('invoice_series','DESC')->first();
            
            if($new_sales_order )
            {
                if($new_sales_order->date_created <=  $date_created)
                {
                    $invoice_series = $new_sales_order->invoice_series + 1;
                    $invoice_id = $new_prefix.'/'.$invoice_series;
                }
                else
                {
                    return $this->respond('Invoice Date grater than already created invoice("'.$new_sales_order->date_created .'")');
                }
            }else{
                
                $invoice_id =   $new_prefix .'/1';
                $invoice_series = 1;
            }
            DB::table('franchise_service')->where('id', $data->id )->update([

                'invoice_prefix' => $organization->invoice_prefix,

                'invoice_id' => $invoice_id,

                'invoice_series' => $invoice_series,
            ]);
        }
        else
        {
            $date_below = DB::table('franchise_service')->where('organization_id',$data->organization_id)->where('invoice_series','=', $data->invoice_series-1)->select(DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created'))->first();

            $date_above = DB::table('franchise_service')->where('organization_id',$data->organization_id)->where('invoice_series','=', $data->invoice_series+1)->select( DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as date_created') )->first();

            if(isset($date_below->date_created))
            {
                $date_below = date('Y-m-d',strtotime($date_below->date_created));
            }

            if(isset($date_above->date_created))
            {
                $date_above = date('Y-m-d',strtotime($date_above->date_created));
            }

            if(isset($date_above->date_created) && isset($date_below->date_created ))
            {
                if(($date_above->date_created < $data->date_created) || ($date_below->date_created > $data->date_created))
                {
                    return $this->respond('GREATER DATE'); 
                }
            }
            else if(isset($date_above->date_created) && (date('Y-m-d',strtotime($date_above->date_created)) < $data->date_created))
            {
                return $this->respond('GREATER DATE'); 
            }
            else if(isset($date_below->date_created) && ($date_below->date_created > $data->date_created))
            {
                return $this->respond('GREATER DATE'); 
            }
        }

        $invoice = DB::table('franchise_service')->where('id',$data->id )->update([

            'date_created' => $date_created,

            'updated_date' => date('Y-m-d'),

            'updated_by' => $data->login_id,

            'organization_id' =>  $data->organization_id,

            'sub_total' =>  $data->itemTotal,

            'dis_per' =>  $data->netDiscountPer,

            'dis_amt' =>  $data->netDiscountAmount,

            'gross_total' =>  $data->netGrossAmount,

            'gst_amt' =>  $data->netGstAmount,

            'sgst_amt' =>  $data->sgst_amt,

            'cgst_amt' =>  $data->cgst_amt,

            'igst_amt' =>  $data->igst_amt,

            'igst_per' =>  $data->igst_per,

            'sgst_per' =>  $data->sgst_per,

            'cgst_per' =>  $data->cgst_per,

            'invoice_total' =>  $data->netAmount,

            'due_terms' =>  $data->due_terms,

            'payment_status' =>  $data->paymentStatus,

            'balance' =>  $data->balance
        ]);

        $itm = (array)$data->itemList;

        foreach ($itm as $key => $row) {
            $row = (array)$row;

            if($row['id'])
            {
                $invoiceItem = DB::table('franchise_service_item')->where('id',$row['id'])->update([

                    'date_created' => $date_created,

                    'item_amount' =>  $row['amount'],

                    'item_qty' =>  $row['qty'],

                    'discount' =>  $row['discount'],

                    'discount_amount' =>  $row['discounted_amount'],

                    'gross_amount' =>  $row['gross_amount'],

                    'gst' =>  $row['gst'],

                    'gst_amount' =>  $row['gst_amount'],

                    'sgst_amt' =>  $row['sgst_amt'],

                    'cgst_amt' =>  $row['cgst_amt'],

                    'igst_amt' =>  $row['igst_amt'],

                    'igst_per' =>  $row['igst_per'],

                    'sgst_per' =>  $row['sgst_per'],

                    'cgst_per' =>  $row['cgst_per'],

                    'item_total' =>  $row['item_final_amount']

                ]);
            }

            if(  $row['id'] == 0 || $row['id'] == '0' )
            {
                $start_date =   date('Y-m-d');

                if( isset($row['start_date']) && $row['start_date'] ){
                    $start_date = $row['start_date'];
                }

                $end_date = date('Y-m-d', strtotime("+".$row['duration'], strtotime( $start_date )-86400));

                $invoiceItem = DB::table('franchise_service_item')->insert([

                    'franchise_service_id' => $data->id,

                    'date_created' => $date_created,

                    'item_id' => $row['service_id'],

                    'uom_id' =>  $row['duration_id'],

                    'category' => $row['category'],

                    'service_name' => $row['service_name'],

                    'duration' =>  $row['duration'],

                    'start_date' =>  $start_date,

                    'end_date' =>   $end_date,
                    
                    'status' =>   'Active',

                    'description' =>  $row['description'],

                    'sac' =>  $row['sac'],

                    'item_amount' =>  $row['amount'],

                    'discount' =>  $row['discount'],

                    'discount_amount' =>  $row['discounted_amount'],

                    'gross_amount' =>  $row['gross_amount'],

                    'gst' =>  $row['gst'],

                    'gst_amount' =>  $row['gst_amount'],

                    'sgst_amt' =>  $row['sgst_amt'],

                    'cgst_amt' =>  $row['cgst_amt'],

                    'igst_amt' =>  $row['igst_amt'],

                    'igst_per' =>  $row['igst_per'],

                    'sgst_per' =>  $row['sgst_per'],

                    'cgst_per' =>  $row['cgst_per'],

                    'item_total' =>  $row['item_final_amount']

                ]);
            }
        }
            
        $inv = DB::table('franchise_service')->where('id', $data->id)->first();

        // lo
        if( $data->receivedAmount  &&  ( (int)$inv->received < (int)$data->receivedAmount ) && $data->mode && $data->mode != 'None' )
        {
            $payment = DB::table('franchise_service_payment')->insert([

                'date_created' => date('Y-m-d H:i:s'),

                'created_by' =>   $data->login_id,

                'franchise_id' =>  $inv->franchise_id,

                'invoice_id' =>  $data->id,

                'amount' =>  (int)( $data->receivedAmount - $inv->received  ),

                'mode' =>    $data->mode

            ]);

                
            DB::table('franchise_service')->where('id', $data->id)->update([
                'received' => $data->receivedAmount,
                'balance' => $data->balance
            ]);
        }   

        else if( $data->receivedAmount  &&  ( (int)$inv->received == (int)$data->receivedAmount )  ) 
        {
            DB::table('franchise_service')->where('id', $data->id)->update([
            'balance' => $data->balance
            ]);
        }

        return $this->respond('Service updated Successfully!');
    }

    public function getInvoiceId(Request $data) 
    {

        $data = (object)$data;

        $organization = DB::table('organization')->orderBy('id','DESC')->get();        
        return $this->respond([
            'data' => compact('organization'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Sales Invoice Inserted Successfully.'
        ]);
       
    }







    public function reject_order(Request $data) {





        $invoice = DB::table('sales_order')->where('id', $data['id'])->update([

                'order_status' =>  'Reject'

        ]);



        



    }



    public function accessory_outgoing(Request $request){




        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        $items = DB::table('sales_invoice_item')

        // ->where('sales_invoice_item.del', '0')

        ->join('sales_invoice','sales_invoice.id','=','sales_invoice_item.sales_invoice_id')

        ->join('users','sales_invoice.created_by','=','users.id')

        // ->where('sales_invoice_item.item_id',3)

        ->where('sales_invoice_item.uom_id',$request['unit_id'])

        // ->where('sales_invoice_item.category',$request['category'])

        ->select('sales_invoice_item.*','sales_invoice.date_created','sales_invoice.invoice_id','users.first_name')

        ->groupBy('sales_invoice_item.id')

        ->get();



        return $this->respond([



            'data' => compact('items','prod','unit'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Sales Invoice Inserted Successfully.'



        ]);



    }


    


    public function transfer_outgoing(Request $request){




        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        $items = DB::table('franchise_transfer_stock_item')

        ->join('franchise_transfer_stock','franchise_transfer_stock.id','=','franchise_transfer_stock_item.franchise_transfer_stock_id')

        ->join('users','franchise_transfer_stock.created_by','=','users.id')

        ->join('franchises','franchises.id','=','franchise_transfer_stock.franchise_id')

        ->join('locations','locations.id','=','franchises.location_id')

        ->where('franchise_transfer_stock_item.uom_id',$request['unit_id'])

        ->select('franchise_transfer_stock_item.*','franchise_transfer_stock.date_created','franchise_transfer_stock.invoice_id','franchise_transfer_stock.id as transfer_id','users.first_name','franchises.company_name','locations.location_name')

        ->groupBy('franchise_transfer_stock_item.id')

        ->get();



        return $this->respond([



            'data' => compact('items','prod','unit'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Sales Invoice Inserted Successfully.'



        ]);



    }





   public function payment_receiving(Request $request)
   {
        //    print_r($request->all());
        $d = (object)$request['data'];
        
        $c = '';
        if( isset($d->customer_id))
        $c = $d->customer_id;

        $payment_date = '';

        if(isset($d->payment_date) && $d->payment_date )
        {
            $payment_date = $d->payment_date;
        }
        else
        {
            $payment_date = date('Y-m-d H:i:s');
        }

        if($d->receive_payment && $d->payment_mode && $d->payment_mode !='None' ) 
        {
            $payment = DB::table('sales_invoice_payment')->insert([

                'date_created' => $payment_date,

                'created_by' => $d->user_id,

                'franchise_id' =>  $d->franchise_id,

                'customer_id' =>  $c,

                'invoice_id' =>  $d->invoice_id,

                'amount' =>  $d->receive_payment,

                'mode' =>  $d->payment_mode,

                'note' =>  $d->note,

            ]);


            if($d->balance_amount > 0){

                $payment_status = 'Pending';

            }else if($d->balance_amount == ''){

                $payment_status = 'Paid';
                $d->due_terms = '';
            }

            $invoice = DB::table('sales_invoice')

            ->where('id', $d->invoice_id)

            ->update([

                'payment_status' =>  $payment_status,

                'balance' =>  $d->balance_amount,

                'due_terms' =>  $d->due_terms,

            ]);

            $invoice = DB::table('sales_invoice')

            ->where('id', $d->invoice_id)

            ->increment('received', $d->receive_payment);
        }
    }



    public function service_payment_receiving(Request $request)
    {
        $d = (object)$request['data'];

        $c = '';
        if( isset($d->customer_id))
        $c = $d->customer_id;

        $payment_date = '';

        if(isset($d->payment_date) && $d->payment_date )
        {
            $payment_date = $d->payment_date;
        }
        else
        {
            $payment_date = date('Y-m-d H:i:s');
        }

        if($d->receive_payment && $d->payment_mode && $d->payment_mode !='None' ) 
        {
            $payment = DB::table('franchise_service_payment')->insert([

                'date_created' => $payment_date,

                'created_by' => $d->user_id,

                'franchise_id' =>  $d->franchise_id,

                'customer_id' =>  $c,

                'invoice_id' =>  $d->invoice_id,

                'amount' =>  $d->receive_payment,

                'mode' =>  $d->payment_mode,

                'note' =>  $d->note,

            ]);


            if($d->balance_amount > 0){

                $payment_status = 'Pending';

            }else if($d->balance_amount == ''){

                $payment_status = 'Paid';
                $d->due_terms = '';
            }

            $invoice = DB::table('franchise_service')

            ->where('id', $d->invoice_id)

            ->update([

                'payment_status' =>  $payment_status,

                'balance' =>  $d->balance_amount,

                'due_terms' =>  $d->due_terms,

            ]);

            $invoice = DB::table('franchise_service')

            ->where('id', $d->invoice_id)

            ->increment('received', $d->receive_payment);
        }
    }




    public function  getPendingPayment(Request $request)
    {
        $d = (object)$request['data'];
        $payment = DB::table('sales_invoice')->where('id', $d->invoice_id)->first();

        return $this->respond([
            'data' => compact('payment'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Sales Invoice Inserted Successfully.'
        ]);
    }



    public function  getServicePendingPayment(Request $request)
    {
        $d = (object)$request['data'];
        $payment = DB::table('franchise_service')->where('id', $d->invoice_id)->first();

        return $this->respond([
            'data' => compact('payment'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Sales Invoice Inserted Successfully.'
        ]);
    }





    public function direct_customer(Request $request)
    {
   
    // $data = (object)$request->input();
    $data = (object)$request['lead'];


    $exist = DB::table('direct_customer')->where('contact_no' ,'=',$data->contact_no )->where('del' ,'=','0')->first();

    if(!$exist){

            $lead = DB::table('direct_customer')->insert([

            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $data->created_by,
            'address' => $data->address,
            'country' => $data->country_id,
            'state' => $data->state,
            'district' => $data->district,
            'city' => $data->city,
            'pincode' => $data->pincode,

            'name' => $data->name,
            'contact_no' => $data->contact_no,
            'email_id' => $data->email_id,

            'company_name' => $data->company_name,
            'company_contact_no' => $data->company_contact_no,
            'company_email_id' => $data->company_email_id,
            'company_gstin' => $data->company_gstin,


            'ship_address' => $data->ship_address,
            'ship_country_id' => $data->ship_country_id,
            'ship_state' => $data->ship_state,
            'ship_district' => $data->ship_district,
            'ship_city' => $data->ship_city,
            'ship_pincode' => $data->ship_pincode,


            ]);

            $msg = 'Success';

    }else{
            $msg = 'Exist';
   

    }

    return $this->respond([



        'data' => compact('msg'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead'



    ]);




   

    }



    public function stock_manually_incoming(Request $request)
{
   
    $data = (object)$request->input();
    // $data = (object)$request['lead']];




            $lead = DB::table('stock_manually_incoming')->insert([

            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $data->created_by,
            'stock_type' => $data->stock_type,
            'category' => $data->category,
            'brand' => $data->brand,
            'product' => $data->product,
            'uom' => $data->uom,
            'qty' => $data->qty,
            'product_id' => $data->product_id,
            'uom_id' => $data->uom_id,

            ]);

            $msg = $lead ? 'stock manually incoming saved Successfully!' : '';


    return $this->respond([



        'data' => compact('msg'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead'



    ]);




   

}


public function getDirectCustomers(Request $request)

    {
        
 $result = DB::table('direct_customer')

        ->where('del' ,'0')
        ->orderBy('company_name' ,'ASC')
        
        ->get();

         return $this->respond([

            'data' => compact('result'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'master_measurement_types List Fetched Successfully.'

    ]);

}




    public function stockTxransfer(Request $request)
    {
        $data = (object)$request['stock'];
        
        // print_r($request->all());
        // exit;

        $date_created = date('Y-m-d H:i:s');
        if( isset($data->date_created) && $data->date_created ){
            $date_created = $data->date_created;
        }

        $invoice = DB::table('franchise_transfer_stock')->insert([

            'date_created' =>  $date_created,

            'created_by' => $data->login_id,

            'franchise_id' =>  $data->franchise_id,

            'order_id' =>  $data->order_id,

            'organization_id' =>  $data->organization_id,
        ]);

        $salesInvoiceId = DB::getPdo()->lastInsertId();

        foreach ($data->itemList as $key => $row) 
        {

            $invoiceItem = DB::table('franchise_transfer_stock_item')->insert([

                'franchise_transfer_stock_id' => $salesInvoiceId,

                'date_created' =>  $date_created,

                'item_id' => $row['product_id'],

                'uom_id' =>  $row['uom_id'],

                'category' => $row['category'],

                'brand_name' => $row['brand_name'],

                'item_name' =>  $row['product_name'],

                'item_measurement_type' =>  $row['measurement'],

                'description' =>  $row['description'],

                'hsn_code' =>  $row['hsn_code'],

                'item_qty' =>  $row['qty'],

                'delivered_qty' =>  $row['qty'],
            ]);

            $up  = DB::table('master_product_measurement_prices')->where('product_id',$row['product_id'])->where('unit_of_measurement', $row['measurement'])->decrement('sale_qty',$row['transfer_qty']);

            if($row['id'] != '0') 
            {
                $orderDeliveryData = DB::table('sales_order_item')
                ->where('sales_order_item.id', $row['id'])

                ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')

                ->first();

                $updatedDeliveryQty = $orderDeliveryData->delivered_qty + $row['transfer_qty'];

                $result =  DB::table('sales_order_item')->where('id', $row['id'])->update(['delivered_qty' => $updatedDeliveryQty]);
            }
            if($data->franchise_id)
            {
                $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->first();

                if($exist_porduct)
                {
                    $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->increment('current_stock',$row['transfer_qty']);
                } 
                else 
                {
                    $lead = DB::table('franchise_purchase_initial_stocks')->insert([

                        'date_created' =>  $date_created,

                        'created_by' => $data->login_id,

                        'franchise_id' => $data->franchise_id,

                        'category' => $row['category'],

                        'brand' => $row['brand_name'],

                        'product' => $row['product_name'],

                        'hsn_code' =>  $row['hsn_code'],

                        'unit_measurement' => $row['measurement'],

                        'quantity' => $row['transfer_qty'],

                        'current_stock' => $row['transfer_qty'],

                    ]);
                }

            }
        }


        if(isset($data->order_id) && $data->order_id) 
        {
            $orderItemData = DB::table('sales_order_item')

            ->where('sales_order_item.sales_order_id', $data->order_id)

            ->where('sales_order_item.del', '0')

            ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')

            ->get();

            $isDeliveryLeft = false;

            foreach ($orderItemData as $key => $row)
            {
                if($row->delivered_qty < $row->item_qty)
                {
                    $isDeliveryLeft = true;
                }
            }

            if($isDeliveryLeft === false) 
            {
                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Approved']);
            }
            else 
            {
                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Pending']);
            }

        }
    }



    public function transfer_stock_list(Request $request) 
    {
        $per_page = 15;

        $search = $request->s;

        $filter = (Object)$request['filter'];

        $so = DB::table('franchise_transfer_stock');

        $so->leftJoin('users', 'users.id', '=', 'franchise_transfer_stock.created_by');

        $so->leftJoin('franchises', 'franchises.id', '=', 'franchise_transfer_stock.franchise_id');

        if($search) 
        {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('franchise_transfer_stock.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('franchise_transfer_stock.date_created','LIKE','%'.$filter->date.'%');

        $so->select('franchise_transfer_stock.*', 'franchises.name','users.first_name as created_name','franchises.company_name','franchises.contact_no' );

        $so->orderBy('franchise_transfer_stock.id','Desc');

        $salesInvoiceList = $so->paginate($per_page);

        $so = DB::table('franchise_transfer_stock');

        $so->leftJoin('users', 'users.id', '=', 'franchise_transfer_stock.created_by');

        $so->leftJoin('franchises', 'franchises.id', '=', 'franchise_transfer_stock.franchise_id');


        if($search) {
            $so ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%')
                ->orWhere('franchise_transfer_stock.invoice_id','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('franchise_transfer_stock.date_created','LIKE','%'.$filter->date.'%');

        $sum = $so->sum('franchise_transfer_stock.received');

        $totalstock=DB::table('franchise_transfer_stock')

        ->leftJoin('franchises', 'franchises.id', '=', 'franchise_transfer_stock.franchise_id')

        ->count();

        foreach ($salesInvoiceList as $key => $row)
        {
            $itemList =  DB::table('franchise_transfer_stock_item')->where('franchise_transfer_stock_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();
            $salesInvoiceList[$key]->totalItem = $itemList->totalItem;
        }

        return $this->respond([
            'data' => compact('salesInvoiceList','sum','totalstock'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Fetch Sales Invoice List Successfully'
        ]);

    }









public function getStockTransferDetail($sales_invoice_id)

{



    $invoicedetail = DB::table('franchise_transfer_stock')

        ->leftJoin('franchises', 'franchises.id', '=', 'franchise_transfer_stock.franchise_id')

        ->leftJoin('countries', 'franchises.country_id', '=', 'countries.id')

        ->leftJoin('users', 'users.id', '=', 'franchise_transfer_stock.created_by')

        ->leftJoin('organization', 'organization.id', '=', 'franchise_transfer_stock.organization_id')

        ->where('franchise_transfer_stock.id',$sales_invoice_id)

        ->select('franchise_transfer_stock.*'
        ,'franchise_transfer_stock.date_created as created_at','countries.name','franchises.company_name',
        'franchises.contact_no','franchises.name','franchises.email_id','franchises.address','franchises.state','franchises.city','franchises.pincode','franchises.ship_state','franchises.ship_district','franchises.ship_city','franchises.ship_address','organization.company_name as admin_company_name','organization.org_logo','organization.state as admin_state','organization.address as admin_address','organization.city as admin_city','users.first_name as created_name','organization.district as admin_district','organization.pincode as admin_pincode','organization.company_gstin','organization.company_pan_no as admin_company_pan_no','organization.aadhaar_no as admin_aadhaar_no','organization.bank_name as admin_bank_name','organization.account_no as admin_account_no','organization.account_type as admin_account_type','organization.ifsc_code as admin_ifsc_code','organization.branch_name as admin_branch_name','organization.bank_address as admin_bank_address','organization.company_pan_no as admin_company_pan_no','organization.company_name_in_bank as admin_company_name_in_bank')

        ->first();



    $dateCreated = date_create($invoicedetail->created_at);

    $invoicedetail->created_at = date_format($dateCreated, 'd-M-Y');



    $itemdetail = DB::table('franchise_transfer_stock_item')

        ->where('franchise_transfer_stock_item.franchise_transfer_stock_id',$sales_invoice_id)

        ->get();




    return $this->respond([



        'data' => compact('invoicedetail','itemdetail'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Invoice Detail Fetched Successfully.'



        ]);

}







    public function getInvoiceEdit(Request $request )
    {
        $sales_invoice_id = $request['id'];
        $invoicedetail = DB::table('sales_invoice')
        ->leftJoin('franchises', 'franchises.id','=','sales_invoice.franchise_id')
        ->leftJoin('direct_customer', 'direct_customer.id','=','sales_invoice.customer_id')
        ->where('sales_invoice.del', '0')
        ->where('sales_invoice.id',$sales_invoice_id)
        ->select('sales_invoice.*',
        'sales_invoice.dis_per as netDiscountPer',
        'sales_invoice.dis_amt as netDiscountAmount',
        'sales_invoice.del as extra_discount',
        'sales_invoice.received as receivedAmount',
        DB::raw('CASE WHEN sales_invoice.franchise_id  THEN franchises.state ELSE direct_customer.state END as state'),
        'franchises.id as franchise_id'
        )->first();

        $itemdetail = DB::table('sales_invoice_item')
        ->where('sales_invoice_item.del', '0')
        ->where('sales_invoice_item.sales_invoice_id',$sales_invoice_id)
        ->select('sales_invoice_item.*','sales_invoice_item.item_rate as rate',
        'sales_invoice_item.item_amount as amount',
        'sales_invoice_item.item_qty as qty',
        'sales_invoice_item.discount_amount as discounted_amount',
        'sales_invoice_item.item_measurement_type as measurement'
        )
        ->get();
       
        return $this->respond([
        'data' => compact('invoicedetail','itemdetail'),
        'status' => 'success',
        'status_code' => $this->getStatusCode(),
        'message' => 'Invoice Detail Fetched Successfully.'
        ]);
    }


    public function getServiceEdit(Request $request )
    {
        $franchise_service = $request['id'];
        $invoicedetail = DB::table('franchise_service')
        ->leftJoin('franchises', 'franchises.id','=','franchise_service.franchise_id')
        // ->leftJoin('direct_customer', 'direct_customer.id','=','franchise_service.customer_id')
        ->where('franchise_service.del', '0')
        ->where('franchise_service.id',$franchise_service)
        ->select('franchise_service.*',
        'franchise_service.dis_per as netDiscountPer',
        'franchise_service.dis_amt as netDiscountAmount',
        'franchise_service.del as extra_discount',
        'franchise_service.received as receivedAmount',
        'franchises.state as state',
        'franchises.id as franchise_id'
        )->first();

        $itemdetail = DB::table('franchise_service_item')
        ->where('franchise_service_item.del', '0')
        ->where('franchise_service_item.franchise_service_id',$franchise_service)
        ->select('franchise_service_item.*','franchise_service_item.item_rate as rate',
        'franchise_service_item.item_amount as amount',
        'franchise_service_item.item_qty as qty',
        'franchise_service_item.discount_amount as discounted_amount'
        // 'franchise_service_item.item_measurement_type as measurement'
        )
        ->get();
       
        return $this->respond([
        'data' => compact('invoicedetail','itemdetail'),
        'status' => 'success',
        'status_code' => $this->getStatusCode(),
        'message' => 'Invoice Detail Fetched Successfully.'
        ]);
    }

    public function notification($data)
    {
        
              DB::table('notification')->insert([           

            'date_created' => date("Y-m-d H:i:s"),

            'created_by'=> $data['created_by'],

            'table' => $data['table'],

            'table_id'=> $data['table_id'],

            'user_name'=> $data['user_name'],

            'title' => $data['title'],

            'message' => $data['msg']
        ]);

      return DB::getPdo()->lastInsertId();

    } 

    public function setNotificationReceived($n,$id,$c)
    {
        
              DB::table('notification_receivers')->insert([           

            'date_created' => date("Y-m-d"),

            'created_by'  => $c,

            'notification_id' => $n,

            'user_id'=> $id
        ]);
    }

    public function get_name($id)
    {
            return  DB::table('users')->where('id', $id)->select('first_name')->first()->first_name;
    }




    public function invoice_cancel(Request $request){
        
        
        $invitem  = DB::table('sales_invoice_item')->where('sales_invoice_id', $request['invoice_id'])->get();

        foreach ($invitem as $key => $row) {
            $row = (Array)$row;

                 DB::table('master_product_measurement_prices')->where('id',$row['uom_id'] )->increment('sale_qty', $row['item_qty'] );
                
                 DB::table('franchise_purchase_initial_stocks')
                ->where('franchise_id',  $request['franchise_id'] )
                ->where('category',$row['category'] )
                ->where('brand',$row['brand_name'] )
                ->where('product',$row['item_name'] )
                ->where('unit_measurement',$row['item_measurement_type'] )
                ->decrement('current_stock', $row['item_qty'] );


        }


        DB::table('sales_invoice')->where('id', $request['invoice_id'] )->update( ['del' => '2'] );

        




    }


    public function service_invoice_cancel(Request $request){
        
        DB::table('franchise_service')->where('id',$request['id'])->update( ['del' => '2'] );
        DB::table('franchise_service_item')->where('franchise_service_id', $request['id'] )->update( ['status' => 'Cancel'] );

    }


    public function deleteSalesInvoiceItem(Request $request)
    {
        $item = (array)$request['item'];
        $row =  DB::table('sales_invoice_item')->where('id', $item['id'] )->first();
        $row = (array)$row;
        
        DB::table('master_product_measurement_prices')->where('id',$row['uom_id'] )->increment('sale_qty', $row['item_qty'] );
                    
        DB::table('franchise_purchase_initial_stocks')
        ->where('franchise_id',  $request['franchise_id'] )
        ->where('category',$row['category'] )
        ->where('brand',$row['brand_name'] )
        ->where('product',$row['item_name'] )
        ->where('unit_measurement',$row['item_measurement_type'] )
        ->decrement('current_stock', $row['item_qty'] );

        DB::table('sales_invoice_item')->where('id', $item['id'] )->delete();
    }

    public function deleteServiceInvoiceItem(Request $request)
    {
        $item = (array)$request['item'];

        DB::table('franchise_service_item')->where('id', $item['id'] )->where('franchise_service_id', $item['franchise_service_id'] )->delete();

    }
}

