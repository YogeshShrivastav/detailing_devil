<?php







namespace App\Http\Controllers\Admin;









use App\Http\Controllers\ApiController;



use Illuminate\Http\Request;



use DB;





class PurchaseController extends ApiController



{





///// PURCHASE ORDER CONTROLLER START 

    public function __construct()

    {

        date_default_timezone_set("Asia/Calcutta");

    }





    public function getPurchases(Request $request)

    {



        $per_page = 20;


        $filter = (Object)$request['filter'];


        $so = DB::table('purchase_order')

        ->join('users', 'users.id', '=', 'purchase_order.created_by')

        ->leftJoin('purchase_order_item', 'purchase_order_item.purchase_order_id', '=', 'purchase_order.id')

        ->leftJoin('vendors', 'vendors.id', '=', 'purchase_order.vendor_id')    

        ->where('purchase_order.del', '0');
 

          if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s ) {
                $query->where('vendors.name','LIKE','%'.$s.'%')
                ->orWhere('purchase_order.vendor_id','LIKE','%'.$s.'%')
                ->orWhere('vendors.phone','LIKE','%'.$s.'%');

            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('purchase_order.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('purchase_order.receive_status','LIKE','%'.$filter->status.'%');

         $so->select('purchase_order.*','vendors.name','vendors.phone','users.first_name as created_name', DB::raw("COUNT('purchase_order_item.id') as total_item"))

        ->groupBy('purchase_order.id')
        
        ->orderBy('purchase_order.id','DESC');

        $purchesorderList= $so->paginate($per_page);

        
      

       

    return $this->respond([



        'data' => compact('purchesorderList'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Order\'s List Get Successfully.'



        ]);





}











public function getVendor(Request $request)

{

   $per_page = 20;

   $search = $request->s;



   if($search)

   {

    $vendors = DB::table('vendors')->where('status', 'A')

    ->where('vendors.name', 'LIKE', '%'.$search.'%')

    ->orderBy('vendors.id','DESC')

    ->select('id','name','phone')

    ->groupBy('vendors.id')

    ->paginate($per_page);

   }

   else

   {

    $vendors = DB::table('vendors')

    ->where('status', 'A')

    ->orderBy('vendors.id','DESC')

    ->select('id','name','phone')

    ->groupBy('vendors.id')

    ->paginate($per_page);

   }





return $this->respond([



    'data' => compact('vendors'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Vendor\'s List Get Successfully.'



    ]);





}



public function getVendorCategory($vendor_id)

{



    $vendors_category = DB::table('vendordeals')

    ->leftJoin('master_products', 'master_products.id', '=', 'vendordeals.deals')

    ->where('vendordeals.status', 'A')

    ->where('vendor_id',$vendor_id)

    ->orderBy('master_products.brand_name','ASC')

    ->select('master_products.brand_name','master_products.category')

    ->groupBy('master_products.category')

    ->get();





    return $this->respond([



        'data' => compact('vendors_category'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Vendor\'s Product List Get Successfully.'



        ]);



}









public function getVendorBrand(Request $request , $vendor_id)

{

    $d = (object)$request['item'];



    $vendors_brand = DB::table('vendordeals')

    ->leftJoin('master_products', 'master_products.id', '=', 'vendordeals.deals')

    ->where('vendordeals.status', 'A')

    ->where('vendor_id',$vendor_id)

    ->where('category',$d->category)

    ->orderBy('master_products.brand_name','ASC')

    ->select('master_products.brand_name','master_products.category')

    ->groupBy('master_products.brand_name')

    ->get();





    return $this->respond([



        'data' => compact('vendors_brand'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Vendor\'s Product List Get Successfully.'



        ]);



}







public function getProduct(Request $request,$vendor_id)

{

    $d = (object)$request['item'];



    $products = DB::table('vendordeals')

    ->leftJoin('master_products', 'master_products.id', '=', 'vendordeals.deals')

    ->where('vendordeals.status', 'A')

    ->where('vendordeals.vendor_id',$vendor_id)

    ->where('master_products.brand_name',$d->brand_name)

    ->where('master_products.category',$d->category)

    ->orderBy('master_products.product_name','ASC')

    ->select('master_products.id','master_products.brand_name','master_products.category','master_products.product_name','master_products.hsn_code')

    ->groupBy('master_products.product_name')

    ->get();



    return $this->respond([



        'data' => compact('products'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Product List Get Successfully.'



        ]);

}







public function getMeasurement(Request $request)

{

    $measurement = DB::table('master_product_measurement_prices')

        ->where('status', 'A')

        ->where('purchase_price', '!=' ,'')

        ->where('product_id',$request->product_id)

        ->get();



    foreach ($measurement as $key => $row) {

             $measurement[$key] = $row;



             if (strpos($row->unit_of_measurement, 'box') !== false) {

                   $measurementArr = explode(' ', $row->unit_of_measurement);

                   $measurement[$key]->unit_of_measurement = $measurementArr[1].' ('.$measurementArr[0] . ' pc)';

             }

    }



    return $this->respond([



        'data' => compact('measurement'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Product List Get Successfully.'



        ]);



}





public function getAttributeTypeList(Request $request)

{

    $d = (object)$request['item'];



    $attributeTypeList = DB::table('master_product_attr_types')

    ->where('status', 'A')

    ->where('attr_type', '!=' ,'')

    ->where('product_id', $d->product_id)

    ->get();



    



    foreach ($attributeTypeList as $key => $row) {



           $o = DB::table('master_product_attr_options')->where('status', 'A')->where('attr_option', '!=' ,'')->where('attr_type_id', $row->id)->get();



           $attributeTypeList[$key]->optionList = $o;

    }





    return $this->respond([



        'data' => compact('attributeTypeList'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Product List Get Successfully.'



        ]);



}















public function addOrder(Request $data)

{



    // dd($data);

    // echo "<pre>";

    // print_r($data);

    // exit;

    $date = date('Y-m-d');
    if( isset( $data['date_created'] ) &&  $date['date_created']  ){
      $date = $job->date_created;
    }


    $purchase_order = DB::table('purchase_order')->insert([

        'date_created' => date("Y-m-d H:i:s"), 

        'created_by' => $data['created_by'],

        'created_by_type' => $data['created_by_type'],

        'vendor_id' =>  $data['data']['vendor_id'],

        'order_total' =>  $data['data']['item_total'],

        'order_status' =>  'Pending',

        'receive_status' =>  'Pending',

        'del' =>  '0',

        ]);

    $purchase_order_id = DB::getPdo()->lastInsertId();   

    

    if($purchase_order){

        $vendor_log = DB::table('vendor_log')->insert([

            'date_created' => date('Y-m-d H:i:s'),

            'created_by' => $data['created_by'],

            'vendor_id' =>  $data['data']['vendor_id'],

            'remark' => 'Created',

            'purchase_order_id' => $purchase_order_id,

            'del' =>  '0',

            ]);

    }



    $item_data = $data['item'];



    foreach ($item_data as $key => $value) {



        if (strpos($value['measurement'], 'box') !== false) {

               

               $arr = explode(" ", $value['measurement']);

               $measurement = str_replace("(","", $arr[1])." ".$arr[0];



        } else {

            $measurement = $value['measurement'];

        }



        $measurement = DB::table('master_product_measurement_prices')

            ->where('status', 'A')

            ->where('unit_of_measurement', $measurement)

            ->where('product_id', $value['product_id'])

            ->first();



        if(!isset($measurement->id) || !$measurement->id) {

            $measurement->id = 0;

        }





        $purchase_order_item = DB::table('purchase_order_item')->insert([

            'purchase_order_id' => $purchase_order_id,

            'item_id' => $value['product_id'],

            'category' => $value['category'],

            'item_name' => $value['product_name'],

            'brand_name' => $value['brand_name'],

            'hsn_code' => $value['hsn_code'],

            'measurement' => $value['measurement'],

            'item_attribute_type' => $value['attribute_type'],

            'item_attribute_value' => $value['attribute_option'],

            'measurement_id' => $measurement->id,

            'qty' =>  $value['qty'],

            'rate' =>  $value['rate'],

            'receive_qty' =>  '0',

            'pending_qty' => $value['qty'],

            'item_total' => $value['amount'],

            'del' =>  '0',

            ]);



        $item_id = DB::getPdo()->lastInsertId();



    }

    return $this->respond([



        'data' => compact('purchase_order_id','item_id'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Order Add Successfully.'



        ]);



}











public function getPurchaseDetail($purchase_id)

{



    $orderdetail = DB::table('purchase_order')

    ->leftJoin('vendors', 'vendors.id', '=', 'purchase_order.vendor_id')

    ->where('del', '0')

    ->where('purchase_order.id',$purchase_id)

    ->select('purchase_order.*','vendors.name','vendors.phone','vendors.landline','vendors.name','vendors.address','vendors.state','vendors.city','vendors.pin_code','vendors.district','vendors.country')

    ->groupBy('purchase_order.id')

    ->first();



    $v_con = DB::table('vendor_details')->where('status','!=', 'X')->where('vendor_id', '=' ,$orderdetail->vendor_id)->get();    

    $v_log = DB::table('vendor_log')->where('del', '0')->where('purchase_order_id', '=' ,$purchase_id)->where('vendor_id', '=' ,$orderdetail->vendor_id)->get(); 

    $itemdetail = DB::table('purchase_order_item')

    ->where('del', '0')

    ->where('purchase_order_item.purchase_order_id',$purchase_id)

    ->select('purchase_order_item.*')

    ->get();



    $pid_receive=DB::table('purchase_order_receive')

    ->where('del', '0')

    ->where('purchase_order_receive.purchase_order_id',$purchase_id)

    ->select('purchase_order_receive.*')

    ->get();

    

    $pid_receive_id=DB::table('purchase_order_receive')

    ->where('del', '0')

    ->where('purchase_order_receive.purchase_order_id',$purchase_id)

    ->select('id')

    ->lists('id');



    $all_receive_item=DB::table('purchase_order_receive_item')

    ->where('del', '0')

    ->whereIn('purchase_order_receive_item.receive_id',$pid_receive_id)    

    ->get();

    

    $itemdetailqty = DB::table('purchase_order_item')

    ->where('del', '0')

    ->where('purchase_order_item.purchase_order_id',$purchase_id)   

    ->sum('qty');

    $itemdetailreceiveqty = DB::table('purchase_order_item')

    ->where('del', '0')

    ->where('purchase_order_item.purchase_order_id',$purchase_id)   

    ->sum('qty');



    $usernam = DB::table('users')->where('id',$orderdetail->created_by)->select('id as user_id', 'username')->get();

    return $this->respond([



        'data' => compact('orderdetail','itemdetail','v_con','v_log','usernam','pid_receive','all_receive_item','itemdetailqty','itemdetailreceiveqty'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Details Get Successfully.'



        ]);

}











///// PURCHASE ORDER CONTROLLER END









public function add(Request $data) {

    $lead = DB::table('franchises')->insert([

        'name' => $data->name, 

        'contact_no' => $data->contact_no,

        'email_id' => $data->email,

        // 'source' => $data->source,

        'address' =>  $data->address,

        'address' =>  $data->address,

        'state' =>  $data->state,

        'city' =>  $data->city,

        'pin_code' =>  $data->pin_code,

        'location_id' =>  $data->location_id,

        'company_name' =>  $data->company_name,

        'business_type' =>  $data->business_type,

        'business_loc' =>  $data->business_loc,

        'year_of_est' =>  $data->year_of_est,

        'city_apply_for' =>  $data->city_apply_for,

        'automotive_exp' =>  $data->automotive_exp,

        'type' =>  $data->type,

        'created_by' =>  $data->created_by,

        'status' => 'A'

        ]);

    $id = DB::getPdo()->lastInsertId();



    return $this->respond([



        'data' => compact('franchise_id'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead\'s Get Successfully for edit.'



        ]);



                    // $franchise = DB::table('franchises')->create( $request->all() );    

                    // return response()->json(compact('franchise'));  



}





public function service_plans() {

    $plans = DB::table('master_franchise_plans')->where('status', 'A')->orderBy('plan','ASC')->get();

    return $this->respond([



        'data' => compact('plans'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead\'s Get Successfully for edit.'



        ]);

}





public function get_stock( $id ) {



    $plans = DB::table('master_franchise_plans')->where('id', $id)->first();

    $accessories = DB::table('master_franchise_accessories')->where('franchise_plan_id', $id)->where('status' ,'A')->select('accessories_name')->get();

    $brand = DB::table('master_franchise_initial_stocks')->where('franchise_plan_id', $id)->groupBy('brand')->get();



    $data = [];

    foreach ($brand as $key => $value) {

        $product = DB::table('master_franchise_initial_stocks')->where('franchise_plan_id', $id)->where('brand', $value->brand )->groupBy('product')->get();



        foreach ($product as $key2 => $value2) {

            $temp = [];



            $stock = DB::table('master_franchise_initial_stocks')->where('franchise_plan_id', $id)->where('brand', $value->brand )->where('product', $value2->product )->get();

                        // $value2->stock= $stock;



            array_push($temp, $stock);

            array_push($temp, $value2);

            array_push($data, $temp);

        }

    }



    return $this->respond([



        'data' => compact('data','plans', 'accessories'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead\'s Get Successfully for edit.'



        ]);

}











public function locations(Request $request) {



    $l = DB::table('locations')->where('location_name')->orderBy('location_name','ASC')->get();



    return $this->respond([



        'data' => compact('l'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead\'s Get Successfully for edit.'



        ]);

}



public function countries() {



    $country = DB::table('countries')->orderBy('name','ASC')->get();



    return $this->respond([



        'data' => compact('country'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead\'s Get Successfully for edit.'



        ]);



}









                //  public function saveLead(Request $request) {



                    //      $lead = $this->leads_repo->save_lead($request);



                    //      return $this->respond([



                        //          'data' => compact('lead'),



                        //          'status' => 'success',



                        //          'status_code' => $this->getStatusCode(),



                        //          'message' => 'Lead Save Successfully.'



                        //      ]);



                        //  }







public function detail($l_id) {



    $frchise = $this->franchises_repo->detail($l_id);



    return response()->json(  array('frchise' => $frchise ) );



}



                        //  public function updateLead(Request $request) {



                            //      $lead = $this->leads_repo->update_lead($request);



                            //      return $this->respond([



                                //          'data' => compact('lead'),



                                //          'status' => 'success',



                                //          'status_code' => $this->getStatusCode(),



                                //          'message' => 'Lead detail\'s Get Successfully for edit.'



                                //      ]);



                                //  }







public function deleteFranchises(Request $request) {



    $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return $this->respond([



        'data' => compact('r_lead'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Lead detail\'s Get Successfully for edit.'



        ]);



}

public function deletePurchaseOrder(Request $request) {

     //dd(1221);

     //echo "<pre>";print_r($request);exit;

    $r_purorders = DB::table('purchase_order')->where('id', $request->po_id)->where('del', '0')->update(['del' => '1']);

    $r_purorderitems = DB::table('purchase_order_item')->where('purchase_order_id', $request->po_id)->where('del', '0')->update(['del' => '1']);

    $r_purorderlog = DB::table('vendor_log')->where('purchase_order_id', $request->po_id)->where('del', '0')->update(['del' => '1']);

        return $this->respond([



            'data' => compact('r_purorders'),

            

            'status' => 'success',

            

            'status_code' => $this->getStatusCode(),

            

            'message' => 'Purchase Order deleted Successfully.'

            

            ]); 



}





public function followups($l_id) {

    $followups = DB::table('consumers')->where('franchise_id', $l_id)->get();

    // $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return response()->json(compact('followups'));

}



public function franch_consumers($l_id) {

    $consumers = DB::table('consumers')->where('franchise_id', $l_id)->where('status', 'A')->get();

     // $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return response()->json(compact('consumers'));

}





public function get_brand(Request $request) {

    $brands = DB::table('master_products')->where('status', 'A')->groupBy('brand_name')->get();

    // $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return response()->json(compact('brands'));

}





public function get_products(Request $request) {

    $products = DB::table('master_products')->where('status', 'A')->where('brand_name',$request->brand)->groupBy('product_name')->get();

    // $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return response()->json(compact('products'));

}





public function units(Request $request) {

    $units = DB::table('master_product_measurement_prices')->where('status', 'A')->where('product_id',$request->product_id)->get();

    // $r_lead = $this->franchises_repo->deleteFranchises($request->l_id);

    return response()->json(compact('units'));

}





public function savePurReceive(Request $request){



    // echo "<pre>";

    // print_r($request);

    // // dd($request);

    // exit;

    

    $purchase_receive_save = DB::table('purchase_order_receive')->insert([           

            'date_created' => date("Y-m-d H:i:s"),

            'created_by'=> $request['created_by'],

            'created_by_type' => $request['created_by_type'],

            'vendor_id'=> $request['vendor_id'],

            'purchase_order_id' => $request['purchase_order_id'],

            'invoice_no' => $request['invoice_no'],

            'invoice_date'=> $request['invoice_date'],

            'invoice_amt'=> $request['invoice_amt'],

            'receive_note'=> $request['receive_note'],

            'del'=> '0'

        ]);//order receive master table value added

    $id = DB::getPdo()->lastInsertId();

    if($purchase_receive_save) {

        //$this->purchase_receive_item_save($id, $request->items);    

        foreach ($request->items as $key1 => $value1) {  //update purchase order item of purchase order 

            $rec=$value1['receive_qty'];

            if(!isset($value1['accept_qty'])){

                $ac=0;

            }else{

                $ac=$value1['accept_qty'];

            }            

            $receieve_update= DB::table('purchase_order_item')

            ->where('id',$value1['id'])

            ->update(['receive_qty' => $rec+$ac,'pending_qty' => $value1['qty']-($rec+$ac) ]);

        } 



        $flagitem=0;

        foreach ($request->items as $key => $value) {   

            if(!isset($value['accept_qty'])){

                $ac=0;

            }else{

                $ac=$value['accept_qty'];

            }

            if(!isset($value['reject_qty'])){

                $rq=0;

            }else{

                $rq=$value['reject_qty'];

            }

            if(($ac>0)||($rq>0)){ //if reject item and accept item is more than 0 then item added



                $purchase_order_receive_item = DB::table('purchase_order_receive_item')->insert([                

                'date_created' => date("Y-m-d H:i:s"),

                'purchase_order_id' =>  $value['purchase_order_id'],

                'receive_id' => $id,

                'item_id' => $value['item_id'],

                'category' => $value['category'],

                'brand_name' => $value['brand_name'],

                'hsn_code' => $value['hsn_code'],

                'item_name' => $value['item_name'],

                'measurement_id' => $value['measurement_id'],

                'measurement' => $value['measurement'],

                'item_attribute_type' => $value['item_attribute_type'],

                'item_attribute_value' => $value['item_attribute_value'],

                'accept_qty' => $ac,

                'reject_qty' => $rq,

                'del'  => '0'    

                 ]);



                 $flagitem=1;





                  if($ac > 0) {



                       $productStockRow = DB::table('master_product_measurement_prices')->where('status', 'A')->where('id', $value['measurement_id'])->first();



                       $updatedStockQty = $productStockRow->stock_qty + $ac;



                       $measurementArr = explode(' ', $productStockRow->unit_of_measurement);



                       $stock_total = ((int)$measurementArr[0] *  $updatedStockQty) . ' ' . $measurementArr[1];



                       $result =  DB::table('master_product_measurement_prices')->where('id', $value['measurement_id'])->update(['stock_qty' => $updatedStockQty, 'stock_total' => $stock_total]);

                  }

            }

        } 





        if($flagitem==0){                

            DB::table('purchase_order_receive')->where('id',$id)->delete();   //if receive item not added

        }else{

            //log update if receive item is added

            $vendor_log = DB::table('vendor_log')->insert([

                'date_created' => date('Y-m-d H:i:s'),

                'created_by' => $request['created_by'],

                'vendor_id' =>  $request['vendor_id'],

                'remark' => 'Invoice Created',

                'purchase_order_id' => $request['purchase_order_id'],

                'del' =>  '0',

                ]);

        }

        

    }

    $this->updatepending($request['purchase_order_id']);

    return $this->respond([



        'data' => compact('purchase_receive_save','receieve_update','purchase_order_receive_item'),



        'status' => 'success',       



        'message' => 'Order Receive Added Successfully.'



    ]);



    

    

 

}



 public function updatepending($pid){

    $dbupdate=DB::table('purchase_order_item')->where('purchase_order_id',$pid)->get();

    $flag=1;

    //echo "<pre>";

   // print_r($dbupdate);

    foreach($dbupdate as $dbu){  

        //print_r($dbu);  

        if($dbu->pending_qty>0){

           $flag=0;

        }

    }

    //echo $flag;

    if($flag){

        DB::table('purchase_order')->where('id',$pid)->update(['receive_status' => 'Received']);

    }

 }







 public function fil(Request $request){

   dd($_FILES);

 }





}



