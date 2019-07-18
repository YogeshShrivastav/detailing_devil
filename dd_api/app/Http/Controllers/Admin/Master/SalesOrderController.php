<?php



namespace App\Http\Controllers\Admin;



// use Acme\Repositories\Franchises\FranchisesRepo;



use App\Http\Controllers\ApiController;



use Illuminate\Http\Request;



use DB;





class SalesOrderController extends ApiController

{



     public function salesOrderList(Request $request) {

        $per_page = 15;

        $search = $request->s;

        $status = $request->st;

        $so = DB::table('sales_order');

        $so->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id');

        $so->where('del' ,'0');

        if($status!='All') {

            if($status == 'Date'){ $so->where('sales_order.date_created','LIKE',date("Y-m-d").'%'); }

            else{

            $so->where('sales_order.order_status' ,$status);

           }

        }

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $so->select('sales_order.*', 'franchises.name', 'franchises.company_name');

        $so->orderBy('sales_order.id','Desc');

        $salesOrderList = $so->paginate($per_page);











        // if($search){

        //     $salesOrderList = DB::table('sales_order')

        //     ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

        //     ->where('del' ,'0')->where('franchises.name', 'LIKE', '%'.$search.'%')

        //     ->select('sales_order.*', 'franchises.name')

        //     ->groupBy('sales_order.id')->orderBy('sales_order.id','DESC')

        //     ->paginate($per_page);

        // }else{

        //     $salesOrderList = DB::table('sales_order')

        //     ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

        //     ->where('del' ,'0')

        //     ->select('sales_order.*', 'franchises.name')

        //     ->groupBy('sales_order.id')->orderBy('sales_order.id','DESC')

        //     ->paginate($per_page);

        // }



        foreach ($salesOrderList as $key => $row) {



             $salesOrderList[$key]->created_by_type = ucwords($row->created_by_type);



             $itemList =  DB::table('sales_order_item')->where('sales_order_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();



             $salesOrderList[$key]->totalItem = $itemList->totalItem;

        }

         $totalorder=DB::table('sales_order')

         ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

         ->where('del' ,'0')

         ->count();



         $pendingorder=DB::table('sales_order')

         ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

         ->where('del' ,'0')->where('sales_order.order_status','Pending')

         ->count();



         $neworder=DB::table('sales_order')

         ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

         ->where('del' ,'0')->where('sales_order.date_created','LIKE',date("Y-m-d").'%')

         ->count();



        return $this->respond([



            'data' => compact('salesOrderList','totalorder','pendingorder','neworder'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Fetch Sales Order List Successfully'



            ]);

    }







    public function salesInvoiceList(Request $request) {



        $per_page = 15;

        $search = $request->s;



        $so = DB::table('sales_invoice');

        $so->join('users', 'users.id', '=', 'sales_invoice.created_by');

        $so->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->where('del' ,'0');

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $so->select('sales_invoice.*', 'franchises.name','franchises.company_name','users.first_name as created_name');

        $so->orderBy('sales_invoice.id','Desc');

        $salesInvoiceList = $so->paginate($per_page);



        $so = DB::table('sales_invoice');

        $so->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->where('del' ,'0');

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $balance = $so->sum('sales_invoice.balance');



        $so = DB::table('sales_invoice');

        $so->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');

        $so->where('del' ,'0');

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $sum = $so->sum('sales_invoice.invoice_total');



        // $salesInvoiceList = DB::table('sales_invoice')

        // ->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id')

        // ->where('del' ,'0')->select('sales_invoice.*', 'franchises.name')

        // ->orderBy('id','Desc')->get();



        foreach ($salesInvoiceList as $key => $row) {



             $salesInvoiceList[$key]->created_by_type = ucwords($row->created_by_type);



             $dateCreated = date_create($row->date_created);

             $salesInvoiceList[$key]->date_created = date_format($dateCreated, 'd-M-Y');



             $salesInvoiceList[$key]->created_by_type = ucwords($row->created_by_type);



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

                    'created_by' => 1,

                    'created_by_type' => 'admin',

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



        $dateCreated = date_create($orderdetail->created_at);

        $orderdetail->created_at = date_format($dateCreated, 'd-M-Y');





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

                    ->join('master_product_measurement_prices','master_product_measurement_prices.id','=','sales_order_item.uom_id')

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

        foreach ($invoice as $key => $row) {



             $orderInvoiceList[$key] = $row;



             $dateCreated = date_create($row->date_created);

             $orderInvoiceList[$key]->date_created = date_format($dateCreated, 'd-M-Y');



             $orderInvoiceList[$key]->created_by_type = ucwords($row->created_by_type);

        }





        return $this->respond([



            'data' => compact('orderdetail','itemdetail','orderInvoiceList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Order Detail Fetched Successfully.'



        ]);

    }







    public function getSalesInvoiceDetail($sales_invoice_id)

    {



        $invoicedetail = DB::table('sales_invoice')

            ->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id')

            ->leftJoin('countries', 'franchises.country_id', '=', 'countries.id')

            ->leftJoin('users', 'users.id', '=', 'sales_invoice.created_by')

            ->leftJoin('organization', 'organization.id', '=', 'sales_invoice.organization_id')

            ->leftJoin('countries as admin_country', 'organization.country_id', '=', 'admin_country.id')

            ->where('sales_invoice.del', '0')

            ->where('sales_invoice.id',$sales_invoice_id)

            ->select('sales_invoice.*', 'franchises.created_at',

            'countries.name as country_name','franchises.company_name','franchises.name','franchises.contact_no','franchises.email_id','franchises.address','franchises.state','franchises.city','franchises.pincode','franchises.ship_state','franchises.ship_district','franchises.ship_city','franchises.ship_address','franchises.ship_pincode','organization.company_name as admin_company_name','organization.state as admin_state',

            

            'organization.address as admin_address','organization.city as admin_city','users.first_name as created_name','organization.district as admin_district','organization.pincode as admin_pincode','admin_country.name as admin_country_name','organization.company_gstin','organization.company_pan_no as admin_company_pan_no','organization.aadhaar_no as admin_aadhaar_no','organization.bank_name as admin_bank_name','organization.account_no as admin_account_no','organization.account_type as admin_account_type','organization.ifsc_code as admin_ifsc_code','organization.branch_name as admin_branch_name','organization.bank_address as admin_bank_address','organization.company_pan_no as admin_company_pan_no','organization.company_name_in_bank as admin_company_name_in_bank')

            ->first();



        $dateCreated = date_create($invoicedetail->created_at);

        $invoicedetail->created_at = date_format($dateCreated, 'd-M-Y');



        $itemdetail = DB::table('sales_invoice_item')

            ->where('sales_invoice_item.del', '0')

            ->where('sales_invoice_item.sales_invoice_id',$sales_invoice_id)

            // ->select('sales_invoice_item.brand_name')

            // ->groupBy('brand_name')

            ->get();





        // $itemdetail = array();



        // foreach ($distinctBrandList as $key => $row) {



        //       $itemdetail[$key]['brand_name'] = $row->brand_name;



        //       $brandItemList = DB::table('sales_invoice_item')

        //             ->where('sales_invoice_item.del', '0')

        //             ->where('sales_invoice_item.sales_invoice_id',$sales_invoice_id)

        //             ->where('sales_invoice_item.brand_name',$row->brand_name)

        //             ->select('sales_invoice_item.*')

        //             ->get();



        //       $itemdetail[$key]['item_list'] = $brandItemList;

        // }





        $payment = DB::table('sales_invoice_payment')

                    ->join('sales_invoice','sales_invoice.id','=','sales_invoice_payment.invoice_id')

                    ->join('users','users.id','=','sales_invoice_payment.created_by')



                    ->where('sales_invoice_payment.del', '0')

                    ->where('sales_invoice_payment.invoice_id',$sales_invoice_id)

                    ->select('sales_invoice_payment.*','sales_invoice.invoice_id as prfx_invoice_id','users.first_name')

                    ->get();



        $invoicePaymentList = array();

        foreach ($payment as $key => $row) {



             $invoicePaymentList[$key] = $row;



             $dateCreated = date_create($row->date_created);

             $invoicePaymentList[$key]->date_created = date_format($dateCreated, 'd-M-Y');

        }





        return $this->respond([



            'data' => compact('invoicedetail','itemdetail', 'invoicePaymentList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Invoice Detail Fetched Successfully.'



            ]);

    }





    public function salesInvoicePaymentList(Request $request) {





        $per_page = 20;

        $search = $request->s;



        $so = DB::table('sales_invoice_payment');

        $so->join('franchises', 'franchises.id', '=', 'sales_invoice_payment.franchise_id');

        $so->join('users', 'users.id', '=', 'sales_invoice_payment.created_by');

        $so->join('sales_invoice', 'sales_invoice.id', '=', 'sales_invoice_payment.invoice_id');

        $so->where('sales_invoice_payment.del' ,'0');

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $so->select('sales_invoice_payment.*', 'franchises.name','users.first_name','sales_invoice.invoice_id as prefix_invoice_id');

        $so->orderBy('sales_invoice_payment.id','Desc');

        $invoicePaymentList= $so->paginate($per_page);



        $so = DB::table('sales_invoice_payment');

        $so->join('franchises', 'franchises.id', '=', 'sales_invoice_payment.franchise_id');

        $so->where('sales_invoice_payment.del' ,'0');

        if($search) { $so->where('franchises.name', 'LIKE', '%'.$search.'%'); }

        $sum= $so->sum('sales_invoice_payment.amount');



            // $payment = DB::table('sales_invoice_payment')

            //         ->leftJoin('franchises', 'franchises.id', '=', 'sales_invoice_payment.franchise_id')

            //         ->where('sales_invoice_payment.del', '0')

            //         ->select('sales_invoice_payment.*', 'franchises.name')

            //         ->orderBy('sales_invoice_payment.id','Desc')

            //         ->get();



            //$invoicePaymentList = array();

        foreach ($invoicePaymentList as $key => $row) {



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







    public function saveInvoice(Request $data) {

            if(!$data->organization_id)return false;



            $invoice = DB::table('sales_invoice')->insert([

                    'date_created' => date('Y-m-d H:i:s'),

                    'created_by' => $data->login_id,

                    'franchise_id' =>  $data->franchise_id,

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

                    'updated_by' =>  '1',

                    'updated_date' =>  date('Y-m-d')

            ]);



            $salesInvoiceId = DB::getPdo()->lastInsertId();



            $organization = DB::table('organization')->where('id', $data->organization_id)->first();





            if (date('m') <= 4) {//Upto June 2014-2015

                $financial_year = (date('y')-1) . '-' . date('y');

            } else {//After June 2015-2016

                $financial_year = date('y') . '-' . (date('y') + 1);

            }



            $invoice_series = 1;

            $prefix_year = $organization->invoice_prefix.''.$financial_year;

            $invoice_id = '';

            $p = DB::table('sales_invoice')->where('invoice_id','LIKE','%'.$prefix_year.'%')->orderBy('id','DESC')->first();

            if($p){

                $invoice_series = $p->invoice_series + 1;

                $invoice_id = $prefix_year.'/'.$invoice_series;

            }else{

                $invoice_id = $prefix_year.'/1';

            }





             DB::table('sales_invoice')->where('id',$salesInvoiceId)->update([

                'invoice_prefix' => $organization->invoice_prefix,

                'invoice_id' => $invoice_id,

                'invoice_series' => $invoice_series,

                 

                 ]);



            foreach ($data->itemList as $key => $row) {



                    $invoiceItem = DB::table('sales_invoice_item')->insert([



                            'sales_invoice_id' => $salesInvoiceId,

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





                    // $m = DB::table('master_product_measurement_prices')->where('product_id',$row['product_id'])->where('unit_of_measurement', $row['measurement'])->first();



                    // $measurementArr = explode(' ', $m->stock_total);

                    // $actual_qty  = ((int)$measurementArr[0] - $row['qty'] );

                    // $stock_total =    $actual_qty. ' ' . $measurementArr[1];





                    // $uom = explode(' ', $m->unit_of_measurement);

                    // $stock_qty  =  $actual_qty /  $uom[0];





                    // $f = DB::table('master_product_measurement_prices')

                    // ->where('id',$m->id)

                    // ->update(['stock_qty'=>  $stock_qty ]);



                    // $f = DB::table('master_product_measurement_prices')

                    // ->where('id',$m->id)

                    // ->update(['stock_total'=>  $stock_total ]);





                    $up  = DB::table('master_product_measurement_prices')->where('product_id',$row['product_id'])->where('unit_of_measurement', $row['measurement'])->decrement('sale_qty',$row['qty']);









                    $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->first();



                    if($exist_porduct) {



                          $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['measurement'])->where('franchise_id',$data->franchise_id)->increment('current_stock',$row['qty']);



                    } else {



                          $lead = DB::table('franchise_purchase_initial_stocks')->insert([

                                'date_created' => date('Y-m-d'),

                                'created_by' => $data->login_id,

                                'franchise_id' => $data->franchise_id,

                                'category' => $row['category'],

                                'brand' => $row['brand_name'],

                                'product' => $row['product_name'],

                                'unit_measurement' => $row['measurement'],

                                'quantity' => $row['qty'],

                                'current_stock' => $row['qty'],

                            ]);

                    }





                    if($row['id'] != '0') {



                        $orderDeliveryData = DB::table('sales_order_item')

                                ->where('sales_order_item.id', $row['id'])

                                ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')

                                ->first();



                        $updatedDeliveryQty = $orderDeliveryData->delivered_qty + $row['qty'];



                        $result =  DB::table('sales_order_item')->where('id', $row['id'])->update(['delivered_qty' => $updatedDeliveryQty]);

                    }

            }





            if($data->receivedAmount) {



                $payment = DB::table('sales_invoice_payment')->insert([

                        'date_created' => date('Y-m-d H:i:s'),

                        'created_by' => $data->login_id,

                        'franchise_id' =>  $data->franchise_id,

                        'invoice_id' =>  $salesInvoiceId,

                        'amount' =>  $data->receivedAmount,

                        'mode' =>  $data->mode,

                ]);

            }





            $orderItemData = DB::table('sales_order_item')

                    ->where('sales_order_item.sales_order_id', $data->order_id)

                    ->where('sales_order_item.del', '0')

                    ->select('sales_order_item.item_qty', 'sales_order_item.delivered_qty')

                    ->get();



            $isDeliveryLeft = false;

            foreach ($orderItemData as $key => $row) {



                 if($row->delivered_qty < $row->item_qty) {

                     $isDeliveryLeft = true;

                 }

            }





            if($isDeliveryLeft === false) {



                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Approved']);



            } else {



                $result =  DB::table('sales_order')->where('id', $data->order_id)->update(['order_status' => 'Pending']);

            }





            return $this->respond([



                'data' => compact('salesInvoiceId','p'),



                'status' => 'success',



                'status_code' => $this->getStatusCode(),



                'message' => 'Sales Invoice Inserted Successfully.'



            ]);

    }





    public function getInvoiceId(Request $data) {

        $data = (object)$data;



        // if($data->invoice_id){

            // $invoice_id = DB::table('sales_invoice')->where('invoice_id', $data->invoice_id)->select('id')->first();



        // }else{

            $organization = DB::table('organization')->orderBy('id','DESC')->get();



        // }



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



        if (date('m') <= 4) {//Upto June 2014-2015

            $financial_year = (date('Y')-1) . '-' . date('Y');

        } else {//After June 2015-2016

            $financial_year = date('Y') . '-' . (date('Y') + 1);

        }





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



            'data' => compact('items','prod','unit','financial_year'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Sales Invoice Inserted Successfully.'



        ]);



    }



   public function payment_receiving(Request $request){

       $d = (object)$request['data'];

        



            $payment = DB::table('sales_invoice_payment')->insert([

                    'date_created' => date('Y-m-d H:i:s'),

                    'created_by' => $d->user_id,

                    'franchise_id' =>  $d->franchise_id,

                    'invoice_id' =>  $d->invoice_id,

                    'amount' =>  $d->receive_payment,

                    'mode' =>  $d->payment_mode,

                    'note' =>  $d->note,

            ]);



            if($d->balance_amount > 0){

                $payment_status = 'Pending';

            }else if($d->balance_amount == 0){

                $payment_status = 'Paid';

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



  public function  getPendingPayment(Request $request){

       $d = (object)$request['data'];



        $payment = DB::table('sales_invoice')->where('id', $d->invoice_id)->first();



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
    $data = (object)$request['lead']];


    $exist = DB::table('direct_customer')->where('contact_no' ,'=',$data->contact_no )->where('del' ,'=','0')->first();

    if(!$exist){

            $lead = DB::table('direct_customer')->insert([

            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $data->created_by,
            'company_name' => $data->company_name,
            'contact_no' => $data->contact_no,
            'email_id' => $data->email_id,
            'address' => $data->address,
            'country' => $data->country,
            'state' => $data->state,
            'district' => $data->district,
            'city' => $data->city,
            'pincode' => $data->pincode,
            'company_gstin' => $data->company_gstin,

            ]);

            $msg = $lead ? 'Direct Customer saved Successfully!' : '';

    }else{
            $msg = 'Direct Customer Already Exist with same Mobile No.';
   

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

        

}

