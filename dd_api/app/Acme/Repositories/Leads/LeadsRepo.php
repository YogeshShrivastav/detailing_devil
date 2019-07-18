<?php

namespace Acme\Repositories\Leads;
use App\Consumer;
use App\Franchise;
use DB;
class LeadsRepo
{
    public function get_franchise_leads($limit, $search, $Login, $user_assign_search) 
    {
        
        $leads = DB::table('franchises');
        $leads->leftJoin('users', 'users.id', '=', 'franchises.user_assign');
        $leads->leftJoin('users as user2', 'user2.id', '=', 'franchises.created_by');
        $leads->leftJoin('users as status_users', 'franchises.status_convert_by', '=', 'status_users.id');
        $leads->where('franchises.type', 1);
        $leads->where('franchises.status', 'A');
        
        if($Login->access_level == 3 ){
            
            $id = $Login->id;
            $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id )
                ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $leads->join('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
            
        }
        
        if($Login->access_level != 3  && !$user_assign_search ){
            $id = $Login->id;
            $leads->leftJoin('franchise_assign_sales_agent', function($join) use($id) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $leads->leftJoin('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
            
        }
        
        
        
        if($Login->access_level != 3 && $user_assign_search ){
            $id = $Login->id;
            
            $leads->join('franchise_assign_sales_agent', function($join) use($id,$user_assign_search ) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id');
                $join->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
                $join->where('franchise_assign_sales_agent.sales_agent_id', '=', $user_assign_search  );
            });
            
            $leads->join('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
            
        }
        
        
        $leads->leftJoin('follow_ups', function($join){
            $join->on('follow_ups.franchise_id','=','franchises.id')
            ->where('follow_ups.followup_status', '=', 'p' )
            ->where('follow_ups.next_follow_type', '!=', 'Appointment' );
            
        });
        
        if(isset($search['city']) && $search['city'] == '--'){
            $leads->where('franchises.city', '=', '');
            
        }else if(isset($search['city']) && $search['city'] != '') {
            $leads->where('franchises.city', 'LIKE', ''.$search['city'].'');
        }
        
        
        if(isset($search['source']) && $search['source'] != '') $leads->where('franchises.source', '=', ''.$search['source'].'');
        
        if(isset($search['lead_source_type']) && $search['lead_source_type'] == 'api') $leads->where('franchises.created_by','0' );
        
        if(isset($search['lead_status']) && $search['lead_status'] != '') $leads->where('franchises.lead_status', 'LIKE', '%'.$search['lead_status'].'%');
        
        if(isset($search['date']) && $search['date'] != '') $leads->where('franchises.created_at', 'LIKE', '%'.$search['date'].'%');
        
        
        
        if(isset($search['master']) && $search['master'] != '') 
        {
            $s = $search['master'];
            $leads ->where(function ($query) use ($s ) 
            {
                $query->where('franchises.name','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%')
                ->orWhere('user2.first_name','LIKE','%'.$s.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$s.'%');
                
            });
        }
        
        
        
        return $leads->select('franchises.*','users.first_name','user2.first_name as created_name','status_users.first_name as s_name', 'franchises.id as assign_sales', DB::raw('group_concat( franchise_assign_sales_agent_users.first_name ) as agents'),'follow_ups.id as followup_id' )->orderBy('franchises.updated_at', 'DESC')->groupBy('franchises.id')->paginate($limit);
        
        
    }
    
    
    
    public function get_assign_user_list($Login){
        
        
        $leads = DB::table('franchises');
        $leads->leftJoin('users', 'users.id', '=', 'franchises.user_assign');
        $leads->where('franchises.type', 1);
        $leads->where('franchises.status', 'A');
        
        if($Login->access_level == 3 ){
            $id = $Login->id;
            $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id )
                ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $leads->join('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
        }
        
        if($Login->access_level != 3 ){
            $id = $Login->id;
            $leads->leftJoin('franchise_assign_sales_agent', function($join) use($id) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $leads->leftJoin('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
        }
        
        return $leads->groupBy('franchise_assign_sales_agent_users.id')->select('franchise_assign_sales_agent_users.id','franchise_assign_sales_agent_users.first_name')->get();
        
        
    }
    
    
    
    
    public function get_cites($Login){
        
        
        $leads = DB::table('franchises');
        $leads->where('franchises.type', 1);
        $leads->where('franchises.status', 'A');
        
        if($Login->access_level == 3 ){
            $id = $Login->id;
            $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id )
                ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $leads->join('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
            });
            
        }
        
        return $leads->groupBy('franchises.city')->orderBy('franchises.city','ASC')->select('franchises.city')->get();
        
        
    }
    
    
    
    
    
    
    public function get_consumer_leads($limit,$search, $Login, $user_assign_search) {
        $l = DB::table('consumers');
        $l->leftJoin('countries', 'consumers.country_id', '=', 'countries.id');
        $l->leftJoin('locations', 'consumers.location_id', '=', 'locations.id');
        $l ->leftJoin('franchises', 'consumers.franchise_id', '=', 'franchises.id');
        $l ->leftJoin('users', 'consumers.created_by', '=', 'users.id');
        $l->where('consumers.type', 1);
        
        if($Login->access_level == 6 )
        $l->where('consumers.franchise_sales_manager_assign', $Login->id);
        
        if($Login->access_level == 3 ){
            $id = $Login->id;
            
            $l->join('consumer_assign_sales_agent', function($join) use($id) {
                $join->on('consumer_assign_sales_agent.franchise_id','=','consumers.id')
                ->where('consumer_assign_sales_agent.sales_agent_id', '=',  $id )
                ->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $l->join('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
            });
            
        }
        
        if($Login->access_level != 3 && !$user_assign_search ){
            $id = $Login->id;
            $l->leftJoin('consumer_assign_sales_agent', function($join) use($id) {
                $join->on('consumer_assign_sales_agent.franchise_id','=','consumers.id')
                ->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
            });
            
            $l->leftJoin('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
            });
        }
        
        if($Login->access_level != 3 && $user_assign_search ){
            $id = $Login->id;
            
            $l->join('consumer_assign_sales_agent', function($join) use($id,$user_assign_search ) {
                $join->on('consumer_assign_sales_agent.franchise_id','=','franchises.id');
                $join->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
                $join->where('consumer_assign_sales_agent.sales_agent_id', '=', $user_assign_search  );
            });
            
            $l->join('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
            });
        }
        
        $l->leftJoin('follow_ups', function($join) {
            $join->on('follow_ups.consumer_id','=','consumers.id')
            ->where('follow_ups.followup_status', '=', 'p' )
            ->where('follow_ups.next_follow_type', '!=', 'Appointment' );
            
        });
        
        if($Login->access_level == 5 )
        $l->where('consumers.franchise_id', $Login->id);
        
        $l->where('consumers.status', 'A');
        
        if(isset($search['city']) && $search['city'] == '--'){
            $l->where('consumers.city', '=', '');
            
        }else if(isset($search['city']) && $search['city'] != '') {
            $l->where('consumers.city', 'LIKE', ''.$search['city'].'');
            
        }
        
        
        
        if(isset($search['lead_status']) && $search['lead_status'] != '') $l->where('consumers.lead_status', 'LIKE', '%'.$search['lead_status'].'%');
        
        
        // if( !isset($search['lead_source_type']) || ( isset($search['lead_source_type']) && $search['lead_source_type'] == 'portal') ) $l->where('consumers.created_by', '!=','0' );
        
        if(isset($search['lead_source_type']) && $search['lead_source_type'] == 'api') $l->where('consumers.created_by', '0' );
        
        
        
        if(isset($search['source']) && $search['source'] != '') $l->where('consumers.source', 'LIKE', '%'.$search['source'].'%');
        
        if(isset($search['date']) && $search['date'] != '') $l->where('consumers.created_at', 'LIKE', '%'.$search['date'].'%');
        
        if(isset($search['franchise_id']) && $search['franchise_id'] != '') $l->where('consumers.franchise_id', '=', ''.$search['franchise_id'].'');
        
        // if(isset($search['master']) && $search['master'] != '') $l->where('consumers.first_name', 'LIKE', ''.$search['master'].'%');
        
        // if(isset($search['mobile']) && $search['mobile'] != '') $l->where('consumers.phone', 'LIKE', '%'.$search['mobile'].'%');
        
        
        if(isset($search['master']) && $search['master'] != '') {
            $s = $search['master'];
            $l->where(function ($query) use ($s ) {
                $query->where('consumers.first_name','LIKE','%'.$s.'%')
                ->orWhere('consumers.phone','LIKE','%'.$s.'%')
                ->orWhere('franchises.name','LIKE','%'.$s.'%')
                ->orWhere('locations.location_name','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%');
                
                // if($s == 'source api' || $s == 'Source API' ){
                    //     $query->orWhere('consumers.created_by','=','0');
                    // }
                    
                    
                    
                });
            }
            
            
            return $lead = $l->select('consumers.*','users.first_name as created_name','franchises.id as franchise_id','franchises.name as franchise_name', 'countries.name as country_name', DB::raw('group_concat( consumer_assign_sales_agent_users.first_name ) as agents') , 'locations.location_name','follow_ups.id as followup_id')->orderBy('consumers.updated_at', 'DESC')->groupBy('consumers.id')->paginate($limit);
        }
        
        
        
        
        
        
        public function get_consumer_cites($Login) {
            $l = DB::table('consumers');
            $l->where('consumers.type', 1);
            $l->where('consumers.status', 'A');
            
            if($Login->access_level == 6 )
            $l->where('consumers.franchise_sales_manager_assign', $Login->id);
            
            if($Login->access_level == 3 ){
                $id = $Login->id;
                
                $l->join('consumer_assign_sales_agent', function($join) use($id) {
                    $join->on('consumer_assign_sales_agent.franchise_id','=','consumers.id')
                    ->where('consumer_assign_sales_agent.sales_agent_id', '=',  $id )
                    ->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
                });
                
                $l->join('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                    $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
                });
                
            }
            
            
            if($Login->access_level == 5 )
            $l->where('consumers.franchise_id', $Login->id);
            
            return $lead = $l->groupBy('consumers.city')->orderBy('consumers.city', 'ASC')->select('consumers.city')->get();
        }
        
        
        
        
        
        
        public function get_assign_franchise_list(){
            
            $leads = Consumer::join('franchises', 'consumers.franchise_id', '=', 'franchises.id')
            ->join('locations', 'franchises.location_id', '=', 'locations.id')
            ->where('consumers.type', 1)
            ->where('consumers.status', 'A');
            return $leads->select('franchises.id','franchises.name','locations.location_name')
            ->orderBy('franchises.name', 'ASC')
            ->groupBy('franchises.id')
            ->get();
            
        }
        
        
        
        public function total_consumer_leads($Login) {
            $l = DB::table('consumers');
            $l->where('consumers.type', 1);
            
            if($Login->access_level == 6 )
            $l->where('consumers.franchise_sales_manager_assign', $Login->id);
            
            // if($Login->access_level == 3 ){
                // $l->where('consumers.created_by', $Login->id);
                // }
                
                if($Login->access_level == 3 ){
                    $id = $Login->id;
                    
                    $l->join('consumer_assign_sales_agent', function($join) use($id) {
                        $join->on('consumer_assign_sales_agent.franchise_id','=','consumers.id')
                        ->where('consumer_assign_sales_agent.sales_agent_id', '=',  $id )
                        ->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
                    });
                    
                    $l->join('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                        $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
                    });
                    
                }
                
                // if($Login->access_level != 3 ){
                    //     $id = $Login->id;
                    //     $l->leftJoin('consumer_assign_sales_agent', function($join) use($id) {
                        //         $join->on('consumer_assign_sales_agent.franchise_id','=','consumers.id')
                        //         ->where('consumer_assign_sales_agent.isDeactive', '=', '0' );
                        //     });
                        
                        //     $l->leftJoin('users as consumer_assign_sales_agent_users ', function($join) use($id) {
                            //         $join->on('consumer_assign_sales_agent_users.id','=','consumer_assign_sales_agent.sales_agent_id');
                            //     });
                            
                            
                            // }
                            
                            
                            if($Login->access_level == 5 )
                            $l->where('consumers.franchise_id', $Login->id);
                            
                            
                            $l->where('consumers.status', 'A');
                            
                            
                            
                            
                            return  $l->count('consumers.id');
                            
                        }
                        
                        public function total_franchise_leads($Login) {
                            
                            $leads = DB::table('franchises');
                            $leads->where('franchises.type', 1);
                            $leads->where('franchises.status', 'A');
                            
                            if($Login->access_level == 3 ){
                                $id = $Login->id;
                                $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                                    $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                                    ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id )
                                    ->where('franchise_assign_sales_agent.isDeactive', '=', '0' );
                                });
                                
                                $leads->join('users as franchise_assign_sales_agent_users ', function($join) use($id) {
                                    $join->on('franchise_assign_sales_agent_users.id','=','franchise_assign_sales_agent.sales_agent_id');
                                });
                                
                                
                            }
                            
                            
                            return $leads->count();
                        }
                        
                        public function save_franchise_lead($data) 
                        {
                            $lead = new Franchise();
                            $lead->name = $data->name;
                            $lead->contact_no = $data->contact_no;
                            $lead->email_id = $data->email;
                            $lead->source = $data->source;
                            $lead->address = $data->address;
                            $lead->country_id = $data->country_id;
                            $lead->state = $data->state;
                            $lead->district = $data->district;
                            $lead->city = $data->city;
                            $lead->pincode = $data->pincode;
                            $lead->company_name = $data->company_name;
                            $lead->email2 = $data->company_email;
                            $lead->business_type = $data->business_type;
                            $lead->profile = $data->profile;
                            $lead->business_loc = $data->business_loc;
                            $lead->year_of_est = $data->year_of_est;
                            $lead->city_apply_for = $data->city_apply_for;
                            $lead->automotive_exp = $data->automotive_exp;
                            $lead->type = '1';
                            $lead->lead_status = 'new';
                            $lead->created_by = $data->user_id;
                            $lead->status = 'A';
                            
                            // $lead->user_assign = $data->user_assign;
                            $lead->save();
                            
                            return DB::getPdo()->lastInsertId();
                            
                        }
                        
                        public function get_franchise_lead_details($f_id) {
                            $l = Franchise::leftJoin('locations', 'franchises.location_id', '=', 'locations.id')
                            ->leftJoin('users', 'franchises.created_by', '=', 'users.id')
                            ->leftJoin('users as status_users', 'franchises.status_convert_by', '=', 'status_users.id');
                            
                            $l->leftJoin('follow_ups', function($join){
                                $join->on('follow_ups.franchise_id','=','franchises.id')
                                ->where('follow_ups.followup_status', '=', 'p' )
                                ->where('follow_ups.next_follow_type', '!=', 'Appointment' );
                                
                            });
                            
                            return $l->where('franchises.status', 'A')
                            ->where('franchises.id', $f_id)
                            ->select('franchises.*','locations.location_name','users.first_name as created_name','status_users.first_name as s_name','follow_ups.id as followup_id')
                            ->first();
                        }
                        
                        public function get_consumer_lead_details($c_id) {
                            $l = Consumer::leftJoin('countries', 'consumers.country_id', '=', 'countries.id')
                            ->leftJoin('master_service_plans', 'consumers.service_plan_id', '=', 'master_service_plans.id')
                            ->leftJoin('locations', 'consumers.location_id', '=', 'locations.id')
                            ->leftJoin('users', 'consumers.created_by', '=', 'users.id')
                            ->leftJoin('users as apoint_users', 'consumers.status_convert_by', '=', 'apoint_users.id');
                            
                            
                            $l->leftJoin('follow_ups', function($join){
                                $join->on('follow_ups.consumer_id','=','consumers.id')
                                ->where('follow_ups.followup_status', '=', 'p' )
                                ->where('follow_ups.next_follow_type', '!=', 'Appointment' );
                                
                            });
                            
                            return $l->where('consumers.status', 'A')->where('consumers.id', $c_id)
                            ->select('consumers.*', 'countries.name as country_name','users.first_name as created_name', 'locations.location_name as location_name', 'master_service_plans.plan_name as service_plan_name','apoint_users.first_name as appoint_name','follow_ups.id as followup_id')
                            ->first();
                            
                        }
                        
                        public function update_franchise_lead($data) {
                            // echo "<pre>";
                            // print_r($data);
                            // exit;
                            $lead = Franchise::where('id', $data->l_id)->first();
                            $lead->contact_no = $data->contact_no;
                            $lead->email_id = $data->email;
                            $lead->address = $data->address;
                            $lead->country_id = $data->country;
                            $lead->source = $data->source;
                            $lead->state = $data->state;
                            $lead->district = $data->district;
                            $lead->city = $data->city;
                            $lead->pincode = $data->pincode;
                            $lead->company_name = $data->company_name;
                            $lead->business_type = $data->business_type;
                            $lead->profile = $data->profile;
                            $lead->name = $data->name;
                            $lead->business_loc = $data->business_loc;
                            $lead->year_of_est = $data->year_of_est;
                            $lead->city_apply_for = $data->city_apply_for;
                            $lead->automotive_exp = $data->automotive_exp;
                            $lead->updated_by =  $data->user_id;
                            $lead->user_assign = $data->user_assign;
                            
                            
                            
                            
                            if($lead->save()) return $lead;
                            return false;
                        }
                        
                        public function update_consumer_lead($data) {
                            // echo "<pre>";
                            // print_r($data);
                            // exit;
                            $lead = Consumer::where('id', $data->l_id)->first();
                            $lead->vehicle_type = $data->vehicle_type;
                            $lead->service_plan_id = $data->service_plan_id;
                            $lead->country_id = $data->country_id;
                            $lead->state = $data->state;
                            $lead->district = $data->district;
                            $lead->city = $data->city;
                            $lead->pincode = $data->pincode;
                            $lead->location_id = isset($data->location_id) ? $data->location_id : '';
                            $lead->franchise_id = $data->franchise_id;
                            $lead->source = $data->source;
                            $lead->interested_in = $data->interested_in;
                            $lead->category = $data->category;
                            $lead->first_name = $data->first_name;
                            $lead->last_name = $data->last_name;
                            $lead->phone = $data->phone;
                            $lead->email = $data->email;
                            $lead->car_model = $data->car_model;
                            $lead->address = $data->address;
                            $lead->message = $data->message;
                            $lead->updated_by =  $data->user_id;
                            // $lead->franchise_sales_manager_assign = $data->franchise_sales_manager_assign;
                            
                            $lead->company_name = $data->company_name;
                            $lead->company_contact_no = $data->company_contact_no;
                            $lead->gstin = $data->gstin;
                            $lead->company_address = $data->company_address;
                            
                            if($lead->save()) return $lead;
                            return false;
                        }
                        
                        
                        
                        
                        
                        
                        public function update_customer($data) 
                        {
                            // print_r($data);
                            // exit;
                            $lead = Consumer::where('id', $data->l_id)->first();
                            
                            $lead->vehicle_type = $data->vehicle_type;
                            $lead->service_plan_id = $data->service_plan_id;
                            
                            $lead->country_id = $data->country_id;
                            $lead->state = $data->state;
                            $lead->district = $data->district;
                            $lead->city = $data->city;
                            $lead->pincode = $data->pincode;
                            
                            
                            $lead->company_country_id = $data->company_country_id;
                            $lead->company_state = $data->company_state;
                            $lead->company_district = $data->company_district;
                            $lead->company_city = isset( $data->company_city ) ? $data->company_city : '';
                            $lead->company_pincode = $data->company_pincode;
                            
                            
                            
                            $lead->source = $data->source;
                            $lead->interested_in = $data->interested_in;
                            $lead->category = $data->category;
                            $lead->first_name = $data->first_name;
                            $lead->last_name = $data->last_name;
                            $lead->phone = $data->phone;
                            $lead->email = $data->email;
                            $lead->car_model = $data->car_model;
                            $lead->address = $data->address;
                            $lead->message = $data->message;
                            $lead->updated_by =  $data->user_id;
                            $lead->company_name = $data->company_name;
                            $lead->company_contact_no = $data->company_contact_no;
                            $lead->gstin = $data->gstin;
                            $lead->company_address = $data->company_address;
                            
                            if($lead->save()) return $lead;
                            return false;
                        }
                        
                        
                        
                        public function delete_franchise_lead($l_id) {
                            return Franchise::where('id', $l_id)->update(['status' => 'X']);
                        }
                        
                        public function delete_consumer_lead($l_id) {
                            return Consumer::where('id', $l_id)->update(['status' => 'X']);
                        }
                        
                        public function save_consumer_lead($data) {
                            
                            
                            $lead = new Consumer();
                            $lead->vehicle_type = $data->vehicle_type;
                            $lead->service_plan_id = $data->service_plan_id;
                            $lead->country_id = $data->country_id;
                            $lead->state = $data->state;
                            $lead->district = $data->district;
                            $lead->city = $data->city;
                            $lead->pincode = $data->pincode;
                            $lead->franchise_id = $data->franchise_id;
                            $lead->location_id = $data->location_id;
                            $lead->interested_in = $data->interested_in;
                            $lead->source = $data->source;
                            //$lead->category = $data->category;
                            
                            $lead->company_name = $data->company_name;
                            $lead->company_contact_no = $data->company_contact_no;
                            $lead->gstin = $data->gstin;
                            $lead->company_address = $data->company_address;
                            
                            $lead->company_country_id = $data->company_country_id;
                            $lead->company_state = $data->company_state;
                            $lead->company_district = $data->company_district;
                            $lead->company_city = $data->company_city;
                            $lead->company_pincode = $data->company_pincode;
                            
                            $lead->first_name = $data->first_name;
                            $lead->last_name = $data->last_name;
                            $lead->phone = $data->phone;
                            $lead->email = $data->email;
                            $lead->car_model = $data->car_model;
                            $lead->address = $data->address;
                            $lead->lead_status = 'new';
                            $lead->message = $data->message;
                            $lead->created_by = $data->user_id;       
                            // $lead->franchise_sales_manager_assign = $data->franchise_sales_manager_assign;
                            $lead->type = $data->type;
                            $lead->status = 'A';
                            $lead->save();
                            return DB::getPdo()->lastInsertId();
                            
                        }
                        
                        public function update_consumer_lead_status($data) {
                            
                            Consumer::where('id', $data->l_id)
                            
                            ->update([ 'previous_status' => DB::raw("`lead_status`")  ]);
                            
                            return Consumer::where('id', $data->l_id)
                            ->update([
                                'lead_status' => $data->lead_status,
                                'status_convert_by' => $data->login_id,
                                'status_convert_date' => date('Y-m-d H:i:s')
                                ]);
                            }
                            
                            public function update_franchise_lead_status($data) {
                                Franchise::where('id', $data->l_id)
                                ->update([ 'previous_status' => DB::raw("`lead_status`")  ]);
                                
                                return Franchise::where('id', $data->l_id)
                                ->update([
                                    'lead_status' => $data->lead_status,
                                    'status_convert_by' => $data->login_id,
                                    'status_convert_date' => date('Y-m-d H:i:s')
                                    ]);
                                    
                                }
                                
                                
                                
                                public function assign_franchise($data)
                                {
                                    
                                    $lead = Consumer::whereIn('id', $data->lead_id)
                                    ->update([
                                        'franchise_id' => $data->franchise_id,
                                        'location_id' => $data->location_id,
                                        ]);
                                        if($lead)
                                        { return true;}
                                        else
                                        { return false;}
                                        
                                    }
                                    
                                    
                                    
                                    public function assign_user($data)
                                    {
                                        
                                        $lead = Franchise::whereIn('id', $data->franchise_id)->update([
                                            'user_assign' => $data->user_assign
                                            ]);
                                            if($lead)
                                            { return true;}
                                            else
                                            { return false;}
                                            
                                        }
                                        
                                        
                                        
                                    }