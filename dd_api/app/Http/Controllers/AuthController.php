<?php



namespace App\Http\Controllers;



use App\Http\Controllers\Controller;

use App\User;

use Carbon\Carbon;

use Illuminate\Http\Request;

use Tymon\JWTAuth\JWTAuth;

use DB;



class AuthController extends ApiController

{
    
    /**
    
    * @var \Tymon\JWTAuth\JWTAuth
    
    */
    
    protected $jwt;
    
    
    
    public function __construct(JWTAuth $jwt)
    {
        $this->jwt = $jwt;
    }
    
    public function source_franchise( $data )
    {
        $exist = DB::table('franchises')->where('contact_no' ,'=',$data->phone )->where('status' ,'=','A')->first();
              
        if(!$exist)
        {
            $lead = DB::table('franchises')->insert([
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
            'name' => isset( $data->name ) ?  $data->name : 'N/A',
            'contact_no' => $data->phone,
            'email_id' => isset( $data->email ) ?  $data->email : '',
            'source' => isset( $data->source ) ?  $data->source : '',
            'address' => isset( $data->address ) ?  $data->address : '',
            'country_id' => isset( $data->country_id ) ?  $data->country_id : '',
            'state' => isset( $data->state ) ?  $data->state : '',
            'district' => isset( $data->district ) ?  $data->district : '',
            'city' => isset( $data->city ) ?  $data->city : '',
            'pincode' => isset( $data->pincode ) ?  $data->pincode : '',
            'company_name' => isset( $data->company_name ) ?  $data->company_name : 'N/A',
            'business_type' => isset( $data->business_type ) ?  $data->business_type : '',
            'profile' => isset( $data->profile ) ?  $data->profile : '',
            'business_loc' => isset( $data->business_loc ) ?  $data->business_loc : '',
            'year_of_est' => isset( $data->year_of_est ) ?  $data->year_of_est : '',
            'city_apply_for' => isset( $data->city_apply_for ) ?  $data->city_apply_for : '',
            'automotive_exp' => isset( $data->automotive_exp ) ?  $data->automotive_exp : '',
            'type' => '1',
            'lead_status' => 'new',
            'created_by' => '0',
            'status' => 'A'
            ]);

            $last_id = DB::getPdo()->lastInsertId();

            $msg = "New Franchise lead #'.$last_id.' (".$data->name.") created from Company Source API ";

            $id =  $this->notification(['created_by'   =>  '0', 'table' =>  'franchises', 'table_id' =>  $last_id,
            'user_name' => $data->company_name, 'title'   => 'New lead created', 'msg'   => $msg ]);
            
            $so = DB::table('users')->where('access_level', '1')->select('id')->get();
            foreach ($so as $key => $value) 
            {
                $this->setNotificationReceived( $id , $value->id,  '0');
            }
            return  $msg = $lead ? 'Franchise Lead saved Successfully!' : '';
        }
        else
        {
            return $msg = 'Franchises Lead Already Exist with same Mobile No.';
        }
    }
        
    public function source_counsumer($data)
    {
        if(!$data->first_name)
        $data->first_name = 'N/A';
        
        $exist = DB::table('consumers')->where('phone' ,'=',$data->phone )->where('status' ,'=','A')->first();
      
        if(!$exist)
        {
            $lead = DB::table('consumers')->insert([
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
            'vehicle_type' => isset( $data->vehicle_type ) ? $data->vehicle_type : '',
            'country_id' => isset( $data->country_id ) ? $data->country_id : '',
            'state' => isset( $data->state ) ? $data->state : '',
            'district' => isset( $data->district ) ? $data->district : '',
            'city' => isset( $data->city ) ? $data->city : '',
            'pincode' => isset( $data->pincode ) ? $data->pincode : '',
            'interested_in' => isset( $data->interested_in ) ? $data->interested_in : '',
            'source' => isset( $data->source ) ? $data->source : '',
            'company_name' => isset( $data->company_name ) ? $data->company_name : '',
            'company_contact_no' => isset( $data->company_contact_no ) ? $data->company_contact_no : '',
            'gstin' => isset( $data->gstin ) ? $data->gstin : '',
            'company_address' => isset( $data->company_address ) ? $data->company_address : '',
            'first_name' => isset( $data->first_name ) ? $data->first_name : '',
            'last_name' => isset( $data->last_name ) ? $data->last_name : '',
            'phone' => $data->phone,
            'email' => isset( $data->email ) ? $data->email : '',
            'car_model' => isset( $data->car_model ) ? $data->car_model : '',
            'address' => isset( $data->address ) ? $data->address : '',
            'lead_status' => 'new',
            'message' => $data->message,
            'created_by' =>'0',
            'type' => '1',
            'status' => 'A',
            
            ]);
            
            $last_id = DB::getPdo()->lastInsertId();

            $msg = "New Consumer lead #'.$last_id.' (".$data->first_name.") created from Company Source API ";

            $id =  $this->notification(['created_by'   =>  '0', 'table' =>  'consumers', 'table_id' =>  $last_id,
            'user_name' => $data->company_name, 'title'   => 'New lead created', 'msg'   => $msg ]);
            
            $so = DB::table('users')->where('access_level', '1')->select('id')->get();
            foreach ($so as $key => $value) 
            {
                $this->setNotificationReceived( $id , $value->id,  '0');
            }

            return $msg = $lead ? 'Consumer Lead saved Successfully!' : '';
        }
        else
        {
            return  $msg = 'Consumer Lead Already Exist with same Mobile No.';
        }
        
    }
        
    public function source_lead(Request $request)
    {
        $data = (object)$request->input();
        
        if( !isset( $data->type ) ||  ( isset( $data->type ) && $data->type == '1') )
        {                    
            $msg = $this->source_counsumer($data);
            
            return $this->respond([
            'data' => compact('msg'),
            
            'status' => 'success',
            
            'status_code' => $this->getStatusCode(),
            
            'message' => 'Source Lead Inserted!'
            ]);
            
        }
        else if( isset( $data->type ) && $data->type == '2') 
        {
            $msg = $this->source_franchise($data);
            
            return $this->respond([
            'data' => compact('msg'),
            
            'status' => 'success',
            
            'status_code' => $this->getStatusCode(),
            
            'message' => 'Source Lead Inserted!'
            ]);
        }
    }
            
    public function notification($data)
    {
        DB::table('notification')->insert([           

        'date_created' => date("Y-m-d H:i:s"),

        'created_by'=> $data['created_by'],

        'table' => $data['table'],

        'table_id'=> $data['table_id'],

        'user_name'=> $data['user_name'],

        'title' => $data['title'],

        'message' => $data['msg']
        ]);

        return DB::getPdo()->lastInsertId();
    } 
            
    public function setNotificationReceived($n,$id,$c)
    {
        DB::table('notification_receivers')->insert([           
            
        'date_created' => date("Y-m-d"),
        
        'created_by'  => $c,
        
        'notification_id' => $n,
        
        'user_id'=> $id
        ]);
    }

    public function get_name($id)
    {
        return  DB::table('users')->where('id', $id)->select('first_name')->first()->first_name;
    }
    
        
    public function postLogin(Request $request)
    {
        $this->validate($request,[
        'email'    => 'required',
        'password' => 'required',
        ]);
        
        try
        {
            if (! $token = $this->jwt->attempt($request->only('email', 'password'), ['exp' => Carbon::now()->addDays(7)->timestamp]))
            {
                return response()->json(['user_not_found'], 404);
            }
        }
        catch(\Tymon\JWTAuth\Exceptions\TokenExpiredException $e)
        {
            return response()->json(['token_expired'], 500);
        } 
        catch(\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) 
        {
            return response()->json(['token_invalid'], 500);
        }
        catch(\Tymon\JWTAuth\Exceptions\JWTException $e)
        {
            return response()->json(['token_absent' => $e->getMessage()], 500);
        }
        
        $user = DB::table('users')
        
        ->leftJoin('locations','locations.id','=','users.location_id')
        
        ->leftJoin('franchises','franchises.id','=','users.franchise_id')
        
        ->where('users.email', $request->input('email'))
        
        ->where('users.is_active','1')
        
        ->select('users.*','locations.location_name','franchises.state as franchises_state')
        
        ->first();
        
        
        return response()->json(compact('token', 'user'));
    }
            
    public function fil(Request $request)
    {
        $org_file = $this->file_uploader();
        $user = DB::table('organization')->where('id',$_POST['org_id'])->update(['org_logo'   =>  $org_file ]);
    }
    
    public function file_uploader()
    {
        
        $tempPath = $_FILES['org'][ 'tmp_name'];
        $f_name = $_FILES['org'][ 'name' ];
        
        $file_name = uniqid(). '.' .pathinfo($f_name, PATHINFO_EXTENSION);
        $uploadPath = '/home/detailin/public_html/dd_api/app/uploads/' . $file_name;
        
        // echo $uploadPath = $file_name;
        // $uploadPath2 = 'uploads' .DIRECTORY_SEPARATOR . $loc .DIRECTORY_SEPARATOR . 'nn'.$file_name;
        if( move_uploaded_file( $tempPath, $uploadPath )  ){
            // echo $this->compress($uploadPath, $uploadPath2);
            return $file_name;
        }else{
            return '';
        }
    }
            
    public function product()
    {
        $d = DB::table('master_product_measurement_prices')->join('master_products','master_product_measurement_prices.product_id','=','master_products.id')->select('master_product_measurement_prices.*','master_products.*')->where('master_products.category','=','Product')->get();
    
        return $this->respond([
        'data' => compact('d'),
        
        'status' => 'success',
        
        'status_code' => $this->getStatusCode(),
        
        'message' => 'Lead'
        ]);
    }
}