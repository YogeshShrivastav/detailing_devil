<?php



namespace Acme\Repositories\ServicePlans;



use App\MasterServicePlan;

use App\MasterServiceVisitRawMaterial;

use App\MasterServiceVisitType;

use Illuminate\Support\Facades\DB;



class ServicePlansRepo

{

    public function get_service_plans($per_page, $search = null) {

        $service_plan = MasterServicePlan::where('status', 'A');

        if($search)$service_plan->where('vehicle_type', 'LIKE', ''.$search.'%')->orWhere('plan_name','LIKE',''.$search.'%')->orWhere('category_type','LIKE','%'.$search.'%');

        return $service_plan->groupBy('id')->paginate($per_page);

    }



    public function get_services_visit_types($service_plans) {

        $visit_types = [];

        foreach($service_plans as $val) {

            $data = MasterServiceVisitType::where('service_plan_id', $val->id)->where('status', '!=' ,'X')->select('id as visit_type_id', 'service_plan_id', 'visit_type')->get()->toArray();

            if(count($data)) array_push($visit_types, $data);

        }

        return $visit_types;

    }



    public function get_service_plan_details($service_plan_id) {

        return MasterServicePlan::where('id', $service_plan_id)->where('status', 'A')->first();

    }



    public function get_service_visit_types($service_plan_id) {

        $data = MasterServiceVisitType::where('service_plan_id', $service_plan_id)->where('status', 'A')->select('id as visit_type_id', 'service_plan_id', 'visit_type')->get()->toArray();

        return $data;

    }



    public function get_raw_materials($visit_types) {

        $raw_materials = [];

        foreach($visit_types as $type) {

            foreach($type as $val) {

                $data = MasterServiceVisitRawMaterial::where('service_visit_type_id', $val['visit_type_id'])->select('service_plan_id', 'service_visit_type_id', DB::raw('group_concat(raw_materials) as raw_materials'))->get()->toArray();

                if(count($data)) array_push($raw_materials, $data);

            }

        }

        return $raw_materials;

    }



    public function get_service_raw_materials($visit_types) {

        $raw_materials = [];

        foreach($visit_types as $type) {

            $data = MasterServiceVisitRawMaterial::where('service_visit_type_id', $type['visit_type_id'])->select('service_plan_id', 'service_visit_type_id', DB::raw('group_concat(raw_materials) as raw_materials'))->get()->toArray();

            if(count($data)) array_push($raw_materials, $data);

        }

        return $raw_materials;

    }



    public function save_service_plan($data) {

        $service_plans = new MasterServicePlan();

        $service_plans->vehicle_type = $data->vehicle_type;

        $service_plans->category_type = $data->category_type;

        $service_plans->plan_name = $data->plan_name;

        $service_plans->number_of_visits = $data->num_of_visits;

        $service_plans->invoice_name = $data->invoice_name;

        $service_plans->price = $data->price;

        $service_plans->sac = $data->sac;

        $service_plans->gst = $data->gst;

        $service_plans->year = $data->year;

        $service_plans->interval_value = $data->interval_value;

        $service_plans->interval_type = $data->interval_type;

        $service_plans->description = $data->description;

        $service_plans->status = 'A';

        if($service_plans->save()){

           $this->save_service_visit_types($service_plans->id, $data->visitData);

        }

        return $service_plans;

    }



    public function save_service_visit_types($service_plan_id, $visit_data) {

        foreach($visit_data as $val) {

        $val = (object) $val;

        $service_visit_types = new MasterServiceVisitType();

        $service_visit_types->service_plan_id = $service_plan_id;

        $service_visit_types->visit_type = $val->visit_type;

        $service_visit_types->status = 'A';

        if($service_visit_types->save())

            $this->save_raw_materials($service_plan_id, $service_visit_types->id, $val->raw_materials);

        }

        return true;

    }



    public function save_raw_materials($service_plan_id, $service_visit_type_id, $raw_materials) {

        foreach($raw_materials as $val) {

            $raw_material = new MasterServiceVisitRawMaterial();

            $raw_material->service_plan_id = $service_plan_id;

            $raw_material->service_visit_type_id = $service_visit_type_id;

            $raw_material->raw_materials = $val;

            $raw_material->status = 'A';

            $raw_material->save();

        }

        return true;

    }



    public function get_vehicle_types() {

        return MasterServicePlan::where('status', '!=', 'X')->select(DB::RAW('DISTINCT(vehicle_type) as name'))->groupBy('vehicle_type')->orderBy('vehicle_type','ASC')->get();

    }



    public function get_plan_names() {

        return MasterServicePlan::where('status', '!=', 'X')->select(DB::RAW('DISTINCT(plan_name) as name'))->get();

    }



    public function get_category_types() {

        return MasterServicePlan::where('status', '!=', 'X')->select(DB::RAW('DISTINCT(category_type) as name'))->get();

    }



    public function update_service_plan($data) {

        $service_plans = MasterServicePlan::where('id', $data->service_plan_id)->where('status', '!=', 'X')->first();

        $service_plans->vehicle_type = $data->vehicle_type;

        $service_plans->plan_name = $data->plan_name;

        $service_plans->number_of_visits = $data->num_of_visits;

        $service_plans->invoice_name = $data->invoice_name;

        $service_plans->price = $data->price;

        $service_plans->sac = $data->sac;

        $service_plans->gst = $data->gst;

        $service_plans->year = $data->year;

        $service_plans->interval_value = $data->interval_value;

        $service_plans->interval_type = $data->interval_type;

        $service_plans->description = $data->description;

        $service_plans->status = 'A';

        if($service_plans->save()){

            $this->save_service_visit_types($service_plans->id, $data->visitData);

        }

        return true;

    }



    public function remove_service_plan($s_id) {

        return MasterServicePlan::where('id', $s_id)->update(['status' => 'X']);

    }



    public function remove_visit_data($v_id) {

        $this->remove_visit_type($v_id);

        $this->remove_visit_raw_material($v_id);

        return true;

    }



    public function remove_visit_type($v_id) {

        return MasterServiceVisitType::where('id', $v_id)->update(['status' => 'X']);

    }



    public function remove_visit_raw_material($v_id) {

        return MasterServiceVisitRawMaterial::where('service_visit_type_id', $v_id)->update(['status' => 'X']);

    }



}