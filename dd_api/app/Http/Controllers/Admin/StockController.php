<?php



namespace App\Http\Controllers\Admin;



// use Acme\Repositories\Vendors\VendorsRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;

class StockController extends ApiController

{


    public function getNotification(Request $request){
        $n =  DB::table('notification_receivers');
                
        $id = $request['login_id'];
           $n->join('notification', function($join) use ($id )  {
               $join->on('notification.id', '=', 'notification_receivers.notification_id')
                   ->where('notification_receivers.user_id', '=',$id );
           });
   
       $notifications = $n->limit(30)->orderBy('notification_receivers.id','DESC')->get();

       $n =  DB::table('notification_receivers');
                
       $id = $request['login_id'];
          $n->join('notification', function($join) use ($id )  {
              $join->on('notification.id', '=', 'notification_receivers.notification_id')
                  ->where('notification_receivers.notify', '=',0)
                  ->where('notification_receivers.user_id', '=',$id );
          });
  
      $notify = $n->limit(15)->orderBy('notification_receivers.id','DESC')->get();
      $n =  DB::table('notification_receivers')->where('user_id',$id)->update(['notify'   =>  1]);


                return $this->respond( compact('notifications','notify') );


    }


    public function add_assumption(Request $request){
$data = (Object)$request['stock'];

      $lead = DB::table('assumption_stock')->insert([

        'date_created' =>  ( isset( $data->date_created ) && $data->date_created  ) ? $data->date_created  : date('Y-m-d H:i:s'),

        'created_by' => $data->login_id,

        'type' => $data->type,

        'franchise_id' => isset($data->franchise_id) ? $data->franchise_id : '',

        'itemPrice' => isset($data->itemPrice) ? $data->itemPrice :'' ,
        'issue_to' => isset($data->issue_to) ? $data->issue_to :'' ,
        'purpose' => isset($data->purpose) ? $data->purpose :'' ,

        'itemTotal' => sizeof( $data->itemList ),

        'remark' => isset($data->remark) ? $data->remark : '',

    ]);
      $AssumptionStockId = DB::getPdo()->lastInsertId();



      foreach ($data->itemList as $key => $row) {


            $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $row['category'])->where('brand', $row['brand_name'])->where('product', $row['product_name'])->where('unit_measurement', $row['uom'])->where('franchise_id',$data->franchise_id)->decrement('current_stock',$row['qty']);
        

        $lead = DB::table('assumption_stock_item')->insert([

            'created_at' => date('Y-m-d'),

            'created_by' => $data->login_id,

            'assumption_stock_id' => $AssumptionStockId,

            'type' =>  $data->type,

            'franchise_id' => isset($data->franchise_id) ? $data->franchise_id : '',

            'category' => $row['category'],

            'brand' => $row['brand_name'],

            'product' => $row['product_name'],

            'uom' => $row['uom'],

            'uom_id' => isset( $row['uom_id'] ) ? $row['uom_id'] :'',

            'product_id' => isset($row['product_id']) ? $row['product_id'] : '',

            'qty' => $row['qty'],


        ]);

    }

}



    public function add_company_assumption(Request $request){
$data = (Object)$request['stock'];

      $lead = DB::table('assumption_stock')->insert([

        'date_created' => ( isset( $data->date_created ) && $data->date_created  ) ? $data->date_created  : date('Y-m-d H:i:s'),

        'created_by' => $data->login_id,

        'type' => $data->type,

        'franchise_id' => isset($data->franchise_id) ? $data->franchise_id : '',

        'itemPrice' => isset($data->itemPrice) ? $data->itemPrice :'' ,

        'itemTotal' => sizeof( $data->itemList ),

        'remark' => isset($data->remark) ? $data->remark : '',

    ]);
      $AssumptionStockId = DB::getPdo()->lastInsertId();



      foreach ($data->itemList as $key => $row) {


        $exist_porduct = DB::table('master_product_measurement_prices')->where('id', $row['uom_id'])->decrement('sale_qty',$row['qty']);
        

        $lead = DB::table('assumption_stock_item')->insert([

            'created_at' => date('Y-m-d'),

            'created_by' => $data->login_id,

            'assumption_stock_id' => $AssumptionStockId,

            'type' =>  $data->type,

            'franchise_id' => isset($data->franchise_id) ? $data->franchise_id : '',

            'category' => $row['category'],

            'brand' => $row['brand_name'],

            'product' => $row['product_name'],

            'uom' => $row['uom'],

            'uom_id' => isset( $row['uom_id'] ) ? $row['uom_id'] :'',

            'product_id' => isset($row['product_id']) ? $row['product_id'] : '',

            'qty' => $row['qty'],


        ]);

      }

}




public function getAssumptionStock(Request $data)
{
    $per_page = 20;


    $assumption_stock = DB::table('assumption_stock')

    ->leftJoin('users', 'users.id', '=', 'assumption_stock.created_by')

    ->where('assumption_stock.type', $data->type)

    ->where('assumption_stock.franchise_id', $data->franchise_id)

    ->where('del','0')

    ->select('assumption_stock.*','users.first_name as created_name')->groupBy('assumption_stock.id')->orderBy('assumption_stock.id','DESC')->paginate($per_page);

    return $this->respond([

        'data' => compact('assumption_stock'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Assumption Stock Fetched Successfully.'
    ]);
}






public function getAssumptionStockItem(Request $data)

{

    $assumption_stock = DB::table('assumption_stock')

                        ->leftJoin('users', 'users.id', '=', 'assumption_stock.created_by')

                        ->leftJoin('franchises', 'franchises.id', '=', 'assumption_stock.franchise_id')

                        ->leftJoin('locations', 'locations.id', '=', 'franchises.location_id')

                        ->where('assumption_stock.id', $data->id)

                        ->select('assumption_stock.*','users.first_name as created_name','franchises.company_name' , 'locations.location_name')->first();

    $assumption_stock_item = DB::table('assumption_stock_item')

                        ->leftJoin('users', 'users.id', '=', 'assumption_stock_item.created_by')


                        ->where('assumption_stock_item.assumption_stock_id', $data->id)

                        ->select('assumption_stock_item.*','users.first_name as created_name')->get();

                        return $this->respond([

                            'data' => compact('assumption_stock_item','assumption_stock'),

                            'status' => 'success',

                            'status_code' => $this->getStatusCode(),

                            'message' => 'Assumption stock item Fetched Successfully.'

                        ]);
}



public function consumption_outgoing(Request $request){

    
    $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

    $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



    $items = DB::table('assumption_stock_item')

    ->join('assumption_stock','assumption_stock.id','=','assumption_stock_item.assumption_stock_id')

    ->leftJoin('users','assumption_stock.created_by','=','users.id')

    ->leftJoin('franchises','franchises.id','=','assumption_stock.franchise_id')

    ->leftJoin('locations','locations.id','=','franchises.location_id')

    ->where('assumption_stock_item.uom_id',$request['unit_id'])

    ->select('assumption_stock_item.*','assumption_stock.date_created','users.first_name','franchises.company_name','locations.location_name')

    ->groupBy('assumption_stock_item.id')
    ->orderBy('assumption_stock_item.id','DESC')

    ->get();



    return $this->respond([



        'data' => compact('items','prod','unit'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Sales Invoice Inserted Successfully.'



    ]);



}


//     public function getlocation(Request $data)
//     {

//         $per_page = 15;

//         $getstock = DB::table('assumption_stock_item')

//         ->leftJoin('users', 'users.id', '=', 'assumption_stock.created_by')

//         ->leftJoin('assumption_stock', 'assumption_stock.id', '=', 'assumption_stock_item.assumption_stock_id')

//         ->leftJoin('franchises', 'franchises.id', '=', 'assumption_stock_item.franchise_id')

//         ->leftJoin('locations', 'locations.id', '=', 'franchise.location_id')

//         ->where('assumption_stock_item.id', $data->id)

//         ->select('assumption_stock_item.*','users.first_name as created_name','assumption_stock.type','assumption_stock.franchise_id','franchises.name','location.location_name')->paginate($per_page);

//         return $this->respond([

//             'data' => compact('getstock'),

//             'status' => 'success',

//             'status_code' => $this->getStatusCode(),

//             'message' => 'Fetched Successfully.'
//         ]);
//     }


// }

public function getDirectCustomer(Request $request)
{
    $per_page = 20;

   $filter = (Object)$request['filter'];

    $c = DB::table('direct_customer')

    ->leftJoin('users', 'users.id', '=', 'direct_customer.created_by')

    ->leftJoin('countries', 'countries.id', '=', 'direct_customer.country');

          if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $c->where(function ($query) use ($s ) {
                $query->where('direct_customer.company_name','LIKE','%'.$s.'%')
                ->orWhere('direct_customer.name','LIKE','%'.$s.'%')
                ->orWhere('direct_customer.contact_no','LIKE','%'.$s.'%');

            });
        }

    if(isset($filter->date) && $filter->date != '') $c->where('direct_customer.created_at','LIKE','%'.$filter->date.'%');


    $c->select('direct_customer.*','users.first_name as created_name','countries.name as countries_name')->orderBy('direct_customer.id','DESC');

    $directcustomer = $c->paginate($per_page);

    $totalcustomer=DB::table('direct_customer')

        ->leftJoin('countries', 'countries.id', '=', 'direct_customer.country')

         ->count();

    return $this->respond([

        'data' => compact('directcustomer','totalcustomer'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Fetched Successfully.'
    ]);
}




//////////////////  Franchise Service Master    /////////






public function getFranchiseService(Request $request)
{
    $per_page = 20;
    $filter = (Object)$request['filter'];

 $q =   DB::table('master_franchise_service')
        ->where('del','0');


    if(isset($filter->search) && $filter->search != '') {

        $q->where(function ($query) use ($filter ) {
            $query->where('sac','LIKE','%'.$filter->search.'%')
            ->orWhere('service_name','LIKE','%'.$filter->search.'%')
            ->orWhere('category','LIKE','%'.$filter->search.'%');
        });


    }

$sevice = $q->paginate($per_page);

foreach ($sevice as $key => $value) {

    $r1 = DB::table('master_franchise_service_durations')->where('service_id',$value->id)->where('del','0')->get();
    $sevice[$key]->durations = $r1;


}
    return $this->respond( compact('sevice') );
}





public function editFranchiseService($s_id)
{

    $product = DB::table('master_franchise_service')
                ->where('master_franchise_service.id',$s_id)
                ->where('master_franchise_service.del', '0')
                ->first();

              
    $itemlist =  DB::table('master_franchise_service_durations')->where('service_id' ,$s_id)->where('del' ,'0')->get();


  

     return $this->respond([

    'data' => compact('product','itemlist'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Invoice List Successfully'

  ]);
}




    public function getServiceCategory(){
        $category = DB::table('master_franchise_service')->groupBy('category')->select('master_franchise_service.category as name')->orderBy('category','DESC')->get();
        return $this->respond( compact('category') );
        
    }




    public function saveService(Request $request)
    {

        $data = (Object)$request['data'];

        $lead = DB::table('master_franchise_service')->insert([

            'created_date' => date('Y-m-d'),
    
            'created_by' => $data->login_id,
    
            'category' => $data->category,
    
            'service_name' => isset($data->service_name) ? $data->service_name : '',
    
            'gst' => isset($data->gst) ? $data->gst :'' ,
    
            'sac' => isset( $data->sac ) ? $data->sac : ''
    
    
        ]);

          $master_franchise_service_id = DB::getPdo()->lastInsertId();
    
    
    
        foreach ($request['unitData'] as $key => $row) {
            $row = (Object)$row;
            
           DB::table('master_franchise_service_durations')->insert([
    
                'created_date' => date('Y-m-d'),
    
                'created_by' => $data->login_id,
    
                'service_id' => $master_franchise_service_id,
    
                'value_of_duration' => isset($row->value_of_duration) ? $row->value_of_duration : '',

                'unit_of_duration' => isset($row->unit_of_duration) ? $row->unit_of_duration : '',

                'price' => isset($row->price) ? $row->price : '',

                'description' => isset($row->description) ? $row->description : ''
    
            ]);
        }
    }








public function get_franchise_service(Request $request) 
{

    $per_page = 20;

    $filter = (Object)$request['filter'];


  $so = DB::table('franchise_service')

  ->leftJoin('users', 'users.id', '=', 'franchise_service.created_by')

  ->join('franchises', 'franchises.id', '=', 'franchise_service.franchise_id');



 if( isset($request['franchise_id']) && $request['franchise_id'] )
  $so->where('franchise_service.franchise_id' ,$request['franchise_id']);


  $so->where('franchise_service.del','!=','1');

 if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s) {
                $query->where('franchise_service.invoice_id','LIKE','%'.$s.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('franchise_service.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('franchise_service.payment_status','LIKE','%'.$filter->status.'%');
        if(isset($filter->service_status) && $filter->service_status != '') $so->where('franchise_service.del' , $filter->service_status );

  $so->select('franchise_service.*', 'franchises.name','franchises.company_name','users.first_name as created_name'  ,DB::raw('CASE WHEN franchise_service.del = "0"  THEN "Active" ELSE "Cancel" END as status')   )

  ->orderBy('franchise_service.id','Desc')
  ->groupBy('franchise_service.id');
        

 $serviceList= $so->paginate($per_page);

///
  foreach ($serviceList as $key => $row) {


    $itemList =  DB::table('franchise_service_item')->where('franchise_service_id' ,$row->id)->where('del','=','0')->select(DB::RAW('COUNT(id) as totalItem'))->first();

    $serviceList[$key]->totalItem = $itemList->totalItem;

  }

  return $this->respond([

    'data' => compact('serviceList'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Invoice List Successfully'

  ]);

}





//////////////////////   SERVICE INVOICE   ///////////////////


public function getBillServiceCategory(){
    $categoryList = DB::table('master_franchise_service')->where('del','0')->groupBy('category')->orderBy('category','DESC')->get();
    return $this->respond( compact('categoryList') );
    
}


public function getBillServiceNames(Request $request){
    $serviceList = DB::table('master_franchise_service')->where('category', $request['category'])->where('del', '0')->groupBy('service_name')->orderBy('service_name','DESC')->get();
    
    return $this->respond( compact('serviceList') );
    
}

public function getBillServiceDuration(Request $request){
    $durationList = DB::table('master_franchise_service_durations')->where('service_id', $request['service_id'])->groupBy('id')->orderBy('value_of_duration','ASC')->get();
    
    return $this->respond( compact('durationList') );
    
}









public function saceInvoiceService(Request $request)
{
    $data = (object)$request['data'];
    
    if(!$data->organization_id)return false;

    $date_created = date('Y-m-d');
    if( isset($data->date_created) && $data->date_created ){
        $date_created = $data->date_created;
    }

    $date_below = DB::table('franchise_service')->where('organization_id',$data->organization_id)->where('del','0')->max('date_created');

    $tmp_date = date('Y-m-d',strtotime($date_below));
    if( $date_below && ( $tmp_date > $date_created)) 
    {
        return $this->respond('Date is Grater');
    }
    

    $invoice = DB::table('franchise_service')->insert([

        'date_created' => $date_created,

        'created_by' => $data->login_id,

        'franchise_id' =>  $data->franchise_id,

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

        'received' =>  $data->receivedAmount,

        'balance' =>  $data->balance,

        'due_terms' =>  $data->due_terms,

        'payment_status' =>  $data->paymentStatus,
    ]);

    $salesInvoiceId = DB::getPdo()->lastInsertId();

    $organization = DB::table('organization')->where('id', $data->organization_id)->first();

    if (date('m') <= 4) 
    {
        $financial_year = (date('y')-1) . '-' . date('y');  //Upto June 2014-2015
    }
    else 
    {
        $financial_year = date('y') . '-' . (date('y') + 1);  //After June 2015-2016
    }

    $invoice_series = 1;

    $prefix_year = $organization->service_prefix.''.$financial_year;

    $invoice_id = '';

    $p = DB::table('franchise_service')->where('invoice_id','LIKE','%'.$prefix_year.'%')->orderBy('id','DESC')->first();

    if($p){

        $invoice_series = $p->invoice_series + 1;

        $invoice_id = $prefix_year.'/'.$invoice_series;

    }else{

        $invoice_id = $prefix_year.'/1';

    }

    DB::table('franchise_service')->where('id',$salesInvoiceId)->update([

        'invoice_prefix' => $organization->service_prefix,

        'invoice_id' => $invoice_id,

        'invoice_series' => $invoice_series,
    ]);



    foreach ($data->itemList as $key => $row) {

        $start_date =   date('Y-m-d');

        if( isset($row['start_date']) && $row['start_date'] ){
            $start_date = $row['start_date'];
        }

        $end_date = date('Y-m-d', strtotime("+".$row['duration'], (strtotime( $start_date )-86400)));
       
        $invoiceItem = DB::table('franchise_service_item')->insert([

            'franchise_service_id' => $salesInvoiceId,

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

    if($data->receivedAmount && $data->mode && $data->mode !='None') {

        $payment = DB::table('franchise_service_payment')->insert([

            'date_created' =>$date_created,

            'created_by' => $data->login_id,

            'franchise_id' =>  $data->franchise_id,

            'invoice_id' =>  $salesInvoiceId,

            'amount' =>  $data->receivedAmount,

            'mode' =>  $data->mode,

        ]);
    }

    return $this->respond([
    'data' => compact('salesInvoiceId'),
    'status' => 'success',
    'status_code' => $this->getStatusCode(),
    'message' => 'Sales Invoice Inserted Successfully.'
    ]);

}



public function update_service_start_date(Request $request){
    $request = (Object)$request;


    if( isset($request->start_date) && $request->start_date ){

        $d = DB::table('franchise_service_item')->where('id', $request->service_id )->first();
        $d = (Object)$d;
        $start_date = $request->start_date;
        $end_date = date('Y-m-d', strtotime("+".$d->duration, strtotime( $start_date )));

        DB::table('franchise_service_item')->where('id', $request->service_id )->update([
            'start_date'    =>  $start_date,
             'end_date'    =>  $end_date 
             ]);

            $msg = 'SUCCESS';

    }else{
            $msg = 'NOT';
    }



    return $this->respond([



        'data' => compact('msg'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Sales Invoice Inserted Successfully.'



    ]);



}

public function franchise_consumption_outgoing(Request $request){
    $request = (Object)$request;
    

    $unit = DB::table('franchise_purchase_initial_stocks')->where('id' ,$request['stock_id'])->first();

    $items = DB::table('assumption_stock_item')

    ->join('assumption_stock','assumption_stock.id','=','assumption_stock_item.assumption_stock_id')

    ->leftJoin('users','assumption_stock.created_by','=','users.id')

    ->where('assumption_stock_item.uom_id',$request['stock_id'])

    ->where('assumption_stock_item.franchise_id',$request['franchise_id'])

    ->select('assumption_stock_item.*','assumption_stock.date_created','assumption_stock.issue_to','assumption_stock.purpose','users.first_name')

    ->groupBy('assumption_stock_item.id')
    ->orderBy('assumption_stock_item.id','DESC')

    ->get();



    return $this->respond([



        'data' => compact('items', 'unit'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Sales Invoice Inserted Successfully.'



    ]);



}







public function franchise_jobcard_outgoing(Request $request){
    $request = (Object)$request;
    
    $location_id = DB::table('franchises')->where('id',$request['franchise_id'])->first()->location_id;

    $unit = DB::table('franchise_purchase_initial_stocks')->where('id' ,$request['stock_id'])->first();

    $q = DB::table('customer_job_card_raw_material')

    ->join('users','customer_job_card_raw_material.created_by','=','users.id');


            $q->join('customer_job_card', function($join) use ($location_id)  {
               $join->on('customer_job_card_raw_material.jc_id', '=', 'customer_job_card.id')
                   ->where('customer_job_card.location_id', '=',$location_id );
           });



     $items = $q->where('customer_job_card_raw_material.stock_id',$request['stock_id'])
    ->select('customer_job_card_raw_material.*','customer_job_card.customer_id','users.first_name')
    ->groupBy('customer_job_card_raw_material.id')
    ->orderBy('customer_job_card_raw_material.id','DESC')
    ->get();



    return $this->respond([



        'data' => compact('items', 'unit'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Sales Successfully.'



    ]);



}



public function updateService(Request $request){
         $itemlist = (Array)$request['itemlist'];
          $data = (Object)$request['data'];

       $lead = DB::table('master_franchise_service')->where('id',$data->id)->update([

            'created_date' => date('Y-m-d'),
    
            'created_by' => $data->login_id,
    
            'category' => $data->category,
    
            'service_name' => isset($data->service_name) ? $data->service_name : '',
    
            'gst' => isset($data->gst) ? $data->gst :'' ,
    
            'sac' => isset($data->sac) ? $data->sac :'' 
    
    
        ]);
    
    

          foreach ($itemlist as $key => $row) {
            $row = (Object)$row;
            
            if( !isset($row->id)  ){

                       DB::table('master_franchise_service_durations')->insert([
                
                            'created_date' => date('Y-m-d'),
                
                             'created_by' => $data->login_id,
                
                            'service_id' => $data->id,
                
                            'value_of_duration' => isset($row->value_of_duration) ? $row->value_of_duration : '',

                            'unit_of_duration' => isset($row->unit_of_duration) ? $row->unit_of_duration : '',

                            'price' => isset($row->price) ? $row->price : '',

                            'description' => isset($row->description) ? $row->description : ''
                
                        ]);

            }

          }
          


    }

public function cancel_consumption(Request $req)
{


        DB::table('assumption_stock')->where('id',$req['id'])->update( ['del' => '2'] );
        $stock =   DB::table('assumption_stock_item')->where('assumption_stock_id',$req['id'])->get();

        foreach ($stock as $key => $value) {
            $value = (Object)$value;

            $stock =   DB::table('franchise_purchase_initial_stocks')

            ->where('category',$value->category )
            ->where('brand',$value->brand )
            ->where('product',$value->product )
            ->where('unit_measurement',$value->uom )
            ->where('franchise_id',$value->franchise_id )
            ->increment('current_stock',$value->qty );

            DB::table('assumption_stock_item')->where('id',$value->id )->update( ['del' => '2'] );


           
        }
    }


public function cancel_consumption_company(Request $req)
{


        DB::table('assumption_stock')->where('id',$req['id'])->update( ['del' => '2'] );
        $stock =   DB::table('assumption_stock_item')->where('assumption_stock_id',$req['id'])->get();

        foreach ($stock as $key => $value) {
            $value = (Object)$value;

            $stock =   DB::table('master_product_measurement_prices')

            ->where('id',$value->uom_id )
            ->increment('sale_qty',$value->qty );

            DB::table('assumption_stock_item')->where('id',$value->id )->update( ['del' => '2'] );


           
        }
}

public function removeVisitData(Request $request)
{
    DB::table('master_franchise_service_durations')->where('id', $request['id'])->update(['del' => '1']);
}

public function removeProduct(Request $request)
{
    DB::table('master_franchise_service')->where('id', $request['p_id'])->update(['del' => '1']);

    DB::table('master_franchise_service_durations')->where('service_id', $request['p_id'])->update(['del' => '1']);

}



}

