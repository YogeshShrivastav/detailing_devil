<?php

namespace Acme\Repositories\Franchises;
// use App\FranchiseAccessory;
// use App\FranchiseInitialStock;
// use App\FranchisePlan;
use App\Lead;
use http\Env\Request;
use Illuminate\Support\Facades\DB;

class FranchisesRepo
{
    public function get_franchise($limit, $search, $source) {
        $leads = Lead::where('status', 'A');
        $leads->where('type', '2');
        if($search) $leads->where('name', 'LIKE', '%'.$search.'%');
        if($source) $leads->where('source', $source);
        return $leads->paginate($limit);
    }

    public function save_lead($data) {
        $lead = new Lead(); 
        $lead->name = $data->name;
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
        return Lead::where('status', 'A')->where('id', $lead_id)->first();
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
        return Lead::where('id', $l_id)->update(['status' => 'X']);
    }
}