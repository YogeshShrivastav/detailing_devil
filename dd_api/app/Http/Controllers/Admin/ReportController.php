<?php

namespace App\Http\Controllers\Admin;

// use Acme\Repositories\Franchises\FranchisesRepo;

use App\Http\Controllers\ApiController;

use Illuminate\Http\Request;

use DB;


class ReportController extends ApiController
{

   public function OrderList(Request $request) {
    $per_page = 15;
    $search = $request->search;

    $so = DB::table('sales_order');
    $so->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id');
    $so->where('del' ,'0');

    if((isset($search['date_from'])  && $search['date_from'] != '' ) && (isset($search['date_to'])  && $search['date_to'] != '' ))
    {

        $from = date("Y-m-d",strtotime($search['date_from']) );
        $to = date("Y-m-d",strtotime($search['date_to']) );

        $so->where('date_created','>=',$from);
        $so->where('date_created','<=',$to);
    }

    if((isset($search['status'])) && $search['status'] != 'All')
    {
        $so->where('sales_order.order_status' ,$search['status']);
    }

    if((isset($search['date_created'])) && $search['date_created'] != '')
    {
        $date_created = date("Y-m-d",strtotime($search['date_created']) );

        $so->where('sales_order.date_created' ,$date_created);
    }



    if((isset($search['name'])) && $search['name'] != '')
    {
        $so->where('franchises.name',$search['name']);
    }


    $so->select('sales_order.*', 'franchises.name');
    $so->orderBy('sales_order.id','Desc');
    $salesOrderList = $so->paginate($per_page);


    foreach ($salesOrderList as $key => $row) {

       $salesOrderList[$key]->created_by_type = ucwords($row->created_by_type);

       $itemList =  DB::table('sales_order_item')->where('sales_order_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();

       $salesOrderList[$key]->totalItem = $itemList->totalItem;
   }
   $totalorder=DB::table('sales_order')
   ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')
   ->where('del' ,'0')
   ->count();

   $pendingorder=DB::table('sales_order')
   ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')
   ->where('del' ,'0')->where('order_status','Pending')         
   ->count();

   $neworder=DB::table('sales_order')
   ->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id')
   ->where('del' ,'0')->where('date_created','LIKE',date("Y-m-d").'%')         
   ->count();





   $franchise = DB::table('sales_order');
   $franchise->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id');
   $franchise->where('del' ,'0');
   $franchise->select('franchises.id','franchises.name');
   $franchise->groupBy('sales_order.franchise_id');
   $franchise->orderBy('sales_order.id','Desc');
   $FranchiseList = $franchise->get();

   return $this->respond([

    'data' => compact('salesOrderList','totalorder','pendingorder','neworder','FranchiseList'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Order List Successfully'

]);


}



public function InvoiceList(Request $request) {

    $per_page = 15;
    $search = $request->search;

    $so = DB::table('sales_invoice');
    $so->join('franchises', 'franchises.id', '=', 'sales_invoice.franchise_id');
    $so->where('del' ,'0');


    if((isset($search['date_from'])  && $search['date_from'] != '' ) && (isset($search['date_to'])  && $search['date_to'] != '' ))
    {

        $from = date("Y-m-d",strtotime($search['date_from']) );
        $to = date("Y-m-d",strtotime($search['date_to']) );

        $so->where('date_created','>=',$from);
        $so->where('date_created','<=',$to);
    }


    if((isset($search['date_created'])) && $search['date_created'] != '')
    {
        $date_created = date("Y-m-d",strtotime($search['date_created']) );

        $so->where('sales_order.date_created' ,$date_created);
    }



    if((isset($search['name'])) && $search['name'] != '')
    {
        $so->where('franchises.name',$search['name']);
    }


    $so->select('sales_invoice.*', 'franchises.name');
    $so->orderBy('sales_invoice.id','Desc');
    $InvoiceList = $so->paginate($per_page);


    foreach ($InvoiceList as $key => $row) {

       $InvoiceList[$key]->created_by_type = ucwords($row->created_by_type);

       $dateCreated = date_create($row->date_created);
       $InvoiceList[$key]->date_created = date_format($dateCreated, 'd-M-Y');

       $InvoiceList[$key]->created_by_type = ucwords($row->created_by_type);

       $itemList =  DB::table('sales_invoice_item')->where('sales_invoice_id' ,$row->id)->where('del' ,'0')->select(DB::RAW('COUNT(id) as totalItem'))->first();

       $InvoiceList[$key]->totalItem = $itemList->totalItem;
   }



   $franchise = DB::table('sales_order');
   $franchise->join('franchises', 'franchises.id', '=', 'sales_order.franchise_id');
   $franchise->where('del' ,'0');
   $franchise->select('franchises.id','franchises.name');
   $franchise->groupBy('sales_order.franchise_id');
   $franchise->orderBy('sales_order.id','Desc');
   $FranchiseList = $franchise->get();


   return $this->respond([

    'data' => compact('InvoiceList','FranchiseList'),

    'status' => 'success',

    'status_code' => $this->getStatusCode(),

    'message' => 'Fetch Sales Invoice List Successfully'

]);


}


}
