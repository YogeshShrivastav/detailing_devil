<?php



namespace Acme\Repositories\Franchises;

// use App\FranchiseAccessory;

// use App\FranchiseInitialStock;

// use App\FranchisePlan;

use App\Franchise;

use App\User;

use http\Env\Request;

use Illuminate\Support\Facades\DB;

// use DB;
class FranchisesRepo

{
    
    public function get_franchise($limit, $search, $source , $login ,$request) {

        $filter = (Object)$request['filter'];
        
        $leads = DB::table('franchises')->join('locations', function($join) {
            
            $join->on('franchises.location_id','=','locations.id');
            
        });

        $leads->leftJoin('users','franchises.created_by','=','users.id');
        // $leads->join('users as users2','franchises.id','=','users2.franchise_id');

        
    
        

        $leads->leftJoin('users as users2', function($join) {
            
            $join->on('franchises.id','=','users2.franchise_id');
            
        });
        


            
        // $leads->leftJoin('consumers', function($join) {
            
        //     $join->on('consumers.franchise_id','=','franchises.id')
        //     ->where('consumers.status', '=', 'A')
        //     ->where('consumers.type', '=', '2');
            
        // });

 
        
        
        if($login->access_level == 3 ){
            
            $id = $login->id;
            
            $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                
                ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id );
                
                
            });
            
        }
        
        
        
        if($search) {
            $leads ->where(function ($query) use ($search ) {
                $query->where('franchises.company_name','LIKE','%'.$search.'%')
                ->orWhere('franchises.name','LIKE','%'.$search.'%')
                ->orWhere('franchises.contact_no','LIKE','%'.$search.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $leads->where('franchises.created_at','LIKE','%'.$filter->date.'%');
       if(isset($filter->location_id) && $filter->location_id)$leads->where('franchises.location_id', $filter->location_id );

        
        
        
        
        if($source) $leads->where('franchises.source', $source);
        
        return $leads->where('franchises.type', '2')
        ->where('franchises.status', 'A')
        ->groupBy('franchises.id')
        ->orderBy('franchises.id','DESC')
        ->select('franchises.*','locations.location_name', 'users.first_name as created_name','users2.email as username','users2.visible_password')
        ->paginate($limit);
        // , DB::raw("count(consumers.id) as consumer")
    }



       public function get_franchise_location( $login ) {

        
        $leads = Franchise::leftJoin('locations', function($join) {
            
            $join->on('franchises.location_id','=','locations.id');
            
        });
        
        
        if($login->access_level == 3 ){
            
            $id = $login->id;
            
            $leads->join('franchise_assign_sales_agent', function($join) use($id) {
                
                $join->on('franchise_assign_sales_agent.franchise_id','=','franchises.id')
                
                ->where('franchise_assign_sales_agent.sales_agent_id', '=',  $id );
                
                
            });
            
        }
        
        
        return $leads->where('franchises.type', '2')
        ->where('franchises.status', 'A')
        ->groupBy('locations.id')
        ->orderBy('locations.location_name','ASC')
        ->select('locations.location_name','locations.id','franchises.company_name','franchises.name','franchises.id as franchise_id')
        ->get();
        
    }

    
    
    
    public function save_lead($data) {
        
        $lead = new Franchise();
        
        $lead->name = $data->name;
        
        $lead->created_at = date('Y-m-d');
        
        $lead->contact_no = $data->contact_no;
        
        $lead->email_id = $data->email;
        
        $lead->source = $data->source;
        
        $lead->address = $data->address;
        
        $lead->country = $data->country;
        
        $lead->state = $data->state;
        
        $lead->city = $data->city;
        
        $lead->pin_code = $data->pin_code;
        
        $lead->company_name = $data->company_name;
        
        $lead->business_type = $data->business_type;
        
        $lead->business_loc = $data->business_loc;
        
        $lead->year_of_est = $data->year_of_est;
        
        $lead->city_apply_for = $data->city_apply_for;
        
        $lead->automotive_exp = $data->automotive_exp;
        
        $lead->status = 'A';
        
        return $lead->save();
        
    }
    
    
    
    public function detail($lead_id) {
        
        return Franchise::leftjoin('countries','franchises.country_id','=','countries.id')
        
        ->leftjoin('franchise_purchase_plan','franchise_purchase_plan.franchise_id','=','franchises.id')
        
        ->leftjoin('countries as c2','franchises.cors_country_id','=','c2.id')
        
        ->leftjoin('countries as c3','franchises.ship_country_id','=','c3.id')
        
        ->where('franchises.status', 'A')
        
        ->where('franchises.id', $lead_id)
        
        ->leftjoin('locations','franchises.location_id','=','locations.id')
        
        ->select('franchises.*','locations.location_name','locations.id as loc_id','countries.name as country_name','c2.name as cors_country_name','c3.name as ship_country_name','franchise_purchase_plan.id as plan_id')
        
        ->groupBy('franchises.id')
        
        ->first();
        
    }
    
    
    
    //  public function update_lead($data) {
        
        //      $lead = Lead::where('id', $data->l_id)->first();
        
        //      $lead->contact_no = $data->contact_no;
        
        //      $lead->email_id = $data->email;
        
        //      $lead->address = $data->address;
        
        //      $lead->country = $data->country;
        
        //      $lead->state = $data->state;
        
        //      $lead->city = $data->city;
        
        //      $lead->pin_code = $data->pin_code;
        
        //      $lead->company_name = $data->company_name;
        
        //      $lead->business_type = $data->business_type;
        
        //      $lead->business_loc = $data->business_loc;
        
        //      $lead->year_of_est = $data->year_of_est;
        
        //      $lead->city_apply_for = $data->city_apply_for;
        
        //      $lead->automotive_exp = $data->automotive_exp;
        
        //      if($lead->save()) return $lead;
        
        //      return false;
        
        //  }
        
        
        
        public function deleteFranchises($l_id) {
            
            User::where('franchise_id', $l_id)->update(['is_active' => '0']);
            return Franchise::where('id', $l_id)->update(['status' => 'X']);
            
        }
        
    }
    
    