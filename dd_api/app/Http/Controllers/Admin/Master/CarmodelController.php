<?php



namespace App\Http\Controllers\Admin\Master;



use Acme\Repositories\Products\ProductsRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use Tymon\JWTAuth\Facades\JWTAuth;

use DB;



class CarmodelController extends ApiController

{

    protected $products_repo;

    protected $auth_user;

    public function __construct(ProductsRepo $products_repo)

    {

        $this->products_repo = $products_repo;

    }



    public function getCarModel(Request $request) {



        $perPage = 20;





        $carmodel = DB::table('car_company')

        ->where('del','0')

        ->groupBy('id')

        ->select('car_company.*','company as cars')

        ->get();



        foreach ($carmodel as $key => $value) {

            $cars = DB::table('car_model')

            ->where('del','0')

            ->where('company',$value->company)

            ->orderBy('company','ASC')

            ->get();

           

            $carmodel[$key]->cars = $cars;



        }



        return $this->respond([



            'data' => compact('carmodel'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Company Car\'s Get Successfully for edit.'



        ]);





    }



    public function organization(Request $request) {







        $organization_list = DB::table('organization')->get();



        return $this->respond([



            'data' => compact('organization_list'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Company Car\'s Get Successfully for edit.'



        ]);





    }

     public function getEdit(Request $request) {







        $organization = DB::table('organization')->where('id',$request['org_id'])->first();



        return $this->respond([



            'data' => compact('organization'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Company Car\'s Get Successfully for edit.'



        ]);





    }

    public function updateUser(Request $request) {

    	$org = (object)$request['org'];

			$exist = DB::table('organization')->where('id' ,'!=',$org->id )->where('company_gstin' ,'=',$org->company_gstin )->first();

			if(!$exist){

		       		DB::table('organization')->where('id' ,$org->id )->update([

				            'company_name'=>$org->company_name,

				             'Email'=>$org->Email,

				             'bank_name'=>$org->bank_name,

				             'company_name_in_bank'=>$org->company_name_in_bank,

				             'account_no'=>	$org->account_no,

				             'account_type'=>$org->account_type,

				             'ifsc_code'=>$org->ifsc_code,

				             'branch_name'=>$org->branch_name,

				             'bank_address'=>$org->bank_address,

				             'company_gstin'=>$org->company_gstin,

				             'company_pan_no'=>$org->company_pan_no,

				             'aadhaar_no'=>$org->aadhaar_no,

				             'address'=>$org->address,

                             'invoice_prefix'=>$org->invoice_prefix,
                             
	                        'service_prefix'=> isset( $org->service_prefix ) ? $org->service_prefix : '',

                             'state' =>$org->state,

                             'district' =>$org->district,

                             'city' =>$org->city,

                             'pincode' =>$org->pincode

		        		]);



		             	$msg = 'Success';
                         $id = DB::getPdo()->lastInsertId();



			       	}else{

			             $msg = 'Exist';
                        $id = '';


			       	}



       	 return $this->respond([



            'data' => compact('msg','id'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Company Car\'s Get Successfully for edit.'



        ]);

   }

   public function deleteorganization(Request $request)

{



  $org = DB::table('organization')->where('id', $request['id'] )->delete();



  // $model = DB::table('car_model')->where('company', $request['company'] )->update([ 'del' => 1 ]);



   return $this->respond([



            'data' => compact('organization'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Deleted.'



        ]);

}



   public function saveUser(Request $request) {



    	$org = (object)$request['org'];

    	$exist = DB::table('organization')->where('company_gstin' ,'=',$org->company_gstin )->first();

		if(!$exist){

	       		

	       		DB::table('organization')->insert([

	            'company_name'=>$org->company_name,

	             'Email'=>$org->Email,

	             'bank_name'=>$org->bank_name,

	             'company_name_in_bank'=>$org->company_name_in_bank,

	             'account_no'=>	$org->account_no,

	             'account_type'=>$org->account_type,

	             'ifsc_code'=>$org->ifsc_code,

	             'branch_name'=>$org->branch_name,

	             'bank_address'=>$org->bank_address,

	             'company_gstin'=>$org->company_gstin,

	             'company_pan_no'=>$org->company_pan_no,

	             'aadhaar_no'=>$org->aadhaar_no,

	             'address'=>$org->address,

                 'invoice_prefix'=>$org->invoice_prefix,
                 
	             'service_prefix'=> isset( $org->service_prefix ) ? $org->service_prefix : '',

                 'state' =>$org->state,

                 'district' =>$org->district,

                 'city' =>$org->city,

                 'pincode' =>$org->pincode

            ]);
            
            $id = DB::getPdo()->lastInsertId();


      	$msg = 'Success';



       	}else{

             $msg = 'Exist';
            $id ='';


       	}



       	 return $this->respond([



            'data' => compact('msg','id'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Company Car\'s Get Successfully for edit.'



        ]);

   }











    public function saveProduct(Request $request)

    {

        $product = $this->products_repo->save_product($request);

        return $this->respond([

            'data' => compact('product', 'product_attr'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product Saved Successfully!'

        ]);

    }





    public function editProduct($p_id)

    {

        $product = $this->products_repo->get_product_details($p_id);

        $product_units = $this->products_repo->get_product_units($product->product_id);

        $product_attr = $this->products_repo->get_product_attr_details($product->product_id);

        $attr_options = $this->products_repo->get_product_options($product_attr);

        return $this->respond([

            'data' => compact('product', 'product_attr', 'product_units', 'attr_options'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product Details Get Successfully for edit.'

        ]);

    }



    public function removeUnitData(Request $request) {

        $r_unit_data = $this->products_repo->remove_unit_data($request->unit_id);

        return $this->respond([

            'data' => compact('r_unit_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product Unit data removed Successfully.'

        ]);

    }



    public function removeAttrData(Request $request) {

        $r_attr_data = $this->products_repo->remove_attr_data($request->attr_id);

        return $this->respond([

            'data' => compact('r_attr_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product Attr data removed Successfully.'

        ]);

    }



    public function updateProduct(Request $request)

    {

        $product = $this->products_repo->update_product($request);

        return $this->respond([

            'data' => $product,

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product Details Updated Successfully!'

        ]);

    }



    public function getProductOptions(Request $request) {

        $type = $request['type'];

        $brands = $this->products_repo->get_product_brand_names($type);

        $products = $this->products_repo->get_product_names('','',$type);



        $unit_measurements = $this->products_repo->get_product_unit_measurements();



        $measurement_types = DB::table('master_measurement_types')->where('status' ,'A')->get();



        $attr_type = $this->products_repo->get_product_attr_type();

        return $this->respond([

            'data' => compact('brands', 'products', 'unit_measurements','attr_type', 'measurement_types'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product name and brand sent Successfully!'

        ]);

    }



    public function removeProduct(Request $request) {

        $r_product = $this->products_repo->remove_product($request->p_id);

        return $this->respond([

            'data' => compact('r_product'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Product removed Successfully.'

        ]);

    }



    public function getStockProducts(Request $request)

    {

        $per_page = 10;

        $search = $request->s;        

        $type = $request['type'];        

        $products = $this->products_repo->getStockProducts($per_page, $search, $type);

        $a = $this->products_repo->getUnitPrice($products);

        $unit_prices = $a['unit_data'];

        $products = $a['products'];

        // $attr_types = $this->products_repo->get_product_attr_types($products);

        // $attr_options = $this->products_repo->get_products_options($attr_types);

        $stock_qty = $this->products_repo->getStockQty($products);

        $stock_total = $this->products_repo->getStockTotal($products);

        return $this->respond([

            'data' => compact('products', 'unit_prices','stock_total','stock_qty'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }







    public function getFinishGoodDetail(Request $request)

    {



        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        $finish_good = DB::table('finished_good')->where('product_id' ,$request['id'])->get();



        $finish_good_item_array = [];

        foreach ($finish_good as $key => $value) {



            $finish_good_item = DB::table('finished_good_raw_material')->where('finished_good_id' ,$value->id)->get();

            $finish_good[$key]->finish_good_item = $finish_good_item;

        }





        return $this->respond([

            'data' => compact('prod','unit','finish_good'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }







    public function getIncomeProduct(Request $request)

    {



        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        $vendor_item_data = DB::table('purchase_order_receive_item')

        ->join('purchase_order_receive','purchase_order_receive.id','=','purchase_order_receive_item.receive_id')

        ->join('users','users.id','=','purchase_order_receive.created_by')

        ->join('vendors','vendors.id','=','purchase_order_receive.vendor_id')

        ->where('purchase_order_receive_item.measurement_id',$request['unit_id'])

        ->select('purchase_order_receive_item.*','vendors.name','users.first_name','purchase_order_receive.vendor_id','purchase_order_receive.purchase_order_id')

        ->groupBy('purchase_order_receive_item.id')

        ->orderBy('purchase_order_receive_item.id','DESC')

        ->get();





        return $this->respond([

            'data' => compact('prod','unit','vendor_item_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }









    public function getProductDetail(Request $request)

    {



        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        $raw_data = DB::table('finished_good_raw_material')

        ->join('users','users.id','=','finished_good_raw_material.created_by')

        ->leftJoin('master_products','master_products.id','=','finished_good_raw_material.product_id')

        ->join('finished_good','finished_good.id','=','finished_good_raw_material.finished_good_id')

        ->where('measurement_id' ,$request['unit_id'])

        ->select('finished_good_raw_material.*','finished_good.brand_name','finished_good.product_name','finished_good.uom','finished_good.qty as finish_qty','users.first_name','master_products.category')

        ->orderBy('id','DESC')

        ->get();



        // $finish_good_item_array = [];

        // foreach ($finish_good as $key => $value) {



        // $finish_good_item = DB::table('finished_good_raw_material')->where('finished_good_id' ,$value->id)->get();

        // $finish_good[$key]->finish_good_item = $finish_good_item;

        // }

        return $this->respond([

            'data' => compact('prod','unit','raw_data'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }







    public function recivedProductDetail(Request $request)

    {



        $prod = DB::table('master_products')->where('status' ,'A')->where('id' ,$request['id'])->first();

        $unit = DB::table('master_product_measurement_prices')->where('status' ,'A')->where('id' ,$request['unit_id'])->first();



        // $finish_good = DB::table('finished_good')->where('product_id' ,$request['id'])->get();



        $finish_good_item_array = [];

        foreach ($finish_good as $key => $value) {



            $finish_good_item = DB::table('finished_good_raw_material')->where('finished_good_id' ,$value->id)->get();

            $finish_good[$key]->finish_good_item = $finish_good_item;

        }





        return $this->respond([

            'data' => compact('prod','unit','finish_good'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }



    public function getFinishProducts(Request $request)

    {

        $per_page = 10;

        $search = $request->s;        

        $products = $this->products_repo->getFinishProducts($per_page, $search);

        $a = $this->products_repo->getFinishPrice($products);

        $unit_prices = $a['unit_data'];

        $products = $a['products'];

        // $attr_types = $this->products_repo->get_product_attr_types($products);

        // $attr_options = $this->products_repo->get_products_options($attr_types);

        $stock_qty = $this->products_repo->getFinishQty($products);

        $stock_total = $this->products_repo->getFinishTotal($products);

        return $this->respond([

            'data' => compact('products', 'unit_prices','stock_total','stock_qty'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Products Get Successfully!'

        ]);

    }







    public function getBrand()

    {

        $b = DB::table('master_products');

        $b->join('master_product_measurement_prices',function($join) { 

            $join->on('master_product_measurement_prices.product_id','=','master_products.id')

            ->where('master_product_measurement_prices.purchase_price', '!=' ,'')

            ->where('master_products.category', '=' ,'Product');



        });

        $b->where('master_products.status', 'A');

        $b->where('master_products.category', 'Product');

        $b->select('master_products.brand_name');

        $b->orderBy('master_products.brand_name','ASC');

        $b->groupBy('master_products.brand_name');

        $brandList = $b->get();



        return $this->respond([



            'data' => compact('brandList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Brand List Fetched Successfully.'



        ]);



    }







    public function getProductList(Request $request)

    {



        $p = DB::table('master_products');

        $p->join('master_product_measurement_prices',function($join) { 

            $join->on('master_product_measurement_prices.product_id','=','master_products.id')->where('master_product_measurement_prices.purchase_price', '!=' ,'');



        });

        $p->where('master_products.status', 'A');

        $p->where('master_products.category', 'Product');

        $p->where('master_products.brand_name',$request->brand_name);

        $p->select('master_products.id','master_products.brand_name','master_products.product_name', 'master_products.gst');

        $p->groupBy('master_products.product_name');

        $productList = $p->get();



        return $this->respond([



            'data' => compact('productList'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Product List Fetched Successfully.'



        ]);

    }







    public function getMeasurementList(Request $request)

    {



        $measurementList = DB::table('master_product_measurement_prices')->where('status', 'A')->where('purchase_price', '!=' ,'')->where('product_id',$request->product_id)->get();





        foreach ($measurementList as $key => $row) {

         $measurementList[$key] = $row;



         if (strpos($row->unit_of_measurement, 'box') !== false) {

           $measurementArr = explode(' ', $row->unit_of_measurement);

           $measurementList[$key]->unit_of_measurement = $measurementArr[1].' ('.$measurementArr[0] . ' pc)';

       }

   }



   $attributeList = DB::table('master_product_attr_types')->where('status', 'A')->where('attr_type', '!=' ,'')->where('product_id', $request->product_id)->get();



   foreach ($attributeList as $key => $row) {



       $attributeOptionList = DB::table('master_product_attr_options')->where('status', 'A')->where('attr_option', '!=' ,'')->where('attr_type_id', $row->id)->get();



       $attributeList[$key]->optionList = $attributeOptionList;

   }







   return $this->respond([



    'data' => compact('measurementList', 'attributeList'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'Measurement List Get Successfully.'

]);



// ])

}



public function saveRawProductList(Request $request){



    $finish_good = (object)$request['finish_good'];







    $f = DB::table('finished_good')->insert([

        'date_created' => date('Y-m-d'),

        'created_by' =>  $request['login_id'],

        'product_id' => $finish_good->product_id,

        'brand_name' => $finish_good->brand_name,

        'product_name' => $finish_good->product_name,

        'uom' => $finish_good->measurement,

        'qty' => $finish_good->qty,

        'status' => 'A',

    ]);

    $finished_good_id = DB::getPdo()->lastInsertId();



    $f = DB::table('master_product_measurement_prices')

    ->where('id',$finish_good->measurement_id)

    ->increment('sale_qty', (int)$finish_good->qty );

    



    foreach ($request['raw'] as $key => $value) {

        $rw = (object)$value;







        $m = DB::table('master_product_measurement_prices')->where('id', $rw->measurement_id)->first();

        if( $m->stock_total && $m->unit_of_measurement){





            $measurementArr = explode(' ', $m->stock_total);

            $actual_qty  = ((int)$measurementArr[0] - $rw->qty );

            $stock_total =    $actual_qty. ' ' . $measurementArr[1];





            $uom = explode(' ', $m->unit_of_measurement);

            $stock_qty  =  $actual_qty /  $uom[0];







            $f = DB::table('master_product_measurement_prices')

            ->where('id',$rw->measurement_id)

            ->update(['stock_qty'=>  $stock_qty ]);



            $f = DB::table('master_product_measurement_prices')

            ->where('id',$rw->measurement_id)

            ->update(['stock_total'=>  $stock_total ]);



        }



        // $m = DB::table('master_product_measurement_prices')->where('id', $rw->measurement_id)->update(['stock_total' => $stock_total ]);





        $d = DB::table('finished_good_raw_material')->insert([

            'date_created' => date('Y-m-d'),

            'created_by' =>  $request['login_id'],

            'product_id' => $finish_good->product_id,

            'finished_good_id' =>  $finished_good_id,

            'brand_name' => $rw->brand_name,

            'product_name' => $rw->product_name,

            'uom' => $rw->measurement,

            'measurement_id' => $rw->measurement_id,

            'qty' => $rw->qty. ' '.$rw->raw_required_Measurement,

            'status' => 'A',

        ]);

    }



}



public function master_measurement(){

    $measurement = DB::table('master_measurement_types')->get();

    return $this->respond([



        'data' => compact('measurement'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'master_measurement_types List Fetched Successfully.'



    ]);

}





public function imageTest(Request $request ){

        // $c = $request['j'];

        // $c = $_FILES;

    dd( $_FILES );



    return $this->respond([



        'data' => compact('c'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'master_measurement_types List Fetched Successfully.'



    ]);

}









public function updateStock(Request $request){



 $store = array();

 foreach ($request['stock'] as $key => $prod) {

    foreach ($prod as $key2 => $value) {

        $rw = (object)$value;



        if( $rw->updated_at == '' ){



            if( $request['type'] == '' ){



                $f = DB::table('master_product_measurement_prices')

                ->where('id',$rw->id)

                ->update(['sale_qty'=>  $rw->sale_qty ]);



            }else{









                $m = DB::table('master_product_measurement_prices')->where('id', $rw->id)->first();



                            // if( $m->stock_total && $m->unit_of_measurement){





                $measurementArr = explode(' ', $m->unit_of_measurement);

                $actual_qty  = ((int)$measurementArr[0] * $rw->stock_qty );

                $stock_total =    $actual_qty. ' ' . $measurementArr[1];





                                // $uom = explode(' ', $m->unit_of_measurement);

                                // $stock_qty  =  $actual_qty /  $uom[0];







                $f = DB::table('master_product_measurement_prices')

                ->where('id',$rw->id)

                ->update(['stock_qty'=>  $rw->stock_qty  ]);



                $f = DB::table('master_product_measurement_prices')

                ->where('id',$rw->id)

                ->update(['stock_total'=>  $stock_total ]);



                            // }

                array_push($store, $stock_total);



            }



        }

    }

}



return $this->respond([



    'data' => compact('store'),



    'status' => 'success',



    'status_code' => $this->getStatusCode(),



    'message' => 'master_measurement_types List Fetched Successfully.'



]);







}



public function saveCar(Request $request){

    $car = (object)$request['car'];

    $d = DB::table('car_model')->insert([

        'company' =>  $car->company_name,

        'car' =>  $car->car_name

    ]);

}



public function addCompany(Request $request){

    $car = (object)$request['car'];

    $d = DB::table('car_company')->insert([

        'company' =>  $car->company,

    ]);

}













public function removeCar(Request $request)

{



  $company = DB::table('car_model')->where('id', $request['car'] )->delete();



  // $model = DB::table('car_model')->where('company', $request['company'] )->update([ 'del' => 1 ]);



   return $this->respond([



            'data' => compact('model'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Deleted.'



        ]);





}





public function removeCompany(Request $request)

{



  $company = DB::table('car_company')->where('company', $request['company'] )->delete();



  $model = DB::table('car_model')->where('company', $request['company'] )->delete();



   return $this->respond([



            'data' => compact('company','model'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Deleted.'



        ]);





}





}

