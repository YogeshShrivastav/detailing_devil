<?php







namespace App\Http\Controllers\Admin;







use Acme\Repositories\Franchises\FranchisesRepo;



use App\Http\Controllers\ApiController;



use Illuminate\Http\Request;



use Illuminate\Support\Facades\Hash;

use DB;





class FranchisesController extends ApiController



{



  protected $franchises_repo;



  public function __construct(FranchisesRepo $franchises_repo)



  {



    $this->franchises_repo = $franchises_repo;



  }







  public function getFranchises(Request $request)



  {



    $perPage = 20;



    $search = $request->s;



    $source = $request->source;

    $login = (object)$request['login'];



    $leads = $this->franchises_repo->get_franchise($perPage, $search, $source, $login, $request);



    foreach ($leads as $key => $value) {
      

      $consumer_lead = DB::table('consumers')

      ->where('franchise_id', $value->id )
      ->where('type', '1' )
      ->where('status', 'A' )
      ->count();


      $consumer = DB::table('consumers')

      ->where('franchise_id', $value->id )
      ->where('type', '2' )
      ->where('status', 'A' )
      ->count();


    $leads[ $key ]->consumer_lead = $consumer_lead; 
    $leads[ $key ]->consumer = $consumer; 
    }



    // $d = compact( $leads );
    // dd($d);

  //   foreach ($leads as $key => $value) {


  
  //     $lead = DB::table('consumers')->where('franchise_id', $value['attributes']['id'] )->count();

      
  // dd(  $leads[$key]['attributes']['leads'] = 9 );


  //   }
    $locations = $this->franchises_repo->get_franchise_location($login);



    return $this->respond([



      'data' => compact('leads','locations'),



      'status' => 'success',



      'status_code' => $this->getStatusCode(),



      'message' => 'Lead\'s Get Successfully for edit.'



    ]);



  }



public function getFranchLoc(Request $request){
$login = (Object) $request['login'];
  $franchise = $this->franchises_repo->get_franchise_location($login);

  
  return $this->respond( compact('franchise') );

  
}

  public function getsales(Request $request)



  {

    // $login = (object)$request['login'];



    $d = DB::table('users');

    $d->where('access_level', 3);

    $sales = $d->get();





    return $this->respond([



      'data' => compact('sales'),



      'status' => 'success',



      'status_code' => $this->getStatusCode(),



      'message' => 'Lead\'s Get Successfully for edit.'



    ]);



  }





  

  public function updateSales(Request $request)

  {



    $d = DB::table('franchises');

    $d->where('id', $request['id'])

    ->update( ['company_sales_agent' => $request['company_sales_agent'] ] );









  }





  public function check_email(Request $request)
  {
    print_r($request->all());
    exit;
  }





  public function add(Request $request) 
  {
    $data = (object)$request['tmp'];

    if(!$data->edit_franchise_id)
    {
      $exist = DB::table('franchises')->where('email_id' ,'=',$data->email )->first();
      $prefix_exist = DB::table('franchises')->where('pre_fix' ,'=',$data->pre_fix )->first();
     
      // print_r($data);
      // print_r($prefix_exist);
      // exit;
      if(!$exist && !$prefix_exist){

        $lead = DB::table('franchises')->insert([

          'created_at' => date('Y-m-d H:i:s'),

          'name' => $data->name,

          'contact_no' => $data->contact_no,

          'email_id' => $data->email,

          'name2' => $data->name2,

          'contact_no2' => $data->contact_no2,

          'email2' => $data->email2,

          'address' =>  $data->address,

          'state' =>  $data->state,

          'district' =>  $data->district,

          'city' =>  $data->city,

          'pincode' =>  $data->pincode,

          'country_id' =>  $data->country_id,

          'location_id' =>  $data->location_id,

          'company_name' =>  $data->company_name,

          'business_type' =>  $data->business_type,

          'business_loc' =>  $data->business_loc,

          'year_of_est' =>  $data->year_of_est,

          'pre_fix'    =>   $data->pre_fix,

          'associated_date' =>  $data->associated_date,

          'city_apply_for' =>  $data->city_apply_for,

          'automotive_exp' =>  $data->automotive_exp,

          'type' =>  $data->type,

          'bank_name' =>  $data->bank_name,

          'company_name_in_bank' =>  $data->company_name_in_bank,

          'account_no' =>  $data->account_no,

          'account_type' =>  $data->account_type,

          'ifsc_code' =>  $data->ifsc_code,

          'branch_name' =>  $data->branch_name,

          'bank_address' =>  $data->bank_address,

          'cors_country_id' =>  $data->cors_country_id,

          'cors_state' =>  $data->cors_state,

          'cors_district' =>  $data->cors_district,

          'cors_city' =>  $data->cors_city,

          'cors_pincode' =>  $data->cors_pincode,

          'cors_address' =>  $data->cors_address,

          'ship_country_id' =>  $data->ship_country_id,

          'ship_state' =>  $data->ship_state,

          'ship_district' =>  $data->ship_district,

          'ship_city' =>  $data->ship_city,

          'ship_pincode' =>  $data->ship_pincode,

          'ship_address' =>  $data->ship_address,

          'constitution' =>  $data->constitution,

          'company_pan_no' =>  $data->company_pan_no,

          'company_gstin' =>  $data->company_gstin,

          'training_start' =>  $data->training_start,

          'training_end' =>  $data->training_end,

          'aadhaar_no' => $data->aadhaar_no,

          'status' => 'A'

        ]);

        $franchise_id = DB::getPdo()->lastInsertId();

        if($franchise_id)
        {
          DB::table('locations')->where('id', $data->location_id)->where('del', '0')->update(['assign_to_franchise' => $franchise_id]);
        }

        $p =  'devil'.$franchise_id;

        $u =  'Detailing'.rand(0000,9999);

        DB::table('users')->insert( [

          'created_at' => date('Y-m-d'),

          'created_by' => '1',

          'username' => $u,

          'email' => $data->email2,

          'password' => Hash::make($p),

          'visible_password' => $p,

          'first_name' =>$data->name,

          'phone' => $data->contact_no,

          'address' =>$data->address,

          'location_id' => $data->location_id,

          'franchise_id' => $franchise_id,

          'is_active' => 1,

          'access_level' => 5
        ]);

        $msg = 'Success';

      }
      else if($prefix_exist)
      {
        $msg = 'Prefix Exist'; 
      }
      else if($exist)
      {
        $msg = 'Exist'; 
      }
    }
    else
    {
      $exist = DB::table('franchises')->where('email_id' ,'=',$data->email )->where('id', '!=', $data->edit_franchise_id )->first();

      $prefix_exist = DB::table('franchises')->where('pre_fix' ,'=',$data->pre_fix )->where('id', '!=', $data->edit_franchise_id )->first();

      if(!$exist && !$prefix_exist)
      {
        $inv_prefix_exist = DB::table('franchises')->where('pre_fix' , $data->pre_fix )->where('id',  $data->edit_franchise_id )->first();

        if( !$inv_prefix_exist )
        {
          $prefix_edit = DB::table('customer_job_card_invoice')->where('franchise_id' ,$data->edit_franchise_id )->get();
          foreach ($prefix_edit as $key => $value) 
          {
            $tags = explode('/',$value->prefix);
            $new_prefix = $data->pre_fix .'/'. $tags[1];
            $new_invoice = $new_prefix .'/'. $value->invoice_series;
            DB::table('customer_job_card_invoice')->where('id', $value->id)->update([
              'prefix' => $new_prefix,
              'invoice_id' => $new_invoice
            ]);
          }
        }

        DB::table('franchises')->where('id', $data->edit_franchise_id )->update([

          'name' => $data->name,

          'contact_no' => $data->contact_no,

          'email_id' => $data->email,

          'name2' => $data->name2,

          'contact_no2' => $data->contact_no2,

          'email2' => $data->email2,

          'address' =>  $data->address,

          'state' =>  $data->state,

          'district' =>  $data->district,

          'city' =>  $data->city,

          'pincode' =>  $data->pincode,

          'country_id' =>  $data->country_id,

          'location_id' =>  $data->location_id,

          'company_name' =>  $data->company_name,

          'business_type' =>  $data->business_type,

          'business_loc' =>  $data->business_loc,

          'year_of_est' =>  $data->year_of_est,

          'pre_fix'    => $data->pre_fix,

          'associated_date' =>  $data->associated_date,

          'city_apply_for' =>  $data->city_apply_for,

          'automotive_exp' =>  $data->automotive_exp,

          'type' =>  $data->type,

          'bank_name' =>  $data->bank_name,

          'company_name_in_bank' =>  $data->company_name_in_bank,

          'account_no' =>  $data->account_no,

          'account_type' =>  $data->account_type,

          'ifsc_code' =>  $data->ifsc_code,

          'branch_name' =>  $data->branch_name,

          'bank_address' =>  $data->bank_address,

          'cors_country_id' =>  $data->cors_country_id,

          'cors_state' =>  $data->cors_state,

          'cors_district' =>  $data->cors_district,

          'cors_city' =>  $data->cors_city,

          'cors_pincode' =>  $data->cors_pincode,

          'cors_address' =>  $data->cors_address,

          'ship_country_id' =>  $data->ship_country_id,

          'ship_state' =>  $data->ship_state,

          'ship_district' =>  $data->ship_district,

          'ship_city' =>  $data->ship_city,

          'ship_pincode' =>  $data->ship_pincode,

          'ship_address' =>  $data->ship_address,

          'constitution' =>  $data->constitution,

          'company_pan_no' =>  $data->company_pan_no,

          'company_gstin' =>  $data->company_gstin,

          'training_start' =>  $data->training_start,

          'training_end' =>  $data->training_end,

          'aadhaar_no' => $data->aadhaar_no

          ]);

          DB::table('locations')->where('id', $data->location_id)->where('del', '0')->update(['assign_to_franchise' => $data->edit_franchise_id]);

          DB::table('users')->where('franchise_id', $data->edit_franchise_id )->where('access_level', 5 )->update([
        'email' => $data->email2,
        'first_name' =>$data->name,
        'phone' => $data->contact_no,
        'address' =>$data->address,
        'location_id' => $data->location_id
      ]);
      $franchise_id = $data->edit_franchise_id;
      $msg = 'Success';

    }
    else if($prefix_exist)
    {
      $msg ='Prefix Exist';
    }
    else if($exist)
    {
      $msg = 'Exist'; 
    }
  }


    $prefix_edit = ( isset($prefix_edit) && $prefix_edit ) ?  sizeof($prefix_edit) : 0 ;

    return $this->respond([
    'data' => compact('franchise_id','msg','prefix_edit'),
    'status' => 'success',
    'status_code' => $this->getStatusCode(),
    'message' => 'Lead\'s Get Successfully for edit.'
    ]);
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





public function get_rol(Request $requset) {



  $role = DB::table('roles');







  if($requset['franchise_id']){



    $role->where('role_type', '=' , '1');

    $role->where('id','!=', '5');



  }else{

    $role->where('role_type', '0');



    // $role->where('id','!=', '1');

  }



  $roles = $role->get();



  return $this->respond([



    'data' => compact('roles'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'roles\'s Get Successfully.'



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



    'data' => compact('data','plans','accessories'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Lead\'s Get Successfully for edit.'



  ]);



}











public function get_franchise_plan_stock( $id ) {



  $plans = DB::table('master_franchise_plans')->where('id', $id)->first();

  // $accessories = DB::table('master_franchise_accessories')->where('franchise_plan_id', $id)->where('status' ,'A')->select('accessories_name')->get();

  $stock = DB::table('master_franchise_initial_stocks as x1')

  ->join('master_product_measurement_prices as x2','x2.id','=','x1.uom_id')

  ->join('master_products as x3','x3.id','=','x2.product_id')

  ->where('x1.franchise_plan_id', $id)

  ->select('x1.*','x2.sale_price','x2.sale_qty','x2.description','x2.stock_total','gst')

  ->groupBy('x2.id')

  ->get();







  return $this->respond([



    'data' => compact('stock','plans'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Lead\'s Get Successfully for edit.'



  ]);



}













public function get_franchises_stock( $id ) {



  $brand = DB::table('franchise_purchase_initial_stocks')->where('franchise_id', $id)->groupBy('brand')->get();



  $data = [];

  foreach ($brand as $key => $value) {



    $product = DB::table('franchise_purchase_initial_stocks')->where('franchise_id', $id)->where('brand', $value->brand )->groupBy('product')->get();





    foreach ($product as $key2 => $value2) {

      $temp = [];



      $stock = DB::table('franchise_purchase_initial_stocks')->where('franchise_id', $id)->where('brand', $value->brand )->where('product', $value2->product )->get();

                  // $value2->stock= $stock;



      array_push($temp, $stock);

      array_push($temp, $value2);

      array_push($data, $temp);

    }

  }









  return $this->respond([



    'data' => compact('data'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Lead\'s Get Successfully for edit.'



  ]);





}











public function locations($request) {



                //$l = DB::table('locations')->where('country_id',$request)->orderBy('location_name','ASC')->get();

  $l = DB::table('locations')

  ->where('country_id',$request)

  ->where('del', 0)

  ->where('assign_to_franchise', 0)

  ->orderBy('location_name','ASC')

  ->get();



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





  $sales = DB::table('franchise_assign_sales_agent')->where('franchise_assign_sales_agent.isDeactive', '=','0')->where('franchise_id', $l_id)->get();

  $remarks = DB::table('franchise_Sales_assign_remark')->join('users','franchise_Sales_assign_remark.created_by','=','users.id')->leftJoin('franchise_assign_sales_agent','franchise_Sales_assign_remark.id','=','franchise_assign_sales_agent.remark_id')->where('franchise_Sales_assign_remark.franchise_id', $l_id)->select('franchise_Sales_assign_remark.*', DB::raw('group_concat( franchise_assign_sales_agent.sales_agent_id ) as agents'),'franchise_assign_sales_agent.id as assign_sales','users.first_name')->groupBy('franchise_Sales_assign_remark.id')->orderBy('franchise_Sales_assign_remark.id','DESC')->get();



                    // $sal = 

  foreach ($remarks as $key => $value1) {

    $sale_agent  = explode(',', $value1->agents );

    $a = [];

    foreach ($sale_agent as $key2 => $value) {



      $users = DB::table('users')->where('id', $value)->first();

      if($users)array_push($a, $users->first_name );



    }

    $b = implode(',' ,$a );

    $remarks[$key]->assign_sales =  $b;

  }

  $agent_assign = [];

  foreach ($sales as $key => $value) {

    array_push($agent_assign, $value->sales_agent_id );

  }



  $invoice = DB::table('franchise_invoice')

  ->join('users','franchise_invoice.created_by','=','users.id')

  ->where('franchise_invoice.franchise_id',$l_id)

  ->select('franchise_invoice.*','users.first_name as created_name')

  ->first();



  $franchise_plan = DB::table('franchise_purchase_plan')

  ->where('franchise_purchase_plan.franchise_id',$l_id)

  ->select('franchise_purchase_plan.*')

  ->first();





  return response()->json(  array('frchise' => $frchise, 'agent_assign' => $agent_assign, 'remarks' => $remarks, 'invoice' => $invoice, 'franchise_plan' => $franchise_plan  ) );



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





public function followups($l_id) {

  $followups = DB::table('consumers')->where('franchise_id', $l_id)->get();

  return response()->json(compact('followups'));

}



public function franch_consumers(Request $request , $l_id) {
//

$perPage = 20;
  $login = (object)$request->login;
  $search = (Object)$request['filter'];




  $c = DB::table('consumers');

  $c->join('users','consumers.created_by', '=','users.id');
  

  if($login->access_level == 6 )

    $c->where('consumers.franchise_sales_manager_assign', $login->id);



  $c->where('consumers.franchise_id', $l_id);

  $c->where('consumers.type', 1);

  $c->where('consumers.status', 'A');


  if(isset($search->master) && $search->master != '') {
    $s = $search->master;
    $c ->where(function ($query) use ($s ) {
            $query->where('consumers.first_name','LIKE','%'.$s.'%')
                ->orWhere('consumers.last_name','LIKE','%'.$s.'%')
                ->orWhere('consumers.phone','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%');

        });
    }

        
    if(isset($search->date) && $search->date != '') {
      $s = $search->date;
      $c ->where(function ($query) use ($s ) {
            $query->where('consumers.created_at','LIKE','%'.$s.'%');
             
        });
      }

      if(isset($search->source) && $search->source != '') $c->where('consumers.source','LIKE','%'.$search->source.'%');
      if(isset($search->lead_status) && $search->lead_status != '')  $c->where('consumers.lead_status','LIKE','%'.$search->lead_status.'%');
      if(isset($search->vehicle_type) && $search->vehicle_type != '')  $c->where('consumers.vehicle_type','LIKE','%'.$search->vehicle_type.'%');
      if(isset($search->interested_in) && $search->interested_in != '')  $c->where('consumers.interested_in','LIKE','%'.$search->interested_in.'%');


  $c->select('consumers.*','users.first_name as created_name');

  $c->groupBy('consumers.id');
  $c->orderBy('consumers.updated_at','Desc');

  $consumers = $c->paginate($perPage);



  return response()->json(compact('consumers'));

}



public function franchises_consumers(Request $request, $l_id) {

$perPage = 20;

$search = (Object)$request['filter'];

  $f = DB::table('franchises')->where('id', $l_id)->first();

  $c = DB::table('consumers');

  $c->join('users','consumers.created_by', '=','users.id')


  ->where('consumers.franchise_id', $l_id)

  ->where('consumers.type', 2)->where('status', 'A');


  if(isset($search->master) && $search->master != '') {
    $s = $search->master;
    $c ->where(function ($query) use ($s ) {
            $query->where('consumers.first_name','LIKE','%'.$s.'%')
                ->orWhere('consumers.last_name','LIKE','%'.$s.'%')
                ->orWhere('consumers.phone','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%');

        });
    }

        
    if(isset($search->date) && $search->date != '') {
      $s = $search->date;
      $c ->where(function ($query) use ($s ) {
            $query->where('consumers.created_at','LIKE','%'.$s.'%');
             
        });
      }

      if(isset($search->source) && $search->source != '') $c->where('consumers.source','LIKE','%'.$search->source.'%');
      if(isset($search->lead_status) && $search->lead_status != '')  $c->where('consumers.lead_status','LIKE','%'.$search->lead_status.'%');
      if(isset($search->vehicle_type) && $search->vehicle_type != '')  $c->where('consumers.vehicle_type','LIKE','%'.$search->vehicle_type.'%');
      if(isset($search->interested_in) && $search->interested_in != '')  $c->where('consumers.interested_in','LIKE','%'.$search->interested_in.'%');



      $c->select('consumers.*','users.first_name as created_name');

      $c->groupBy('consumers.id');
      $c->orderBy('consumers.updated_at','Desc');
    
      $consumers = $c->paginate($perPage);

  return response()->json(compact('consumers'));

}





public function franch_name($l_id) {

  $franchisenam = DB::table('franchises')->where('id', $l_id)->first();

  return response()->json(compact('franchisenam'));

}



public function consumer_name($l_id) {

  $Consumernam = DB::table('consumers')->where('id', $l_id)->first();

  return response()->json(compact('Consumernam'));

}

public function get_brand(Request $request) {

  $brands = DB::table('master_products')->where('status', 'A')->groupBy('brand_name')->get();

  return response()->json(compact('brands'));

}



public function get_products(Request $request) {

  $products = DB::table('master_products')->where('status', 'A')->where('brand_name',$request->brand)->where('category',$request->category)->groupBy('product_name')->get();

  return response()->json(compact('products'));

}



public function units(Request $request) {

  $units = DB::table('master_product_measurement_prices')->where('status', 'A')->where('product_id',$request->product_id)->get();



  $attributeList = DB::table('master_product_attr_types')->where('status', 'A')->where('attr_type', '!=' ,'')->where('product_id', $request->product_id)->get();



  foreach ($attributeList as $key => $row) {



   $attributeOptionList = DB::table('master_product_attr_options')->where('status', 'A')->where('attr_option', '!=' ,'')->where('attr_type_id', $row->id)->get();



   $attributeList[$key]->optionList = $attributeOptionList;

 }









 return $this->respond([



  'data' => compact('units', 'attributeList'),



  'status' => 'success',



  'status_code' => $this->getStatusCode(),



  'message' => 'Measurement List Get Successfully.'

]);









}





public function validate_customer(Request $request){

  $f = DB::table('franchises')->where('id', $request->franchise_id)->first();

  $isExist = false;

  $consumers = DB::table('consumers')->where('status', 'A')->where('location_id', $f->location_id)->where('phone',$request->mobile)->first();                           if($consumers){

    $isExist = true;

  }

  return response()->json(compact('consumers','isExist'));

}





public function getDetail(Request $request){

  $isExist = false;



  $consumer = DB::table('consumers')->where('id', $request['lead_id'])->first();

                                // dd( $consumer);

  if($consumer){

   $isExist = true;

 }



 $vehicles_info = DB::table('customer_job_card')->where('customer_id', $request['lead_id'])->select('vehicle_type','category_type','regn_no','model_no','color','year','chasis_no','make','technician','vehicle_condition')->groupBy('regn_no')->orderBy('id','Desc')->get();



 $isFExist = false;



 $f_detail = DB::table('customer_job_card_preventive_measures')->where('id', $request['f_id'])->first();

 if($f_detail){

  $isFExist = true;

}





return response()->json(compact('consumer','isExist','f_detail','isFExist','vehicles_info' ));

}


public function franchise_saleinvoice(Request $request) 
{

    $per_page = 20;

    $filter = (Object)$request['filter'];


  $so = DB::table('sales_invoice')

  ->leftJoin('users', 'users.id', '=', 'sales_invoice.created_by')

  ->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id')

  ->where('sales_invoice.franchise_id' ,$request['franchise_id'])

  ->where('sales_invoice.del' ,'0');

 if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s) {
                $query->where('sales_invoice.invoice_id','LIKE','%'.$s.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('sales_invoice.payment_status','LIKE','%'.$filter->status.'%');

  $so->select('sales_invoice.*', 'franchises.name','users.first_name as created_name')->orderBy('sales_invoice.id','Desc')->groupBy('sales_invoice.id');
        

 $salesInvoiceList= $so->paginate($per_page);


  foreach ($salesInvoiceList as $key => $row) {


    $itemList =  DB::table('sales_invoice_item')->where('sales_invoice_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();

    $salesInvoiceList[$key]->totalItem = $itemList->totalItem;

  }

  return $this->respond([

    'data' => compact('salesInvoiceList'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Invoice List Successfully'

  ]);

}





public function franch_saleorders(Request $request) 

{

 $per_page = 20;

 $filter = (Object)$request['filter'];



  $so = DB::table('sales_order')

   ->leftJoin('users', 'users.id', '=', 'sales_order.created_by')

  ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')

  ->where('sales_order.franchise_id' ,$request['franchise_id'])

  ->where('sales_order.del' ,'0');

  if(isset($filter->search) && $filter->search != '') {
                $s = $filter->search;
                $so->where(function ($query) use ($s ) {
                    $query->where('sales_order.order_id','LIKE','%'.$s.'%');
            });
        }

  if(isset($filter->date) && $filter->date != '') $so->where('sales_order.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('sales_order.order_status','LIKE','%'.$filter->status.'%');



  $so->select('sales_order.*', 'franchises.name','users.first_name as created_name')

  ->orderBy('sales_order.id','Desc')

   ->groupBy('sales_order.id');


 $salesOrderList= $so->paginate($per_page);


  foreach ($salesOrderList as $key => $row) {

    $itemList =  DB::table('sales_order_item')->where('sales_order_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();
    $salesOrderList[$key]->totalItem = $itemList->totalItem;

  }

  return $this->respond([

    'data' => compact('salesOrderList'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Order List Successfully'

  ]);

}




public function franchise_payment(Request $request)
 {

         $per_page = 20;


        $filter = (Object)$request['filter'];




        $so = DB::table('sales_invoice_payment')

        ->where('sales_invoice_payment.del', '0')

        ->where('sales_invoice_payment.franchise_id', $request['franchise_id']);

         if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s ) {
                $query->where('sales_invoice_payment.invoice_id','LIKE','%'.$s.'%');
                
                
            });
        }

if(isset($filter->date) && $filter->date != '') $so->where('sales_invoice_payment.date_created','LIKE','%'.$filter->date.'%');
if(isset($filter->mode) && $filter->mode != '') $so->where('sales_invoice_payment.mode','LIKE','%'.$filter->mode.'%');


        $so->select('sales_invoice_payment.*')

           ->orderBy('sales_invoice_payment.id','Desc');

        $payment= $so->paginate($per_page);



  return $this->respond([



    'data' => compact('payment'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Payment Detail Fetched Successfully.'



  ]);

}





public function franchise_jobcards( Request $request )

{

   $per_page = 20;

   $filter = (Object)$request['filter'];




  $location_id = DB::table('franchises')

  ->where('franchises.id', $request['franchise_id'])->first();



  $so = DB::table('customer_job_card')

  ->leftJoin('users', 'customer_job_card.created_by', '=', 'users.id')

  ->leftJoin('customer_job_card_invoice', 'customer_job_card_invoice.jc_id', '=', 'customer_job_card.id')

  ->leftJoin('consumers', 'customer_job_card.customer_id', '=', 'consumers.id')

  ->where('customer_job_card.location_id', $location_id->location_id)

  ->where('customer_job_card.del', '0');


   if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s ) {
                $query->where('customer_job_card.name','LIKE','%'.$s.'%')
                ->orWhere('consumers.first_name','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card.regn_no','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card_invoice.invoice_id','LIKE','%'.$s.'%');

            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('customer_job_card.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('customer_job_card.status','LIKE','%'.$filter->status.'%');

        
 $so->select('customer_job_card.id','customer_job_card.customer_id','customer_job_card.vehicle_type','customer_job_card.model_no','customer_job_card.regn_no','customer_job_card.status','customer_job_card.date_created','users.first_name as created_name','consumers.first_name as customer_name','customer_job_card_invoice.id as invoice_id','customer_job_card_invoice.invoice_id as prfx_invoice_id')

  ->groupBy('customer_job_card.id')

  ->orderBy('customer_job_card.id','DESC');


  $jobsc  = $so->paginate($per_page);


return $this->respond([



        'data' => compact('jobsc'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Order\'s List Get Successfully.'



        ]);
}



public function addstock(Request $request)

{

  $product_item = (object)$request['addProduct'];



  $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $product_item->category)->where('brand', $product_item->brand)->where('product', $product_item->product)->where('unit_measurement', $product_item->unit_measurement)->where('franchise_id',$request['franchise_id'])->first();



  if($exist_porduct){

    $exist_porduct = DB::table('franchise_purchase_initial_stocks')->where('category', $product_item->category)->where('brand', $product_item->brand)->where('product', $product_item->product)->where('unit_measurement', $product_item->unit_measurement)->where('franchise_id',$request['franchise_id'])->increment('current_stock',$product_item->quantity);



  }else{

    $lead = DB::table('franchise_purchase_initial_stocks')->insert([

      'date_created' => date('Y-m-d'),

      'created_by' =>  $request['login_id'],

      'franchise_id' => $request['franchise_id'],

      'category' => $product_item->category,

      'brand' => $product_item->brand,

      'product' => $product_item->product,

      'hsn_code' => $product_item->hsn_code,

      'unit_measurement' => $product_item->unit_measurement,

      'attribute_type' => $product_item->attribute_type,

      'attribute_option' => $product_item->attribute_option,

      'quantity' => $product_item->quantity,

      'current_stock' => $product_item->quantity,

    ]);

  }



  DB::table('master_product_measurement_prices')->where('product_id', $product_item->product_id)->where('unit_of_measurement', $product_item->unit_measurement)->decrement('sale_qty',$product_item->quantity);

}





public function addIntialStock( Request $requset , $franchise_purchase_plan_id = 0 )

{



  $login_id = $requset['login_id'];

  $franchise_id = $requset['franchise_id'];

  $plan_id = 0;



  if($requset['isPlanSelected']){

    $plan_data = (object)$requset['plan_data'];

    $plan_id =  $plan_data->id;



  }



  foreach ($requset['stock'] as $key => $prod) {

    $prod_object = (object)$prod[1];



    foreach ($prod[0] as $key => $value) {

      $value = (object)$value;



      DB::table('master_product_measurement_prices')->where('product_id', $value->product)->where('unit_of_measurement', $value->unit_measurement)->decrement('sale_qty',$value->quantity);



      $lead = DB::table('franchise_purchase_initial_stocks')->insert([

        'date_created' => date('Y-m-d'),

        'created_by' =>  $login_id,

        'franchise_id' => $franchise_id,

        'franchise_plans_id' => $plan_id,

        'franchise_purchase_plan_id' => $franchise_purchase_plan_id,

        'category' => $prod_object->category,

        'brand' => $prod_object->brand,

        'products_id' => $value->product,

        'product' => $prod_object->product,

        'hsn_code' => $prod_object->hsn_code,

        'unit_measurement' => $value->unit_measurement,

        'attribute_type' => $value->attribute_type,

        'attribute_option' => $value->attribute_option,

        'quantity' => $value->quantity,

        'current_stock' => $value->quantity,

      ]);

    }

  }







}









public function addIntialStockWithPlan( Request $requset )

{

  $plan_data = '';

  $login_id = $requset['login_id'];

  $franchise_id = $requset['franchise_id'];

  $franchise_purchase_plan_id = 0;



  if($requset['isPlanSelected']){

    $plan_data = (object)$requset['plan_data'];





    $lead = DB::table('franchise_purchase_plan')->insert([

      'date_created' => date('Y-m-d'),

      'created_by' =>  $login_id,

      'franchise_id' => $franchise_id,

      'franchise_plan_id' => $plan_data->id,

      'plan' => $plan_data->plan,

      'description' => $plan_data->description,

      'price' => $plan_data->price,

    ]);

    $franchise_purchase_plan_id = DB::getPdo()->lastInsertId();



    // foreach ($requset['accessories'] as $key => $value) {

    //   $value = (object)$value;

    //   $lead = DB::table('franchise_accessories')->insert([

    //     'date_created' => date('Y-m-d'),

    //     'created_by' =>  $login_id,

    //     'franchise_id' => $franchise_id,

    //     'franchise_plan_id' => $plan_data->id,

    //     'franchise_purchase_plan_id' => $franchise_purchase_plan_id,

    //     'plan' => $plan_data->plan,

    //     'accessories_name' => $value->accessories_name,

    //   ]);

    // }





  }



  $this->addIntialStock( $requset, $franchise_purchase_plan_id);

}





public function convertLeadtoFranchise(Request $requset ){

  $this->addIntialStockWithPlan( $requset );



  $f_id = $requset['franchise_id'];

  $this->franchiseLoginCreate($f_id );

  return response()->json(compact('f_id'));

}



public function franchiseLoginCreate($id ){

  $f = DB::table('franchises')->where('id', $id )->update(['type'=>2]);

  $d = DB::table('franchises')->where('id', $id )->first();

  $u =  'Detailing'.rand(0000,9999);

  if($d->email_id)
  {
   $emil = $d->email_id;
  }else{
  $emil = $u;
  }

  $p =  'devil'.$id ;

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
}







public function saveUser(Request $request)

{

  $user = (object)$request['user'];

  $msg = '';

  $e_user = DB::table('users')->where('email', $user->email )->select('id')->first();

  if(!$e_user){



    $p =  'Detailing'.rand(0000,9999);



    $d = DB::table('users')->insert([



      'email' => $user->email,

      'password' => Hash::make($p),

      'visible_password' => $p,

      'first_name' => $user->first_name,

      'phone' => $user->phone,

      'address' => $user->address,

      'access_level' => $user->role,

      'created_at' => date('Y-m-d'),

      'created_by' =>  $user->login_id,

      'franchise_id' => $user->franchise_id,

      'location_id' => $user->location_id,

      'is_active' => 1,



    ]);



    $msg = 'Success';



  }else{

    $msg = 'Exist';



  }



  return $this->respond([



    'data' => compact('msg'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Payment Detail Fetched Successfully.'



  ]);



}





public function usersList(Request $request ){

  $per_page = 20;

  $user = (object)$request['user'];
  $filter = (object)$request['filter'];

  $login = (object)$request['login'];



  $u = DB::table('users');

  $u->join('roles','roles.id','=','users.access_level');

  $u->leftJoin('users as created','created.id','=','users.created_by');

  $u->leftJoin('franchises as franchise_created','franchise_created.id','=','users.franchise_id');



  if($user->franchise_id)$u->where('users.franchise_id', $user->franchise_id );
  if(isset($filter->access_level) && $filter->access_level)$u->where('users.access_level', $filter->access_level );

  

  $u->where('users.is_active', 1 );


  if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $u->where(function ($query) use ($s ) {
                $query->where('users.first_name','LIKE','%'.$s.'%')
                ->orWhere('users.email','LIKE','%'.$s.'%')
                ->orWhere('users.phone','LIKE','%'.$s.'%');

            });
        }

  // if($user->s)$u->where('users.first_name','LIKE', ''.$user->s.'%' );

  // if($user->s)$u->orWhere('users.phone','LIKE', ''.$user->s.'%' );

  if(isset($filter->date) && $filter->date != '') $u->where('users.created_at','LIKE','%'.$filter->date.'%');



  $u->select('users.*','created.first_name as created_name','franchise_created.name as franchise_created_name','roles.role_name');

  // $users = $u->get($user->franchise_id);

   $users= $u->paginate($per_page);




  return response()->json(compact('users'));

}






public function roles(Request $request ){

 
  $u = DB::table('roles');

  if(isset($request['franchise_id']) && $request['franchise_id'])$u->where('type', '1');

  $roles = $u->get();

  return response()->json(compact('roles'));





}











public function updateUser(Request $request)

{

  $user = (object)$request['user'];



  $msg = '';

  $e_user = DB::table('users')->where('email', $user->email )->where('id', '!=',$user->id )->select('id')->first();

  if(!$e_user){





    $d = DB::table('users')->where('id',$user->id)->update([



      'password' => Hash::make($user->visible_password),

      'visible_password' => $user->visible_password,

      'first_name' => $user->first_name,

      'email' => $user->email,

      'phone' => $user->phone,

      'address' => $user->address,

      'updated_at' => date('Y-m-d'),



    ]);



    $msg = 'Success';



  }else{

    $msg = 'Exist';

  }



  return $this->respond([



    'data' => compact('msg'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Payment Detail Fetched Successfully.'



  ]);



}



public function getUser(Request $request){

  $user = DB::table('users')

  ->leftJoin('roles','roles.id', '=','users.access_level')

  ->where('users.id', $request['user'] )

  ->where('users.is_active', 1 )

  ->select('users.*','roles.role_name')

  ->groupBy('users.id')

  ->first();



  return $this->respond([



    'data' => compact('user'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'User Detail Fetched Successfully.'



  ]);

}











public function userDelete(Request $request)

{



  $d = DB::table('users')->where('id', $request['user'] )->update([ 'is_active' => 0 ]);



}







public function checkexist(Request $request)

{

  DB::enableQueryLog();

  $email = $request->data['email'];

  $user = DB::table('users')->where('email',$email)->where('is_active', 1 )->get();

  $lastQuery = DB::getQueryLog();



  if(is_array($user) && sizeof($user) > 0)

    {$exist = true; }else{ $exist = false; }



  return $this->respond([



    'data' => compact('user','email','lastQuery','exist'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Check existence of User.'



  ]);

}















////////    FRANCHISE STOCK INVOICE        //////////////





  public function saveFranchiseStockInvoice(Request $data) 
  {
      if(!$data->organization_id)return false;
      $plan_data = '';

      $login_id = $data->login_id;

      $franchise_id = $data->franchise_id;

      $franchise_purchase_plan_id = 0;

      $lead = DB::table('franchise_purchase_plan')->insert([

        'date_created' => date('Y-m-d'),

        'created_by' =>  $login_id,

        'franchise_id' => $franchise_id,

        'franchise_plan_id' => $data->plan_id,

        'plan' => $data->plan,

        'description' => $data->description,

        'price' => $data->price,

      ]);

      $franchise_purchase_plan_id = DB::getPdo()->lastInsertId();

      $invoice = DB::table('franchise_invoice')->insert([

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

        'updated_date' =>  ''

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

      $p = DB::table('franchise_invoice')->where('invoice_id','LIKE','%'.$prefix_year.'%')->orderBy('id','DESC')->first();

      if($p){

          $invoice_series = $p->invoice_series + 1;

          $invoice_id = $prefix_year.'/'.$invoice_series;

      }else{

        $invoice_id = $prefix_year.'/1';
      }

        DB::table('franchise_invoice')->where('id',$salesInvoiceId)->update([

          'invoice_prefix' => $organization->invoice_prefix,

          'invoice_id' => $invoice_id,

          'invoice_series' => $invoice_series,

        ]);

      foreach ($data->itemList as $key => $row) 
      {
        $invoiceItem = DB::table('franchise_invoice_item')->insert([

                'franchise_invoice_id' => $salesInvoiceId,

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

        if(  $row['category'] != 'Other')
        {
          $up  = DB::table('master_product_measurement_prices')->where('product_id',$row['product_id'])->where('unit_of_measurement', $row['measurement'])->decrement('sale_qty',$row['qty']);

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

                  'franchise_plans_id' => $data->plan_id,

                  'franchise_purchase_plan_id'  =>  $franchise_purchase_plan_id,

                  'category' => $row['category'],

                  'brand' => $row['brand_name'],

                  'product' => $row['product_name'],

                  'unit_measurement' => $row['measurement'],

                  'quantity' => $row['qty'],

                  'current_stock' => $row['qty'],

              ]);

          }
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

      $this->franchiseLoginCreate($data->franchise_id);

      return $this->respond([



          'data' => compact('salesInvoiceId','p'),



          'status' => 'success',



          'status_code' => $this->getStatusCode(),



          'message' => 'Sales Invoice Inserted Successfully.'



      ]);

    }

  





      

    
    public function getFranchiseStockInvoice($id)
    {



        $invoicedetail = DB::table('franchise_invoice')

            ->leftJoin('franchises', 'franchises.id', '=', 'franchise_invoice.franchise_id')

            ->leftJoin('countries', 'franchises.country_id', '=', 'countries.id')

            ->leftJoin('users', 'users.id', '=', 'franchise_invoice.created_by')

            ->leftJoin('organization', 'organization.id', '=', 'franchise_invoice.organization_id')

            ->leftJoin('countries as admin_country', 'organization.country_id', '=', 'admin_country.id')

            ->where('franchise_invoice.del', '0')

            // ->where('franchise_invoice.id',1)

            ->where('franchise_invoice.franchise_id',$id)

            ->select('franchise_invoice.*', 'franchises.created_at',

            'countries.name as country_name','franchises.company_name','franchises.name','franchises.contact_no','franchises.email_id','franchises.address','franchises.state','franchises.city','franchises.pincode','franchises.ship_state','franchises.ship_district','franchises.ship_city','franchises.ship_address','franchises.ship_pincode','organization.company_name as admin_company_name','organization.state as admin_state',

            

            'organization.address as admin_address','organization.org_logo','organization.city as admin_city','organization.district as admin_district','organization.pincode as admin_pincode','admin_country.name as admin_country_name','organization.company_gstin','organization.company_pan_no as admin_company_pan_no','organization.aadhaar_no as admin_aadhaar_no','organization.bank_name as admin_bank_name','organization.account_no as admin_account_no','organization.account_type as admin_account_type','organization.ifsc_code as admin_ifsc_code','organization.branch_name as admin_branch_name','organization.bank_address as admin_bank_address','organization.company_pan_no as admin_company_pan_no','organization.company_name_in_bank as admin_company_name_in_bank')

            ->first();



            $itemdetail = [];

   if($invoicedetail){



   

        $itemdetail = DB::table('franchise_invoice_item')

            ->where('franchise_invoice_item.del', '0')

            ->where('franchise_invoice_item.franchise_invoice_id',$invoicedetail->id)

            ->get();



   }





        // $payment = DB::table('sales_invoice_payment')

        //             ->join('sales_invoice','sales_invoice.id','=','sales_invoice_payment.invoice_id')

        //             ->join('users','users.id','=','sales_invoice_payment.created_by')



        //             ->where('sales_invoice_payment.del', '0')

        //             ->where('sales_invoice_payment.invoice_id',$sales_invoice_id)

        //             ->select('sales_invoice_payment.*','sales_invoice.invoice_id as prfx_invoice_id','users.first_name')

        //             ->get();



        // $invoicePaymentList = array();

        // foreach ($payment as $key => $row) {



        //      $invoicePaymentList[$key] = $row;



        //      $dateCreated = date_create($row->date_created);

        //      $invoicePaymentList[$key]->date_created = date_format($dateCreated, 'd-M-Y');

        // }





        return $this->respond([



            'data' => compact('invoicedetail','itemdetail'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Invoice Detail Fetched Successfully.'



            ]);

    }



          

    public function update_current_stock(Request $data)
    {

      

         DB::table('franchise_purchase_initial_stocks')->where('id','=',$data['stock_id'])->update(['stock_limit' => $data['stock_val']]);

    }



 public function get_franchise_refix(Request $request)
    {

        $prefix= DB::table('franchises')->where('id',$request->franchise_id)->select('pre_fix')->first();

         return $this->respond( compact('prefix') );

    }




}

