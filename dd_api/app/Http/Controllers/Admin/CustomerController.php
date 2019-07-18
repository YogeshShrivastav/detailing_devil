<?php



namespace App\Http\Controllers\Admin;



use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;

class CustomerController extends ApiController

{



    public function __construct()

    {

        date_default_timezone_set("Asia/Calcutta");

    }





    public function franch_customers($l_id)

    {

        $customers = DB::table('consumers')->where('franchise_id', $l_id)->where('status', 'A')->where('type', '2')->get();

        return response()->json(compact('customers'));

    }



    public function customer_detail($l_id)

    {



        $detail = DB::table('consumers')

        ->leftJoin('locations', 'locations.id', '=', 'consumers.location_id')
        ->leftJoin('countries', 'countries.id', '=', 'consumers.country_id')
        ->leftJoin('countries as countries2', 'countries2.id', '=', 'consumers.company_country_id')

        ->where('consumers.id', $l_id)
        ->where('consumers.status', 'A')
        ->where('consumers.type', '2')
        ->select('consumers.*','locations.location_name','countries.name as country_name','countries2.name as company_country_name')
        ->first();




        $vehicle_info=$this->get_customer_vehicles($l_id);



        return response()->json(compact('detail','vehicle_info'));

    }



    public function get_customer_vehicles($l_id)

    {

        $data = DB::table('customer_job_card')

        ->leftJoin('customer_job_card_services', 'customer_job_card.id', '=', 'customer_job_card_services.jc_id')

        ->leftJoin('customer_job_card_invoice_services_item', 'customer_job_card_invoice_services_item.plan_name', '=', 'customer_job_card_services.service_name','customer_job_card.vehicle_type', '=', 'customer_job_card_invoice_services_item.vehicle_type','customer_job_card.category_type', '=', 'customer_job_card_invoice_services_item.category_type')

        ->where('customer_job_card.customer_id', $l_id)

        ->select('customer_job_card.vehicle_type','customer_job_card.category_type','customer_job_card.model_no','customer_job_card.regn_no','customer_job_card_services.plan_end_date','customer_job_card_services.service_name',DB::raw('group_concat(DISTINCT  customer_job_card_services.service_name) as service_name'),DB::raw('group_concat(DISTINCT    DATE_FORMAT(customer_job_card_services.plan_end_date, "%d %b %Y") ) as plan_end_date'))

        ->groupBy('customer_job_card.regn_no')->get();



        // foreach ($data as $key => $value) {

        //     $value = (object)$value;

        //     $d = DB::table('customer_job_card_services')

        //     ->leftJoin('customer_job_card', 'customer_job_card.id', '=', 'customer_job_card_services.jc_id')



        //     ->where('customer_job_card.regn_no', $value->regn_no)

        //     ->where('customer_job_card_services.plan_end_date', '!=','0000-00-00')

        //     ->select(''DB::raw('group_concat(DISTINCT    DATE_FORMAT(customer_job_card_services.plan_end_date, "%d %b %Y") ) as plan_end_date'))

        //     ->groupBy('customer_job_card.regn_no')->first();



        //     $s = (object)$d;

        //     $data[ $key ]->plan_end_date  = $s->plan_end_date;

        // }

        return $data;

    }





    public function customer_jobcards(Request $request)

    {

         $per_page = 20;


        $filter = (Object)$request['filter'];

        $so = DB::table('customer_job_card')
        ->leftJoin('users', 'customer_job_card.created_by', '=', 'users.id')
        ->where('customer_job_card.customer_id', $request['id'])
        ->where('customer_job_card.status','!=', 'Cancel');


         if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s ) {
                $query->where('customer_job_card.vehicle_type','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card.regn_no','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card.id','LIKE','%'.$s.'%');

            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('customer_job_card.date_created','LIKE','%'.$filter->date.'%');
    if(isset($filter->status) && $filter->status != '') $so->where('customer_job_card.status','LIKE','%'.$filter->status.'%');


        
    $so->select('customer_job_card.id','customer_job_card.customer_id','customer_job_card.vehicle_type','customer_job_card.model_no','customer_job_card.regn_no','customer_job_card.status','customer_job_card.date_created','users.first_name as created_name')

    ->orderBy('customer_job_card.id','DESC');
    
    $cardlist= $so->paginate($per_page);


         return $this->respond([



        'data' => compact('cardlist'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Order\'s List Get Successfully.'



        ]);

    }





    public function customer_pre_srvclist(Request $request)

    {

        $per_page = 20;


        $filter = (Object)$request['filter'];

        $so = DB::table('customer_job_card_preventive_measures')

        ->leftJoin('users', 'customer_job_card_preventive_measures.created_by', '=', 'users.id')

    ->leftJoin('customer_job_card_invoice', 'customer_job_card_preventive_measures.invoice_id', '=', 'customer_job_card_invoice.id')

        ->where('customer_job_card_preventive_measures.customer_id', $request['id'])
        ->where('customer_job_card_preventive_measures.del', '0');

         if(isset($filter->search) && $filter->search != '') {
            $s = $filter->search;
            $so->where(function ($query) use ($s ) {
                $query->where('customer_job_card_preventive_measures.vehicle_type','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card_preventive_measures.plan_name','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card_preventive_measures.regn_no','LIKE','%'.$s.'%')
                ->orWhere('customer_job_card_preventive_measures.visit_no','LIKE','%'.$s.'%');
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('customer_job_card_preventive_measures.date_created','LIKE','%'.$filter->date.'%');
        if(isset($filter->status) && $filter->status != '') $so->where('customer_job_card_invoice.payment_status','LIKE','%'.$filter->status.'%');

     $so->select('customer_job_card_preventive_measures.*','users.first_name as created_name','customer_job_card_invoice.invoice_id as prfx_invoice_id','customer_job_card_invoice.payment_status')

         ->orderBy('customer_job_card_preventive_measures.id','DESC');

      $list= $so->paginate($per_page);

    
    return $this->respond([



        'data' => compact('list'),



        'status' => 'success',



        'status_code' => $this->getStatusCode(),



        'message' => 'Order\'s List Get Successfully.'



        ]);


    }



    public function customer_invoicelist(Request $request)
    {
        $per_page = 20;
        $filter = (Object)$request['filter'];

        // print_r($request->all());
        // exit;
        $so = DB::table('customer_job_card_invoice')

        ->join('consumers', 'consumers.id', '=', 'customer_job_card_invoice.customer_id')
        ->leftJoin('users', 'customer_job_card_invoice.created_by', '=', 'users.id')

        ->where('customer_job_card_invoice.franchise_id', $request['franchise_id'])
        ->where('customer_job_card_invoice.del', '0');

        if( isset(  $request['customer_id'] ) &&  $request['customer_id'] ) $so->where('customer_job_card_invoice.customer_id', $request['customer_id']);

        if(isset($filter->search) && $filter->search != '') 
        {
            $s = $filter->search;
            $so->where(function ($query) use ($s, $request) 
            {
                $query->where('customer_job_card_invoice.invoice_id','LIKE','%'.$s.'%')
                ->orWhere('users.first_name','LIKE','%'.$s.'%');
                if( !isset(  $request['customer_id'] ) ||  !$request['customer_id'] ) 
                {
                    $query->orWhere('consumers.first_name','LIKE','%'.$s.'%')
                    ->orWhere('consumers.last_name','LIKE','%'.$s.'%');
                }
            });
        }

        if(isset($filter->date) && $filter->date != '') $so->where('customer_job_card_invoice.date_created','LIKE','%'.$filter->date.'%');

        if(isset($filter->discount) && $filter->discount != 'With Discount' &&  $filter->discount != '') $so->where('customer_job_card_invoice.disc_price','=','0');
        if(isset($filter->discount) && $filter->discount != 'Without Discount'  &&  $filter->discount != '') $so->where('customer_job_card_invoice.disc_price','!=','0');

        if(isset($filter->balance) && $filter->balance != 'Paid'  &&  $filter->balance != '') $so->where('customer_job_card_invoice.balance','=','0');
        if(isset($filter->balance) && $filter->balance != 'Pending'  &&  $filter->balance != '') $so->where('customer_job_card_invoice.balance','!=','0');


        if(isset($filter->payment) && $filter->payment != '') $so->where('customer_job_card_invoice.payment_mode','LIKE','%'.$filter->payment.'%');

        $so->select('customer_job_card_invoice.*','consumers.first_name','consumers.last_name','users.first_name as created_name')

        ->groupBy('customer_job_card_invoice.id')->orderBy('customer_job_card_invoice.id','DESC');

        $list= $so->paginate($per_page);

        return $this->respond([

            'data' => compact('list'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Order\'s List Get Successfully.'
        ]);

    }



    public function cust_jobcardetail($l_id,$card_id)
    {
        $detail = DB::table('customer_job_card')

        ->leftJoin('consumers', 'customer_job_card.customer_id', '=', 'consumers.id')

        ->leftJoin('users', 'customer_job_card.created_by', '=', 'users.id')

        ->where('customer_job_card.customer_id', $l_id)

        ->where('customer_job_card.id', $card_id)

        ->where('del', '0')

        ->select('customer_job_card.*','users.first_name as created_name','consumers.first_name','consumers.last_name','consumers.phone','consumers.company_name','consumers.company_contact_no','consumers.gstin','consumers.company_address','consumers.type','consumers.email','consumers.address','customer_job_card.isCompany',
        'consumers.company_district','consumers.company_city','consumers.company_state','consumers.company_pincode',DB::raw('CASE WHEN customer_job_card.isCompany = "1"  THEN consumers.company_state ELSE consumers.state END as state')
        )
         ->first();

        $plan_info=$this->get_card_plans($card_id);

        $items=$this->get_card_items($card_id);



        $card_invoices=$this->get_card_invoices($card_id);

        $vehicle_type_plans = $this->get_vehicle_type_plans($detail->vehicle_type);





        return response()->json(compact('detail','plan_info','card_invoices','items','vehicle_type_plans'));

    }



    public function get_vehicle_type_plans($v_type)

    {

      $data = DB::table('master_service_plans')->where('status', '=' ,'A')->where('vehicle_type', '=', ''.urldecode($v_type).'')->groupBy('plan_name')->get();

      return $data;

    }



    public function get_card_items($card_id)

    {

        $data = DB::table('customer_job_card_raw_material')->leftJoin('users', 'customer_job_card_raw_material.created_by', '=', 'users.id')->where('customer_job_card_raw_material.jc_id', $card_id)->select('customer_job_card_raw_material.*','users.first_name as created_name')->get();

        return $data;

    }





    public function get_card_plans($card_id)

    {

        $data = DB::table('customer_job_card_services')->where('customer_job_card_services.jc_id', $card_id)->select('customer_job_card_services.service_name','customer_job_card_services.plan_start_date','customer_job_card_services.plan_end_date')->groupBy('customer_job_card_services.service_name')->get();

        return $data;

    }



    public function get_card_invoices($card_id)

    {

        $data = DB::table('customer_job_card_invoice')->leftJoin('users', 'customer_job_card_invoice.created_by', '=', 'users.id')->where('customer_job_card_invoice.jc_id', $card_id)->select('customer_job_card_invoice.*','users.first_name as created_name','customer_job_card_invoice.date_created')->where('customer_job_card_invoice.del','0')->groupBy('customer_job_card_invoice.id')->get();

        return $data;

    }

    public function cust_invoicedetail($l_id,$inv_id)
    {
        $detail = DB::table('customer_job_card_invoice')

        ->leftJoin('consumers', 'customer_job_card_invoice.customer_id', '=', 'consumers.id')

        ->leftJoin('customer_job_card', 'customer_job_card_invoice.jc_id', '=', 'customer_job_card.id')

        ->leftJoin('users', 'customer_job_card_invoice.created_by', '=', 'users.id')
        
        ->leftJoin('users as user1', 'customer_job_card_invoice.updated_by', '=', 'user1.id')

        ->leftJoin('franchises', 'franchises.id', '=', 'consumers.franchise_id')

        ->leftJoin('locations', 'locations.id', '=', 'franchises.location_id')

        ->leftJoin('countries', 'countries.id', '=', 'franchises.country_id')

        ->leftJoin('countries as client_countries', 'client_countries.id', '=', 'consumers.country_id')

        ->leftJoin('customer_job_card_preventive_measures', 'customer_job_card_preventive_measures.invoice_id', '=', 'customer_job_card_invoice.id')

        ->where('customer_job_card_invoice.customer_id', $l_id)

        ->where('customer_job_card_invoice.id', $inv_id)

        ->orderBy('customer_job_card_preventive_measures.id','DESC')

        ->select('customer_job_card_invoice.*','customer_job_card_invoice.del as extra_discount','users.first_name as created_name','user1.first_name as updated_name','consumers.first_name','consumers.last_name','consumers.phone','consumers.email','consumers.address','consumers.pincode','consumers.district' ,'consumers.company_address' ,'consumers.company_contact_no' ,'consumers.gstin' ,'consumers.company_name','consumers.company_city','consumers.company_district','customer_job_card.vehicle_type','customer_job_card.model_no','customer_job_card.make','customer_job_card.regn_no','customer_job_card_preventive_measures.closing_date','locations.location_name', 'franchises.state as franchise_state','franchises.district as franchise_district','franchises.city as franchise_city','franchises.pincode as franchise_pincode','franchises.address as franchise_address','franchises.company_name as franchise_name','franchises.company_gstin as franchise_company_gstin','countries.name as franchise_country','client_countries.name as consumer_country','customer_job_card.color','customer_job_card.isCompany','franchises.email_id','franchises.contact_no',DB::raw('CASE WHEN customer_job_card.isCompany = "1"  THEN consumers.company_state ELSE consumers.state END as state') )

        ->first();

        $inv_item=$this->get_inv_items($inv_id);

        $payment = DB::table('customer_job_card_invoice_payment')

        ->join('customer_job_card_invoice','customer_job_card_invoice.id','=','customer_job_card_invoice_payment.invoice_id')

        ->join('users','users.id','=','customer_job_card_invoice_payment.created_by')

        ->where('customer_job_card_invoice_payment.invoice_id',$inv_id)

        ->select('customer_job_card_invoice_payment.*','customer_job_card_invoice.invoice_id as prfx_invoice_id','users.first_name')

        ->get();

        // print_r($detail);
        // exit;

        return response()->json(compact('detail','inv_item','payment'));

    }



    public function get_inv_items($inv_id)

    {

        $data = DB::table('customer_job_card_invoice_services_item as inv_item')->where('inv_item.invoice_id', $inv_id)->get();

        return $data;

    }





    public function getallbrands(Request $request,$f_id)

    {

        // $brands = DB::table('master_products')->where('status', 'A')->select('master_products.id','master_products.brand_name')->groupBy('master_products.brand_name')->get();

        $brands = DB::table('franchise_purchase_initial_stocks')->where('category',  $request->category)->where('franchise_id', $f_id)->select('brand as brand_name')->groupBy('brand')->get();

        return response()->json(compact('brands'));

    }



    public function get_brand_wise_product(Request $request)

    {

        // $products = DB::table('master_products')->where('brand_name', $request->brand)->select('master_products.id','master_products.product_name')->groupBy('master_products.product_name')->get();

        $products = DB::table('franchise_purchase_initial_stocks')->where('category',  $request->category)->where('brand', $request->brand)->where('franchise_id', $request->franchise_id)->select('product as product_name','id')->groupBy('product')->get();

        return response()->json(compact('products'));

    }



    public function get_prdct_wise_attr(Request $request)

    {

        // $attr_types = DB::table('master_product_attr_types')->where('product_id', $request->product_id)->select('master_product_attr_types.id','master_product_attr_types.attr_type')->groupBy('master_product_attr_types.attr_type')->get();

        //

        // $uom = DB::table('master_product_measurement_prices')->where('product_id', $request->product_id)->select('master_product_measurement_prices.id','master_product_measurement_prices.unit_of_measurement as uom')->groupBy('master_product_measurement_prices.unit_of_measurement')->get();



      $measures = DB::table('franchise_purchase_initial_stocks')->where('category',  $request->category)->where('brand', $request->brand_name)->where('product', $request->product)->where('franchise_id', $request->franchise_id)->select('unit_measurement as uom','quantity','current_stock','id')->get();



        return response()->json(compact('measures'));

    }



    public function get_attrtype_wise_attroption(Request $request)

    {

        $attroptions = DB::table('master_product_attr_options')->where('attr_type_id', $request->attr_type_id)->where('product_id', $request->prod_id)->select('master_product_attr_options.id','master_product_attr_options.attr_option')->groupBy('master_product_attr_options.attr_option')->get();

        return response()->json(compact('attroptions'));

    }





    public function saveraw_material(Request $request,$card_id)
    {
        foreach($request['cart'] as $row)
        {

          $prev_data = DB::table('customer_job_card_raw_material')

            ->where('jc_id', $card_id)

            ->where('category',$row['category'])

            ->where('brand_name',$row['brand_name'])

          ->where('item_name',$row['product_name'])

          ->where('uom',$row['uom'])

          ->increment('quantity', $row['qty']) ;


          if(!$prev_data)
          {

         DB::table('customer_job_card_raw_material')->insert(

              [

                'date_created'=> date("Y-m-d"),

                'created_by' => $request['created_by'] ,

                'jc_id' => $card_id,

                'category' =>$row['category'],

                'stock_id' => $row['stock_id'],

                'brand_name' =>$row['brand_name'],

                'item_name' => $row['product_name'],

                'uom' => $row['uom'],

                'quantity' => $row['qty']

              ]

            );

          }





          DB::table('franchise_purchase_initial_stocks')

        ->where('franchise_id',$request['franchise_id'])
        ->where('category',$row['category'])

        ->where('brand',$row['brand_name'])

          ->where('product',$row['product_name'])

          ->where('unit_measurement',$row['uom'])

          ->decrement('current_stock' , $row['qty'] );





        }



     



    }

    public function get_rew_matrial($card_id){

            $items = $this->get_card_items($card_id);



            return $this->respond([



                'items' => compact('items'),



                'status' => 'success',



                'message' => 'Item\'s Saved Successfully.'



            ]);
    }



    public function getPendingpreventive_service($custid,$cardid,$franchise_id)

    {



        $custdata = DB::table('consumers')->where('consumers.id', $custid)->select('consumers.state_name')->first();



        $frnch_data = DB::table('franchises')->where('franchises.id', $franchise_id)->select('franchises.state')->first();





         $cgst; $sgst; $igst;



        if(isset($custdata->state_name) && isset($frnch_data->state))

        {

            if($custdata->state_name==$frnch_data->state)

            {

                $cgst = 9;

                $sgst = 9;

                $igst = 0;

            }

            else

            {

                $cgst = 0;

                $sgst = 0;

                $igst = 18;

            }

        }



        else

        {

          $cgst = 0;

          $sgst = 0;

          $igst = 18;

        }



        $detail = DB::table('customer_job_card')->leftJoin('consumers', 'customer_job_card.customer_id', '=', 'consumers.id')->leftJoin('users', 'customer_job_card.created_by', '=', 'users.id')->where('customer_job_card.customer_id', $custid)->where('customer_job_card.id', $cardid)->where('del', '0')->select('customer_job_card.id as jc_id','customer_job_card.customer_id','customer_job_card.vehicle_type','customer_job_card.model_no','customer_job_card.regn_no','customer_job_card.status','customer_job_card.date_created','users.first_name as created_name','consumers.first_name','consumers.last_name','consumers.phone','consumers.email','consumers.address')->first();



        $itemdata_temp = DB::table('customer_job_card_services as card_services')->leftJoin('customer_job_card', 'card_services.jc_id', '=', 'customer_job_card.id')->leftJoin('master_service_plans', 'master_service_plans.plan_name', '=', 'card_services.service_name','master_service_plans.vehicle_type', '=', 'customer_job_card.vehicle_type','master_service_plans.category_type', '=', 'customer_job_card.category_type')->where('card_services.jc_id', $cardid)->where('customer_job_card.customer_id', $custid)->select('card_services.id','master_service_plans.price','card_services.service_name as plan_name','customer_job_card.vehicle_type','customer_job_card.category_type','customer_job_card.regn_no','customer_job_card.model_no')->groupBy('card_services.service_name')->get();



        $item_data = array();

        $total_amount=0;$sub_total=0;

        $total_cgst=0;$total_sgst=0;$total_igst=0;



        foreach($itemdata_temp as $key =>$row)

        {

            $item_data[$key] = $row;

            $item_data[$key]->qty = 1;





            $temp_rate = $item_data[$key]->qty * $row->price;



            $item_data[$key]->cgst_per = $cgst;

            $item_data[$key]->cgst = ($temp_rate * $cgst)/100;



            $item_data[$key]->sgst_per = $sgst;

            $item_data[$key]->sgst = ($temp_rate * $sgst)/100;



            $item_data[$key]->igst_per = $igst;

            $item_data[$key]->igst = ($temp_rate * $igst)/100;



            $item_data[$key]->amount = $temp_rate;



            $sub_total = $sub_total + $temp_rate;

            $total_cgst = $total_sgst + $item_data[$key]->cgst;

            $total_sgst = $total_cgst + $item_data[$key]->sgst;

            $total_igst = $total_igst + $item_data[$key]->igst;

        }



        $total_amount = $sub_total + $total_cgst + $total_sgst + $total_igst;





        $detail->item_total = $sub_total;

        $detail->dis_amt = 0;

        $detail->dis_per = 0;





        $detail->sub_total = $sub_total;

        $detail->total_cgst = $total_cgst;

        $detail->total_sgst = $total_sgst;

        $detail->total_igst = $total_igst;

        $detail->total_amount = $total_amount;



        return response()->json(compact('item_data','detail'));



    }



    public function save_invoice(Request $request,$card_id,$cust_id,$franchise_id)

    {

        $invoice_items = $request['items'];

        $inv_detail = $request['detail'];



        $inv_save = DB::table('customer_job_card_invoice')->insert(

            [

                'date_created'=> date("Y-m-d"),

                'created_by' => $inv_detail['created_by']  ,

                'customer_id' => $cust_id,

                'jc_id' => $card_id,

                'amount' => $inv_detail['item_total'],

                'dis_per' => $inv_detail['dis_per'],

                'dis_amt' =>  $inv_detail['dis_amt'],

                'sub_total' =>  $inv_detail['sub_total'],

                'cgst' =>  $inv_detail['total_cgst'],

                'sgst' =>  $inv_detail['total_sgst'],

                'igst' =>  $inv_detail['total_igst'],

                'total' =>  $inv_detail['total_amount']

            ]

        );

        $inv_id = DB::getPdo()->lastInsertId();



        foreach($invoice_items as $row)

        {

            DB::table('customer_job_card_invoice_services_item')->insert(

                [

                    'invoice_id'=> $inv_id,

                    'vehicle_type' => $row['vehicle_type'] ,

                    'category_type' => $row['category_type'] ,

                    'plan_name' => $row['plan_name'],

                    'qty' =>$row['qty'],

                    'price' => $row['price'],

                    'cgst_per' => $row['cgst_per'],

                    'cgst_amt' => $row['cgst'],

                    'sgst_per' => $row['sgst_per'],

                    'sgst_amt' => $row['sgst'],

                    'igst_per' => $row['igst_per'],

                    'igst_amt' => $row['igst'],

                    'total' => $row['price']

                ]

            );



            $serv_plandata = DB::table('master_service_plans')->where('master_service_plans.plan_name', $row['plan_name'])->where('master_service_plans.vehicle_type', $row['vehicle_type'])->where('master_service_plans.category_type', $row['category_type'])->where('master_service_plans.status', 'A')->orderBy('master_service_plans.id','ASC')->select('master_service_plans.id','master_service_plans.number_of_visits','master_service_plans.year')->first();



            $plan_start_date;$plan_end_date;$plan_interval_type;$plan_interval_value;



            if(isset($serv_plandata->year) && isset($serv_plandata->number_of_visits)  && $serv_plandata->year && $serv_plandata->number_of_visits)

            {

                $due_date;

                $jc_id;

                for($i=1;$i<=$serv_plandata->number_of_visits;$i++)

                {

                    if($i==1)

                    {

                        $due_date = date("Y-m-d");

                        $jc_id=$card_id;

                    }



                    else

                    {

                        $newdate = strtotime ( '+1 year' , strtotime ( $due_date ) ) ;

                        $due_date = date ( 'Y-m-d' , $newdate );

                        $jc_id=0;

                    }

                    $jc_prvnt_mesures = DB::table('customer_job_card_preventive_measures')->insert(

                    [

                        'date_created' => date('Y-m-d'),

                        'created_by' => $inv_detail['created_by'],

                        'created_by_type' => 'Admin',

                        'customer_id' => $cust_id,

                        'jc_id' => $jc_id,

                        'plan_name' => $row['plan_name'],

                        'vehicle_type' => $row['vehicle_type'],

                        'regn_no' => $row['regn_no'],

                        'model' =>  $row['model_no'],

                        'visit_no' => $i,

                        'due_date' => $due_date

                    ]

                    );

                }

            }





            $prvntv_measures = DB::table('customer_job_card_preventive_measures as preventive')->where('preventive.customer_id', $cust_id)->where('preventive.jc_id', $card_id)->where('preventive.invoice_id', '0')->where('preventive.plan_name', $row['plan_name'])->orderBy('preventive.id','ASC')->select('preventive.id')->first();



            if(isset($prvntv_measures->id) && $prvntv_measures->id)

            {



                DB::table('customer_job_card_preventive_measures')->where('id', $prvntv_measures->id)->update(

                    ['invoice_id' => $inv_id,

                    'closing_date' =>  date("Y-m-d")]

                );

            }

        }



        return $inv_id;

    }



    public function change_card_status($custid,$card_id)

    {

        DB::table('customer_job_card_preventive_measures')->where('customer_id', $custid)->where('jc_id', $card_id)->update(

                    ['closing_date' =>  date("Y-m-d")]

        );

    }


    public function CancelJobCard(Request $request, $card_id, $f_id , $created_by )
    {   
        $exist =  DB::table('customer_job_card_invoice')->where('jc_id', $card_id)->first();
        $msg = 'EXIST';
        
        if(!$exist)
        {
            $row_material =  DB::table('customer_job_card_raw_material')->where('jc_id', $card_id)->get();

            foreach($row_material as $row)
            {
                DB::table('franchise_purchase_initial_stocks')
                ->where('id',$row->stock_id)
                ->increment('current_stock', $row->quantity) ;
            }

            DB::table('customer_job_card_raw_material')->where('jc_id', $card_id)->update(
                ['del' =>  '1']
            );

            DB::table('customer_job_card')->where('id', $card_id)->update(
                ['status' =>  'Cancel']
            );
            $msg = 'SUCCESS';
        }

        return $this->respond( $msg );

    }




    public function CloseJobCard(Request $request, $card_id, $f_id , $created_by )

    {

        DB::table('customer_job_card')->where('id', $card_id)->update(

                    ['status' =>  'Close']

        );




        $this->notification(['created_by'   =>  $created_by, 'table' =>  'customer_job_card', 'table_id' =>  $card_id ,  'user_name' =>
        $request['name']  ,'title'   => 'Status Changed', 'msg'   => 'Job card Status get closed by '.$this->get_name($created_by) ] );


        // return response()->json(compact('raw_mat','jc_id','f_id'));

    }



    


    public function notification($data)
    {

             $purchase_receive_save = DB::table('notification')->insert([           

            'date_created' => date("Y-m-d H:i:s"),

            'created_by'=> $data['created_by'],

            'table' => $data['table'],

            'table_id'=> $data['table_id'],

            'user_name'=> $data['user_name'],

            'title' => $data['title'],

            'message' => $data['msg']
        ]);
    }

    public function get_name($id)
    {
            return  DB::table('users')->where('id', $id)->select('first_name')->first()->first_name;
    }

   

 public function getConsumer(Request $request)
    {

        $search = $request['search'];
        $Login = (object) $request['login'];

        $l = DB::table('consumers')->where('status','=','A');


        if($Login->access_level == 6 )
        $l->where('consumers.franchise_sales_manager_assign', $Login->id);

        if($Login->access_level == 5 )
        $l->where('consumers.franchise_id', $Login->franchise_id);


        if($search) {

            $l ->where(function ($query) use ($search ) {
                $query->where('phone','LIKE',''.$search.'%')
                ->orWhere('first_name','LIKE',''.$search.'%')
                ->orWhere('last_name','LIKE',''.$search.'%');
            });
        }
           $users = $l->limit(10)->select('*', DB::raw('concat(first_name, " ",last_name, " " , phone) as full_name') )->get();


           return $this->respond( compact('users') );

    }




    public function changeAddress( Request $request)
    {
        $request = (Object)$request;

        $consumer_id = DB::table('customer_job_card')->where('id', $request['id'])->select('customer_id')->first()->customer_id;
        if($request['isCompany'])
        {
            $inv = DB::table('consumers')
            ->where('id',  $consumer_id )
            ->where('company_state','!=','')
            ->where('company_name','!=','')
            ->where('gstin','!=','')
            ->get();
        }
        else
        {
            $inv = DB::table('consumers')
            ->where('id',  $consumer_id )
            ->where('state','!=','')
            ->get();
        }


        if($inv)
        {
            DB::table('customer_job_card')->where('id', $request['id'])->update(
                ['isCompany' =>  $request['isCompany'] ]
            );
        }
        else
        {
            return $this->respond( 'ERROR' );
        }

        $inv = DB::table('customer_job_card_invoice')
        ->join('consumers','consumers.id','=','customer_job_card_invoice.customer_id')
        ->join('franchises','franchises.id','=','customer_job_card_invoice.franchise_id')
        ->select('customer_job_card_invoice.*','consumers.state','consumers.company_state','franchises.state as f_state')
        ->where('jc_id',  $request['id'] )
        ->get();

        foreach ($inv as $key => $value) 
        {
            $value = (array)$value;
            $igst = false;
            
            if( $request['isCompany']  == '1' ){
                
                $igst = (   $value['company_state'] == $value['f_state']   ) ? false : true ;
            }

            if( $request['isCompany']  == '0' ){
                
                $igst = (   $value['state'] == $value['f_state']   ) ? false : true ;
            }

            $cgst_price = 0;
            $sgst_price = 0;
            $igst_price = 0;

            $cgst_per = 0;
            $sgst_per = 0;
            $igst_per = 0;

            if($igst){
                $igst_per = round( $value['cgst_per'] + $value['sgst_per'] );
                $igst_price = round( $value['cgst_price'] + $value['sgst_price'] );
            }else{
                    $cgst_per = round( $value['igst_per'] / 2 );
                    $sgst_per = round( $value['igst_per'] / 2 );
                    
                $cgst_price = round( $value['igst_price'] / 2 );
                $sgst_price = round( $value['igst_price'] / 2 );
            }

            DB::table('customer_job_card_invoice')->where('id', $value['id'])->update([
                'igst_per' =>  $igst_per,
                'sgst_per' =>  $sgst_per,
                'cgst_per' =>  $cgst_per,
                'cgst_price' =>  $cgst_price,
                'sgst_price' =>  $sgst_price,
                'igst_price' =>  $igst_price
            ]);
        
            $inv_itms = DB::table('customer_job_card_invoice_services_item')->where('invoice_id',  $value['id'] )->get();

            $cgst_amt = 0;
            $sgst_amt = 0;
            $igst_amt = 0;

            $cgst_per = 0;
            $sgst_per = 0;
            $igst_per = 0;

            foreach ($inv_itms as $key2 => $value2) 
            {
                $value2 = (array)$value2;
                if($igst)
                {
                    $igst_per = round( $value2['cgst_per'] + $value2['sgst_per'] );
                    $igst_amt = round( $value2['cgst_amt'] + $value2['sgst_amt'] );
                }
                else
                {
                    $cgst_per = round( $value2['igst_per'] / 2 );
                    $sgst_per = round( $value2['igst_per'] / 2 );
                    
                    $cgst_amt = round( $value2['igst_amt'] / 2 );
                    $sgst_amt = round( $value2['igst_amt'] / 2 );
                }
                DB::table('customer_job_card_invoice_services_item')->where('id', $value2['id'])->update([
                    'igst_per' =>  $igst_per,
                    'sgst_per' =>  $sgst_per,
                    'cgst_per' =>  $cgst_per,
                    'cgst_amt' =>  $cgst_amt,
                    'sgst_amt' =>  $sgst_amt,
                    'igst_amt' =>  $igst_amt
                ]);
            }
        }
        DB::table('customer_job_card')->where('id', $request['id'])->update(

            ['isCompany' =>  $request['isCompany'] ]

        );
        return $this->respond( 'SUCCESS' );
    }




    
    public function CancelCustomerInvoice(Request $request, $card_id, $f_id , $created_by )
    {

        
    //   $exist =  DB::table('customer_job_card_invoice')->where('jc_id', $card_id)->first();
    //   $msg = 'EXIST';

    // if(!$exist){


                DB::table('customer_job_card_invoice')->where('id', $card_id)->update( ['del' =>  '2'] );

                
                DB::table('customer_job_card_invoice_payment')->where('invoice_id', $card_id)->first();

                $in =  DB::table('customer_job_card_invoice_services_item')->where('invoice_id', $card_id)->get();
               foreach ($in as $key => $value) {
               
                DB::table('customer_job_card_services')->where('service_name', $value->plan_name  )->update( ['plan_start_date' => '0000-00-00',  'plan_end_date' =>  '0000-00-00'] );

               }


               $p = DB::table('customer_job_card_preventive_measures')->where('invoice_id', $card_id)->get();
            //    DB::table('customer_job_card_preventive_measures')->where('invoice_id', $card_id)->update(['del' => '2' ]);

              foreach ($p as $key => $value) {
                    DB::table('customer_job_card_preventive_measures')->where('plan_name', $value->plan_name )->where('regn_no', $value->regn_no  )->where('del', 0  )->update(['del' => '2' ]);
                  
              }


            $msg = 'SUCCESS';
        // }

    return $this->respond( $msg );

    }





}

