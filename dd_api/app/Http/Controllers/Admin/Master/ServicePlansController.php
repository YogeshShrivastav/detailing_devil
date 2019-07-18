<?php

namespace App\Http\Controllers\Admin\Master;

use Acme\Repositories\ServicePlans\ServicePlansRepo;
use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;

class ServicePlansController extends ApiController
{
    protected $service_plans_repo;
    public function __construct(ServicePlansRepo $service_plans_repo)
    {
        $this->service_plans_repo = $service_plans_repo;
    }

    public function getServicePlans(Request $request)
    {
        $perPage = 50;
        $search = $request->s;
        $service_plans = $this->service_plans_repo->get_service_plans($perPage, $search);
        $visit_types = $this->service_plans_repo->get_services_visit_types($service_plans);
        $raw_materials = $this->service_plans_repo->get_raw_materials($visit_types);
        return $this->respond([
            'data' => compact('service_plans', 'visit_types', 'raw_materials'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Service Plan\'s Get Successfully for edit.'
        ]);
    }

    public function saveServicePlan(Request $request)
    {
        $service_plans = $this->service_plans_repo->save_service_plan($request);
        return $this->respond([
            'data' => compact('service_plans'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Service Plans Saved Successfully!'
        ]);
    }

    public function editServicePlan($s_id)
    {
        $service_plan = $this->service_plans_repo->get_service_plan_details($s_id);
        $visit_type = $this->service_plans_repo->get_service_visit_types($service_plan->id);
        $raw_materials = $this->service_plans_repo->get_service_raw_materials($visit_type);
        return $this->respond([
            'data' => compact('service_plan', 'visit_type', 'raw_materials'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Service Plan Details Get Successfully for edit.'
        ]);
    }

    public function updateServicePlan(Request $request)
    {
        $service_plans = $this->service_plans_repo->update_service_plan($request);
        return $this->respond([
            'data' => compact('service_plans'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Service Plans Updated Successfully!'
        ]);
    }

    public function getServicePlanOptions() {
        $vehicle_types = $this->service_plans_repo->get_vehicle_types();
        $category_types = $this->service_plans_repo->get_category_types();
        $plan_names = $this->service_plans_repo->get_plan_names();
        return $this->respond([
            'data' => compact('vehicle_types', 'plan_names', 'category_types'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'vehicle_types and plan_names sent Successfully!'
        ]);
    }

    public function removeVisitData(Request $request) {
        $r_visit_data = $this->service_plans_repo->remove_visit_data($request->visit_id);
        return $this->respond([
            'data' => compact('r_visit_data'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Product removed Successfully.'
        ]);
    }

    public function removeServicePlan(Request $request) {
        $r_service_plan = $this->service_plans_repo->remove_service_plan($request->s_id);
        return $this->respond([
            'data' => compact('r_service_plan'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Product removed Successfully.'
        ]);
    }
}
