<?php



namespace App\Http\Controllers\Admin;



use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;

class JobCardController extends ApiController

{



    public function __construct()

    {

        date_default_timezone_set("Asia/Calcutta");

    }



    public function saveJobCard(Request $request)
    {
      $job = (object)$request['temp'];


      $date = date('Y-m-d');
      if( isset( $job->date_created ) &&  $job->date_created  ){
        $date = $job->date_created;
      }

      $exist = DB::table('customer_job_card')->where('date_created' , '>' , $date )->where('customer_id', $job->cust_id )->where('status', '!=', 'Cancel' )->where('del', '0' )->first();

        if( $exist ){
          $msg = 'NOT';
            return $this->respond([ 'data' => compact('msg') ]);
            exit;
        }

      // dd( $request['temp'] );




        $location = DB::table('consumers')->where('id', '=' , $job->cust_id)->first();

        $tech = implode(',', $request['technician']);

        $cat_type = implode(',', $request['cat_ype']);




        $jc_save = DB::table('customer_job_card')->insert(

            [

                'date_created' => $date,

                'created_by' => $job->created_by,

                'created_by_type' => 'Admin',

                'customer_id' => $job->cust_id,

                'isCompany' => $job->isCompany,

                'location_id' => $location->location_id,

                'vehicle_type' =>  $job->vehicle_type,

                'category_type' =>  $cat_type,

                'regn_no' =>  $job->reg_no,

                'model_no' =>  $job->modal_no,

                'color' =>  $job->color,

                'year' =>  $job->year,

                'chasis_no' =>  $job->chasis_no,

                'make' => $job->make,

                'technician' => $tech,

                'vehicle_condition' =>  $job->srs,

                'status' => 'Open',

                'preventive_id' => $job->preventive_id,

                'isRepainted' => $job->isRepainted,

                'isSingleStagePaint' => $job->isSingleStagePaint,

                'isPaintThickness' => $job->isPaintThickness,

                'isVehicleOlder' => $job->isVehicleOlder,

                'isDisclaimer' => $job->isDisclaimer,

                'del'=> 0

            ]

        );

        $id = DB::getPdo()->lastInsertId();



       $services = $request['services']; 



    if($job->preventive_id != '0')

    {

        $r_vendors = DB::table('customer_job_card_preventive_measures')->where('id', $job->preventive_id)->update(['jc_id' => $id]);



        foreach ($services as $key => $value)

        {

          // $value = (string)$value;

          $jc_data = DB::table('customer_job_card_preventive_measures')->where('customer_id', $job->cust_id)->where('regn_no', $job->reg_no)->where('plan_name', $value)->where('visit_no', 1)->orderBy('id','DESC')->limit(1)->select('jc_id')->first();



          if($jc_data)

          {

            $plandata = DB::table('customer_job_card_services')->where('jc_id', $jc_data->jc_id)->where('del', 0)->select('service_name','plan_start_date','plan_end_date','plan_interval_type','plan_interval_value')->first();

          }



          if($plandata)

          {

            if($plandata->service_name == $value)

            {

              $jc_service = DB::table('customer_job_card_services')->insert(

                [

                  'jc_id' => $id,

                  'service_name' => $value,

                  'plan_start_date' => $plandata->plan_start_date,

                  'plan_end_date' => $plandata->plan_end_date,

                  'plan_interval_type' => $plandata->plan_interval_type,

                  'plan_interval_value' => $plandata->plan_interval_value

                ]

              );

            }

            else

            {

              $serv_plandata = DB::table('master_service_plans')->where('master_service_plans.plan_name', $value)->where('master_service_plans.vehicle_type', $job->vehicle_type)->where('master_service_plans.category_type', $job->cat_type)->where('master_service_plans.status', 'A')->orderBy('master_service_plans.id','ASC')->select('master_service_plans.interval_value','master_service_plans.interval_type')->first();



              if(isset($serv_plandata->interval_type) && isset($serv_plandata->interval_value))

              {

                $plan_interval_type = $serv_plandata->interval_type;

                $plan_interval_value = $serv_plandata->interval_value;

              }

              else

              {

                $plan_interval_type = '';

                $plan_interval_value = 0;

              }

              $jc_service = DB::table('customer_job_card_services')->insert(

                [

                  'jc_id' => $id,

                  'service_name' => $value,

                  'plan_interval_type' => $plan_interval_type,

                  'plan_interval_value' => $plan_interval_value

                ]

              );

            }

          }

          else

          {

            $serv_plandata = DB::table('master_service_plans')->where('master_service_plans.plan_name', $value)->where('master_service_plans.vehicle_type', $job->vehicle_type)->where('master_service_plans.category_type', $job->cat_type)->where('master_service_plans.status', 'A')->orderBy('master_service_plans.id','ASC')->select('master_service_plans.interval_value','master_service_plans.interval_type')->first();



            if(isset($serv_plandata->interval_value) && isset($serv_plandata->interval_type))

            {

              $plan_interval_type = $serv_plandata->interval_type;

              $plan_interval_value = $serv_plandata->interval_value;

            }

            else

            {

              $plan_interval_type = '';

              $plan_interval_value = 0;

            }

            $jc_service = DB::table('customer_job_card_services')->insert(

              [

                'jc_id' => $id,

                'service_name' => $value,

                'plan_interval_type' => $plan_interval_type,

                'plan_interval_value' => $plan_interval_value

              ]

            );

          }



        }



    }else{



        foreach ($services as $key => $value)

        {

          // $value = (string)$value;

            $serv_plandata = DB::table('master_service_plans')

            ->where('master_service_plans.plan_name', $value)

            ->where('master_service_plans.vehicle_type', $job->vehicle_type)

            ->where('master_service_plans.status', 'A')

            ->orderBy('master_service_plans.id','ASC')

            ->select('master_service_plans.id','master_service_plans.number_of_visits','master_service_plans.year','master_service_plans.interval_value','master_service_plans.interval_type')

            ->first();



             if( $serv_plandata ){

    

                $jc_service = DB::table('customer_job_card_services')->insert([

                    'jc_id' => $id,

                    'service_name' => $value,

                    'plan_interval_type' => $serv_plandata->interval_type,

                    'plan_interval_value' => $serv_plandata->interval_value,

              

                ]);

            }





        }

      }



      $x = $request['services'];
      $msg = 'SECCESS';
        // return $id;



        return $this->respond([



          'data' => compact('id','x','msg'),



          'status' => 'success',



          'message' => 'job created Successfully.'

      ]);



    }



    public function updateInvoice(Request $data)
    {

      $request = (Object)$data['price'];

      if( !isset($request->date_created) || ( isset($request->date_created) && !$request->date_created ) )
      return $this->respond('BILL DATE REQUIRED'); 
      
      $date_below = DB::table('customer_job_card_invoice')->where('franchise_id',$request->franchise_id)->where('invoice_series','=', $request->invoice_series-1)->select('date_created')->first();

      $date_above = DB::table('customer_job_card_invoice')->where('franchise_id',$request->franchise_id)->where('invoice_series','=', $request->invoice_series+1)->select('date_created')->first();

      if(isset($date_above->date_created) && isset($date_below->date_created ))
      {
        if(($date_above->date_created < $request->date_created) || ($date_below->date_created > $request->date_created))
        {
          return $this->respond('GREATER DATE'); 
        }
      }
      else if(isset($date_above->date_created) && ($date_above->date_created <= $request->date_created))
      {
          return $this->respond('GREATER DATE'); 
      }
      else if(isset($date_below->date_created) && ($date_below->date_created > $request->date_created))
      {
          return $this->respond('GREATER DATE'); 
      }

      $inv_save = DB::table('customer_job_card_invoice')->where('id', $request->id)->update([

        'date_created' => $request->date_created,
        
        'updated_date' => date('Y-m-d'),

        'updated_by' => $data['updated_by'],

        'payment_mode' =>  $request->payment_mode,

        'item_price' =>  $request->item_price,

        'disc_price' =>  $request->disc_price,

        'dis_per' =>  $request->dis_per,

        'sub_amount' =>  $request->sub_amount,

        'gst_price' =>  $request->gst_price,

        'igst_price' =>  $request->igst_price,

        'cgst_price' =>  $request->cgst_price,

        'sgst_price' =>  $request->sgst_price,

        'igst_per' =>  $request->igst_per,

        'cgst_per' =>  $request->cgst_per,

        'sgst_per' =>  $request->sgst_per,

        'amount' => $request->amount,
      ]);


      foreach ($data['InvServItem'] as $key => $value)
      {
        
        DB::table('customer_job_card_invoice_services_item')->where('id', $value['id'])->update([

          'disc_percent' => $value['disc_percent'],

          'discount' => $value['discount'],

          'sub_amount' => $value['sub_amount'],

          'cgst_per' => $value['cgst_per'],

          'gst' => isset($value['gst']) ? $value['gst'] : '',

          'cgst_amt' => $value['cgst_amt'],

          'sgst_per' => $value['sgst_per'],

          'sgst_amt' => $value['sgst_amt'],

          'igst_per' => $value['igst_per'],

          'igst_amt' => $value['igst_amt'],

          'item_gst_amt' => $value['item_gst_amt'],

          'amount'    => $value['amount'],

        ]);
      }

      $inv = DB::table('customer_job_card_invoice')->where('id', $request->id)->first();

      if( $request->received  &&  ( (int)$inv->received < (int)$request->received )  ) 
      {
        $payment = DB::table('customer_job_card_invoice_payment')->insert([

          'date_created' => date('Y-m-d H:i:s'),

          'created_by' =>  $data['updated_by'],

          'franchise_id' =>  $inv->franchise_id,

          'invoice_id' =>  $inv->id,

          'amount' =>  (int)( $request->received - $inv->received  ),

          'mode' =>    $request->payment_mode,
        ]);

              
        $inv_save = DB::table('customer_job_card_invoice')->where('id', $request->id)->update([
              'received' => $request->received,

              'balance' => $request->balance,
        ]);

      }
      else if( $request->refund  &&  (  (int)$request->refund )  ) 
      {
        $inv_save = DB::table('customer_job_card_invoice')->where('id', $request->id)->update([
          'received' => (int)$request->received - (int)$request->refund,
          'refund' => $request->refund,
          'balance' => $request->balance,
        ]);
        
        $payment = DB::table('customer_job_card_invoice_payment')->insert([

          'date_created' => date('Y-m-d H:i:s'),

          'created_by' =>  $data['updated_by'],

          'franchise_id' =>  $inv->franchise_id,

          'invoice_id' =>  $inv->id,

          'amount' =>  (int)( $request->received - $inv->received  ),
          'refund_amount' =>  (int)( $request->refund  ),

          'mode' =>    $request->payment_mode,

        ]);


      } 
      else if( $request->received  &&  ( (int)$inv->received == (int)$request->received )  ) 
      {
          $inv_save = DB::table('customer_job_card_invoice')->where('id', $request->id)->update([
            'balance' => $request->balance,
          ]);
      }

      
        return $this->respond('SUCCESS'); 

    }



    


    public function saveinvoice(Request $request)
    {
      $login  =  (object)$request['login'];

      $date = date('Y-m-d');
      if(isset( $request->jc_inv['date_created'] ) &&  $request->jc_inv['date_created']  )
      {
        $date = $request->jc_inv['date_created'];
      }

      $date_below = DB::table('customer_job_card_invoice')->where('franchise_id',$request->franchise_id)->where('del','0')->max('date_created');

      if( $date_below && date('Y-m-d',strtotime($date_below)) > $date) 
      {
        return $this->respond('Date is Grater');
      }

      $inv_save = DB::table('customer_job_card_invoice')->insert(
        [
          'date_created' => $date,
          'created_by' => $request->created_by,
          'franchise_id' => $request->franchise_id,
          'customer_id' => $request->cust_id,
          'jc_id' =>  $request['jc_id'],
          'payment_mode' =>  $request->jc_inv['payment_mode'],
          'item_price' =>  $request->jc_inv['item_price'],
          'disc_price' =>  $request->jc_inv['disc_price'],
          'dis_per' =>  $request->jc_inv['dis_per'],
          'sub_amount' =>  $request->jc_inv['sub_amount'],
          'gst_price' =>  $request->jc_inv['gst_price'],
          'igst_price' =>  $request->jc_inv['igst_price'],
          'cgst_price' =>  $request->jc_inv['cgst_price'],
          'sgst_price' =>  $request->jc_inv['sgst_price'],
          'igst_per' =>  $request->jc_inv['igst_per'],
          'cgst_per' =>  $request->jc_inv['cgst_per'],
          'sgst_per' =>  $request->jc_inv['sgst_per'],
          'amount' => $request->jc_inv['inv_price'],
          'received_amount' => $request->jc_inv['inv_price'],
          'received' => $request->jc_inv['received'],
          'balance' => $request->jc_inv['balance'],
        ]);

      $id = DB::getPdo()->lastInsertId();
      if (date('m') < 4)
      {
        $financial_year = (date('y')-1) . '-' . date('y');      //Upto June 2014-2015
      }
      else
      {
        $financial_year = date('y') . '-' . (date('y') + 1);    //After June 2015-2016
      }

      $pre_fix = DB::table('franchises')->where('id',$request->franchise_id)->first()->pre_fix;

      $prefix =  $pre_fix .'/'. $financial_year;

      $invoice_series = 1;

      $p = DB::table('customer_job_card_invoice')->where('prefix','LIKE','%'.$prefix.'%')->where('franchise_id',$request['franchise_id'])->orderBy('invoice_series','DESC')->first();
      if($p)
      {
        $invoice_series = $p->invoice_series + 1;
        $invoice_id = $prefix.'/'.$invoice_series;
      }
      else
      {
        $invoice_id = $prefix.'/1';
      }

      DB::table('customer_job_card_invoice')->where('id',$id)->update([
        'invoice_id' => $invoice_id,
        'invoice_series' => $invoice_series,
        'prefix' => $prefix
      ]);

      if( $request->jc_inv['received'] )
      {
        $payment = DB::table('customer_job_card_invoice_payment')->insert([
          'date_created' => $date,
          'created_by' => $request->created_by,
          'franchise_id' =>  $request->franchise_id,
          'invoice_id' =>  $id,
          'amount' =>  $request->jc_inv['received'],
          'mode' =>    $request->jc_inv['payment_mode'],
        ]);
      }

      foreach ($request->jc_inv_item as $key => $value)
      {
        if($value['plan_start_date'] == '0000-00-00')
        {

          $jc_inv_item = DB::table('customer_job_card_invoice_services_item')->insert(
            [
              'invoice_id' => $id,
              'vehicle_type' => $value['vehicle_type'],
              'plan_name' => $value['plan_name'],
              'service_plan_id' => $value['id'],
              'invoice_name' => $value['invoice_name'],
              'description' => $value['description'],
              'sac' => $value['sac'],
              'qty' => 1,
              'price' => $value['price'],
              'disc_percent' => $value['disc_percent'],
              'discount' => $value['discount'],
              'sub_amount' => $value['sub_amount'],
              'cgst_per' => $value['cgst_per'],
              'gst' => isset($value['gst']) ? $value['gst'] : '',
              'cgst_amt' => $value['cgst_amt'],
              'sgst_per' => $value['sgst_per'],
              'sgst_amt' => $value['sgst_amt'],
              'igst_per' => $value['igst_per'],
              'igst_amt' => $value['igst_amt'],
              'item_gst_amt' => $value['item_gst_amt'],
              'amount'    => $value['amount'],
            ]
          );

          $next_value = 0;
          $temp_next_value = 0;
          if($value['interval_type'] == 'Year')
          {
            $temp_next_value = (int)($value['interval_value'] * 12)/ $value['number_of_visits'];
          }
          else if($value['interval_type'] == 'Month')
          {
            $temp_next_value = (int)($value['interval_value'] * 30)/ $value['number_of_visits'];
          }
          else
          {
            $due_date = '0000-00-00';
          }

          $due_date = $date;
          $closing_date = '0000-00-00';
          for($i = 0; $i < $value['number_of_visits']; $i++)
          {
            $job_id = $request['jc_id'];
            $invoice_id = $id;
            if($i == 0)
            {
              $closing_date = date('Y-m-d');
            }
            else
            {
              $closing_date = '0000-00-00';
              $job_id = 0;
              $invoice_id = 0;
              if($value['interval_type'] == 'Year')
              {
                $due_date = date('Y-m-d', strtotime("+".$next_value." Month", strtotime( $date )));
              }
              else if($value['interval_type'] == 'Month')
              {
                $due_date = date('Y-m-d', strtotime("+".$next_value." Day", strtotime( $date )));
              }
              else
              {
                $due_date = '0000-00-00';
              }
            }
            $next_value = $next_value + $temp_next_value;
            $detail = (object)$request['detail'];
            $jc_inv_item = DB::table('customer_job_card_preventive_measures')->insert(
              [
                'date_created' => date('Y-m-d'),
                'created_by' => $request->created_by,
                'created_by_type' => 'Admin',
                'customer_id' => $request->cust_id,
                'jc_id' =>  $job_id,
                'invoice_id' => $invoice_id,
                'vehicle_type' => $value['vehicle_type'],
                'plan_name' => $value['plan_name'],
                'regn_no' => $detail->regn_no,
                'model' => $detail->model_no,
                'make' =>  $detail->make,
                'color' =>  $detail->color,
                'chasis_no' =>  $detail->chasis_no,
                'vehicle_condition' =>  $detail->vehicle_condition,
                'visit_no' => $i+1,
                'due_date' => $due_date,
                'closing_date' => $closing_date,
                'del'=> 0
              ]
            );

          }
        }

        $jc_plan_data = DB::table('customer_job_card_services')->where('jc_id', $request['jc_id'])->where('service_name', $value['plan_name'])->select('*')->first();
        if($jc_plan_data)
        {
          if($jc_plan_data->plan_start_date == '0000-00-00')
          {
            $plan_start_date = date("Y-m-d");
            $plan_end_date = date('Y-m-d', strtotime("+".$value['interval_value']." ".$value['interval_type'], strtotime(date('Y-m-d'))));

            DB::table('customer_job_card_services')->where('jc_id', $request['jc_id'])->where('service_name', $value['plan_name'])->update(
                [
                  'plan_start_date' => $plan_start_date,
                  'plan_end_date' =>  $plan_end_date,
                ]
            );
          }
        }
        else
        {
          $plan_start_date = date("Y-m-d");
          $plan_end_date = date('Y-m-d', strtotime("+".$value['interval_value']." ".$value['interval_type'], strtotime(date('Y-m-d'))));
          $jc_service = DB::table('customer_job_card_services')->insert([
            'jc_id' => $request['jc_id'],
            'service_name' => $value['plan_name'],
            'plan_start_date' => $plan_start_date,
            'plan_end_date' => $plan_end_date,
            'plan_interval_type' => $value['interval_type'],
            'plan_interval_value' => $value['interval_value'],
            'del'=> 0
          ]);
        }
      }

      if($detail->type == 1)
      { 
        DB::table('consumers')->where('id', $request->cust_id)->update( [ 'type' => 2,'lead_status' => 'converted','status_convert_by' => $request->created_by,'status_convert_date' => date('Y-d-m H:i:s') ]);

        $test = DB::table('follow_ups')->where('consumer_id', $request->cust_id )->update(['followup_status' => 'D','updated_at' => date('Y-m-d')]);
        $follow = DB::table('follow_ups')->insert([
          'consumer_id' => $request->cust_id,
          'follow_type' => 'Appointment',
          'created_at' => date('Y-m-d'),
          'created_by' => $request->created_by,
          'followup_status' => 'D',
        ]);
      }
      return $id;

    }



    public function getData(Request $request) {



      $franchise_id = (String)$request['franchise_id'];



        $tech_data = DB::table('users')->where('access_level', '=' ,'7')->where('franchise_id', '=' , $franchise_id)->select('first_name', 'id')->get();



        $vehicle_type_data = DB::table('master_service_plans')->where('status', '=' ,'A')->select('vehicle_type')->groupBy('vehicle_type')->get();



        return $this->respond([



            'data' => compact('tech_data','vehicle_type_data'),



            'status' => 'success',



            'message' => 'Data Fetched Successfully.'

        ]);

    }



    public function getCategory(Request $request) {

      $request = (object)$request['data'];



      

        $cat_data = DB::table('master_service_plans')->where('status', '=' ,'A')->where('vehicle_type', 'LIKE', '%'.$request->vehicle_type.'%')->select('category_type')->groupBy('category_type')->get();



        



        return $this->respond([



            'data' => compact('cat_data'),



            'status' => 'success',



            'message' => 'Data Fetched Successfully.'

        ]);

    }



    public function getPlan(Request $request) {

      $data = (object)$request['data'];



      $plan_data = [];

        foreach ($data->cat_type as $key => $services) {

       

          $services = (string)$services;

        $d = DB::table('master_service_plans')

        ->where('status', '=' ,'A')

        ->where('category_type', 'LIKE', '%'.$services.'%')

        ->select('plan_name','category_type')

        ->groupBy('plan_name')

        ->get();

        foreach ($d as $key => $value) {

          array_push($plan_data, $value);

        }



      }

       



        return $this->respond([



            'data' => compact('plan_data'),



            'status' => 'success',



            'message' => 'Data Fetched Successfully.'

        ]);

    }







    public function getJobCardList($cust_id){



      $jc_data = DB::table('customer_job_card')

      ->leftJoin('consumers', 'customer_job_card.customer_id', '=', 'consumers.id')

      ->where('customer_job_card.customer_id', '=' , $cust_id)

      ->where('customer_job_card.del','=',0)

      ->select('customer_job_card.*','consumers.first_name','consumers.franchise_id','consumers.last_name','consumers.email','consumers.phone')

      ->get();



      return $this->respond([



          'data' => compact('jc_data'),



          'status' => 'success',



          'message' => 'Data Fetched Successfully.'

      ]);

    }



    public function JobCardDetail($jc_id){

      $jc_data = DB::table('customer_job_card')->where('id', '=' , $jc_id)->select('*')->get();



      return $this->respond([



          'data' => compact('jc_data'),



          'status' => 'success',



          'message' => 'Data Fetched Successfully.'

      ]);

    }



    public function JobCardDelete($jc_id){

      $r_vendors = DB::table('customer_job_card')->where('id', $jc_id)->update(['del' => '1']);

      return $this->respond([



          'data' => compact('r_vendors'),



          'status' => 'success',



          'message' => 'Job Card deleted Successfully.'



          ]);

    }



    public function GetProducts(){

      $prod_data = DB::table('master_products')->where('status', '!=' , 'X')->select('*')->get();



      return $this->respond([



          'data' => compact('prod_data'),



          'status' => 'success',



          'message' => 'Data Fetched Successfully.'

      ]);

    }

    public function update_jobCard(Request $request)
    {
      // print_r($request->all());
      // exit;
      $vendordeal_save = DB::table('customer_job_card')->where('id',$request->data['id'])->update(
        [
          'vehicle_type' => $request->data['vehicle_type'],
          'category_type' => $request->data['category_type'],
          'regn_no' => $request->data['regn_no'],
          'model_no' => $request->data['model_no'],
          'color' => $request->data['color'],
          'year' => $request->data['year'],
          'chasis_no' => $request->data['chasis_no'],
          'make' => $request->data['make'],
          'technician' => $request->data['technician'],
          'vehicle_condition' => $request->data['vehicle_condition'],
          'vehicle_condition' => $request->data['vehicle_condition']
        ]
      );
      return $this->respond('SUCCESS');
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

                    'name' =>$val->contact_name,

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

//         $per_page = 10;

//         $search = $request->s;

//         $search ='';

//         $vendors = $this->vendors_repo->get_vendors($per_page, $search);

//         $vendor_details = $this->vendors_repo->get_vendors_contact($vendors);

//         return $this->respond([

//             'data' => compact('vendors', 'vendor_details'),

//             'status' => 'success',

//             'message' => 'Vendors Get Successfully!'

//         ]);

        $per_page = 10;

        $search = $request->s;

        //$search = '';

        if($search){

            $vendors = DB::table('vendors')->leftJoin('vendordeals', 'vendors.id', '=', 'vendordeals.vendor_id')->where('status', 'A')->where('vendors.name', 'LIKE', '%'.$search.'%')->orderBy('vendors.id','DESC')->select('vendors.*', DB::raw("COUNT('vendordeals.vendor_id') as total_deals"))->groupBy('vendors.id')->paginate($per_page);

        }else{

            $vendors = DB::table('vendors')->leftJoin('vendordeals', 'vendors.id', '=', 'vendordeals.vendor_id')->select('vendors.*', DB::raw("COUNT('vendordeals.vendor_id') as total_deals"))->groupBy('vendors.id')->where('vendors.status', 'A')->orderBy('vendors.id','DESC')->paginate($per_page);

        }

        $vendors_count = DB::table('vendors')->where('status', 'A')->count();

        $vendor_con=$this->get_vendor_contact($vendors);

        $usernam=$this->get_usersname($vendors);

        return $this->respond([



            'data' => compact('vendors','vendor_con','vendors_count','usernam'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor\'s Get Successfully.'



            ]);

            //dd($vendors);

    }



    public function get_vendor_contact($vendors) {

        $con_info = [];

        foreach($vendors as $val) {

            $data = DB::table('vendor_details')->where('vendor_id', $val->id)->where('status', '!=' ,'X')->select('id as con_id', 'vendor_id', 'name','phone1','phone2')->get();

            if(count($data)) array_push( $con_info, $data);

        }

        return $con_info;

    }



    public function get_usersname($vendors) {

        $us_info = [];

        foreach($vendors as $val) {

            $data = DB::table('users')->where('id', $val->created_by)->select('id as user_id', 'username')->get();

            if(count($data)) array_push( $us_info, $data);

        }

        return $us_info;

    }









    public function vendorDetails($v_id){



        $data = DB::table('vendors')->where('id', '=' ,$v_id)->get();

        $v_deal = DB::table('vendordeals')->where('vendor_id', '=' ,$v_id)->get();

        $v_con = DB::table('vendor_details')->where('vendor_id', '=' ,$v_id)->get();

        return $this->respond([



            'data' => compact('data','v_deal','v_con'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'vendor Fetched Successfully.'



        ]);

        //return $v_id;

        //dd($data);

    }

    public function deleteVendors(Request $request) {

        $r_vendors = DB::table('vendors')->where('id', $request->v_id)->where('status', 'A')->update(['status' => 'X']);

        return $this->respond([



            'data' => compact('r_vendors'),



            'status' => 'success',



            'status_code' => $this->getStatusCode(),



            'message' => 'Vendor deleted Successfully.'



            ]);

    }



    public function updateVendors(Request $request) {

        $vendors_update = DB::table('vendors')->where('id', $request->vendor_id)->update(

            ['email_id' => $request->email],

            ['phone' =>  $request->mobile],

            ['landline' => $request->landline],

            ['address' => $request->address],

            ['city' => $request->city],

            ['state' => $request->state],

            ['district' => $request->district],

            ['country' => $request->country],

            ['pan_no' => $request->pan_no],

            ['gst_no' => $request->mobile],

            ['pin_code' => $request->pin]



        );

        if($vendors_update) {

            //$this->save_product_measurement($product->id, $data->unitData);

            //$this->save_product_attr($product->id, $data->attrData);



        return $this->respond([

            'data' => compact('vendors_update'),

            'status' => 'success',

            'status_code' => $this->getStatusCode(),

            'message' => 'Consumer Lead Updated Successfully.'

        ]);

    }

   }



   public function fetchCustomerFromNo(Request $request){

    //echo "<pre>";

    //print_r($request->franchise_id);

    //print_r($request->mobile);

    $consumers = DB::table('consumers')->where('status', 'A')->where('franchise_id',$request->franchise_id)->where('phone',$request->mobile)->get();



    return response()->json(compact('consumers'));

  }



  public function fetchCustomerFromId(Request $request){

    //echo "<pre>";

    //print_r($request->franchise_id);

    //print_r($request->mobile);

    $consumers = DB::table('consumers')->where('status', 'A')->where('franchise_id',$request->franchise_id)->where('id',$request->cust_id)->get();



    return response()->json(compact('consumers'));

  }



    public function get_car_company()
    {
      $company_list = DB::table('car_company')
      ->where('del', 0)
      ->get();
      
      return $this->respond([
        'data' => compact('company_list'),
        'status' => 'success',
        'status_code' => $this->getStatusCode(),
        'message' => 'company_list Lead Updated Successfully.'
      ]);
    }





    public function car_model_list( Request $request ){

      $car_model_list = DB::table('car_model')

      ->where('company', $request['company'])

      ->where('del', 0)

      ->get();

      return $this->respond([

        'data' => compact('car_model_list'),

        'status' => 'success',

        'status_code' => $this->getStatusCode(),

        'message' => 'company_list Lead Updated Successfully.'

    ]);
  }


  public function check_is_company( Request $request ){

    // print_r($request->all());
    // exit;
    // $car_model_list = DB::table('car_model')

    // ->where('company', $request['company'])

    // ->where('del', 0)

    // ->get();

    // return $this->respond([

    //   'data' => compact('car_model_list'),

    //   'status' => 'success',

    //   'status_code' => $this->getStatusCode(),

    //   'message' => 'company_list Lead Updated Successfully.'

  // ]);
}



  public function updateNote( Request $request ){

    $noteData = (object)$request['note'];

    $s= DB::table('customer_job_card_invoice')->where('id', $noteData->id)->update(['note'=> $noteData->note]);





  }





  public function  getJobcardPendingPayment(Request $request){

    $d = (object)$request['data'];



     $payment = DB::table('customer_job_card_invoice')->where('id', $d->invoice_id)->first();



     return $this->respond([



         'data' => compact('payment'),



         'status' => 'success',



         'status_code' => $this->getStatusCode(),



         'message' => 'Job Card Invoice Fatch Successfully.'



     ]);



}





public function jobcard_payment_receiving(Request $request)
{

  $d = (object)$request['data'];

  if($d->receive_payment && $d->payment_mode && $d->payment_mode != 'None')
    $payment = DB::table('customer_job_card_invoice_payment')->insert([

      'date_created' =>  ( isset( $d->date_created ) && $d->date_created  ) ? $d->date_created  : date('Y-m-d H:i:s'),

      'created_by' => $d->user_id,

      'franchise_id' =>  $d->franchise_id,

      'invoice_id' =>  $d->invoice_id,

      'amount' =>  $d->receive_payment,

      'mode' =>  $d->payment_mode,

      'note' =>  $d->note,

    ]);

    if($d->balance_amount > 0){

        $payment_status = 'Pending';

    }else if($d->balance_amount == 0){

        $payment_status = 'Paid';
    }

    $invoice = DB::table('customer_job_card_invoice')

    ->where('id', $d->invoice_id)

    ->update([

        'payment_status' =>  $payment_status,

        'balance' =>  $d->balance_amount,

        'due_terms' =>  $d->due_terms,

    ]);

    $invoice = DB::table('customer_job_card_invoice')

    ->where('id', $d->invoice_id)

    ->increment('received', $d->receive_payment);
}






}

