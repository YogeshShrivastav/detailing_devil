<?php

namespace Acme\Repositories\FollowUps;

use App\Consumer;
use App\FollowUp;
use App\Franchise;
use DB;
class FollowUpsRepo
{
    public function get_today_follow_ups( $filter ,$per_page, $search = null, $session) {



        $follow_ups = FollowUp::leftJoin('consumers', function($join) {
            $join->on('follow_ups.consumer_id', '=', 'consumers.id')
            ->where('consumers.status', '=', 'A');
        });

        $follow_ups->leftJoin('franchises', function($join) {
            $join->on('follow_ups.franchise_id', '=', 'franchises.id')
            ->where('franchises.status', '=', 'A');
        });

        $follow_ups->leftJoin('locations', function($join) {
            $join->on('consumers.location_id', '=', 'locations.id');
        });

        $follow_ups->leftJoin('locations as f_l', function($join) {
            $join->on('franchises.location_id', '=', 'f_l.id');
        });

         $follow_ups->leftJoin('franchises as f2', function($join) {
            $join->on('consumers.franchise_id', '=', 'f2.id');
        });
         $follow_ups->leftJoin('users', function($join) {
            $join->on('follow_ups.created_by', '=', 'users.id');
        });
          

        

       $follow_ups->where('follow_ups.followup_status', '=', 'P');
            if($session->access_level == '3')
            $follow_ups->where('follow_ups.created_by', '=', $session->id);

            $follow_ups->where('follow_ups.next_follow_date', '<=', date('Y-m-d') );
            $follow_ups->where('follow_ups.next_follow_date', '!=', '0000-00-00');



        if(isset($filter->date) && $filter->date != '') $follow_ups->where('follow_ups.next_follow_date','LIKE','%'.$filter->date.'%');

        if(isset($filter->NextFollowupType) && $filter->NextFollowupType != '') $follow_ups->where('follow_ups.next_follow_type','LIKE','%'.$filter->NextFollowupType.'%');

        if(isset($filter->FollowupType) && $filter->FollowupType != '') $follow_ups->where('follow_ups.follow_type','LIKE','%'.$filter->FollowupType.'%');
        if(isset($filter->type) && $filter->type != '' && $filter->type == 'Consumer') $follow_ups->where('follow_ups.consumer_id','!=','0');
        if(isset($filter->type) && $filter->type != '' && $filter->type == 'Franchise') $follow_ups->where('follow_ups.franchise_id','!=','0');



        if(isset($search) && $search){
                $follow_ups ->where(function ($query) use ($search ) {
                    $query->where('consumers.first_name', 'LIKE', '%'.$search.'%')
                        ->orWhere('consumers.phone','LIKE','%'.$search.'%')
                        ->orWhere('franchises.name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.company_name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.contact_no','LIKE','%'.$search.'%');
                });
            }


            // if($search) $follow_ups->where('consumers.first_name', 'LIKE', '%'.$search.'%')->orWhere('consumers.phone','LIKE','%'.$search.'%')->orWhere('franchises.name','LIKE','%'.$search.'%')->orWhere('franchises.contact_no','LIKE','%'.$search.'%');

        return $follow_ups->select('follow_ups.*','franchises.contact_no','franchises.name as f_name' ,'f2.company_name as assign_name','franchises.city','franchises.company_name', 'franchises.business_type', 'consumers.first_name', 'consumers.last_name', 'consumers.phone', 'consumers.interested_in','users.first_name as created_name','locations.location_name','f_l.location_name as f_l_name')->orderBy('follow_ups.id','DESC')->paginate($per_page);


    }



    public function get_today_appointment_follow_ups($per_page, $search = null, $session) {

        $follow_ups = FollowUp::join('consumers', function($join) {
            $join->on('follow_ups.consumer_id', '=', 'consumers.id')
            ->where('consumers.status', '=', 'A');
        });

    if($session->access_level == '3' ){


                $follow_ups->join('franchises', function($join) {
                    $join->on('consumers.franchise_id', '=', 'franchises.id');
                    // ->where('franchises.status', '=', 'A');
                });

                $id = $session->id;
                $follow_ups->join('franchise_assign_sales_agent', function($join) use($id) {
                    $join->on('franchise_assign_sales_agent.franchise_id', '=', 'franchises.id')
                    ->where('franchise_assign_sales_agent.sales_agent_id', '=', $id);
                });

        }

      

        $follow_ups->leftJoin('users', function($join) {
            $join->on('follow_ups.created_by', '=', 'users.id');
        });

        $follow_ups->leftJoin('locations', function($join) {
            $join->on('consumers.location_id', '=', 'locations.id');
        });
          
        // $follow_ups->leftJoin('locations as f_l', function($join) {
        //     $join->on('franchises.location_id', '=', 'f_l.id');
        // });


        if(isset($search) && $search){
                $follow_ups ->where(function ($query) use ($search ) {
                    $query->where('consumers.first_name', 'LIKE', '%'.$search.'%')
                        ->orWhere('consumers.phone','LIKE','%'.$search.'%');
                        // ->orWhere('franchises.name','LIKE','%'.$search.'%')
                        // ->orWhere('franchises.contact_no','LIKE','%'.$search.'%');
                });
            }


        // if($search) $follow_ups->where('consumers.first_name', 'LIKE', '%'.$search.'%');

        // if($session->access_level == '3')
        // $follow_ups->where('follow_ups.created_by', '=', $session->id);

        return $follow_ups->where('follow_ups.followup_status', '=', 'P')

        // ->where('follow_ups.next_follow_date', '<=', date('Y-m-d') )
        ->where('follow_ups.next_follow_type', '=','Appointment' )
        ->where('follow_ups.next_follow_date', '!=', '0000-00-00')
        ->select('follow_ups.*', 'consumers.first_name', 'consumers.last_name', 'consumers.phone', 'consumers.interested_in', 'consumers.car_model','users.first_name as created_name','locations.location_name')
        ->groupBy('follow_ups.id')
        ->orderBy('follow_ups.id','DESC')
        ->paginate($per_page);


    }






        public function get_upcoming_follow_ups($filter,$per_page, $search = null, $session) {

            $follow_ups = FollowUp::leftJoin('consumers', function($join) {
                $join->on('follow_ups.consumer_id', '=', 'consumers.id')
                ->where('consumers.status', '=', 'A');
            });

            $follow_ups->join('users', function($join) {
                $join->on('follow_ups.created_by', '=', 'users.id');
            });

            $follow_ups->leftJoin('franchises', function($join) {
                $join->on('follow_ups.franchise_id', '=', 'franchises.id')
                ->where('franchises.status', '=', 'A');
            });

            $follow_ups->leftJoin('locations', function($join) {
                $join->on('consumers.location_id', '=', 'locations.id');
            });
            
      

            $follow_ups->leftJoin('franchises as f2', function($join) {
                $join->on('consumers.franchise_id', '=', 'f2.id');
            });

          
            if($search){
                $follow_ups ->where(function ($query) use ($search ) {
                    $query->where('consumers.first_name', 'LIKE', '%'.$search.'%')
                        ->orWhere('consumers.phone','LIKE','%'.$search.'%')
                        ->orWhere('franchises.name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.company_name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.contact_no','LIKE','%'.$search.'%');
                });
            }
            
            if(isset($filter->date) && $filter->date != '') $follow_ups->where('follow_ups.next_follow_date','LIKE','%'.$filter->date.'%');

        if(isset($filter->NextFollowupType) && $filter->NextFollowupType != '') $follow_ups->where('follow_ups.next_follow_type','LIKE','%'.$filter->NextFollowupType.'%');

        if(isset($filter->FollowupType) && $filter->FollowupType != '') $follow_ups->where('follow_ups.follow_type','LIKE','%'.$filter->FollowupType.'%');

         if(isset($filter->type) && $filter->type != '' && $filter->type == 'Consumer') $follow_ups->where('follow_ups.consumer_id','!=','0');
        if(isset($filter->type) && $filter->type != '' && $filter->type == 'Franchise') $follow_ups->where('follow_ups.franchise_id','!=','0');

            // if($search) $follow_ups->where('consumers.first_name', 'LIKE', '%'.$search.'%')
            // ->orWhere('franchises.name','LIKE','%'.$search.'%');

            if($session->access_level == '3')
            $follow_ups->where('follow_ups.created_by', '=', $session->id);

            return $follow_ups->where('follow_ups.followup_status', '=', 'P')->where('follow_ups.next_follow_date', '!=', '0000-00-00')->where('follow_ups.next_follow_date', '>', date('Y-m-d'))->select('follow_ups.*','users.first_name as created_name','franchises.contact_no','franchises.name as f_name' ,'franchises.company_name','franchises.city', 'franchises.business_type', 'consumers.first_name', 'consumers.last_name', 'consumers.phone', 'consumers.interested_in','f2.company_name as assign_name','locations.location_name')->orderBy('follow_ups.id','DESC')->paginate($per_page);

        }


        public function get_done_follow_ups($filter,$per_page,  $search = null, $session) {

            $follow_ups = FollowUp::leftJoin('consumers', function($join) {
                $join->on('follow_ups.consumer_id', '=', 'consumers.id')
                ->where('consumers.status', '=', 'A');
            });

            $follow_ups->leftJoin('franchises', function($join) {
                $join->on('follow_ups.franchise_id', '=', 'franchises.id')
                ->where('franchises.status', '=', 'A');
            });

            $follow_ups->leftJoin('locations', function($join) {
                $join->on('consumers.location_id', '=', 'locations.id');
            });

            $follow_ups->leftJoin('locations as f_l', function($join) {
                $join->on('franchises.location_id', '=', 'f_l.id');
            });


            $follow_ups->leftJoin('franchises as f2', function($join) {
                $join->on('consumers.franchise_id', '=', 'f2.id');
            });

             $follow_ups->leftJoin('users', function($join) {
                $join->on('follow_ups.created_by', '=', 'users.id');
            });
          
            


            if($session->access_level == '3')
            $follow_ups->where('follow_ups.created_by', '=', $session->id);

            $follow_ups->where('follow_ups.updated_at', '=', date('Y-m-d') );


             $follow_ups->where('follow_ups.followup_status', '=', 'D' );


             if(isset($filter->date) && $filter->date != '') $follow_ups->where('follow_ups.next_follow_date','LIKE','%'.$filter->date.'%');

        if(isset($filter->NextFollowupType) && $filter->NextFollowupType != '') $follow_ups->where('follow_ups.next_follow_type','LIKE','%'.$filter->NextFollowupType.'%');

        if(isset($filter->FollowupType) && $filter->FollowupType != '') $follow_ups->where('follow_ups.follow_type','LIKE','%'.$filter->FollowupType.'%');

         if(isset($filter->type) && $filter->type != '' && $filter->type == 'Consumer') $follow_ups->where('follow_ups.consumer_id','!=','0');
        if(isset($filter->type) && $filter->type != '' && $filter->type == 'Franchise') $follow_ups->where('follow_ups.franchise_id','!=','0');




if(isset($search) && $search){
                $follow_ups ->where(function ($query) use ($search ) {
                    $query->where('consumers.first_name', 'LIKE', '%'.$search.'%')
                        ->orWhere('consumers.phone','LIKE','%'.$search.'%')
                        ->orWhere('franchises.name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.company_name','LIKE','%'.$search.'%')
                        ->orWhere('franchises.contact_no','LIKE','%'.$search.'%');
                });
            }

            // if($search) $follow_ups->where('consumers.first_name', 'LIKE', '%'.$search.'%')->orWhere('franchises.name','LIKE','%'.$search.'%');

            return $follow_ups->select('follow_ups.*','users.first_name as created_name','franchises.contact_no','franchises.name as f_name' ,'franchises.company_name','f2.company_name as assign_name','franchises.city', 'franchises.business_type', 'consumers.first_name', 'consumers.last_name', 'consumers.phone', 'consumers.interested_in','locations.location_name','f_l.location_name as f_l_name')->orderBy('follow_ups.id','DESC')->paginate($per_page);

        }




                        public function total_pending_follow_ups($session) {
                            $f = FollowUp::where('followup_status', '=', 'P');
                            
                            if($session->access_level == '3')
                            $f->where('follow_ups.created_by', '=', $session->id);

                            return $f->where('follow_ups.next_follow_date', '!=', '0000-00-00')
                            ->where('next_follow_date', '<=', date('Y-m-d'))
                            ->count();
                        }



                        public function total_done_follow_ups($session) {
                            $f = FollowUp::where('updated_at', '=', date('Y-m-d') );

                            if($session->access_level == '3')
                            $f->where('follow_ups.created_by', '=', $session->id);

                            return $f->where('followup_status', '=', 'D' )
                            ->count();

                        }

                        public function total_upcoming_follow_ups($session) {
                            $f =  FollowUp::where('followup_status', '=', 'P');

                            if($session->access_level == '3')
                            $f->where('follow_ups.created_by', '=', $session->id);

                            return $f->where('follow_ups.next_follow_date', '!=', '0000-00-00')
                            ->where('next_follow_date', '>', date('Y-m-d'))->count();

                        }

                        public function total_upcoming_appointment_follow_ups($session) {
                           
                        
        $follow_ups = FollowUp::join('consumers', function($join) {
            $join->on('follow_ups.consumer_id', '=', 'consumers.id')
            ->where('consumers.status', '=', 'A');
        });

    if($session->access_level == '3' ){


                $follow_ups->join('franchises', function($join) {
                    $join->on('consumers.franchise_id', '=', 'franchises.id');
                    // ->where('franchises.status', '=', 'A');
                });

                $id = $session->id;
                $follow_ups->join('franchise_assign_sales_agent', function($join) use($id) {
                    $join->on('franchise_assign_sales_agent.franchise_id', '=', 'franchises.id')
                    ->where('franchise_assign_sales_agent.sales_agent_id', '=', $id);
                });

        }

      

        $follow_ups->leftJoin('users', function($join) {
            $join->on('follow_ups.created_by', '=', 'users.id');
        });

        $follow_ups->leftJoin('locations', function($join) {
            $join->on('consumers.location_id', '=', 'locations.id');
        });
          


        // if($session->access_level == '3')
        // $follow_ups->where('follow_ups.created_by', '=', $session->id);

        $follow_ups->where('follow_ups.followup_status', '=', 'P')

        // ->where('follow_ups.next_follow_date', '<=', date('Y-m-d') )
        ->where('follow_ups.next_follow_type', '=','Appointment' )
        ->where('follow_ups.next_follow_date', '!=', '0000-00-00')
        ->select('follow_ups.*', 'consumers.first_name', 'consumers.last_name', 'consumers.phone', 'consumers.interested_in', 'consumers.car_model','users.first_name as created_name','locations.location_name')
        ->groupBy('follow_ups.id')
        ->orderBy('follow_ups.id','DESC');
        $f = $follow_ups->get();
        if(!$f)return 0;
        return sizeof( $f );


                        }


                        public function get_followup_consumre($per_page,  $search = null, $f_id){

                            $f = DB::table('franchises')->where('id', $f_id)->first();
                            $location_id =  $f->location_id;

                            $c = DB::table('consumers');
                            $c->where('consumers.status', '=', 'A');
                            // $c->where('consumers.location_id', '=', $location_id );
                            $c->where('consumers.franchise_id', '=', $f_id );

                            if($search)  $c->where('consumers.first_name', 'LIKE', '%'.$search.'%');

                            $consumers = $c->paginate($per_page);

                            return   $consumers;

                        }

                        
                       public function get_appointment_consumer($per_page,  $search = null, $f_id , $session){

                        $f = DB::table('franchises')->where('id', $f_id)->first();
                        $location_id =  $f->location_id;

                        $c = DB::table('consumers');
                        $c->leftJoin('users','consumers.status_convert_by', '=', 'users.id');
                        $c->where('consumers.status', '=', 'A');
                        $c->where('consumers.type', '=', '1');
                        $c->where('consumers.lead_status', '=', 'booked' );
                        $c->where('consumers.franchise_id', '=', $f_id );

                        if($search)  $c->where('consumers.first_name', 'LIKE', '%'.$search.'%');
                        $c->select('consumers.*','users.first_name as created_name');
                        $consumers = $c->get();

                        return   $consumers;

                    }


                        public function frachise_get_today_follow_ups( $consumers , $session ) {

                            $temp = [];
                            foreach ($consumers as $key => $value) {
                               $f = DB::table('follow_ups')
                                ->where('followup_status', '=', 'P')
                                ->where('consumer_id', '=', $value->id);

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow  = $f->where('next_follow_date', '<=', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $follow->first_name = $value->first_name;
                                    $follow->last_name = $value->last_name;
                                    $follow->interested_in = $value->interested_in;
                                    $follow->type = $value->type;
                                    $follow->phone = $value->phone;
                                    array_push($temp, $follow);
                                }
                            }
                            return $temp;

                        }

                        public function frachise_get_upcoming_follow_ups( $consumers , $session  ) {

                            $temp = [];
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups')
                                ->where('followup_status', '=', 'P');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }
                                $follow = $f->where('consumer_id', '=', $value->id)
                                ->where('next_follow_date', '>', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $follow->first_name = $value->first_name;
                                    $follow->last_name = $value->last_name;
                                    $follow->interested_in = $value->interested_in;
                                    $follow->phone = $value->phone;
                                    $follow->type = $value->type;

                                    array_push($temp, $follow);
                                }
                            }
                            return $temp;
                        }


                        
                        
          

                        public function frachise_get_today_appointment_follow_ups( $consumers , $session  ) {

                            $temp = [];
                            foreach ($consumers as $key => $value) {
                                $f= DB::table('follow_ups')
                                ->where('followup_status', '=', 'P')
                                ->where('next_follow_type', '=', 'Appointment');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow = $f->where('consumer_id', '=', $value->id)
                                // ->where('next_follow_date', '<=', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $follow->first_name = $value->first_name;
                                    $follow->last_name = $value->last_name;
                                    $follow->interested_in = $value->interested_in;
                                    $follow->phone = $value->phone;
                                    $follow->type = $value->type;

                                    array_push($temp, $follow);
                                }
                            }
                            return $temp;
                        }



                        
                        public function frachise_appointment_follow_ups( $consumers , $session  ) {

                            $temp = [];
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups')
                                ->where('followup_status', '=', 'P')
                                ->where('next_follow_type', '=', 'Appointment');

                                // if($session->access_level == '6'){
                                //     // $f->where('created_by', '=', $session->id);

                                //     $id = $session->id;
                                //     $f->join('consumers', function($join) use($id) {
                                //         $join->on('follow_ups.consumer_id', '=', 'consumers.id')
                                //         ->where('consumers.franchise_sales_manager_assign', '=', $id);
                                //     });

                                // }

                                

                                $follow = $f->where('consumer_id', '=', $value->id)
                                // ->where('next_follow_date', '<=', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $follow->first_name = $value->first_name;
                                    $follow->last_name = $value->last_name;
                                    $follow->lead_status = $value->lead_status;
                                    $follow->status_convert_by = $value->status_convert_by;
                                    $follow->created_name = $value->created_name;
                                    $follow->status_convert_date = $value->status_convert_date;
                                    $follow->interested_in = $value->interested_in;
                                    $follow->phone = $value->phone;
                                    $follow->type = $value->type;

                                    array_push($temp, $follow);
                                }
                            }
                            return $temp;
                        }



                        public function frachise_get_done_follow_ups(  $consumers , $session  ) {

                            $temp = [];
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow = $f->where('consumer_id', '=', $value->id)
                                ->where('updated_at', '=', date('Y-m-d') )
                                ->where('followup_status', '=', 'D' )

                                ->first();
                                if($follow){
                                    $follow->first_name = $value->first_name;
                                    $follow->last_name = $value->last_name;
                                    $follow->interested_in = $value->interested_in;
                                    $follow->phone = $value->phone;
                                    $follow->type = $value->type;

                                    array_push($temp, $follow);
                                }
                            }
                            return $temp;
                        }




                        public function frachise_total_pending_follow_ups(  $consumers ,  $session  ) {

                            $x = 0;
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow = $f->where('followup_status', '=', 'P')
                                ->where('consumer_id', '=', $value->id)
                                ->where('next_follow_date', '<=', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $x++;
                                }
                            }
                            return $x;

                        }

                        public function frachise_total_appointment_follow_ups(  $consumers  , $session ) {

                            $x = 0;
                            foreach ($consumers as $key => $value) {
                                $follow = DB::table('follow_ups');

                                // if($session->access_level == '6'){
                                //     $follow->where('created_by', '=', $session->id);
                                // }

                                 $follow = $follow->where('followup_status', '=', 'P')
                                ->where('next_follow_type', '=', 'Appointment')
                                ->where('consumer_id', '=', $value->id)
                                // ->where('next_follow_date', '<=', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $x++;
                                }
                            }
                            return $x;

                        }

                        
                        public function frachise_total_done_follow_ups(  $consumers  , $session  ) {

                            $x = 0;
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow = $f->where('consumer_id', '=', $value->id)
                                ->where('updated_at', '=', date('Y-m-d') )
                                ->where('followup_status', '=', 'D')
                                ->first();
                                if($follow){
                                    $x++;
                                }
                            }
                            return $x;

                        }

                        public function frachise_total_upcoming_follow_ups( $consumers , $session ) {

                            $x = 0;
                            foreach ($consumers as $key => $value) {
                                $f = DB::table('follow_ups');

                                if($session->access_level == '6'){
                                    $f->where('created_by', '=', $session->id);
                                }

                                $follow = $f->where('followup_status', '=', 'P')
                                ->where('consumer_id', '=', $value->id)
                                ->where('next_follow_date', '>', date('Y-m-d') )
                                ->where('next_follow_date', '!=', '0000-00-00')
                                ->first();
                                if($follow){
                                    $x++;
                                }
                            }
                            return $x;

                        }

                      
                        

                        public function get_franchise_follow_ups($l_id) {

                            return FollowUp::join('users', 'follow_ups.created_by','=','users.id')
                            ->where('follow_ups.franchise_id', $l_id)
                            ->select('follow_ups.*','users.first_name')
                            ->orderBy('follow_ups.id','DESC')
                            ->get();
                        }
                        public function update_franchise_lead_status($data) {
                            Franchise::where('id', $data->l_id)
                            ->update([ 'previous_status' => DB::raw("`lead_status`"),'updated_at'   =>  date('Y-m-d')  ]);
                    
                            Franchise::where('id', $data->l_id)
                                    ->update([
                                        'lead_status' => $data->status,
                                        'status_convert_by' => $data->user_id,
                                        'status_convert_date' => date('Y-m-d H:i:s')
                                        ]);
                    
                    }


                        public function save_franchise_follow_ups($data) {

                            if($data->status){
                                $this->update_franchise_lead_status($data);
                                $lead = Franchise::where('id', $data->l_id)->first();
                            }
                            FollowUp::where('franchise_id', $data->l_id)->update(['followup_status' => 'D','updated_at' => date('Y-m-d') ]);
                            DB::table('franchises')->where('id',$data->l_id)->update(['updated_at' => date('Y-m-d H:i:s') ] );

                            $follow_up = new FollowUp();
                            $follow_up->franchise_id = $data->l_id;
                            $follow_up->follow_type = $data->follow_type;
                            $follow_up->description = $data->description;
                            $follow_up->next_follow_date = $data->next_follow_date;
                            $follow_up->next_follow_type = $data->next_follow_type;

                            if($data->status){
                                $follow_up->previous_status = $lead->previous_status;
                                $follow_up->current_status = $lead->lead_status;
                            }
                            $follow_up->updated_at = '';
                            
                            if($data->next_follow_date){
                                $follow_up->followup_status = 'P';
                            }else{
                                $follow_up->followup_status = 'D';
                            }

                            $follow_up->created_by = $data->user_id;

                            return $follow_up->save();
                        }


                        public function get_franchise_follow_up_details($f_id) {
                            return Franchise::where('franchise_id', $f_id)->first();
                        }

                        public function update_franchise_follow_up($data) {
                            return FollowUp::where('id', $data->f_id)->update(['followup_status' => 'C']);
                        }

                        public function delete_franchise_follow_ups($f_id) {
                            return FollowUp::where('id', $f_id)->update(['status' => 'X']);
                        }

                        public function get_today_consumer_follow_ups($per_page, $search = null) {
                            $follow_ups = FollowUp::join('consumers', function($join) {
                                $join->on('follow_ups.franchise_id', '=', 'franchises.id')
                                ->where('franchises.status', '=', 'A'); });
                                if($search)
                                $follow_ups->where('first_name', 'LIKE', '%'.$search.'%')->orWhere('company_name','LIKE','%'.$search.'%');
                                return $follow_ups->where('follow_ups.status', '=', 'A')->where('next_follow_date', '>=', date('Y-m-d'))->select('follow_ups.id as follow_up_id', 'follow_ups.created_at', 'consumers.first_name', 'consumers.last_name', 'follow_ups.franchise_id', 'consumers.contact_no', 'consumers.business_type', 'consumers.company_name', 'franchises.city')->paginate($per_page);
                            }

                            public function get_consumer_follow_ups($c_id) {
                                //$follow_ups = FollowUp::join('user_details', 'follow_ups.created_by', '=', 'user_details.id')->where('status', 'A')->where('consumer_id', $c_id);
                                return FollowUp::join('users','users.id','=','follow_ups.created_by')
                                ->where('follow_ups.consumer_id',$c_id)
                                ->select('follow_ups.*','users.first_name as created_name')
                                ->orderBy('follow_ups.id','DESC')
                                ->get();
                            }


                            public function update_consumer_lead_status($data) {

                                Consumer::where('id', $data->l_id)
                            
                                ->update([ 'previous_status' => DB::raw("`lead_status`") ,'updated_at'   =>  date('Y-m-d H:i:s')   ]);
                            
                                return Consumer::where('id', $data->l_id)
                                ->update([
                                    'lead_status' => $data->status,
                                    'status_convert_by' => $data->user_id,
                                    'status_convert_date' => date('Y-m-d H:i:s')
                                 ]);
                            }

                            public function save_consumer_follow_ups($data) {

                                if($data->status){
                                    $this->update_consumer_lead_status($data);
                                    $lead = Consumer::where('id', $data->l_id)->first();
                                }


                                FollowUp::where('consumer_id', $data->l_id)->update(['followup_status' => 'D','updated_at' => date('Y-m-d')]);

                                DB::table('consumers')->where('id',$data->l_id)->update(['updated_at' => date('Y-m-d H:i:s') ] );

                                $follow_up = new FollowUp();
                                $follow_up->consumer_id = $data->l_id;
                                $follow_up->follow_type = $data->follow_type;
                                $follow_up->description = $data->description;
                                $follow_up->next_follow_type = $data->next_follow_type;
                                $follow_up->next_follow_date = $data->next_follow_date;
                                $follow_up->updated_at = '';

                                
                            if($data->status){
                                $follow_up->previous_status = $lead->previous_status;
                                $follow_up->current_status = $lead->lead_status;
                            }

                                if($data->next_follow_date){
                                    $follow_up->followup_status = 'P';
                                }else{
                                    $follow_up->followup_status = 'D';
                                }

                                $follow_up->created_by = $data->user_id;
                                return $follow_up->save();


                            }

                            public function get_consumer_follow_up_details($f_id) {
                                return Consumer::where('consumer_id', $f_id)->first();
                            }

                            public function update_consumer_follow_up($data) {
                                return FollowUp::where('id', $data->f_id)->update(['followup_status' => 'C']);
                            }

                            public function delete_consumer_follow_ups($f_id) {
                                return FollowUp::where('id', $f_id)->update(['status' => 'X']);
                            }

                            public function update_consumer_followups_lead($l_id, $next_follow_date, $next_follow_type) {
                                return Consumer::where('id', $l_id)->update(['next_follow_date' =>$next_follow_date, 'next_follow_type' => $next_follow_type]);
                            }

                            public function update_franchise_followups_lead($l_id, $next_follow_date, $next_follow_type) {
                                return Franchise::where('id', $l_id)->update(['next_follow_date' =>$next_follow_date, 'next_follow_type' => $next_follow_type]);
                            }
                        }
