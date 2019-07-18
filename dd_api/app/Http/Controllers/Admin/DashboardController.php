<?php



namespace App\Http\Controllers\Admin;



// use Acme\Repositories\Vendors\VendorsRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;

class DashboardController extends ApiController

{


///////////////////     C O M P A N Y  D A S H B O A R D    ////////////////////////

    public function compareByTimeStamp($time1, $time2) 
    {   
        if (strtotime($time1) < strtotime($time2)) 
            return 1; 
        else if (strtotime($time1) > strtotime($time2))  
            return -1; 
        else
            return 0; 
    } 

    
    public function dashboard_data(Request $request){

        $data = (Object)$request['dashboard'];
        $filter = (object)$data->filter;


        $count_order = DB::table('sales_order')->where('order_status','Pending')->where('del', 0)->count();

        $count_order_amount = DB::table('sales_order')->where('order_status','Pending')->where('del', 0)->sum('order_total');

        $count_inoice_amount = DB::table('sales_invoice')->where('payment_status','Paid')->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->sum('received');
        $count_inoice_amount_no = DB::table('sales_invoice')->where('payment_status','Paid')->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->count();

        $count_purchase_order = DB::table('purchase_order')->where('order_status','Pending')->where('del', 0)->count();

        $count_consumer_lead = DB::table('consumers')->where('type','1')->where('status', 'A')->count();

        $count_franchise_lead = DB::table('franchises')->where('type','1')->where('status', 'A')->count();

        $count_franchises = DB::table('franchises')->where('type','2')->where('status', 'A')->count();

        $count_vendors = DB::table('vendors')->where('status','A')->count();

        $count_follow_ups = DB::table('follow_ups')->where('followup_status','P')->where('next_follow_date', date('Y-m-d'))->count();

        $count_invoice_balance = DB::table('sales_invoice')->where('del','0')->where('payment_status','Pending')->sum('balance');

        $count_invoice_balance_no = DB::table('sales_invoice')->where('del','0')->where('payment_status','Pending')->count('id');

        
        $count_purchase_order_receive = DB::table('purchase_order')->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->sum('order_total');

        $count_purchase_order_no       =     DB::table('purchase_order')->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->count();


    /////////////////////      INVOICE LIST START    /////////////////  


        $q = DB::table('sales_invoice as s')
        ->leftJoin('franchises as f', 'f.id', '=', 's.franchise_id')
        ->leftJoin('direct_customer as c', 'c.id', '=', 's.customer_id')
        ->leftJoin('locations as l','f.location_id','=','l.id')
        ->where('s.del','0');

        if(isset($filter->payment_status) && $filter->payment_status)$q->where('s.payment_status','LIKE','%'.$filter->payment_status.'%');

        $list_sales_invoice = $q->select('s.*','l.location_name',
            DB::raw('CASE WHEN s.franchise_id  THEN f.company_name ELSE c.company_name END as company_name'),
            DB::raw('CASE WHEN s.franchise_id  THEN f.contact_no ELSE c.contact_no END as contact_no'),
            DB::raw('CASE WHEN s.franchise_id  THEN "F" ELSE "C" END as type'),
            DB::raw('CASE WHEN s.payment_status = "Pending"  THEN "open" ELSE "close" END as status')
        )

        ->groupBy('s.id')
        ->orderBy('s.id','DESC')
        ->get();



        $q = DB::table('sales_invoice');
        if(isset($filter->payment_status) && $filter->payment_status)$q->where('payment_status','LIKE','%'.$filter->payment_status.'%');

        $total_sales_invoice = $q->where('del','0')
        ->sum('invoice_total');



    /////////////////////    END     //////////////

    /////////////////////      ORDER LIST START    /////////////////  




        $q = DB::table('sales_order as s')
        ->leftJoin('franchises as f', 'f.id', '=', 's.franchise_id')
        ->leftJoin('locations as l','f.location_id','=','l.id')
        ->where('s.del','0');

        if(isset($filter->order_status) && $filter->order_status)$q->where('s.order_status','LIKE','%'.$filter->order_status.'%');

        $list_sales_order = $q->select('s.*','f.company_name','f.contact_no','l.location_name',
            DB::raw('CASE WHEN s.order_status = "Pending"  THEN "open" ELSE "close" END as status')
        )

        ->groupBy('s.id')
        ->orderBy('s.id','DESC')
        ->get();



        $q = DB::table('sales_order');
        if(isset($filter->order_status) && $filter->order_status)$q->where('order_status','LIKE','%'.$filter->order_status.'%');

        $total_sales_order = $q->where('del','0')
        ->sum('order_total');



    /////////////////////    END     ////////



    ////////////////////     SALES AGENT DATA START    ////////////////



        $sales_list = DB::table('users as u')
        ->where('u.access_level', '=', '3')
        ->where('u.is_active', '=', '1')
        ->select('u.*' )
        ->groupBy('u.id')
        ->orderBy('u.first_name','DESC')
        ->get();


        foreach ($sales_list as $key => $value) {

            $consumer = DB::table('consumer_assign_sales_agent')
            ->where('isDeactive', '=', '0')
            ->where('sales_agent_id', '=', $value->id)->count();


            $franchise = DB::table('franchise_assign_sales_agent')
            ->where('isDeactive', '=', '0')
            ->where('sales_agent_id', '=', $value->id)->count();

            $count_follow_ups = DB::table('follow_ups')
            ->where('created_by', '=', $value->id)->where('followup_status', '=', 'P')->count();

            $sales_list[$key]->consumer = $consumer;
            $sales_list[$key]->franchise = $franchise;
            $sales_list[$key]->count_follow_ups = $count_follow_ups;


        }





    ////////////////////     SALES AGENT DATA END    ////////////////




    ////////////////////     FRANCHISE STOCK  DOWN START    ////////////////



        $franchise_stock = DB::table('franchises')
        ->where('franchises.type', '=', '2')
        ->groupBy('franchises.id')
        ->orderBy('franchises.company_name','ASC')
        ->get();


        foreach ($franchise_stock as $key => $value) {



            $stock = DB::table('franchise_purchase_initial_stocks')
            ->where('franchise_id', '=', $value->id)
            ->where(DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)"),'<=' , DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") )
            ->count();

            $franchise_stock[$key]->stock = $stock;



        }



    // $q = DB::table('franchises');

    // $q->join('franchise_purchase_initial_stocks', function($join) {
        //     $join->on('franchises.id', '=', 'franchise_purchase_initial_stocks.franchise_id')
        //     ->where(DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)"),'<=' , DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") );
        // });
        
        // $franchise_stock = $q->where('franchises.status', '=', 'A')
        // ->where('franchises.type', '=', '2')
        
        // ->select('franchises.id','franchises.company_name','franchises.contact_no',  DB::raw('COUNT(franchise_purchase_initial_stocks.id) as stock')  )
        // ->groupBy('franchises.id')
        // ->orderBy('franchises.company_name','DESC')
        // ->get();
        
        
        
        
        
        
        
        
        
        
        ////////////////////        FRANCHISE STOCK  DOWN END    ////////////////
        
        
        
        
        
        
        
        
        
        
        
        $q = DB::table('master_product_measurement_prices')
        ->join('master_products', 'master_products.id', '=', 'master_product_measurement_prices.product_id')
        ->where('master_product_measurement_prices.status','A');
        
        
        $category = 'Raw Material';
        $stock_alert = 'low-stock';
        if(isset($filter->category) && $filter->category) $category = $filter->category;
        if(isset($filter->stock_alert) && $filter->stock_alert) $stock_alert = $filter->stock_alert;
        
        
        if( $category == 'Raw Material') {
            $q->where('master_products.category','=','Product');
            $q->where( 'master_product_measurement_prices.purchase_price' , '!=' , '0');
            if( $stock_alert == 'low-stock') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'>=' ,  DB::raw("CONVERT(master_product_measurement_prices.stock_qty, INT)") );
            if( $stock_alert == 'adequate') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'<' ,  DB::raw("CONVERT(master_product_measurement_prices.stock_qty, INT)") );
            
        }
        
        if( $category == 'Accessory'){
            $q->where('master_products.category','=','Accessory');
            if( $stock_alert == 'low-stock') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'>=' ,  DB::raw("CONVERT(master_product_measurement_prices.sale_qty, INT)") );
            if( $stock_alert == 'adequate') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'<' ,  DB::raw("CONVERT(master_product_measurement_prices.sale_qty, INT)") );
            
        }
        
        
        if( $category == 'Finish Good'){
            $q->where('master_products.category','=','Product');
            $q->where( 'master_product_measurement_prices.sale_price' , '!=' , '0');
            if( $stock_alert == 'low-stock') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'>=' ,  DB::raw("CONVERT(master_product_measurement_prices.sale_qty, INT)") );
            if( $stock_alert == 'adequate') $q->where(  DB::raw("CONVERT(master_products.stock_alert, INT)") ,'<' ,  DB::raw("CONVERT(master_product_measurement_prices.sale_qty, INT)") );
            
        }
        
        
        $list_stock = $q->select('master_product_measurement_prices.*','master_products.product_name' ,'master_products.brand_name','master_products.category','master_products.stock_alert' ,'master_products.hsn_code' )
        
        ->groupBy('master_product_measurement_prices.id')
        ->orderBy('master_products.product_name','ASC')
        ->get();
        
        
        $q = DB::table('franchises');
        
        $date = 'WEEK';
        if(isset($filter->chart_franhcise_counsumers_filter) && $filter->chart_franhcise_counsumers_filter){ $date = $filter->chart_franhcise_counsumers_filter; }
        
        $q->join('consumers', function($join) use ($date) {

            $join->on('franchises.id', '=', 'consumers.franchise_id')
            ->where('consumers.type', '=', '2')
            ->where('consumers.status', '=', 'A');
            
            if($date == 'TODAY'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y-m-d').'%' ); }
            
            if($date == 'WEEK'){  
             $week_date = date('Y-m-d', strtotime("-7 Day", strtotime(date('Y-m-d') ) ) );
             $join->where('consumers.created_at', '>=', ''.$week_date.' 00:00:00' );
         }

         if($date == 'MONTH'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y-m').'%' ); }
         if($date == 'YEAR'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y').'%' ); }

     });
        
        $q->where('franchises.status', '=', 'A');
        
        $chart_franhcise_counsumers =  $q->where('franchises.status', '=', 'A')
        ->where('franchises.type', '=', '2')
        ->select('franchises.company_name','franchises.id', DB::raw('COUNT(consumers.id) as c') )
        ->limit(5)
        ->groupBy('franchises.id')
        ->orderBy('c','DESC')
        ->get();
        
        $chart_franhcise_counsumers_arr1=[];
        $chart_franhcise_counsumers_arr2=[];
        foreach ($chart_franhcise_counsumers  as $key => $value) {
            array_push($chart_franhcise_counsumers_arr1, $value->company_name);
            array_push($chart_franhcise_counsumers_arr2, $value->c);
        }
        
        
        
        
        $q = DB::table('franchises');
        
        $date = 'WEEK';
        if(isset($filter->chart_franhcise_profit_filter) && $filter->chart_franhcise_profit_filter){ $date = $filter->chart_franhcise_profit_filter; }
        
        $q->join('sales_invoice', function($join) use ($date) {

            $join->on('franchises.id', '=', 'sales_invoice.franchise_id')
            ->where('sales_invoice.del', '=', '0');
            
            if($date == 'TODAY'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y-m-d').'%' ); }
            
            if($date == 'WEEK'){  
                $week_date = date('Y-m-d', strtotime("-7 Day", strtotime(date('Y-m-d') ) ) );
                $join->where('sales_invoice.date_created', '>=', ''.$week_date.' 00:00:00' );
            }

            if($date == 'MONTH'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y-m').'%' ); }
            if($date == 'YEAR'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y').'%' ); }
            
        });
        
        $q->where('franchises.status', '=', 'A');
        
        $chart_franhcise_profit =  $q->where('franchises.status', '=', 'A')
        ->where('franchises.type', '=', '2')
        ->select('franchises.company_name','franchises.id', DB::raw('SUM( sales_invoice.received) as c') )
        ->limit(5)
        ->groupBy('franchises.id')
        ->orderBy('c','DESC')
        ->get();
        
        $chart_franhcise_profit_arr1=[];
        $chart_franhcise_profit_arr2=[];
        foreach ($chart_franhcise_profit  as $key => $value) {
            array_push($chart_franhcise_profit_arr1, $value->company_name);
            array_push($chart_franhcise_profit_arr2, $value->c);
        }
        
        
        ////////////     Start Lead Graph 1    /////////////
        if( !isset($filter->graphType ) || ( isset($filter->graphType ) && $filter->graphType == 'Lead' ) )    {

            $f = DB::table('franchises')
            ->where('type', '1')
            ->where('status', 'A')
            ->select( DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(created_at, "%Y-%m") as monthyear' ) ,DB::raw("COUNT(id) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_franchise_lead = $f->get();




            $f = DB::table('consumers')
            ->where('type', '1')
            ->where('status', 'A')
            ->select( DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(created_at, "%Y-%m") as monthyear' ) ,DB::raw("COUNT(id) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_consumer_lead = $f->get();




            foreach ($chart_consumer_lead as $obj) {        
                $counsumerobjectsList[] = (array)$obj;
            }


            foreach ($chart_franchise_lead as $obj) {
                $franchiseobjectsList[] = (array)$obj;
            }


            if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
            {
                $counsumer_lead_dayyear = isset($counsumerobjectsList) ?  array_column($counsumerobjectsList, 'dayyear') : [];
                $franchise_lead_dayyear   = isset($franchiseobjectsList) ? array_column($franchiseobjectsList, 'dayyear') : [];
                $label = array_unique(  array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ); 
            // $label = array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ; 

            }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $counsumer_lead_monthyear = isset($counsumerobjectsList) ? array_column($counsumerobjectsList, 'monthyear') : [];
                $franchise_lead_monthyear = isset($franchiseobjectsList) ?  array_column($franchiseobjectsList, 'monthyear') : [];
                $label =  array_unique(  array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ); 
            // $label =    array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ; 

            }



            usort($label, function($a, $b)
            {
                if ($a == $b)
                {
                // echo "a ($a) is same priority as b ($b), keeping the same\n";
                    return 0;
                }
                else if ($a > $b)
                {
                // echo "a ($a) is higher priority than b ($b), moving b down array\n";
                    return -1;
                }
                else {
                // echo "b ($b) is higher priority than a ($a), moving b up array\n";                
                    return 1;
                }
            });



            $label = array_reverse($label); 
        // $label =  sort( $label );
        // $label_all =  $label;

            foreach ($label as $key => $val) {

                $f = DB::table('franchises')
                ->where('type', '1')
                ->where('status', 'A')
                ->where('created_at','LIKE', '%'.$val.'%')
                ->count();

                $franchise_lead_count[] = $f;
            }


            $days = ['0'=>'Sun','1'=>'Mon','2'=>'Tue','3'=>'Wed','4'=>'Thu','5'=>'Fri','6'=>'Sat'];

            foreach ($label as $key => $val) {

                $c = DB::table('consumers')
                ->where('type', '1')
                ->where('status', 'A')
                ->where('created_at','LIKE', '%'.$val.'%')
                ->count();

                $counsumer_lead_count[] = $c;

                if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                {


                    if( !isset($filter->leadfilter) || (  isset($filter->leadfilter)  &&  $filter->leadfilter == 'WEEK')  ){
                        $w = date_format(date_create( $val ),"w");
                        $label_all[] = $days[$w];
                    }else{
                        $label_all[] = date_format(date_create( $val ),"Y M d");
                    }

                }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                {
                    $label_all[] = date_format(date_create( $val ),"M Y");
                }

            }


        //////////////  End Lead graph  1    ///////
        } else if( isset($filter->graphType ) && $filter->graphType == 'Invoice'  )    {
        //////////////  Start Invoice graph  2    ///////



            $f = DB::table('sales_order')
            ->where('del', '0')
            ->select( DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(date_created, "%Y-%m") as monthyear' ) ,DB::raw("SUM(order_total) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_franchise_lead = $f->get();




            $f = DB::table('sales_invoice')
            ->where('del', '0')
            ->select( DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(date_created, "%Y-%m") as monthyear' ) ,DB::raw("SUM(invoice_total) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_consumer_lead = $f->get();

            if($chart_consumer_lead || $chart_franchise_lead ){ 


                foreach ($chart_consumer_lead as $obj) {        
                    $counsumerobjectsList[] = (array)$obj;
                }


                foreach ($chart_franchise_lead as $obj) {
                    $franchiseobjectsList[] = (array)$obj;
                }


                if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                {
                    $counsumer_lead_dayyear = isset( $counsumerobjectsList) ? array_column($counsumerobjectsList, 'dayyear') : [];
                    $franchise_lead_dayyear   =  isset($franchiseobjectsList) ?  array_column($franchiseobjectsList, 'dayyear') : [];
                    $label = array_unique(  array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ); 
            // $label = array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ; 

                }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                {
                    $counsumer_lead_monthyear = isset($counsumerobjectsList) ? array_column($counsumerobjectsList, 'monthyear') : [];
                    $franchise_lead_monthyear = isset($franchiseobjectsList) ?  array_column($franchiseobjectsList, 'monthyear') : [];
                    $label =  array_unique(  array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ); 
            // $label =    array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ; 

                }


                usort($label, function($a, $b)
                {
                    if ($a == $b)
                    {
                // echo "a ($a) is same priority as b ($b), keeping the same\n";
                        return 0;
                    }
                    else if ($a > $b)
                    {
                // echo "a ($a) is higher priority than b ($b), moving b down array\n";
                        return -1;
                    }
                    else {
                // echo "b ($b) is higher priority than a ($a), moving b up array\n";                
                        return 1;
                    }
                });



                $label = array_reverse($label);

                foreach ($label as $key => $val) {

                    $f = DB::table('sales_order')
                    ->where('del', '0')
                    ->where('date_created','LIKE', '%'.$val.'%')
                    ->sum('order_total');

                    $franchise_lead_count[] = $f;
                }


                $days = ['0'=>'Sun','1'=>'Mon','2'=>'Tue','3'=>'Wed','4'=>'Thu','5'=>'Fri','6'=>'Sat'];

                foreach ($label as $key => $val) {

                    $c = DB::table('sales_invoice')
                    ->where('del', '0')
                    ->where('date_created','LIKE', '%'.$val.'%')
                    ->sum('invoice_total');

                    $counsumer_lead_count[] = $c;

                    if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                    {


                        if( !isset($filter->leadfilter) || (  isset($filter->leadfilter)  &&  $filter->leadfilter == 'WEEK')  ){
                            $w = date_format(date_create( $val ),"w");
                            $label_all[] = $days[$w];
                        }else{
                            $label_all[] = date_format(date_create( $val ),"Y M d");
                        }

                    }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                    {
                        $label_all[] = date_format(date_create( $val ),"M Y");
                    }

                }


            }else{
                $label_all = [];
                $franchise_lead_count = [];
                $counsumer_lead_count = [];
            }





        //////////////  END Invoice graph  2    ///////

        }


        $label_all = isset($label_all) ?  $label_all : [];
        $franchise_lead_count = isset($franchise_lead_count) ? $franchise_lead_count : [];
        $counsumer_lead_count = isset($counsumer_lead_count) ? $counsumer_lead_count : [];
        

        

        
        if( isset($filter->appoint_cal_date) && $filter->appoint_cal_date) {$month = $filter->appoint_cal_date;}
        else{$month = date('Y-m');}

        $q = DB::table('follow_ups')
        ->where('follow_ups.followup_status', '=' , 'p');

        
        if( isset($filter->franchise) && $filter->franchise) {


            $q->join('consumers', function($join) use ($filter) {

                $join->on('consumers.id','=', 'follow_ups.consumer_id')
                ->where('consumers.status', '=', 'A')
                ->where('consumers.franchise_id', '=', $filter->franchise);

            });

        }
        
        $q->where('follow_ups.next_follow_date', 'LIKE' , '%'.$month.'%' )
        ->where('follow_ups.next_follow_type','=','Appointment')
        ->select( DB::raw('COUNT(follow_ups.id) as tll_fllup'),'follow_ups.next_follow_date' )
        ->groupBy('follow_ups.next_follow_date');
        $calender_appoinments = $q->get();



        
        
        $bucket = array(

            'count_order'                                    =>  $count_order,
            'count_order_amount'                             =>  $count_order_amount,
            'count_inoice_amount'                            =>  $count_inoice_amount,
            'count_inoice_amount_no'                         =>  $count_inoice_amount_no,
            'count_purchase_order'                           =>  $count_purchase_order,
            'count_consumer_lead'                            =>  $count_consumer_lead,
            'count_franchise_lead'                           =>  $count_franchise_lead,
            'count_franchises'                               =>  $count_franchises,
            'count_vendors'                                  =>  $count_vendors,
            'count_follow_ups'                               =>  $count_follow_ups,
            'list_sales_invoice'                             =>  $list_sales_invoice,
            'total_sales_invoice'                            =>  $total_sales_invoice,
            'count_invoice_balance'                          =>  $count_invoice_balance,
            'count_invoice_balance_no'                       =>  $count_invoice_balance_no,
            'list_stock'                                     =>  $list_stock,
            'chart_franhcise_counsumers'                     =>  $chart_franhcise_counsumers,
            'chart_franhcise_counsumers_arr1'                =>  $chart_franhcise_counsumers_arr1,
            'chart_franhcise_counsumers_arr2'                =>  $chart_franhcise_counsumers_arr2,
            'chart_franhcise_profit'                         =>  $chart_franhcise_profit,
            'chart_franhcise_profit_arr1'                    =>  $chart_franhcise_profit_arr1,
            'chart_franhcise_profit_arr2'                    =>  $chart_franhcise_profit_arr2,
            'list_sales_order'                               =>  $list_sales_order,
            'total_sales_order'                              =>  $total_sales_order,
            'sales_list'                                     =>  $sales_list,
            'franchise_stock'                                =>  $franchise_stock,
            'chart_consumer_lead'                            =>  $chart_consumer_lead,
            'chart_franchise_lead'                           =>  $chart_franchise_lead,
            'label'                                          =>  $label_all,
            'franchise_lead_count'                           =>  $franchise_lead_count,
            'counsumer_lead_count'                           =>  $counsumer_lead_count,
            'count_purchase_order_receive'                           =>  $count_purchase_order_receive,
            'count_purchase_order_no'                           =>  $count_purchase_order_no,
            'calender_appoinments'                           =>  $calender_appoinments,
            
            
            
            
        );
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        return $this->respond([
            'data' => compact('bucket'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Fetch Dashboard Data Successfully'
        ]);




    }


///////////////////     F R A N C H I S E  D A S H B O A R D    ////////////////////////






    
    public function franchise_data(Request $request){

        $data = (Object)$request['dashboard'];
        $login = (object)$data->login;
        $filter = (object)$data->filter;

        $login->location_id = DB::table('franchises')->where('id', $login->franchise_id)->select('location_id')->first()->location_id;

        $count_order = DB::table('sales_order')->where('order_status','Pending')->where('franchise_id', $login->franchise_id)->where('del', 0)->count();

        $count_order_amount = DB::table('sales_order')->where('order_status','Pending')->where('franchise_id', $login->franchise_id)->where('del', 0)->sum('order_total');

        $count_inoice_amount = DB::table('sales_invoice')->where('payment_status','Paid')->where('franchise_id', $login->franchise_id)->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->sum('received');

        $count_inoice_amount_no = DB::table('sales_invoice')->where('payment_status','Paid')->where('franchise_id', $login->franchise_id)->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->count();

        $count_sales_inoice_amount = DB::table('customer_job_card_invoice')->where('franchise_id', $login->franchise_id)->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->sum('received');

        $count_sales_inoice_amount_no = DB::table('customer_job_card_invoice')->where('franchise_id', $login->franchise_id)->where('date_created', 'LIKE', '%'.date('Y-m').'%' )->where('del', 0)->count();

        $count_purchase_order = DB::table('sales_order')->where('franchise_id', $login->franchise_id)->where('del', 0)->count();

        $count_consumer_lead = DB::table('consumers')->where('type','1')->where('status', 'A')->where('franchise_id', $login->franchise_id)->count();

        $count_franchise_lead = DB::table('consumers')->where('type','2')->where('status', 'A')->where('franchise_id', $login->franchise_id)->count();

        $count_sales_invoice = DB::table('customer_job_card_invoice')->where('franchise_id', $login->franchise_id)->count();

    // $count_regn_no = DB::table('customer_job_card')->where('location_id', $login->location_id)->groupBy('regn_no')->count();




        $count_vendors = DB::table('vendors')->where('status','A')->count();
    // ->where('next_follow_date', date('Y-m-d'))
        $q = DB::table('follow_ups');
        $f_id =  $login->franchise_id;

        $q->join('consumers', function($join) use ( $f_id ) {
            $join->on('consumers.id', '=', 'follow_ups.consumer_id')
            ->where('consumers.status', '=','A')
            ->where('consumers.franchise_id','=', $f_id);
        });

        $count_follow_ups = $q->where('follow_ups.followup_status','=','P')->groupBy('follow_ups.id')->count();




        $q = DB::table('customer_job_card_invoice');
        $l_id =  $login->location_id;

        $q->join('customer_job_card', function($join) use ( $l_id ) {
            $join->on('customer_job_card.id', '=', 'customer_job_card_invoice.jc_id')
            ->where('customer_job_card.location_id','=', $l_id);
        });

        $count_regn_no = $q->where('customer_job_card_invoice.franchise_id','=',$login->franchise_id)->groupBy('customer_job_card.regn_no')->count();



        $count_invoice_balance = DB::table('sales_invoice')->where('del','0')->where('payment_status','Pending')->where('franchise_id', $login->franchise_id)->sum('balance');
        $count_invoice_balance_no = DB::table('sales_invoice')->where('del','0')->where('payment_status','Pending')->where('franchise_id', $login->franchise_id)->count('id');



    /////////////////////      INVOICE LIST START    /////////////////  


        $q = DB::table('sales_invoice as s')
        ->leftJoin('franchises as f', 'f.id', '=', 's.franchise_id')
        ->leftJoin('direct_customer as c', 'c.id', '=', 's.customer_id')
        ->leftJoin('locations as l','f.location_id','=','l.id')
        ->where('s.del','0');

        if(isset($filter->payment_status) && $filter->payment_status)$q->where('s.payment_status','LIKE','%'.$filter->payment_status.'%');

        $list_sales_invoice = $q->select('s.*','l.location_name',
            DB::raw('CASE WHEN s.franchise_id  THEN f.company_name ELSE c.company_name END as company_name'),
            DB::raw('CASE WHEN s.franchise_id  THEN f.contact_no ELSE c.contact_no END as contact_no'),
            DB::raw('CASE WHEN s.franchise_id  THEN "F" ELSE "C" END as type'),
            DB::raw('CASE WHEN s.payment_status = "Pending"  THEN "open" ELSE "close" END as status')
        )
        ->where('s.franchise_id', $login->franchise_id)
        ->where('s.date_created', 'LIKE', '%'.date('Y-m').'%')
        ->groupBy('s.id')
        ->orderBy('s.id','DESC')
        ->get();



        $q = DB::table('sales_invoice');
        if(isset($filter->payment_status) && $filter->payment_status)$q->where('payment_status','LIKE','%'.$filter->payment_status.'%');

        $total_sales_invoice = $q->where('del','0')
        ->where('franchise_id', $login->franchise_id)
        ->where('date_created', 'LIKE', '%'.date('Y-m').'%')
        ->sum('invoice_total');



    /////////////////////    END     //////////////


    //////      JOB CARD     //////


        $q = DB::table('customer_job_card');
        $l_id =  $login->location_id;

        $q->join('consumers', function($join) use ( $l_id ) {
            $join->on('consumers.id', '=', 'customer_job_card.customer_id')
            ->where('customer_job_card.date_created','LIKE', '%'.date('Y-m').'%')
            ->where('customer_job_card.location_id','=', $l_id);
        });

        if(isset($filter->job_card_status) && $filter->job_card_status)$q->where('customer_job_card.status','LIKE', '%'.$filter->job_card_status.'%');


        $consumer_job_card = $q->groupBy('customer_job_card.id')->select('customer_job_card.*','consumers.first_name','consumers.last_name')->get();



    //////////   END    /////




        //////      Service List    //////


        $franchise_service = DB::table('franchise_service_item')
        ->join('franchise_service','franchise_service.id','=','franchise_service_item.franchise_service_id')
        ->where('franchise_service.franchise_id','=',$login->franchise_id)
        ->select('franchise_service_item.*')
        ->get();



        //////////   END    /////

        

    /////////////////////      ORDER LIST START    /////////////////  




        $q = DB::table('sales_order as s')
        ->leftJoin('franchises as f', 'f.id', '=', 's.franchise_id')
        ->leftJoin('locations as l','f.location_id','=','l.id')
        ->where('s.del','0')
        ->where('s.date_created', 'LIKE', '%'.date('Y-m').'%')
        ->where('s.franchise_id', $login->franchise_id);

        if(isset($filter->order_status) && $filter->order_status)$q->where('s.order_status','LIKE','%'.$filter->order_status.'%');

        $list_sales_order = $q->select('s.*','f.company_name','f.contact_no','l.location_name',DB::raw('CASE WHEN s.order_status = "Pending"  THEN "open" ELSE "close" END as status') )
        ->groupBy('s.id')
        ->orderBy('s.id','DESC')
        ->get();



        $q = DB::table('sales_order');
        if(isset($filter->order_status) && $filter->order_status)$q->where('order_status','LIKE','%'.$filter->order_status.'%');

        $total_sales_order = $q->where('del','0')
        ->where('franchise_id', $login->franchise_id )
        ->where('date_created', 'LIKE', '%'.date('Y-m').'%')

        ->sum('order_total');



    /////////////////////    END     ////////



    ////////////////////     SALES AGENT DATA START    ////////////////



        $sales_list = DB::table('users as u')
        ->where('u.access_level', '=', '3')
        ->where('u.is_active', '=', '1')
        ->select('u.*' )
        ->groupBy('u.id')
        ->orderBy('u.first_name','DESC')
        ->get();


        foreach ($sales_list as $key => $value) {




            $q = DB::table('consumer_assign_sales_agent');

            $q->join('consumers', function($join) use ( $value,$login ) {
                $join->on('consumers.id', '=', 'consumer_assign_sales_agent.franchise_id')
                ->where('consumers.type','=','1')
                ->where('consumer_assign_sales_agent.isDeactive', '=', '0')
                ->where('consumers.franchise_id', '=', $login->franchise_id)
                ->where('consumer_assign_sales_agent.sales_agent_id','=', $value->id);
            });
        // $q->groupBy('consumer_assign_sales_agent.id');
            $consumer =$q->count();


            $q = DB::table('follow_ups');

            $q->join('consumers', function($join) use ( $value,$login ) {
                $join->on('consumers.id', '=', 'follow_ups.consumer_id')
                ->where('follow_ups.followup_status','=','P')
                ->where('consumers.franchise_id', '=', $login->franchise_id)
                ->where('follow_ups.created_by', '=', $value->id);
            });

            $count_followup = $q->count();

            $sales_list[$key]->consumer = $consumer;
            $sales_list[$key]->count_follow_ups = $count_followup;


        }





    ////////////////////     SALES AGENT DATA END    ////////////////




    ////////////////////     FRANCHISE STOCK  DOWN START    ////////////////



        $franchise_stock = DB::table('franchises')
        ->where('franchises.type', '=', '2')
        ->groupBy('franchises.id')
        ->orderBy('franchises.company_name','ASC')
        ->get();


        foreach ($franchise_stock as $key => $value) {



            $stock = DB::table('franchise_purchase_initial_stocks')
            ->where('franchise_id', '=', $value->id)
            ->where(DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)"),'<=' , DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") )
            ->count();

            $franchise_stock[$key]->stock = $stock;



        }



    // $q = DB::table('franchises');

    // $q->join('franchise_purchase_initial_stocks', function($join) {
        //     $join->on('franchises.id', '=', 'franchise_purchase_initial_stocks.franchise_id')
        //     ->where(DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)"),'<=' , DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") );
        // });
        
        // $franchise_stock = $q->where('franchises.status', '=', 'A')
        // ->where('franchises.type', '=', '2')
        
        // ->select('franchises.id','franchises.company_name','franchises.contact_no',  DB::raw('COUNT(franchise_purchase_initial_stocks.id) as stock')  )
        // ->groupBy('franchises.id')
        // ->orderBy('franchises.company_name','DESC')
        // ->get();
        
        
        
        
        
        
        
        
        
        
        ////////////////////        FRANCHISE STOCK  DOWN END    ////////////////
        
        
        
        
        
        
        
        
        
        
        
        $q = DB::table('franchise_purchase_initial_stocks')
        ->where('franchise_purchase_initial_stocks.franchise_id',  $login->franchise_id);
        
        
        $category = 'Product';
        $stock_alert = 'low-stock';
        if(isset($filter->category) && $filter->category) $category = $filter->category;
        if(isset($filter->stock_alert) && $filter->stock_alert) $stock_alert = $filter->stock_alert;
        
        
        
        if( $category == 'Accessory'){
            $q->where('franchise_purchase_initial_stocks.category','=','Accessory');
            if( $stock_alert == 'low-stock') $q->where(  DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") ,'>=' ,  DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)") );
            if( $stock_alert == 'adequate') $q->where(  DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") ,'<' ,  DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)") );
            
        }
        


        if( $category == 'Product'){
            $q->where('franchise_purchase_initial_stocks.category','=','Product');
            if( $stock_alert == 'low-stock') $q->where(  DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") ,'>=' ,  DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)") );
            if( $stock_alert == 'adequate') $q->where(  DB::raw("CONVERT(franchise_purchase_initial_stocks.stock_limit, INT)") ,'<' ,  DB::raw("CONVERT(franchise_purchase_initial_stocks.current_stock, INT)") );
            
        }
        

        
        
        $list_stock = $q->groupBy('franchise_purchase_initial_stocks.id')
        ->orderBy('franchise_purchase_initial_stocks.product','ASC')
        ->get();
        




        
        $q = DB::table('franchises');
        
        $date = 'WEEK';
        if(isset($filter->chart_franhcise_counsumers_filter) && $filter->chart_franhcise_counsumers_filter){ $date = $filter->chart_franhcise_counsumers_filter; }
        
        $q->join('consumers', function($join) use ($date) {

            $join->on('franchises.id', '=', 'consumers.franchise_id')
            ->where('consumers.type', '=', '2')
            ->where('consumers.status', '=', 'A');
            
            if($date == 'TODAY'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y-m-d').'%' ); }
            
            if($date == 'WEEK'){  
             $week_date = date('Y-m-d', strtotime("-7 Day", strtotime(date('Y-m-d') ) ) );
             $join->where('consumers.created_at', '>=', ''.$week_date.' 00:00:00' );
         }

         if($date == 'MONTH'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y-m').'%' ); }
         if($date == 'YEAR'){ $join->where('consumers.created_at', 'LIKE', '%'.date('Y').'%' ); }

     });
        
        $q->where('franchises.status', '=', 'A');
        
        $chart_franhcise_counsumers =  $q->where('franchises.status', '=', 'A')
        ->where('franchises.type', '=', '2')
        ->select('franchises.company_name','franchises.id', DB::raw('COUNT(consumers.id) as c') )
        ->limit(5)
        ->groupBy('franchises.id')
        ->orderBy('c','DESC')
        ->get();
        
        $chart_franhcise_counsumers_arr1=[];
        $chart_franhcise_counsumers_arr2=[];
        foreach ($chart_franhcise_counsumers  as $key => $value) {
            array_push($chart_franhcise_counsumers_arr1, $value->company_name);
            array_push($chart_franhcise_counsumers_arr2, $value->c);
        }
        
        
        
        
        $q = DB::table('franchises');
        
        $date = 'WEEK';
        if(isset($filter->chart_franhcise_profit_filter) && $filter->chart_franhcise_profit_filter){ $date = $filter->chart_franhcise_profit_filter; }
        
        $q->join('sales_invoice', function($join) use ($date) {

            $join->on('franchises.id', '=', 'sales_invoice.franchise_id')
            ->where('sales_invoice.del', '=', '0');
            
            if($date == 'TODAY'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y-m-d').'%' ); }
            
            if($date == 'WEEK'){  
                $week_date = date('Y-m-d', strtotime("-7 Day", strtotime(date('Y-m-d') ) ) );
                $join->where('sales_invoice.date_created', '>=', ''.$week_date.' 00:00:00' );
            }

            if($date == 'MONTH'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y-m').'%' ); }
            if($date == 'YEAR'){ $join->where('sales_invoice.date_created', 'LIKE', '%'.date('Y').'%' ); }
            
        });
        
        $q->where('franchises.status', '=', 'A');
        
        $chart_franhcise_profit =  $q->where('franchises.status', '=', 'A')
        ->where('franchises.type', '=', '2')
        ->select('franchises.company_name','franchises.id', DB::raw('SUM( sales_invoice.received) as c') )
        ->limit(5)
        ->groupBy('franchises.id')
        ->orderBy('c','DESC')
        ->get();
        
        $chart_franhcise_profit_arr1=[];
        $chart_franhcise_profit_arr2=[];
        foreach ($chart_franhcise_profit  as $key => $value) {
            array_push($chart_franhcise_profit_arr1, $value->company_name);
            array_push($chart_franhcise_profit_arr2, $value->c);
        }
        
        
        ////////////     Start Lead Graph 1    /////////////
        if( !isset($filter->graphType ) || ( isset($filter->graphType ) && $filter->graphType == 'Lead' ) )    {

            $f = DB::table('consumers')
            ->where('type', '1')
            ->where('status', 'A')
            ->where('franchise_id', $login->franchise_id)
            ->select( DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(created_at, "%Y-%m") as monthyear' ) ,DB::raw("COUNT(id) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_franchise_lead = $f->get();




            $f = DB::table('consumers')
            ->where('type', '2')
            ->where('status', 'A')
            ->where('franchise_id', $login->franchise_id)
            ->select( DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(created_at, "%Y-%m") as monthyear' ) ,DB::raw("COUNT(id) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_consumer_lead = $f->get();




            foreach ($chart_consumer_lead as $obj) {        
                $counsumerobjectsList[] = (array)$obj;
            }


            foreach ($chart_franchise_lead as $obj) {
                $franchiseobjectsList[] = (array)$obj;
            }


            if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
            {
                $counsumer_lead_dayyear =  isset($counsumerobjectsList) ? array_column($counsumerobjectsList, 'dayyear') : [];
                $franchise_lead_dayyear   =  isset($franchiseobjectsList) ? array_column($franchiseobjectsList, 'dayyear'): [];
                $label = array_unique(  array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ); 
            // $label = array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ; 

            }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $counsumer_lead_monthyear = isset($counsumerobjectsList) ? array_column($counsumerobjectsList, 'monthyear') : [];
                $franchise_lead_monthyear = isset($franchiseobjectsList) ? array_column($franchiseobjectsList, 'monthyear') : [];
                $label =  array_unique(  array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ); 
            // $label =    array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ; 

            }


            usort($label, function($a, $b)
            {
                if ($a == $b)
                {
                // echo "a ($a) is same priority as b ($b), keeping the same\n";
                    return 0;
                }
                else if ($a > $b)
                {
                // echo "a ($a) is higher priority than b ($b), moving b down array\n";
                    return -1;
                }
                else {
                // echo "b ($b) is higher priority than a ($a), moving b up array\n";                
                    return 1;
                }
            });



            $label = array_reverse($label);

            foreach ($label as $key => $val) {

                $f = DB::table('consumers')
                ->where('type', '1')
                ->where('status', 'A')
                ->where('franchise_id', $login->franchise_id)
                ->where('created_at','LIKE', '%'.$val.'%')
                ->count();

                $franchise_lead_count[] = $f;
            }


            $days = ['0'=>'Sun','1'=>'Mon','2'=>'Tue','3'=>'Wed','4'=>'Thu','5'=>'Fri','6'=>'Sat'];

            foreach ($label as $key => $val) {

                $c = DB::table('consumers')
                ->where('type', '2')
                ->where('status', 'A')
                ->where('franchise_id', $login->franchise_id)
                ->where('created_at','LIKE', '%'.$val.'%')
                ->count();

                $counsumer_lead_count[] = $c;

                if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                {


                    if( !isset($filter->leadfilter) || (  isset($filter->leadfilter)  &&  $filter->leadfilter == 'WEEK')  ){
                        $w = date_format(date_create( $val ),"w");
                        $label_all[] = $days[$w];
                    }else{
                        $label_all[] = date_format(date_create( $val ),"Y M d");
                    }

                }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                {
                    $label_all[] = date_format(date_create( $val ),"M Y");
                }

            }


        //////////////  End Lead graph  1    ///////
        } else if( isset($filter->graphType ) && $filter->graphType == 'Invoice'  )    {
        //////////////  Start Invoice graph  2    ///////



            $f = DB::table('sales_order')
            ->where('del', '0')
            ->where('franchise_id', $login->franchise_id)
            ->select( DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(date_created, "%Y-%m") as monthyear' ) ,DB::raw("SUM(order_total) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_franchise_lead = $f->get();




            $f = DB::table('sales_invoice')
            ->where('del', '0')
            ->where('franchise_id', $login->franchise_id)
            ->select( DB::raw('DATE_FORMAT(date_created, "%Y-%m-%d") as dayyear' ) , DB::raw('DATE_FORMAT(date_created, "%Y-%m") as monthyear' ) ,DB::raw("SUM(invoice_total) count ")  );

            if(  !isset($filter->leadfilter)   ){

                $f->groupBy('dayyear');
                $f->limit(7);
            }
            if( isset($filter->leadfilter) && $filter->leadfilter == 'WEEK' )
            {
                $f->groupBy('dayyear');
                $f->limit(7);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'MONTH' )
            {
                $f->groupBy('dayyear');
                $f->limit(30);
            }

            if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
            {
                $f->limit(12);
                $f->groupBy('monthyear');
            }

            $f->orderBy('id','DESC');


            $chart_consumer_lead = $f->get();

            if($chart_consumer_lead || $chart_franchise_lead){


                foreach ($chart_consumer_lead as $obj) {        
                    $counsumerobjectsList[] = (array)$obj;
                }


                foreach ($chart_franchise_lead as $obj) {
                    $franchiseobjectsList[] = (array)$obj;
                }



                if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                {
                    $counsumer_lead_dayyear =  isset($counsumerobjectsList)  ? array_column($counsumerobjectsList, 'dayyear') : [];
                    $franchise_lead_dayyear   = isset($franchiseobjectsList) ?  array_column($franchiseobjectsList, 'dayyear') : [];
                    $label = array_unique(  array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ); 
                        // $label = array_merge( $franchise_lead_dayyear , $counsumer_lead_dayyear ) ; 

                }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                {
                    $counsumer_lead_monthyear = isset($counsumerobjectsList) ?  array_column($counsumerobjectsList, 'monthyear') : [];
                    $franchise_lead_monthyear =  isset($franchiseobjectsList) ?  array_column($franchiseobjectsList, 'monthyear') : [];
                    $label =  array_unique(  array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ); 
                        // $label =    array_merge( $franchise_lead_monthyear , $counsumer_lead_monthyear ) ; 

                }


                usort($label, function($a, $b)
                {
                    if ($a == $b)
                    {
                            // echo "a ($a) is same priority as b ($b), keeping the same\n";
                        return 0;
                    }
                    else if ($a > $b)
                    {
                            // echo "a ($a) is higher priority than b ($b), moving b down array\n";
                        return -1;
                    }
                    else {
                            // echo "b ($b) is higher priority than a ($a), moving b up array\n";                
                        return 1;
                    }
                });



                $label = array_reverse($label);

                foreach ($label as $key => $val) {

                    $f = DB::table('sales_order')
                    ->where('del', '0')
                    ->where('franchise_id', $login->franchise_id)
                    ->where('date_created','LIKE', '%'.$val.'%')
                    ->sum('order_total');

                    $franchise_lead_count[] = $f;
                }


                $days = ['0'=>'Sun','1'=>'Mon','2'=>'Tue','3'=>'Wed','4'=>'Thu','5'=>'Fri','6'=>'Sat'];

                foreach ($label as $key => $val) {

                    $c = DB::table('sales_invoice')
                    ->where('del', '0')
                    ->where('franchise_id', $login->franchise_id)
                    ->where('date_created','LIKE', '%'.$val.'%')
                    ->sum('invoice_total');

                    $counsumer_lead_count[] = $c;

                    if(  !isset($filter->leadfilter)   || ( isset($filter->leadfilter) &&  (  $filter->leadfilter == 'WEEK'  || $filter->leadfilter == 'MONTH'  )  )  )
                    {


                        if( !isset($filter->leadfilter) || (  isset($filter->leadfilter)  &&  $filter->leadfilter == 'WEEK')  ){
                            $w = date_format(date_create( $val ),"w");
                            $label_all[] = $days[$w];
                        }else{
                            $label_all[] = date_format(date_create( $val ),"Y M d");
                        }

                    }else if( isset($filter->leadfilter) && $filter->leadfilter == 'YEAR' )
                    {
                        $label_all[] = date_format(date_create( $val ),"M Y");
                    }

                }


            }else{
                $label_all = [];
                $franchise_lead_count = [];
                $counsumer_lead_count = [];
            }





        //////////////  END Invoice graph  2    ///////

        }

        $label_all = isset($label_all) ?  $label_all : [];
        $franchise_lead_count = isset($franchise_lead_count) ? $franchise_lead_count : [];
        $counsumer_lead_count = isset($counsumer_lead_count) ? $counsumer_lead_count : [];
        



        if( isset($filter->appoint_cal_date) && $filter->appoint_cal_date) {$month = $filter->appoint_cal_date;}
        else{$month = date('Y-m');}

        $q = DB::table('follow_ups')
        ->where('follow_ups.followup_status', '=' , 'p');

        $q->join('consumers', function($join) use ($login) {

            $join->on('consumers.id','=', 'follow_ups.consumer_id')
            ->where('consumers.status', '=', 'A')
            ->where('consumers.franchise_id', '=', $login->franchise_id);

        });
        
        $q->where('follow_ups.next_follow_date', 'LIKE' , '%'.$month.'%' )
        ->where('follow_ups.next_follow_type','=','Appointment')
        ->select( DB::raw('COUNT(follow_ups.id) as tll_fllup'),'follow_ups.next_follow_date','consumers.franchise_id' )
        ->groupBy('follow_ups.next_follow_date');
        $calender_appoinments = $q->get();




        
        $bucket = array(

            'count_order'                                    =>  $count_order,
            'count_order_amount'                             =>  $count_order_amount,
            'count_inoice_amount'                            =>  $count_inoice_amount,
            'count_inoice_amount_no'                         =>  $count_inoice_amount_no,
            'count_purchase_order'                           =>  $count_purchase_order,
            'count_consumer_lead'                            =>  $count_consumer_lead,
            'count_franchise_lead'                           =>  $count_franchise_lead,
            'count_sales_invoice'                               =>  $count_sales_invoice,
            'count_vendors'                                  =>  $count_vendors,
            'count_follow_ups'                               =>  $count_follow_ups,
            'list_sales_invoice'                             =>  $list_sales_invoice,
            'total_sales_invoice'                            =>  $total_sales_invoice,
            'count_invoice_balance'                          =>  $count_invoice_balance,
            'count_invoice_balance_no'                       =>  $count_invoice_balance_no,
            'list_stock'                                     =>  $list_stock,
            'chart_franhcise_counsumers'                     =>  $chart_franhcise_counsumers,
            'chart_franhcise_counsumers_arr1'                =>  $chart_franhcise_counsumers_arr1,
            'chart_franhcise_counsumers_arr2'                =>  $chart_franhcise_counsumers_arr2,
            'chart_franhcise_profit'                         =>  $chart_franhcise_profit,
            'chart_franhcise_profit_arr1'                    =>  $chart_franhcise_profit_arr1,
            'chart_franhcise_profit_arr2'                    =>  $chart_franhcise_profit_arr2,
            'list_sales_order'                               =>  $list_sales_order,
            'total_sales_order'                              =>  $total_sales_order,
            'sales_list'                                     =>  $sales_list,
            'franchise_stock'                                =>  $franchise_stock,
            'chart_consumer_lead'                            =>  $chart_consumer_lead,
            'chart_franchise_lead'                           =>  $chart_franchise_lead,
            'label'                                          =>  $label_all,
            'franchise_lead_count'                           =>  $franchise_lead_count,
            'counsumer_lead_count'                           =>  $counsumer_lead_count,
            'count_sales_inoice_amount'                      =>  $count_sales_inoice_amount,
            'count_sales_inoice_amount_no'                   =>  $count_sales_inoice_amount_no,
            'count_regn_no'                                  =>  $count_regn_no,
            'consumer_job_card'                              =>  $consumer_job_card,
            'franchise_service'                              =>  $franchise_service,
            'calender_appoinments'                           =>  $calender_appoinments,




            
            
            
            
            
        );
        
        
        
        
        
        return $this->respond([
            'data' => compact('bucket'),
            'status' => 'success',
            'status_code' => $this->getStatusCode(),
            'message' => 'Fetch Dashboard Data Successfully'
        ]);




    }



public function  get_followup(Request $request){

    $data = (Object)$request;
       
 if( isset( $data->appoint_cal_date  ) &&  !$data->appoint_cal_date  ){  return $this->respond( compact( [] ) ); }

        $q = DB::table('follow_ups')->where('follow_ups.next_follow_date', 'LIKE' , '%'.$data->appoint_cal_date.'%' );


        $q->join('consumers', function($join) use ($data) {

            $join->on('consumers.id','=', 'follow_ups.consumer_id');
            // ->where('consumers.status', '=', 'A');
            if( isset(  $data->franchise_id)  &&  $data->franchise_id ){

                $join->where('consumers.franchise_id', '=', $data->franchise_id);
            }

        });
    
        $q->where('follow_ups.next_follow_type','=','Appointment');
        $q->where('follow_ups.followup_status', '=' , 'p');
        $q->select('follow_ups.*','consumers.first_name','consumers.last_name','consumers.phone','consumers.address','consumers.interested_in','consumers.car_model' ,'consumers.vehicle_type','consumers.city','consumers.type','consumers.franchise_id')->groupBy('follow_ups.id');
        $appoinments = $q->get();

   return $this->respond( compact('appoinments') );


}




}

