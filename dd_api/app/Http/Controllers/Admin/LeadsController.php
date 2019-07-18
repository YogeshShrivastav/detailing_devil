<?php



namespace App\Http\Controllers\Admin;



use Acme\Repositories\FollowUps\FollowUpsRepo;

use Acme\Repositories\Leads\LeadsRepo;

use Acme\Repositories\ServicePlans\ServicePlansRepo;

use App\Http\Controllers\ApiController;

use App\MasterServicePlan;

use DB;

use Illuminate\Http\Request;



class LeadsController extends ApiController

{

    protected $leads_repo;

    public function __construct(LeadsRepo $leads_repo)

    {

        $this->leads_repo = $leads_repo;

    }



    public function getFranchiseLeads(Request $request)
    {
        $perPage = 20;
        
        $search = $request->filter;
        
        $login = (object)$request->login;
        
        $user_assign_search = $request->user_assign_search;
        
        $leads = $this->leads_repo->get_franchise_leads($perPage, $search, $login, $user_assign_search);

        $total_consumer_leads = $this->leads_repo->total_consumer_leads($login);

        $assign_user_list = $this->leads_repo->get_assign_user_list($login);
        
        $cites = $this->leads_repo->get_cites($login);

        return $this->respond([

            'data' => compact('leads', 'total_consumer_leads','search','assign_user_list','cites'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Lead\'s Get Successfully for edit.'

        ]);

    }



    public function saveFranchiseLead(Request $request) 
    {
        $d = (object)$request['tmp'];
        if(!$d->name)$d->name = 'N/A';
        if(!$d->company_name)$d->company_name = 'No Name';
        
        $exist = DB::table('franchises')->where('status' ,'=', 'A')->where('contact_no' ,'=', $d->contact_no )->first();
        $lead = '';        
        
        if(!$exist)
        {
            $lead = $this->leads_repo->save_franchise_lead($d);
            $msg = 'Success';
        }
        else
        {
           $msg = 'Exist';
        }

        $this->notification(['created_by'   =>  $d->user_id , 'table' =>  'franchise', 'table_id' => $lead , 'user_name' => $d->name, 'title'   => 'Lead Created', 'msg' => $this->get_name($d->user_id).' created franchise lead for '.$d->name ] );

        return $this->respond([
            'data' => compact('lead','msg'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead Save Successfully.'
        ]);
    }



   public function franchiseLeadDetails($l_id, FollowUpsRepo $followUpsRepo) {

    $lead = $this->leads_repo->get_franchise_lead_details($l_id);

    $follow_ups = $followUpsRepo->get_franchise_follow_ups($l_id);



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









    return $this->respond([

        'data' => compact('lead', 'follow_ups','agent_assign','remarks'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Lead detail\'s Get Successfully for edit.'

    ]);

}



public function consumerLeadDetails($l_id, FollowUpsRepo $followUpsRepo) {

    $lead = $this->leads_repo->get_consumer_lead_details($l_id);

    $follow_ups = $followUpsRepo->get_consumer_follow_ups($l_id);

    $jobcardcounts =  DB::table('customer_job_card')->where('del','0')->where('customer_id',$l_id)->count();

    $lead_jobcard =  DB::table('customer_job_card')->where('del','0')->where('customer_id',$l_id)->select('*')->first();



    if($lead_jobcard){



        $plan_info=$this->get_card_plans($lead_jobcard->id);

        $items=$this->get_card_items($lead_jobcard->id);

        $card_invoices=$this->get_card_invoices($lead_jobcard->id);

    }else{

        $plan_info= [];

        $items=  [];

        $card_invoices = [];

    }







    $sales = DB::table('consumer_assign_sales_agent')->where('consumer_assign_sales_agent.isDeactive', '=','0')->where('franchise_id', $l_id)->get();

    $remarks = DB::table('consumer_Sales_assign_remark')->join('users','consumer_Sales_assign_remark.created_by','=','users.id')->leftJoin('consumer_assign_sales_agent','consumer_Sales_assign_remark.id','=','consumer_assign_sales_agent.remark_id')->where('consumer_Sales_assign_remark.franchise_id', $l_id)->select('consumer_Sales_assign_remark.*', DB::raw('group_concat( consumer_assign_sales_agent.sales_agent_id ) as agents'),'consumer_assign_sales_agent.id as assign_sales','users.first_name')->groupBy('consumer_Sales_assign_remark.id')->orderBy('consumer_Sales_assign_remark.id','DESC')->get();



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





    $consumers_remarks = DB::table('consumer_remarks')

    ->leftJoin('users','consumer_remarks.created_by','=','users.id')

    ->leftJoin('users as assign_users','consumer_remarks.assign_to','=','assign_users.id')

    ->where('consumer_remarks.consumer_id', $l_id)

    ->select('consumer_remarks.*','users.first_name as created_name','assign_users.first_name as assign_name')

    ->groupBy('consumer_remarks.id')

    ->orderBy('consumer_remarks.id','DESC')

    ->get();



    return $this->respond([

        'data' => compact('lead', 'follow_ups','jobcardcounts','lead_jobcard','plan_info','items','card_invoices','agent_assign','remarks','consumers_remarks'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Consumer Lead detail\'s Get Successfully for edit.'

    ]);



}



public function get_card_items($card_id)

{

    $data = DB::table('customer_job_card_raw_material')

    ->leftJoin('users', 'customer_job_card_raw_material.created_by', '=', 'users.id')

    ->where('customer_job_card_raw_material.jc_id', $card_id)

    ->select('customer_job_card_raw_material.*','users.first_name as created_name')

    ->get();

    return $data;

}





public function get_card_plans($card_id)

{

    $data = DB::table('customer_job_card_services')

    ->where('customer_job_card_services.jc_id', $card_id)

    ->select('customer_job_card_services.service_name')

    ->groupBy('customer_job_card_services.service_name')->get();

    return $data;

}



public function get_card_invoices($card_id)

{

    $data = DB::table('customer_job_card_invoice')

    ->leftJoin('users', 'customer_job_card_invoice.created_by', '=', 'users.id')

    ->where('customer_job_card_invoice.jc_id', $card_id)

    ->select('customer_job_card_invoice.*','users.first_name as created_name')

    ->groupBy('customer_job_card_invoice.id')

    ->get();

    return $data;

}



public function updateFranchiseLead(Request $request , $created_by) {

    $exist = DB::table('franchises')->where('contact_no' ,'=',$request->contact_no )->where('status' ,'=', 'A' )->where('id', '!=', $request->l_id )->first();

        // $lead = '';

        if(!$exist){

    $lead = $this->leads_repo->update_franchise_lead($request);

      $msg = 'Success';



        }else{

           $msg = 'Exist';

       }


       $id = $this->notification(['created_by'   =>  $created_by,  'table' =>  'franchise', 'table_id' =>  $request->l_id ,  'user_name' =>
        $request['name']  ,'title'   => 'Updated lead detail ', 'msg'   => 'lead has been updated  by '.$this->get_name($created_by) ] );

    return $this->respond([

        'data' => compact('lead','msg'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Lead detail\'s Get Successfully for edit.'

    ]);

}





public function multipleFranchiseAssignSalesAgent(Request $request) {



    $arr = $request->user_assign;

    $leads = $request->l_id;

    foreach ($leads as $key => $value) {





        $d = DB::table('franchise_assign_sales_agent')->where('franchise_id',$value)->update(['isDeactive' => '1'] );
        DB::table('franchises')->where('id', $value)->update(['updated_at' => date('Y-m-d H:i:s') ] );


    $first_name = DB::table('franchises')->where('id', $value)->select('name')->first()->name;

        $id = 0;

        if(!$request->remark){ $request->remark = 'N/A'; } 


        DB::table('franchise_Sales_assign_remark')->insert(

            [

                'date_created' => date('Y-m-d H:i:s'),

                'created_by' => $request->user_id,

                'franchise_id' => $value,

                'remark' => $request->remark,



            ]);

        $r_id = DB::getPdo()->lastInsertId();

         $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'franchise', 'table_id' =>  $value ,  'user_name' =>$first_name ,'title'   => 'Assign Sales Agents ', 'msg'   => $this->get_name($request->user_id).' assigned '.$first_name.' (franchises lead)'  ] );

        foreach ($arr as $key => $value1) {



            DB::table('franchise_assign_sales_agent')->insert(

                [

                    'date_created' => date('Y-m-d'),

                    'created_by' => $request->user_id,

                    'franchise_id' => $value,

                    'sales_agent_id' => $value1,

                    'remark_id' => $r_id,



                ]);

             $this->setNotificationReceived( $id , $value1,  $request->user_id);

        }



    }

    

}



public function consumerAssignSalesAgent(Request $request) 
{

    $arr = $request->user_assign;

    $d = DB::table('consumer_assign_sales_agent')->where('franchise_id',$request->l_id)->update(['isDeactive' => '1'] );
    DB::table('consumers')->where('id',$request->l_id)->update(['updated_at' => date('Y-m-d H:i:s') ] );

    $first_name = DB::table('consumers')->where('id', $request->l_id)->select('first_name')->first()->first_name;

    $id = 0;

    if(!$request->remark){ $request->remark = 'N/A'; }

    DB::table('consumer_Sales_assign_remark')->insert(
    [
        'date_created' => date('Y-m-d H:i:s'),

        'created_by' => $request->user_id,

        'franchise_id' => $request->l_id,

        'remark' => $request->remark,
    ]);

    $r_id = DB::getPdo()->lastInsertId();


    $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id ,  'user_name' =>
    $first_name  , 'title'   => 'Assign Sales Agents ',  'msg'   => $this->get_name($request->user_id).' assigned '.$first_name.' (consumer lead)' ] );



    foreach ($arr as $key => $value) 
    {

        DB::table('consumer_assign_sales_agent')->insert(
        [
            'date_created' => date('Y-m-d'),

            'created_by' => $request->user_id,

            'franchise_id' => $request->l_id,

            'sales_agent_id' => $value,

            'remark_id' => $r_id,
        ]);

        $this->setNotificationReceived( $id , $value,  $request->user_id);

    }

}


public function consumerAssignSalesAgentBulk(Request $request) 
{
    $arr = $request->user_assign;

    foreach($request->l_id as $val)
    {
        $d = DB::table('consumer_assign_sales_agent')->where('franchise_id',$val)->update(['isDeactive' => '1'] );
        DB::table('consumers')->where('id',$val)->update(['updated_at' => date('Y-m-d H:i:s') ] );

        $first_name = DB::table('consumers')->where('id', $val)->select('first_name')->first()->first_name;

        $id = 0;

        if(!$request->remark){ $request->remark = 'N/A'; }

        DB::table('consumer_Sales_assign_remark')->insert(
        [
            'date_created' => date('Y-m-d H:i:s'),

            'created_by' => $request->user_id,

            'franchise_id' => $val,

            'remark' => $request->remark,
        ]);

        $r_id = DB::getPdo()->lastInsertId();


        $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $val ,  'user_name' =>
        $first_name  , 'title'   => 'Assign Sales Agents ',  'msg'   => $this->get_name($request->user_id).' assigned '.$first_name.' (consumer lead)' ] );



        foreach ($arr as $key => $value) 
        {
            DB::table('consumer_assign_sales_agent')->insert(
            [
                'date_created' => date('Y-m-d'),

                'created_by' => $request->user_id,

                'franchise_id' => $val,

                'sales_agent_id' => $value,

                'remark_id' => $r_id,
            ]);

            $this->setNotificationReceived( $id , $value,  $request->user_id);
        }
    }

    // exit;



    // $d = DB::table('consumer_assign_sales_agent')->where('franchise_id',$request->l_id[0])->update(['isDeactive' => '1'] );
    // DB::table('consumers')->where('id',$request->l_id[0])->update(['updated_at' => date('Y-m-d H:i:s') ] );

    // $first_name = DB::table('consumers')->where('id', $request->l_id[0])->select('first_name')->first()->first_name;

    // $id = 0;

    // if(!$request->remark){ $request->remark = 'N/A'; }

    // DB::table('consumer_Sales_assign_remark')->insert(
    // [
    //     'date_created' => date('Y-m-d H:i:s'),

    //     'created_by' => $request->user_id,

    //     'franchise_id' => $request->l_id[0],

    //     'remark' => $request->remark,
    // ]);

    // $r_id = DB::getPdo()->lastInsertId();


    // $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id[0] ,  'user_name' =>
    // $first_name  , 'title'   => 'Assign Sales Agents ',  'msg'   => $this->get_name($request->user_id).' assigned '.$first_name.' (consumer lead)' ] );



    // foreach ($arr as $key => $value) 
    // {
    //     DB::table('consumer_assign_sales_agent')->insert(
    //     [
    //         'date_created' => date('Y-m-d'),

    //         'created_by' => $request->user_id,

    //         'franchise_id' => $request->l_id[0],

    //         'sales_agent_id' => $value,

    //         'remark_id' => $r_id,
    //     ]);

    //     $this->setNotificationReceived( $id , $value,  $request->user_id);
    // }

}


/// himanshi
public function consumerAssignFranchiseSalesAgent(Request $request) {

$d  = (object)$request['temp'];

     DB::table('consumers')->where('id',$d->l_id)->update(['franchise_sales_manager_assign' => $d->franchise_sales_manager_assign, 'updated_at' => date('Y-m-d H:i:s')] );


    $first_name = DB::table('consumers')->where('id', $request->l_id)->select('first_name')->first()->first_name;

    if(!$d->franchise_remark){ $d->franchise_remark = 'N/A'; }



    DB::table('consumer_remarks')->insert(

        [

            'date_created' => date('Y-m-d H:i:s'),

            'created_by' => $d->user_id,

            'consumer_id' => $d->l_id,

            'assign_to' => $d->franchise_sales_manager_assign,

            'remark' => $d->franchise_remark,



        ]);

     $id = $this->notification(['created_by'   =>  $d->user_id, 'table' =>  'consumers', 'table_id' =>  $d->l_id ,  'user_name' => $first_name ,
                            'title'   => 'Assign Sales Agents ', 'msg'   => $this->get_name($d->user_id).' assigned '.$first_name.' (consumer lead) ' ] );


      $this->setNotificationReceived( $id , $d->franchise_sales_manager_assign,  $d->user_id);


}







public function franchiseAssignSalesAgent(Request $request) {



    $arr = $request->user_assign;

    $d = DB::table('franchise_assign_sales_agent')->where('franchise_id',$request->l_id)->update(['isDeactive' => '1'] );
    DB::table('franchises')->where('id', $request->l_id)->update(['updated_at' => date('Y-m-d H:i:s') ] );

    $name = DB::table('franchises')->where('id', $request->l_id)->select('name')->first()->name;



    $id = 0;

    if(!$request->remark){ $request->remark = 'N/A'; } 



    DB::table('franchise_Sales_assign_remark')->insert(

        [

            'date_created' => date('Y-m-d H:i:s'),

            'created_by' => $request->user_id,

            'franchise_id' => $request->l_id,

            'remark' => $request->remark,



        ]);

    $r_id = DB::getPdo()->lastInsertId();



       $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'franchise', 'table_id' =>  $request->l_id ,  'user_name' =>
        $name  , 'title'   => 'Assign Sales Agents ', 'msg'   => $this->get_name($request->user_id).' assigned '.$name.' (franchises lead)' ]);


    foreach ($arr as $key => $value) {



        DB::table('franchise_assign_sales_agent')->insert(

            [


                'date_created' => date('Y-m-d'),

                'created_by' => $request->user_id,

                'franchise_id' => $request->l_id,

                'sales_agent_id' => $value,

                'remark_id' => $r_id,



            ]);

       $this->setNotificationReceived( $id , $value,  $request->user_id);


    }


}





public function deleteFranchiseLead(Request $request) {

    $r_lead = $this->leads_repo->delete_franchise_lead($request->l_id);

    return $this->respond([

        'data' => compact('r_lead'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Lead detail\'s Get Successfully for edit.'

    ]);

}



public function getConsumerFormOptions(ServicePlansRepo $service_plan_repo) {

    $vehicle_types = $service_plan_repo->get_vehicle_types();

    $countries = DB::table('countries')->get();

    return $this->respond([

        'data' => compact('vehicle_types', 'countries'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Form Option\'s Get Successfully.'

    ]);

}

public function getConsumerFormOptionsCountry() {

    $countries = DB::table('countries')->get();

    return $this->respond([

        'data' => compact('countries'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Form Option\'s Get Successfully.'

    ]);

}



public function getConsumerFormOptionsUser() {

    $user = DB::table('users')
    ->where('access_level', '3')
    ->where('is_active', '1')
    ->orWhere('access_level', '1')
    ->select('id', 'first_name','access_level')->orderBy('first_name')->get();



    return $this->respond([

        'data' => compact('user'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Form Option\'s Get Successfully.'

    ]);

}



public function franchise_sale_users(Request $request) {

    $login = (object)$request['login'];

    $user = DB::table('users')->where('access_level', '6')->where('franchise_id', $login->franchise_id)->select('id', 'first_name','access_level')->get();



    return $this->respond([

        'data' => compact('user'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Form Option\'s Get Successfully.'

    ]);

}









public function getLocations($c_id) {

    $locations = DB::table('locations')->where('del',0)->where('assign_to_franchise',0)->where('country_id', $c_id)->get();

    return $this->respond([

        'data' => compact('locations'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Location\'s Get Successfully.'

    ]);

}

public function updateFranchiseLocation(Request $request){

    //     echo "<pre>";

    //     echo $request->franchise_id;

    //     echo "<br>".$request->location_id;

    //    // print_r($request);

    //     exit;

    $locations = DB::table('franchises')->where('id', $request->franchise_id)->update(['location_id'=>$request->location_id]);

    if($locations){

        DB::table('locations')->where('id', $request->location_id)->where('del', '0')->update(['assign_to_franchise' => $request->franchise_id]);

    }

    return $this->respond([

        'data' => compact('locations'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Location\'s Update Successfully.'

    ]);

}

public function saveConsumerLead(Request $request) {



    $d = (object)$request['tmp'];

    if(!$d->first_name)$d->first_name = 'N/A';

    $exist = DB::table('consumers')->where('phone' ,'=',$d->phone )->where('status' ,'=', 'A')->first();

    $lead = '';

    if(!$exist){

        $lead = $this->leads_repo->save_consumer_lead($d);

        

        $id = 0;



        if($d->access_level == 3){

            DB::table('consumer_Sales_assign_remark')->insert(

                [

                    'date_created' => date('Y-m-d H:i:s'),

                    'created_by' => $d->user_id,

                    'franchise_id' => $lead,

                    'remark' => 'Self Created',



                ]);

            $id = DB::getPdo()->lastInsertId();





            DB::table('consumer_assign_sales_agent')->insert(

                [

                    'date_created' => date('Y-m-d'),

                    'created_by' => $d->user_id,

                    'franchise_id' => $lead,

                    'sales_agent_id' => $d->user_id,

                    'remark_id' => $id,



                ]);

        }

            $msg = 'Success';

        

    }else{

       $msg = 'Exist';



   }

 $this->notification(['created_by'   =>  $d->user_id , 'table' =>  'consumers', 'table_id' => $lead , 'user_name' => $d->first_name, 'title'   => 'Lead Created', 
                        'msg'   => $this->get_name($d->user_id).' created consumer lead for '.$d->first_name ] );

   return $this->respond([

    'data' => compact('lead','msg'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Lead Save Successfully.'

]);

   

}



public function getConsumerLeads(Request $request)

{

    $perPage = 20;

    $search = $request->filter;

    $login = (object)$request->login;

    $user_assign_search = $request->consumer_user_assign_search;

    $leads = $this->leads_repo->get_consumer_leads($perPage,$search, $login, $user_assign_search);

    $assign_franchise_list = $this->leads_repo->get_assign_franchise_list();

    $total_franchise_leads = $this->leads_repo->total_franchise_leads($login);

    $cites = $this->leads_repo->get_consumer_cites($login);




    return $this->respond([

        'data' => compact('leads', 'total_franchise_leads','assign_franchise_list','cites'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Lead\'s Get Successfully for edit.'

    ]);



}



public function deleteConsumerLead(Request $request) {

    $r_lead = $this->leads_repo->delete_consumer_lead($request->l_id);

    return $this->respond([

        'data' => compact('r_lead'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'Lead detail\'s Get Successfully for edit.'

    ]);

}



    public function getServicePlans(Request $request) {//dd(1221);

        $service_plans = MasterServicePlan::where('vehicle_type', $request->v_type)->select('id', 'plan_name')->get();

        return $this->respond([

            'data' => compact('service_plans'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Lead\'s Get Successfully for edit.'

        ]);

    }



    public function updateConsumerLead(Request $request) {
        $request = (Object)$request;

         $exist = DB::table('consumers')->where('phone' ,'=',$request->phone)->where('status' ,'=', 'A')->where('id', '!=', $request->l_id)->first();



    
        $lead = '';

        if(!$exist){


                if( isset($request->franchise_id) && $request->franchise_id )
                {

                          $data = DB::table('consumers')-> where('id',$request->l_id)->select('franchise_id')-> first();


                          if($request->franchise_id != $data->franchise_id)
                          {

                           $first_name = DB::table('consumers')->where('id','=', $request->l_id)->first();

                           $company_name =  DB::table('franchises')->where('id', '=', $request->franchise_id)->first();

                           $location_name = DB::table('locations')->where('assign_to_franchise','=', $request->franchise_id )->first();


                            $ntify_msg = '';
                            $ntify_msg = $company_name->company_name.'('.$location_name->location_name.') franchises is assigned to '.$first_name->first_name.' by '.$this->get_name($request->user_id);

                            $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id,
                                    'user_name' => $first_name->first_name , 'title'   => 'Lead Updated', 'msg'   => $ntify_msg ]);

                            $this->setNotificationReceived( $id , $request->franchise_id ,  $request->user_id);

                          }

                      
                    }

                        $lead = $this->leads_repo->update_consumer_lead($request);

                        $msg = 'Success';


            }else{

               $msg = 'Exist';

           }

        return $this->respond([

            'data' => compact('lead','msg'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Consumer Lead Updated Successfully.'

        ]);

    }



    public function updateConsumerLeadStatus(Request $request) {

        $lead = $this->leads_repo->update_consumer_lead_status($request);

        return $this->respond([

            'data' => compact('lead'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Consumer Lead Status Updated Successfully.'

        ]);

    }



    public function updateFranchiseLeadStatus(Request $request) {



        $lead = $this->leads_repo->update_franchise_lead_status($request);

        return $this->respond([

            'data' => compact('lead'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Lead Updated Successfully.'

        ]);

    }





///////////////////



    public function getFranchise(Request $request) 
    {
        $franchise_list = DB::table('franchises')

        ->join('locations', 'locations.id', '=', 'franchises.location_id')

        ->where('franchises.status', '=', 'A')

        ->where('franchises.type', '=', '2')

        ->select('locations.id as location_id','franchises.id','franchises.company_name as name','locations.location_name')

        ->groupBy('franchises.id')

        ->orderBy('franchises.name','ASC')

        ->get();

        return $this->respond([

            'data' => compact('franchise_list'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise\'s Get Successfully.'

        ]);

    }







    public function getFranchiseList() {



        $franchise_list = DB::table('franchises')

        ->leftJoin('locations', 'locations.assign_to_franchise', '=', 'franchises.id')

        ->where('franchises.status', '=', 'A')

        ->where('franchises.location_id', '!=', '0')

        ->select('locations.id as location_id','franchises.id','franchises.name')

        ->orderBy('franchises.name','ASC')

        ->groupBy('franchises.id')

        ->get();



        return $this->respond([

            'data' => compact('franchise_list'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise\'s Get Successfully.'

        ]);

    }





    public function assign_franchise(Request $request, $created_by) {

        $d = (object)$request['data'];

        $assign = $this->leads_repo->assign_franchise($d);

        $name =  (Object)  DB::table('franchises')->where('id', $d->franchise_id)->select('company_name')->first();

        $location_name =  (Object)  DB::table('locations')->where('id', $d->location_id)->select('location_name')->first();

        foreach ($d->lead_id as $key => $consumer_id) 
        {
            $first_name = (Object) DB::table('consumers')->where('id', $consumer_id)->select('first_name')->first();

            $m = $name->company_name.'('.$location_name->location_name.') franchises is assigned to '.$first_name->first_name.' by '.$this->get_name($created_by) ;

            $id = $this->notification(['created_by'   =>  $created_by, 'table' =>  'consumers', 'table_id' =>  (int)$consumer_id,
                    'user_name' =>$first_name->first_name , 'title'   => 'Assign Sales Agents', 'msg'   => $m ]);

            $receivers = DB::table('consumer_assign_sales_agent')->where('franchise_id', $consumer_id)->where('isDeactive', '0')->get();
                

            if( $d->franchise_id )
            {
                foreach ($receivers as $key => $value) {

                    $this->setNotificationReceived( $id , $value->sales_agent_id, $created_by );
                }
            }

        }


        return $this->respond([

            'data' => compact('assign'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Assign Save Successfully.'

        ]);

    }


    public function un_assign_franchise(Request $request, $created_by) 
    {
        $d = (object)$request['data'];
        
        $location_name =  (Object)  DB::table('locations')->where('id', $d->location_id)->select('location_name')->first();
        
        foreach ($d->lead_id as $key => $consumer_id) 
        {
            $consumer = (Object) DB::table('consumers')->where('id', $consumer_id)->select('first_name','franchise_id')->first();

            $name =  (Object)  DB::table('franchises')->where('id', $consumer->franchise_id)->select('company_name')->first();
           
            $m = $consumer->first_name.' is Unassigned from franchises '.$name->company_name.' by '.$this->get_name($created_by) ;

            $id = $this->notification(['created_by'   =>  $created_by, 'table' => 'consumers', 'table_id' =>  (int)$consumer_id,
                    'user_name' =>$consumer->first_name , 'title'   => 'Unassign Sales Agents', 'msg'   => $m ]);

            $this->setNotificationReceived( $id , $consumer->franchise_id, $created_by );
        }

        $assign = $this->leads_repo->assign_franchise($d);

        return $this->respond([

            'data' => compact('assign'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Unssign Save Successfully.'

        ]);

    }



    public function assign_user(Request $request) {



        $d = (object)$request['data'];



        $user = $this->leads_repo->assign_user($d);

        return $this->respond([

            'data' => compact('user'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Assign Save Successfully.'

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


    public function changeAddress($request)
    {
        // print_r($request);
        // exit;
        // $request = (Object)$request;

        $inv = DB::table('customer_job_card_invoice')
        ->join('consumers','consumers.id','=','customer_job_card_invoice.customer_id')
        ->join('franchises','franchises.id','=','customer_job_card_invoice.franchise_id')
        ->select('customer_job_card_invoice.*','consumers.state','consumers.company_state','franchises.state as f_state')
        ->where('jc_id',  $request['id'] )
        ->get();

        foreach ($inv as $key => $value) 
        {
            $value = (array)$value;
            $igst = false;
            
            if( $request['isCompany']  == '1' ){
                
                $igst = (   $value['company_state'] == $value['f_state']   ) ? false : true ;
            }

            if( $request['isCompany']  == '0' ){
                
                $igst = (   $value['state'] == $value['f_state']   ) ? false : true ;
            }

            $cgst_price = 0;
            $sgst_price = 0;
            $igst_price = 0;

            $cgst_per = 0;
            $sgst_per = 0;
            $igst_per = 0;

            if($igst){
                $igst_per = round( $value['cgst_per'] + $value['sgst_per'] );
                $igst_price = round( $value['cgst_price'] + $value['sgst_price'] );
            }else{
                    $cgst_per = round( $value['igst_per'] / 2 );
                    $sgst_per = round( $value['igst_per'] / 2 );
                    
                $cgst_price = round( $value['igst_price'] / 2 );
                $sgst_price = round( $value['igst_price'] / 2 );
            }

            DB::table('customer_job_card_invoice')->where('id', $value['id'])->update([
                'igst_per' =>  $igst_per,
                'sgst_per' =>  $sgst_per,
                'cgst_per' =>  $cgst_per,
                'cgst_price' =>  $cgst_price,
                'sgst_price' =>  $sgst_price,
                'igst_price' =>  $igst_price
            ]);
        
            $inv_itms = DB::table('customer_job_card_invoice_services_item')->where('invoice_id',  $value['id'] )->get();

            $cgst_amt = 0;
            $sgst_amt = 0;
            $igst_amt = 0;

            $cgst_per = 0;
            $sgst_per = 0;
            $igst_per = 0;

            foreach ($inv_itms as $key2 => $value2) 
            {
                $value2 = (array)$value2;
                if($igst)
                {
                    $igst_per = round( $value2['cgst_per'] + $value2['sgst_per'] );
                    $igst_amt = round( $value2['cgst_amt'] + $value2['sgst_amt'] );
                }
                else
                {
                    $cgst_per = round( $value2['igst_per'] / 2 );
                    $sgst_per = round( $value2['igst_per'] / 2 );
                    
                    $cgst_amt = round( $value2['igst_amt'] / 2 );
                    $sgst_amt = round( $value2['igst_amt'] / 2 );
                }
                DB::table('customer_job_card_invoice_services_item')->where('id', $value2['id'])->update([
                    'igst_per' =>  $igst_per,
                    'sgst_per' =>  $sgst_per,
                    'cgst_per' =>  $cgst_per,
                    'cgst_amt' =>  $cgst_amt,
                    'sgst_amt' =>  $sgst_amt,
                    'igst_amt' =>  $igst_amt
                ]);
            }
        }
        DB::table('customer_job_card')->where('id', $request['id'])->update(

            ['isCompany' =>  $request['isCompany'] ]

        );
        return $this->respond( 'SUCCESS' );
    }



    public function update_customer(Request $request)
    {
        $request = (Object)$request;
        
        $CompanyReq = DB::table("customer_job_card")->where("customer_id",$request->l_id)->where('isCompany','1')->pluck("id");
        
        if(count($CompanyReq) > 0)
        {
            if((!$request->company_state) || (!$request->company_district) || (!$request->company_city) || (!$request->company_pincode))
            {
                return $this->respond('COMPANY DETAILS REQUIRE');
            }
        }

        $exist = DB::table('consumers')->where('phone' ,'=',$request->phone)->where('status' ,'=', 'A')->where('id', '!=', $request->l_id)->first();
        $lead = '';

        if(!$exist)
        {
            if( isset($request->franchise_id) && $request->franchise_id )
            {
                $data = DB::table('consumers')-> where('id',$request->l_id)->select('franchise_id')->first();

                if($request->franchise_id != $data->franchise_id)
                {
                    $first_name = DB::table('consumers')->where('id','=', $request->l_id)->first();

                    $company_name =  DB::table('franchises')->where('id', '=', $request->franchise_id)->first();

                    $location_name = DB::table('locations')->where('assign_to_franchise','=', $request->franchise_id )->first();

                    $ntify_msg = '';
                    $ntify_msg = $company_name->company_name.'('.$location_name->location_name.') franchises is assigned to '.$first_name->first_name.' by '.$this->get_name($request->user_id);

                    $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id,
                            'user_name' => $first_name->first_name , 'title'   => 'Lead Updated', 'msg'   => $ntify_msg ]);

                    $this->setNotificationReceived( $id , $request->franchise_id ,  $request->user_id);

                }
            }
            $lead = $this->leads_repo->update_customer($request);

            $consumer_jobCard = DB::table('customer_job_card')->where('customer_id','=', $request->l_id)->select('isCompany','id')->get();

            foreach($consumer_jobCard as $row)
            {
                $arr = [
                    'isCompany' => $row->isCompany,
                    'id' => $row->id
                ];
                $this->changeAddress($arr);
            }

            $msg = 'Success';
        }
        else
        {
            $msg = 'Exist';
        }

        return $this->respond([
            'data' => compact('lead','msg'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Consumer Lead Updated Successfully.'
        ]);
    }
}

