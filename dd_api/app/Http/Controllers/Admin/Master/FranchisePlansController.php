<?php



namespace App\Http\Controllers\Admin\Master;



use Acme\Repositories\FranchisePlans\FranchisePlansRepo;

use Acme\Repositories\Products\ProductsRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use db;

class FranchisePlansController extends ApiController

{

    protected $franchise_plans_repo;



    public function __construct(FranchisePlansRepo $franchise_plans_repo)

    {

        $this->franchise_plans_repo = $franchise_plans_repo;

    }



    public function getFranchisePlans(Request $request)

    {

        $perPage = 50;

        $search = $request->s;

        $franchise_plans = $this->franchise_plans_repo->get_franchise_plans($perPage, $search);

        $accessories = $this->franchise_plans_repo->get_franchise_accessories($franchise_plans);

        $initial_stocks = $this->franchise_plans_repo->get_initial_stocks($franchise_plans);

        return $this->respond([

            'data' => compact('franchise_plans', 'accessories', 'initial_stocks'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Plans Get Successfully!'

        ]);

    }



    public function getFranchisePlanOptions(ProductsRepo $products_repo) {

        $plan_names = $this->franchise_plans_repo->get_plan_names();

        // $brands = $products_repo->get_product_brand_names();

        return $this->respond([

            'data' => compact('plan_names'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product name and brand sent Successfully!'

        ]);

    }



    public function getProducts(Request $request, ProductsRepo $products_repo) {

        $product_names = $products_repo->get_product_names($request->brand);

        return $this->respond([

            'data' => compact('product_names'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product names Get Successfully!'

        ]);

    }



    public function getProductAttrs(Request $request, ProductsRepo $products_repo) {

        $product_attrs = $products_repo->get_product_attrs($request->brand, $request->product, $request->category, $request->product_id);



        $attributeList = DB::table('master_product_attr_types')->where('status', 'A')->where('attr_type', '!=' ,'')->where('product_id', $request->product_id)->get();



        foreach ($attributeList as $key => $row) {



               $attributeOptionList = DB::table('master_product_attr_options')->where('status', 'A')->where('attr_option', '!=' ,'')->where('attr_type_id', $row->id)->get();



               $attributeList[$key]->optionList = $attributeOptionList;

        }



        return $this->respond([

            'data' => compact('product_attrs','attributeList'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product names Get Successfully!'

        ]);

    }



    public function saveFranchisePlan(Request $request)

    {

        $franchise_plan = $this->franchise_plans_repo->save_franchise_plan($request);

        return $this->respond([

            'data' => compact('franchise_plan'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Plan Saved Successfully!'

        ]);

    }



    public function editFranchisePlan(Request $request, $f_p_id)

    {

        $franchise_plan = $this->franchise_plans_repo->get_franchise_details($f_p_id);

        $accessories = $this->franchise_plans_repo->franchise_accessories_get($franchise_plan->id);

        $initial_stocks = $this->franchise_plans_repo->initial_stocks_get($franchise_plan->id);

        return $this->respond([

            'data' => compact('franchise_plan', 'accessories', 'initial_stocks'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Plan Get Successfully for edit.'

        ]);

    }



    public function updateFranchisePlan(Request $request)

    {

        $franchise_plan = $this->franchise_plans_repo->update_franchise_plan($request);

        return $this->respond([

            'data' => compact('franchise_plan'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Franchise Plan Saved Successfully!'

        ]);

    }



    public function removeAccessoriesData(Request $request) {

        $r_accessories_data = $this->franchise_plans_repo->remove_accessories_data($request->accessories_id);

        return $this->respond([

            'data' => compact('r_accessories_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Accessories data removed Successfully.'

        ]);

    }



    public function removeStockData(Request $request) {

        $r_stock_data = $this->franchise_plans_repo->remove_stock_data($request->stock_id);

        return $this->respond([

            'data' => compact('r_stock_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Stock data removed Successfully.'

        ]);

    }



    public function removeFranchisePlan(Request $request) {

        $r_franchise = $this->franchise_plans_repo->remove_franchise_plan($request->f_id);

        return $this->respond([

            'data' => compact('r_franchise'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product removed Successfully.'

        ]);

    }


    public function edit_plan($f_id)
{

    $franchise_plan = DB::table('master_franchise_plans')
                ->where('master_franchise_plans.id',$f_id)
                ->first();

              
    $initial_stock =  DB::table('master_franchise_initial_stocks')->where('franchise_plan_id' ,$f_id)->get();

     $accessories =  DB::table('master_franchise_accessories')->where('franchise_plan_id' ,$f_id)->get();


  

     return $this->respond([

    'data' => compact('franchise_plan','initial_stock','accessories'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Invoice List Successfully'

  ]);
}


public function updatePlan(Request $request){
         $initial_stock = (Array)$request['initial_stock'];
          $data = (Object)$request['data'];

       $lead = DB::table('master_franchise_plans')->where('id',$data->id)->where('status', 'A')->update([

            'created_at' => date('Y-m-d'),
    
            'plan' => $data->plan,
    
            'description' => $data->description,
    
            'price' => isset($data->price) ? $data->price : ''
    
    
        ]);
    
          foreach($initial_stock as $key => $row) {
            $row = (Object)$row;
           
            if( !isset($row->id)  ){

                       DB::table('master_franchise_initial_stocks')->insert([
                
                            'created_at' => date('Y-m-d'),
                
                            'franchise_plan_id' => $data->id,
                
                            'category' => $row->category,

                            'brand' => $row->brand,

                            'product' => $row->product,

                            'hsn_code' => $row->hsn_code,

                            'attribute_type' => $row->attribute_type,

                            'unit_measurement' => $row->unit,

                            'attribute_option' =>$row->attribute_option,

                            'status' => 'A',

                            'uom_id' => $row->uom_id,

                            'quantity' => $row->quantity
                           
                
                        ]);

            }

          }
          


    }

}

