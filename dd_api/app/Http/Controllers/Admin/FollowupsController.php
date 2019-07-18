<?php

namespace App\Http\Controllers\Admin;

use Acme\Repositories\FollowUps\FollowUpsRepo;
use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use DB;

class FollowUpsController extends ApiController
{
    protected $followups_repo;
    public function __construct(FollowUpsRepo $followups_repo)
    {
        $this->followups_repo = $followups_repo;
    }

    public function getFranchiseFollowUps(Request $request)
    {
            $perPage = 10;
            $search = $request->s;
            $status = 'P';
            if($request->status == 'done') $status = 'D';
            $follow_ups = $this->followups_repo->get_today_follow_ups($perPage, $status, 'F', $search);
            $total_pending_follow_ups = $this->followups_repo->total_pending_follow_ups();
            $total_done_follow_ups = $this->followups_repo->total_done_follow_ups();
            return $this->respond([
                'data' => compact('follow_ups', 'total_done_follow_ups', 'total_pending_follow_ups'),
                'status' => 'success',
                'status_code' => $this->getStatusCode(),
                'message' => 'Lead\'s Get Successfully for edit.'
            ]);
    }

    public function getFollowUps(Request $request) {
        $perPage = 20;
        $search = $request->s;
        $session = (object)$request['login'];
        $filter = (Object)$request['filter'];
        if($request->status == 'pending') $follow_ups = $this->followups_repo->get_today_follow_ups($filter ,$perPage,  $search,  $session);
        if($request->status == 'done') $follow_ups = $this->followups_repo->get_done_follow_ups($filter,$perPage,  $search, $session);
        if($request->status == 'upcoming') $follow_ups = $this->followups_repo->get_upcoming_follow_ups($filter,$perPage,   $search, $session);
        if($request->status == 'appointment') $follow_ups = $this->followups_repo->get_today_appointment_follow_ups($perPage,   $search, $session);

        $total_pending_follow_ups = $this->followups_repo->total_pending_follow_ups( $session);
        $total_done_follow_ups = $this->followups_repo->total_done_follow_ups($session);
        $total_upcoming_follow_ups = $this->followups_repo->total_upcoming_follow_ups( $session);
        $total_upcoming_appointment_follow_ups = $this->followups_repo->total_upcoming_appointment_follow_ups( $session);


        return $this->respond([
            'data' => compact('follow_ups', 'total_done_follow_ups', 'total_pending_follow_ups','total_upcoming_follow_ups','total_upcoming_appointment_follow_ups'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead\'s Get Successfully for edit.'
        ]);
    }



    public function fanchises_getFollowUps(Request $request) {
        $perPage = 20;
        $search = $request->s;
     
        $session = (object)$request['login'];

       $followup_consumres = $this->followups_repo->get_followup_consumre($perPage,  $search, $request['franchise_id']);
        if($request->status == 'pending') $follow_ups = $this->followups_repo->frachise_get_today_follow_ups(  $followup_consumres , $session);
        if($request->status == 'done') $follow_ups = $this->followups_repo->frachise_get_done_follow_ups( $followup_consumres , $session);
        if($request->status == 'upcoming') $follow_ups = $this->followups_repo->frachise_get_upcoming_follow_ups(  $followup_consumres, $session);
        if($request->status == 'appointment') $follow_ups = $this->followups_repo->frachise_get_today_appointment_follow_ups( $followup_consumres , $session);

        $total_pending_follow_ups = $this->followups_repo->frachise_total_pending_follow_ups(  $followup_consumres , $session );
        $total_done_follow_ups = $this->followups_repo->frachise_total_done_follow_ups( $followup_consumres , $session );
        $total_upcoming_follow_ups = $this->followups_repo->frachise_total_upcoming_follow_ups( $followup_consumres , $session);
        $frachise_total_appointment_follow_ups = $this->followups_repo->frachise_total_appointment_follow_ups($followup_consumres , $session);
       
        return $this->respond([
            'data' => compact('follow_ups', 'total_done_follow_ups', 'total_pending_follow_ups','total_upcoming_follow_ups','frachise_total_appointment_follow_ups' ),
            // 'data' => compact('follow_ups','f' ),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead\'s Get Successfully for edit.'
        ]);
    }



    
    public function fanchisesAppoinment(Request $request) {
        $perPage = 20;
        $search = $request->s;
     
        $session = (object)$request['login'];


       $followup_consumres = $this->followups_repo->get_appointment_consumer($perPage,  $search, $request['franchise_id'],$session );
        // if($request->status == 'pending') $follow_ups = $this->followups_repo->frachise_get_today_follow_ups(  $followup_consumres);
        // if($request->status == 'done') $follow_ups = $this->followups_repo->frachise_get_done_follow_ups( $followup_consumres );
        // if($request->status == 'upcoming') $follow_ups = $this->followups_repo->frachise_get_upcoming_follow_ups(  $followup_consumres);
        if($request->status == 'appointment') $follow_ups = $this->followups_repo->frachise_appointment_follow_ups( $followup_consumres,$session );

        // $total_pending_follow_ups = $this->followups_repo->frachise_total_pending_follow_ups(  $followup_consumres );
        // $total_done_follow_ups = $this->followups_repo->frachise_total_done_follow_ups( $followup_consumres );
        // $total_upcoming_follow_ups = $this->followups_repo->frachise_total_upcoming_follow_ups( $followup_consumres );
        // $frachise_total_appointment_follow_ups = $this->followups_repo->frachise_total_appointment_follow_ups($followup_consumres);
       
        return $this->respond([
            'data' => compact('follow_ups','followup_consumres' ),
            // 'data' => compact('follow_ups','f' ),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead\'s Get Successfully for edit.'
        ]);
    }



    public function saveFranchiseFollowUp(Request $request) {

        $follow_ups = $this->followups_repo->save_franchise_follow_ups($request);

         $request = (Object)$request;

         $lead = DB::table('franchises')->where('id', $request->l_id)->first();

          if(isset($request->next_follow_date) && $request->next_follow_date) {

     $msg = $this->get_name($request->user_id).' scheduled  '.$request->next_follow_type.' for '.$lead->company_name.'(franchise) on '.$request->next_follow_date;


               $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'franchises', 'table_id' =>  $request->l_id,
                   'user_name' => $lead->name , 'title'   => 'Schedule FollowUp', 'msg'   => $msg ]);


         $receivers = DB::table('franchise_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    
                    foreach ($receivers as $key => $value) {

                                   $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                               }
            }


if(!$request->next_follow_date) {

                $msg = $this->get_name($request->user_id).' close remark followup for '.$lead->company_name.' (franchises) lead';


               $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'franchises', 'table_id' =>  $request->l_id,
                   'user_name' => $lead->name , 'title'   => 'lead remark', 'msg'   => $msg ]);
          
                $receivers = DB::table('franchise_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    
                    foreach ($receivers as $key => $value) {

                                   $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                               }

            }



             if( isset($request->status) && $request->status){

                // $lead = DB::table('consumers')->where('id', $request->l_id)->first();
                $msg = $this->get_name($request->user_id).' change '.$lead->company_name .' from '.$lead->previous_status.' to '. $lead->lead_status;

              $id =  $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'franchises', 'table_id' =>  $request->l_id,
                'user_name' => $lead->name  , 'title'   => 'Status Changes', 'msg'   => $msg ]);


         $receivers = DB::table('franchise_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    
                    foreach ($receivers as $key => $value) {

                                   $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                               }

            }



        return $this->respond([
                'data' => compact('follow_ups'),
                'status' => 'success',
                'status_code' => $this->getStatusCode(),
                'message' => 'FollowUp\'s Get Successfully .'
            ]);
    }

    public function deleteFranchiseFollowUp(Request $request) {
        $r_follow_up = $this->followups_repo->delete_franchise_follow_ups($request->f_id);
        return $this->respond([
            'data' => compact('r_follow_up'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead detail\'s Get Successfully for edit.'
        ]);
    }

    public function updateFranchiseFollowUp(Request $request) {
        $follow_ups = $this->followups_repo->save_franchise_follow_ups($request);
        return $this->respond([
            'data' => compact('follow_ups'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'FollowUp\'s Get Successfully .'
        ]);
    }

    public function getConsumerFollowUps(Request $request)
    {
        $perPage = 10;
        $search = $request->s;
        $status = 'P';
        if($request->status == 'done') $status = 'D';
        $follow_ups = $this->followups_repo->get_today_follow_ups($perPage, $status, 'C', $search);
        $total_pending_follow_ups = $this->followups_repo->total_pending_follow_ups();
        $total_done_follow_ups = $this->followups_repo->total_done_follow_ups();
        return $this->respond([
            'data' => compact('follow_ups', 'total_done_follow_ups', 'total_pending_follow_ups'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead\'s Get Successfully for edit.'
        ]);
    }

    public function saveConsumerFollowUp(Request $request) {

        $follow_ups = $this->followups_repo->save_consumer_follow_ups($request);

        $request = (Object)$request;

        $lead = DB::table('consumers')->where('id', $request->l_id)->first();


          if(isset($request->next_follow_date) &&  $request->next_follow_date) {


            $msg = $this->get_name($request->user_id).' scheduled '.$request->next_follow_type.' for '.$lead->first_name.'(Consumer) on '.$request->next_follow_date;

                  $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id,
                   'user_name' => $lead->first_name , 'title'   => 'Schedule FollowUp', 'msg'   => $msg ]);

                  
                $receivers = DB::table('consumer_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    

                       if( $lead->franchise_id )
                        $this->setNotificationReceived( $id , $lead->franchise_id ,  $request->user_id);
                    
                    foreach ($receivers as $key => $value) {

                                   $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                               }
            }



          if(!$request->next_follow_date) {


            $msg = $this->get_name($request->user_id).' close remark followup for '.$lead->first_name.' (consumers) lead';

                  $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id,
                   'user_name' => $lead->first_name , 'title'   => 'lead remark', 'msg'   => $msg ]);

                        $receivers = DB::table('consumer_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    

                    if( isset($lead->franchise_id) && $lead->franchise_id )
                        $this->setNotificationReceived( $id , $lead->franchise_id ,  $request->user_id);


                    if($receivers){
                        foreach ($receivers as $key => $value) {
                            $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                        }

                    }


            }



             if(isset($request->status) && $request->status){

                // $lead = DB::table('consumers')->where('id', $request->l_id)->first();
                $msg = $this->get_name($request->user_id).' change '.$lead->first_name .' from '.$lead->previous_status.' to '. $lead->lead_status;

                $id = $this->notification(['created_by'   =>  $request->user_id, 'table' =>  'consumers', 'table_id' =>  $request->l_id ,
                'user_name' => $lead->first_name , 'title'   => 'Status Changes', 'msg'   => $msg ]);


                 $receivers = DB::table('consumer_assign_sales_agent')->where('franchise_id', $request->l_id)->where('isDeactive', '0')->get();
                    
                       if(isset($lead->franchise_id) & $lead->franchise_id )
                        $this->setNotificationReceived( $id , $lead->franchise_id ,  $request->user_id);

                        if($receivers){
                            foreach ($receivers as $key => $value) {
                                   $this->setNotificationReceived( $id , $value->sales_agent_id,  $request->user_id);
                               }
                        }

                
            }



        return $this->respond([
            'data' => compact('follow_ups'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'FollowUp\'s Get Successfully .'
        ]);
    }

    public function deleteConsumerFollowUp(Request $request) {
        $r_follow_up = $this->followups_repo->delete_consumer_follow_ups($request->f_id);
        return $this->respond([
            'data' => compact('r_follow_up'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Lead detail\'s Get Successfully for edit.'
        ]);
    }

    public function updateConsumerFollowUp(Request $request) {
        $follow_ups = $this->followups_repo->save_consumer_follow_ups($request);
        return $this->respond([
            'data' => compact('follow_ups'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'FollowUp\'s Get Successfully .'
        ]);
    }

     public function notification($data)
    {

             $purchase_receive_save = DB::table('notification')->insert([           

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
}
