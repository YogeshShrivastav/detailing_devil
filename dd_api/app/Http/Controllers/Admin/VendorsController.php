<?php



namespace App\Http\Controllers\Admin;



// use Acme\Repositories\Vendors\VendorsRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;

class VendorsController extends ApiController

{



    public function __construct()

    {

        date_default_timezone_set("Asia/Calcutta");

    }


    public function stk(Request $d){
$c = $d['data'];
        return $this->respond([

            'data' => compact('c'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Vendor Saved Successfully!'

        ]);

    }



    public function saveVendors(Request $request)
    {
        $vendor_save = '';
        // print_r($request->all());
        // exit;
        $exist = DB::table('vendors')->where('gst_no' ,'=',$request->gst)->first();
        if(!$exist)
        {
            $vendor_save = DB::table('vendors')->insert(
            [
                'name' => $request->name, 
                'phone' => $request->phone,
                'email_id' => $request->email,
                'landline' => $request->landline,
                'address' =>  $request->address,
                'country' =>  $request->country,
                'state' =>  $request->state,
                'city' =>  $request->city,
                'pin_code' =>  $request->pin,
                'district' =>  $request->district,
                'gst_no' => $request->gst,
                'pan_no' => $request->pan,
                'status' => 'A' ,
                'created_by' => $request->created_by,
                'created_at'=> date("Y-m-d H:i:s"),
                'updated_at'=> date("Y-m-d H:i:s")
            ]);

            $id = DB::getPdo()->lastInsertId();
            if($vendor_save) {
                $this->save_vendor_contact($id, $request->vcDetailData);
                $this->save_vendor_deals($id, $request->vpDealData);
            }
            $msg='Success';

        }
        else
        {
            $msg='Exist';
        }

        return $this->respond([

            'data' => compact('vendor','msg'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Vendor Saved Successfully!'

        ]);

    }



    private function save_vendor_deals($v_id, $dealdata) {

        foreach($dealdata as $val) {

            $val = (object) $val;

// $vendor = new VendorDetail();

// $vendor->vendor_id =  $v_id;;

// $vendor->name = $val->contact_name;

// $vendor->phone1 = $val->mobile1;

// $vendor->phone2 = $val->mobile2;

// $vendor->status = 'A';

// $vendor->save();            

            $vendordeal_save = DB::table('vendordeals')->insert(

                [                    

                    'vendor_id' => $v_id,

                    'name' =>$val->name, 

                    'deals' =>$val->v_deal,                    

                    'status' => 'A' ,

                    'created_at'=> date("Y-m-d H:i:s"),

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );

        }

//dd($contactdata);

        return true;

    }



    private function save_vendor_contact($v_id, $contactdata) {

        foreach($contactdata as $val) {

            $val = (object) $val;

// $vendor = new VendorDetail();

// $vendor->vendor_id =  $v_id;;

// $vendor->name = $val->contact_name;

// $vendor->phone1 = $val->mobile1;

// $vendor->phone2 = $val->mobile2;

// $vendor->status = 'A';

// $vendor->save();            

            $vendorcon_save = DB::table('vendor_details')->insert(

                [                    

                    'vendor_id' => $v_id,

                    'name' => $val->contact_name, 

                    'phone1' => $val->mobile1,

                    'phone2' => $val->mobile2,

                    'status' => 'A' ,

                    'created_at'=> date("Y-m-d H:i:s"),

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );

        }

//dd($contactdata);

        return true;

    }





    public function getVendors(Request $request)

    {       

       $per_page = 20;

       $filter = (Object)$request['filter'];


            $so = DB::table('vendors')

            ->join('users', 'users.id', '=', 'vendors.created_by')

            ->leftJoin('vendordeals', 'vendors.id', '=', 'vendordeals.vendor_id')

            ->where('vendors.status', 'A');

             if(isset($filter->search) && $filter->search != '') {
                $s = $filter->search;
                $so->where(function ($query) use ($s ) {
                    $query->where('vendors.name','LIKE','%'.$s.'%')
                    ->orWhere('vendors.email_id','LIKE','%'.$s.'%')
                    ->orWhere('vendors.phone','LIKE','%'.$s.'%');

            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('vendors.created_at','LIKE','%'.$filter->date.'%');
            
         $so->select('vendors.*','users.first_name as created_name', DB::raw("COUNT('vendordeals.vendor_id') as total_deals"))

            ->groupBy('vendors.id')

            ->orderBy('vendors.id','DESC');

           $vendors= $so->paginate($per_page);


        $vendor_con=$this->get_vendor_contact($vendors);

        $usernam=$this->get_usersname($vendors);

        return $this->respond([



            'data' => compact('vendors','vendor_con','usernam'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor\'s Get Successfully.'



        ]);

//dd($vendors);

    }



    public function get_vendor_contact($vendors) {

        $con_info = [];

        foreach($vendors as $val) {

            $data = DB::table('vendor_details')

            ->where('vendor_id', $val->id)

            ->where('status', '!=' ,'X')

            ->select('id as con_id', 'vendor_id', 'name','phone1','phone2')

            ->get();

            if(count($data)) array_push( $con_info, $data);

        }

        return $con_info;

    }



    public function get_usersname($vendors) {

        $us_info = [];

        foreach($vendors as $val) {

            $data = DB::table('users')

            ->where('id', $val->created_by)

            ->select('id as user_id', 'username')

            ->get();

            if(count($data)) array_push( $us_info, $data);

        }

        return $us_info;

    }



    public function getProducts() {

        $pro_info = [];

        $data = DB::table('master_products')->where('status', '!=' ,'X')

        ->select('id as pro_id', 'product_name','brand_name','category')

        ->orderBy('brand_name')

        ->get();

        return $this->respond([

            'data' => compact('data'),            

            'status' => 'success',            

            'status_code' => $this->getStatusCode(),            

            'message' => 'Product Fetched Successfully.'            

        ]);

// if(count($data)) array_push( $pro_info, $data);

// return $pro_info;

//dd(1121);

    }

    public function getFranchsieList(){

        $franchises = DB::table('franchises')->select('id','name')

        ->where('status','A')

        ->get();

        return $this->respond([

            'data' => compact('franchises'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

    }



    public function getStates(){

        $states = DB::table('abq_postal_master')->select('state_name')

        ->where('del','0')

        ->distinct()

        ->orderBy('state_name','Asc')

        ->get();

        return $this->respond([

            'data' => compact('states'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

    } 





    public function getDistrict(Request $request){

        $districts = DB::table('abq_postal_master')

        ->where('state_name',$request->state_name)

        ->where('del','0')

        ->select('district_name')

        ->orderBy('district_name','Asc')

        ->distinct()

        ->get();

        return $this->respond([

            'data' => compact('districts'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

    }



    public function getCity(Request $request){

//dd($request->district_name);

        $cities = DB::table('abq_postal_master')

        ->where('district_name',$request->district_name)

        ->where('del','0')

        ->select('city')

        ->orderBy('city','Asc')

        ->distinct()

        ->get();



        $pins = DB::table('abq_postal_master')

        ->where('district_name',$request->district_name)

        ->where('del','0')

        ->select('pincode')

        ->orderBy('pincode','Asc')

        ->distinct()

        ->get();



        return $this->respond([

            'data' => compact('cities','pins'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

    }



    public function getPincodes(Request $request){

//dd(12211);

        $pins = DB::table('abq_postal_master')

        ->where('city',$request->city_name)

        ->where('del','0')

        ->select('pincode')

        ->distinct()

        ->get();

        return $this->respond([

            'data' => compact('pins'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

//dd($pins);

    }



    public function getConsumerFormOptionsCountry() {       

        $countries = DB::table('countries')->get();

        return $this->respond([

            'data' => compact('countries'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Form Option\'s Get Successfully.'

        ]);

    }



    public function vendorDetails($v_id){       

        $data = DB::table('vendors')->where('id', '=' ,$v_id)->get();

//$v_deal = DB::table('vendordeals')->where('vendor_id', '=' ,$v_id)->get(); 

        $v_deal = DB::table('vendordeals')->select('deals')->where('vendor_id', '=' ,$v_id)->lists('deals'); 

        $v_con = DB::table('vendor_details')->where('vendor_id', '=' ,$v_id)->get();



        $v_purchase = DB::table('purchase_order')->leftJoin('purchase_order_item', 'purchase_order.id', '=', 'purchase_order_item.purchase_order_id')->select('purchase_order.*', DB::raw("COUNT('purchase_order_item.purchase_order_id') as total_items"))->groupBy('purchase_order.id')->where('purchase_order.order_status', 'pending' )->where('purchase_order.vendor_id', '=' ,$v_id)->where('purchase_order.del', '=' ,0)->get();

        $v_purchase_id= DB::table('purchase_order')->select('id')->where('vendor_id', '=' ,$v_id)->where('del','=' ,0)->lists('id'); 

        $v_purchase_item=DB::table('purchase_order_item')->select('*')->where('del','=',0)->whereIn('purchase_order_id',$v_purchase_id)->get();



        $v_purchase_all = DB::table('purchase_order')->where('vendor_id', '=' ,$v_id)->where('del', '=' ,0)->count();

        $v_purchase_pending = DB::table('purchase_order')->where('order_status', 'Pending' )->where('vendor_id', '=' ,$v_id)->where('del', '=' ,0)->count();

        $v_purchase_reject = DB::table('purchase_order')->where('order_status', 'Rejected' )->where('vendor_id', '=' ,$v_id)->where('del', '=' ,0)->count();

        $v_purchase_receive = DB::table('purchase_order')->where('order_status', 'Recieved' )->where('vendor_id', '=' ,$v_id)->where('del', '=' ,0)->count();        



        $v_rdeal = DB::table('master_products')->where('status', '!=' ,'X')->whereNotIn('id',$v_deal)->select('id as pro_id', 'product_name','brand_name','category')->get();

        $v_cdeal = DB::table('master_products')->where('status', '!=' ,'X')->whereIn('id',$v_deal)->select('id as pro_id', 'product_name','brand_name','category')->get();

        $usernam = DB::table('users')->select('id as user_id', 'username')->get();



        return $this->respond([



            'data' => compact('data','v_con','v_cdeal','v_rdeal','usernam','v_purchase','v_purchase_id','v_purchase_item','v_purchase_all','v_purchase_pending','v_purchase_reject','v_purchase_receive'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'vendor Fetched Successfully.'



        ]);

//return $v_id;



//dd($v_deal);

//dd($v_rdeal);

    }

    public function getPurchases(Request $request){

//dd(1211);

        if($request->action == 'All'){

// $v_purchase = DB::table('purchase_order')->where('vendor_id', '=' ,$request->vendor_id)->where('del', '=' ,0)->get();   

            $v_purchase = DB::table('purchase_order')->leftJoin('purchase_order_item', 'purchase_order.id', '=', 'purchase_order_item.purchase_order_id')->select('purchase_order.*', DB::raw("COUNT('purchase_order_item.purchase_order_id') as total_items"))->groupBy('purchase_order.id')->where('purchase_order.vendor_id', '=' ,$request->vendor_id)->where('purchase_order.del', '=' ,0)->get();     

        }else{

// $v_purchase = DB::table('purchase_order')->where('order_status', $request->action )->where('vendor_id', '=' ,$request->vendor_id)->where('del', '=' ,0)->get();   

            $v_purchase = DB::table('purchase_order')->leftJoin('purchase_order_item', 'purchase_order.id', '=', 'purchase_order_item.purchase_order_id')->select('purchase_order.*', DB::raw("COUNT('purchase_order_item.purchase_order_id') as total_items"))->groupBy('purchase_order.id')->where('purchase_order.vendor_id', '=' ,$request->vendor_id)->where('purchase_order.order_status', $request->action )->where('purchase_order.del', '=' ,0)->get(); 



        }

        return $this->respond([



            'data' => compact('v_purchase'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Purchase Fetched Successfully.'



        ]);

//dd($request);

    }

    public function deleteVendors(Request $request) {   

        $r_vendors = DB::table('vendors')->where('id', $request->v_id)->where('status', 'A')->update(['status' => 'X']);

        $r_vendors1 = DB::table('vendordeals')->where('vendor_id', $request->v_id)->where('status', 'A')->update(['status' => 'X']);

        $r_vendors2 = DB::table('vendor_details')->where('vendor_id', $request->v_id)->where('status', 'A')->update(['status' => 'X']);

        return $this->respond([



            'data' => compact('r_vendors'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor deleted Successfully.'



        ]);            

    }







    public function updateVendors(Request $request) {



 // if(!$d->name)$d->name = 'N/A';

  

        $exist = DB::table('vendors')->where('gst_no' ,'=',$request->gst_no )->where('id', '!=', $request->vendor_id)->first();

        $vendors_update =  '';

            if(!$exist){

                $vendors_update = DB::table('vendors')->where('id', $request->vendor_id)->update(

                [

                    'email_id' => $request->email,

                    'phone' =>  $request->mobile,

                    'landline' => $request->landline,

                    'address' => $request->address,

                    'city' => $request->city,

                    'state' => $request->state,

                    'district' => $request->district,

                    'country' => $request->country,

                    'pan_no' => $request->pan_no,

                    'gst_no' => $request->gst_no,

                    'pin_code' => $request->pin

                ]);

                $msg = 'Success';



            }else{

            $msg = 'Exist';



            }  

        return $this->respond([

            'data' => compact('vendors_update','msg'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Vendor Updated Successfully.'

        ]);

         

        

//dd($request->landline);

    }





    public function updateVendorsContact(Request $request) {        

        $vendors_update = DB::table('vendor_details')->where('id', $request->id)->update(

            [

                'name' => $request->name,

                'phone1' => $request->phone1,

                'phone2' => $request->phone2

            ]

        );         

        if($vendors_update) {        

            return $this->respond([

                'data' => compact('vendors_update'),

                'status' => 'success',

                'status_code' => $this->getStatusCode(),

                'message' => 'Vendor Contact Updated Successfully.'

            ]);

        }

//dd($request->id);

    }



    public function addVendorsDeal(Request $request){

//return $requestd;

//dd($request->product_name);

        $vendordeal_save = DB::table('vendordeals')->insert(

            [                    

                'vendor_id' => $request->vendor_id,

                'name' =>$request->product_name, 

                'deals' =>$request->product_id,                    

                'status' => 'A' ,

                'created_at'=> date("Y-m-d H:i:s"),

                'updated_at'=> date("Y-m-d H:i:s")

            ]

        );

        if($vendordeal_save) {        

            return $this->respond([

                'data' => compact('vendordeal_save'),

                'status' => 'success',

                'status_code' => $this->getStatusCode(),

                'message' => 'Vendor deal Added Successfully.'

            ]);

        }

    }



    public function removeVendorsDeal(Request $request){       

//dd($request->vendor_id);

//dd($request->product_id);

        $whereArray = array('vendor_id' => $request->vendor_id,'deals' => $request->product_id);



        $query = DB::table('vendordeals');

        foreach($whereArray as $field => $value) {

            $query->where($field, $value);

        }

        $deal_delete= $query->delete();

        if($deal_delete) {        

            return $this->respond([

                'data' => compact('$deal_delete'),

                'status' => 'success',

                'status_code' => $this->getStatusCode(),

                'message' => 'Vendor deal Removed Successfully.'

            ]);

        }



    }



    public function savelocation(Request $request){

        $sts='';

        $dts='';

        $cts='';

        $pin='';

        if($request->country_id === 99 ){

//echo "<pre>";

//print_r($request);        

            foreach($request->state as $stet){  

//echo $stet['state_name'];          

                $sts=$sts.$stet['state_name'].',';

            }

            foreach($request->district as $dtet){ 

//echo   $dtet['district_name'];         

                $dts=$dts.$dtet['district_name'].',';

            }

            foreach($request->city as $ctet){   

//echo $ctet['city_name'];       

                $cts=$cts.$ctet['city_name'].',';

            }

            foreach($request->pincode as $ptet){ 

//echo $ptet['pin_code'];          

                $pin=$pin.$ptet['pin_code'].',';

            }  



            $location_save = DB::table('locations')->insert(

                [   

                    'country_id' => $request->country_id,

                    'location_name' => $request->location_name,

                    'country_name'=> $request->country_name ,

                    'state'=> $sts ,

                    'district'=> $dts ,

                    'city'=> $cts,

                    'pincode'=> $pin,

                    'assign_to_franchise'=> $request->assign_to_franchise?$request->assign_to_franchise:'',            

                    'created_by' => $request->created_by,            

                    'created_at'=> date("Y-m-d H:i:s"),

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );

        }else{

            $location_save = DB::table('locations')->insert(

                [   

                    'country_id' => $request->country_id,

                    'location_name' => $request->location_name,

                    'country_name'=> $request->country_name ,

                    'state'=> $request->state ,

                    'district'=> $request->district ,

                    'city'=> $request->city,

                    'pincode'=> $request->pincode,

                    'assign_to_franchise'=>  $request->assign_to_franchise?$request->assign_to_franchise:'',            

                    'created_by' => $request->created_by,            

                    'created_at'=> date("Y-m-d H:i:s"),

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );

        }

        $lastid = DB::getPdo()->lastInsertId();

        if($location_save){



            if($request->assign_to_franchise != ''){

                DB::table('franchises')->where('id', $request->assign_to_franchise)->where('status', 'A')->update(['location_id' => $lastid]);

            }



        }



        return $this->respond([



            'data' => compact('location_save'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Location Saved  Successfully.'



        ]);



    }









    public function locationremove(Request $request){

        $r_locations = DB::table('locations')->where('id', $request->l_id)->where('del', '0')->update(['del' => '1']);

        $frc_location_update = DB::table('franchises')->where('location_id', $request->l_id)->where('status', 'A')->update(['location_id' => '']);

        return $this->respond([



            'data' => compact('r_locations','frc_location_update'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Locations deleted Successfully.'



        ]);

    }



    public function getLocations(Request $request){

        $per_page = 20;

        $search = $request->s;

//$search = '';

        $so = DB::table('locations');       

        $so->where('locations.del' ,'0');    

        if($search) { $so->where('locations.location_name', 'LIKE', '%'.$search.'%'); }    

        $so->orderBy('locations.id','Desc');

        $location = $so->paginate($per_page); 



        $franchiselist= DB::table('franchises')->where('status','A')->select('id','name')->get();         



        return $this->respond([



            'data' => compact('location','franchiselist'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor\'s Get Successfully.'



        ]);



//return response()->json(  array('location' => $location,'franchiselist'=> $franchiselist ) );



    }



    public function franchise_consumerlocationDetails($l_id){



        $location= DB::table('locations')->where('id',$l_id)->first();



        return $this->respond([



            'data' => compact('location'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor\'s Get Successfully.'



        ]);





    }



    public function updateLocation(Request $request){

        $sts='';

        $dts='';

        $cts='';

        $pin='';

        $lastid = '';

        if($request->country_id === 99 ){

//echo "<pre>";

//print_r($request);        

            foreach($request->state as $stet){  

//echo $stet['state_name'];          

                $sts=$sts.$stet['state_name'].',';

            }

            foreach($request->district as $dtet){ 

//echo   $dtet['district_name'];         

                $dts=$dts.$dtet['district_name'].',';

            }

            foreach($request->city as $ctet){   

//echo $ctet['city_name'];       

                $cts=$cts.$ctet['city_name'].',';

            }

            foreach($request->pincode as $ptet){ 

//echo $ptet['pin_code'];          

                $pin=$pin.$ptet['pin_code'].',';

            }  



            $location_save = DB::table('locations')->where('id',$request->id)->update(

                [   

                    'country_id' => $request->country_id,

                    'location_name' => $request->location_name,

                    'country_name'=> $request->country_name ,

                    'state'=> $sts ,

                    'district'=> $dts ,

                    'city'=> $cts,

                    'pincode'=> $pin,

                    'assign_to_franchise'=> $request->assign_to_franchise?$request->assign_to_franchise:'',            

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );

        }else{

            $location_save = DB::table('locations')->where('id',$request->id)->update(

                [   

                    'country_id' => $request->country_id,

                    'location_name' => $request->location_name,

                    'country_name'=> $request->country_name ,

                    'state'=> $request->state ,

                    'district'=> $request->district ,

                    'city'=> $request->city,

                    'pincode'=> $request->pincode,

                    'assign_to_franchise'=>  $request->assign_to_franchise?$request->assign_to_franchise:'',                                         

                    'updated_at'=> date("Y-m-d H:i:s")

                ]

            );



        }


        // if($location_save){



            if($request->assign_to_franchise != ''){

                DB::table('franchises')->where('id', $request->assign_to_franchise)->where('status', 'A')->update(['location_id' =>  $request->id  ]);

            }else{
                DB::table('franchises')->where('location_id', $request->id)->where('status', 'A')->update(['location_id' =>   '' ]);

            }





        return $this->respond([



            'data' => compact('location_save'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Location Saved  Successfully.'



        ]);





    }

}

