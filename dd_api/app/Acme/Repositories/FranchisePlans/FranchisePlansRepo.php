<?php

namespace Acme\Repositories\FranchisePlans;


use App\MasterFranchiseAccessory;
use App\MasterFranchiseInitialStock;
use App\MasterFranchisePlan;
use Illuminate\Support\Facades\DB;

class FranchisePlansRepo
{
    public function get_franchise_plans($limit, $search) {
        $franchise = MasterFranchisePlan::where('status', 'A');
        if($search) $franchise->where('plan', 'LIKE', '%'.$search.'%');
        return $franchise->select('id', 'plan as franchise_plan', 'description', 'price')->paginate($limit);
    }

    public function get_franchise_accessories($franchise_plans) {
        $accessories = [];
        foreach($franchise_plans as $val) {
            $data = MasterFranchiseAccessory::where('franchise_plan_id', $val->id)->where('status', 'A')->select('id as accessories_id', 'franchise_plan_id', 'master_franchise_accessories.accessories_name')->get()->toArray();
            if(count($data)) array_push($accessories, $data);
        }
        return $accessories;
    }

    public function get_initial_stocks($franchise_plans) {
        $stocks = [];
        foreach($franchise_plans as $val) {
            $data = MasterFranchiseInitialStock::where('franchise_plan_id', $val->id)->where('status', '=' ,'A')->get()->toArray();
            if(count($data)) array_push($stocks, $data);
        }
        return $stocks;
    }

    public function save_franchise_plan($data) {
        $franchise_plan = new MasterFranchisePlan();
        $franchise_plan->plan = $data->plan;
        $franchise_plan->description = $data->description;
        $franchise_plan->price = $data->price;
        $franchise_plan->status = 'A';
        if($franchise_plan->save())
            // $this->save_franchise_accessories($franchise_plan->id, $data->accessories);
            $this->save_initial_stocks($franchise_plan->id, $data->initial_stock);
        return $franchise_plan;
    }

//    public function save_franchise_accessories($franchise_id, $accessories) {
//        foreach($accessories as $accessory) {
//            foreach($accessory as $val) {
//                foreach($val as $name) {
//                    $accessories = new FranchiseAccessory();
//                    $accessories->franchise_plan_id = $franchise_id;
//                    $accessories->accessories_name = $name;
//                    $accessories->status = 'A';
//                    $accessories->save();
//                }
//            }
//        }
//        return true;
//    }
    public function save_franchise_accessories($franchise_id, $accessories) {
        foreach($accessories as $accessory) {
            $accessory = (object)$accessory;
            $accessories = new MasterFranchiseAccessory();
            $accessories->franchise_plan_id = $franchise_id;
            $accessories->accessories_name = $accessory->accessories_name;
            $accessories->status = 'A';
            $accessories->save();
        }
        return true;
    }

    public function save_initial_stocks($franchise_plan_id, $initial_stock) {
       foreach($initial_stock as $val) {
           $val = (object) $val;
           $initial_stocks = new MasterFranchiseInitialStock();
           $initial_stocks->franchise_plan_id = $franchise_plan_id;
           $initial_stocks->brand = $val->brand;
           $initial_stocks->category = $val->category;
           $initial_stocks->product = $val->product;
           $initial_stocks->hsn_code = $val->hsn_code;
           $initial_stocks->attribute_type = $val->attribute_type;
           $initial_stocks->attribute_option = $val->attribute_option;
           $initial_stocks->unit_measurement = $val->unit;
           $initial_stocks->uom_id = $val->uom_id;
           $initial_stocks->quantity = $val->quantity;
           $initial_stocks->status = 'A';
           $initial_stocks->save();
       }
       return true;
    }

    public function get_plan_names() {
        return MasterFranchisePlan::where('status', 'A')->select(DB::RAW('DISTINCT(plan) as name'))->get();
    }

    public function get_franchise_details($f_id) {
        return MasterFranchisePlan::where('id', $f_id)->where('status', 'A')->select('id', 'plan', 'description', 'price')->first();
    }

    public function franchise_accessories_get($f_id) {
        return MasterFranchiseAccessory::where('franchise_plan_id', $f_id)->where('status' ,'A')->select('id as accessories_id', 'franchise_plan_id', 'master_franchise_accessories.accessories_name')->get();
    }

    public function initial_stocks_get($f_id) {
        return MasterFranchiseInitialStock::where('franchise_plan_id', $f_id)->where('status', 'A')->select('id', 'franchise_plan_id', 'brand', 'product', 'unit_measurement as unit', 'quantity', 'products_id','hsn_code','category')->get();
    }

    public function remove_stock_data($stock_id) {
        $stock = MasterFranchiseInitialStock::where('id', $stock_id)->where('status', 'A')->first();
        $stock->status = 'X';
        return $stock->save();
    }

    public function remove_accessories_data($accessories_id) {
        $accessories = MasterFranchiseAccessory::where('id', $accessories_id)->where('status', 'A')->first();
        $accessories->status = 'X';
        return $accessories->save();
    }

    public function update_franchise_plan($data) {
        $franchise_plan = MasterFranchisePlan::where('id', $data->franchise_plan_id)->where('status', 'A')->first();
        $franchise_plan->plan = $data->plan;
        $franchise_plan->description = $data->description;
        if($franchise_plan->save())
            $this->save_franchise_accessories($franchise_plan->id, $data->accessories);
        $this->save_initial_stocks($franchise_plan->id, $data->initial_stock);
        return $franchise_plan;
    }

    public function remove_franchise_plan($f_id) {
        return MasterFranchisePlan::where('id', $f_id)->update(['status' => 'X']);
    }
}