<?php

	date_default_timezone_set('Asia/Kolkata');


	$app->get('/', function () use ($app) {return $app->app->version();});
	$app->post('auth/login', ['uses' => 'AuthController@postLogin']);
	$app->post('source_lead', ['uses' => 'AuthController@source_lead']);
	$app->post('fil', ['uses' => 'AuthController@fil']);


	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'dashboard'],  function () use ($app) {
			
		$app->post('dashboard_data', ['uses' => 'DashboardController@dashboard_data']);
		$app->post('franchise_data', ['uses' => 'DashboardController@franchise_data']);
		$app->post('get_followup', ['uses' => 'DashboardController@get_followup']);

	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'stockdata'],  function () use ($app) {
			
		$app->post('getAssumptionStock', ['uses' => 'StockController@getAssumptionStock']);
		$app->post('getAssumptionStockItem', ['uses' => 'StockController@getAssumptionStockItem']);
		$app->post('add_assumption', ['uses' => 'StockController@add_assumption']);
		$app->post('add_company_assumption', ['uses' => 'StockController@add_company_assumption']);
		$app->post('getDirectCustomer', ['uses' => 'StockController@getDirectCustomer']);
		$app->post('getFranchiseService', ['uses' => 'StockController@getFranchiseService']);
		$app->get('{s_id}/edit', ['uses' => 'StockController@editFranchiseService']);
		$app->post('getServiceCategory', ['uses' => 'StockController@getServiceCategory']);

		$app->post('getBillServiceCategory', ['uses' => 'StockController@getBillServiceCategory']);
		$app->post('getBillServiceNames', ['uses' => 'StockController@getBillServiceNames']);
		$app->post('getBillServiceDuration', ['uses' => 'StockController@getBillServiceDuration']);

		$app->post('get_franchise_service', ['uses' => 'StockController@get_franchise_service']);
		$app->post('saveService', ['uses' => 'StockController@saveService']);
		$app->post('update', ['uses' => 'StockController@updateService']);
		$app->post('saceInvoiceService', ['uses' => 'StockController@saceInvoiceService']);
		$app->post('getNotification', ['uses' => 'StockController@getNotification']);
		$app->post('franchise_consumption_outgoing', ['uses' => 'StockController@franchise_consumption_outgoing']);
		$app->post('franchise_jobcard_outgoing', ['uses' => 'StockController@franchise_jobcard_outgoing']);
		$app->post('update_service_start_date', ['uses' => 'StockController@update_service_start_date']);
		$app->post('cancel_consumption', ['uses' => 'StockController@cancel_consumption']);
		$app->post('cancel_consumption_company', ['uses' => 'StockController@cancel_consumption_company']);

		
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'carmodel'],  function () use ($app) {
			$app->get('', ['uses' => 'CarmodelController@getCarModel']);
			$app->post('removeCompany', ['uses' => 'CarmodelController@removeCompany']);
			$app->post('saveCar', ['uses' => 'CarmodelController@saveCar']);
			$app->post('addCompany', ['uses' => 'CarmodelController@addCompany']);
			$app->post('removeCar', ['uses' => 'CarmodelController@removeCar']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'organization'],  function () use ($app) {
			$app->post('', ['uses' => 'CarmodelController@organization']);
			$app->post('getEdit', ['uses' => 'CarmodelController@getEdit']);
			$app->post('updateUser', ['uses' => 'CarmodelController@updateUser']);
			$app->post('saveUser', ['uses' => 'CarmodelController@saveUser']);
			$app->post('deleteorganization', ['uses' => 'CarmodelController@deleteorganization']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'products'],  function () use ($app) {
			$app->get('', ['uses' => 'ProductsController@getProducts']);
			$app->post('save', ['uses' => 'ProductsController@saveProduct']);
			$app->get('{p_id}/details', ['uses' => 'ProductsController@ProductDetails']);
			$app->get('{p_id}/edit', ['uses' => 'ProductsController@editProduct']);
			$app->post('unit_data/remove', ['uses' => 'ProductsController@removeUnitData']);
			$app->post('attr_data/remove', ['uses' => 'ProductsController@removeAttrData']);
			$app->post('update', ['uses' => 'ProductsController@updateProduct']);
			$app->post('form_options/get', ['uses' => 'ProductsController@getProductOptions']);
			$app->post('remove', ['uses' => 'ProductsController@removeProduct']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'service_plans'],  function () use ($app) {
			$app->get('', ['uses' => 'ServicePlansController@getServicePlans']);
			$app->post('save', ['uses' => 'ServicePlansController@saveServicePlan']);
			$app->get('{s_id}/edit', ['uses' => 'ServicePlansController@editServicePlan']);
			$app->post('update', ['uses' => 'ServicePlansController@updateServicePlan']);
			$app->get('form_options/get', ['uses' => 'ServicePlansController@getServicePlanOptions']);
			$app->post('visit_data/remove', ['uses' => 'ServicePlansController@removeVisitData']);
			$app->post('remove', ['uses' => 'ServicePlansController@removeServicePlan']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'franchise_plans'],  function () use ($app) {
			$app->get('', ['uses' => 'FranchisePlansController@getFranchisePlans']);
			$app->get('form_options/get', ['uses' => 'FranchisePlansController@getFranchisePlanOptions']);
			$app->post('save', ['uses' => 'FranchisePlansController@saveFranchisePlan']);
			$app->get('{f_id}/edit', ['uses' => 'FranchisePlansController@edit_plan']);
			$app->get('products/get', ['uses' => 'FranchisePlansController@getProducts']);
			$app->get('product_attrs/get', ['uses' => 'FranchisePlansController@getProductAttrs']);
			$app->post('accessories_data/remove', ['uses' => 'FranchisePlansController@removeAccessoriesData']);
			$app->post('stock_data/remove', ['uses' => 'FranchisePlansController@removeStockData']);
			$app->post('update', ['uses' => 'FranchisePlansController@updatePlan']);
			$app->post('remove', ['uses' => 'FranchisePlansController@removeFranchisePlan']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'franchise_leads'],  function () use ($app) {
			$app->post('', ['uses' => 'LeadsController@getFranchiseLeads']);
			$app->get('details/{l_id}', ['uses' => 'LeadsController@franchiseLeadDetails']);
			$app->post('save', ['uses' => 'LeadsController@saveFranchiseLead']);
			$app->post('update/{created_by}', ['uses' => 'LeadsController@updateFranchiseLead']);
			$app->post('franchiseAssignSalesAgent', ['uses' => 'LeadsController@franchiseAssignSalesAgent']);
			$app->post('consumerAssignSalesAgent', ['uses' => 'LeadsController@consumerAssignSalesAgent']);
			$app->post('multipleFranchiseAssignSalesAgent', ['uses' => 'LeadsController@multipleFranchiseAssignSalesAgent']);
			$app->post('location_update', ['uses' => 'LeadsController@updateFranchiseLocation']);
			$app->post('remove', ['uses' => 'LeadsController@deleteFranchiseLead']);
			$app->get('locations/get/{c_id}', ['uses' => 'LeadsController@getLocations']);
			$app->post('status/update', 'LeadsController@updateFranchiseLeadStatus');
			$app->post('validate_customer', ['uses' => 'JobCardController@fetchCustomerFromNo']);
			$app->post('fetch_customer', ['uses' => 'JobCardController@fetchCustomerFromId']);        
			$app->post('assign_user', 'LeadsController@assign_user');
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'consumer_leads'],  function () use ($app) {
			$app->post('', ['uses' => 'LeadsController@getConsumerLeads']);
			$app->get('details/{l_id}', ['uses' => 'LeadsController@consumerLeadDetails']);
			$app->post('save', ['uses' => 'LeadsController@saveConsumerLead']);
			$app->post('update', ['uses' => 'LeadsController@updateConsumerLead']);
			$app->post('update_customer', ['uses' => 'LeadsController@update_customer']);
			$app->post('remove', ['uses' => 'LeadsController@deleteConsumerLead']);
			$app->get('locations/get/{c_id}', ['uses' => 'LeadsController@getLocations']);
			$app->get('form_options/get', ['uses' => 'LeadsController@getConsumerFormOptions']);
			$app->get('form_options/getcountry', ['uses' => 'LeadsController@getConsumerFormOptionsCountry']);    
			$app->get('form_options/getuser', ['uses' => 'LeadsController@getConsumerFormOptionsUser']);        
			$app->post('franchise_sale_users', ['uses' => 'LeadsController@franchise_sale_users']);        
			$app->get('service_plans/get', ['uses' => 'LeadsController@getServicePlans']);
			$app->post('status/update', 'LeadsController@updateConsumerLeadStatus');
			$app->post('getFranchise', 'LeadsController@getFranchise');
			$app->get('getFranchiseList', 'LeadsController@getFranchiseList');
			$app->post('assign_franchise/{created_by}', 'LeadsController@assign_franchise');
			$app->post('consumerAssignFranchiseSalesAgent', 'LeadsController@consumerAssignFranchiseSalesAgent');
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'follow_ups'],  function () use ($app) {
			$app->post('', ['uses' => 'FollowUpsController@getFollowUps']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'franchise_follow_ups'],  function () use ($app) {
			$app->get('', ['uses' => 'FollowUpsController@getFranchiseFollowUps']);
			$app->get('details/{l_id}', ['uses' => 'FollowUpsController@franchiseFollowUpDetails']);
			$app->post('save', ['uses' => 'FollowUpsController@saveFranchiseFollowUp']);
			$app->post('update', ['uses' => 'FollowUpsController@updateFranchiseFollowUp']);
			$app->post('remove', ['uses' => 'FollowUpsController@deleteFranchiseFollowUp']);
	});
	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'consumer_follow_ups'],  function () use ($app) {
			$app->get('', ['uses' => 'FollowUpsController@getConsumerFollowUps']);
			$app->get('details/{l_id}', ['uses' => 'FollowUps@consumerFollowUpDetails']);
			$app->post('save', ['uses' => 'FollowUpsController@saveConsumerFollowUp']);
			$app->post('update', ['uses' => 'FollowUpsController@updateConsumerFollowUp']);
			$app->post('remove', ['uses' => 'FollowUpsController@deleteConsumerFollowUp']);
	});

    $app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'franchises'],  function () use ($app) {
			$app->post('', ['uses' => 'FranchisesController@getFranchises']);
			$app->get('details/{l_id}', ['uses' => 'FranchisesController@detail']);
			$app->post('add', ['uses' => 'FranchisesController@add']);
			$app->post('get_franchise_refix', ['uses' => 'FranchisesController@get_franchise_refix']);
			$app->post('get_brand', ['uses' => 'FranchisesController@get_brand']);
			$app->post('get_products', ['uses' => 'FranchisesController@get_products']);
			$app->post('units', ['uses' => 'FranchisesController@units']);
			$app->get('get_stock/{id}', ['uses' => 'FranchisesController@get_stock']);
			$app->get('get_franchise_plan_stock/{id}', ['uses' => 'FranchisesController@get_franchise_plan_stock']);
			$app->post('addInitialStock', ['uses' => 'FranchisesController@addIntialStockWithPlan']);
			$app->post('convertLeadtoFranchise', ['uses' => 'FranchisesController@convertLeadtoFranchise']);
			$app->get('get_franchises_stock/{f_id}', ['uses' => 'FranchisesController@get_franchises_stock']);
			$app->post('addstock', ['uses' => 'FranchisesController@addstock']);
			$app->get('service_plans', ['uses' => 'FranchisesController@service_plans']);
			$app->get('locations/{country_id}', ['uses' => 'FranchisesController@locations']);
			$app->get('country', ['uses' => 'FranchisesController@countries']);
			$app->post('remove', ['uses' => 'FranchisesController@deleteFranchises']);
			$app->get('followups/{l_id}', ['uses' => 'FranchisesController@followups']);
			$app->post('fanchises_getFollowUps', ['uses' => 'FollowUpsController@fanchises_getFollowUps']);
			$app->post('fanchisesAppoinment', ['uses' => 'FollowUpsController@fanchisesAppoinment']);
			$app->post('franch_consumers/{l_id}', ['uses' => 'FranchisesController@franch_consumers']);
			$app->post('franchises_consumers/{l_id}', ['uses' => 'FranchisesController@franchises_consumers']);
			$app->get('getFranchises_name/{l_id}', ['uses' => 'FranchisesController@franch_name']);
			$app->get('getConsumer_name/{l_id}', ['uses' => 'FranchisesController@consumer_name']);
			$app->post('franch_saleorders', ['uses' => 'FranchisesController@franch_saleorders']);
			$app->post('franchise_saleinvoice', ['uses' => 'FranchisesController@franchise_saleinvoice']);
			$app->post('franchise_jobcard_lists', ['uses' => 'FranchisesController@franchise_jobcards']);
			$app->post('franchise_payment_lists', ['uses' => 'FranchisesController@franchise_payment']);
			$app->post('franchise_invoice_asper_status', ['uses' => 'FranchisesController@franchise_saleinvoice_status']);
			$app->post('franchise_saleorder_asper_status', ['uses' => 'FranchisesController@franchise_saleorder_status']);
			$app->post('validate_customer', ['uses' => 'FranchisesController@validate_customer']);
			$app->post('getDetail', ['uses' => 'FranchisesController@getDetail']);
			$app->post('change_status', ['uses' => 'FranchisesController@change_status']);
			$app->post('get_rol', ['uses' => 'FranchisesController@get_rol']);
			$app->post('roles', ['uses' => 'FranchisesController@roles']);
			$app->post('saveUser', ['uses' => 'FranchisesController@saveUser']);
			$app->post('usersList', ['uses' => 'FranchisesController@usersList']);
			$app->post('getUser', ['uses' => 'FranchisesController@getUser']);
			$app->post('updateUser', ['uses' => 'FranchisesController@updateUser']);
			$app->post('userDelete', ['uses' => 'FranchisesController@userDelete']);
			$app->post('checkexist', ['uses' => 'FranchisesController@checkexist']);
			$app->post('updateSales', ['uses' => 'FranchisesController@updateSales']);
			$app->post('getsales', ['uses' => 'FranchisesController@getsales']);
			$app->post('saveFranchiseStockInvoice', ['uses' => 'FranchisesController@saveFranchiseStockInvoice']);
			$app->post('getFranchiseStockInvoice/{id}', ['uses' => 'FranchisesController@getFranchiseStockInvoice']);
			$app->post('update_current_stock', ['uses' => 'FranchisesController@update_current_stock']);
			$app->post('getFranchLoc', ['uses' => 'FranchisesController@getFranchLoc']);

    });

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'purchase'],  function () use ($app) {
			$app->post('', ['uses' => 'PurchaseController@getPurchases']);
			$app->get('details/{p_id}', ['uses' => 'PurchaseController@getPurchaseDetail']);
			$app->post('add', ['uses' => 'PurchaseController@add']);
			$app->get('getVendor', ['uses' => 'PurchaseController@getVendor']);
			$app->get('getVendorCategory/{v_id}', ['uses' => 'PurchaseController@getVendorCategory']);
			$app->post('getVendorBrand/{v_id}', ['uses' => 'PurchaseController@getVendorBrand']);
			$app->post('getProduct/{v_id}', ['uses' => 'PurchaseController@getProduct']);
			$app->post('getMeasurement', ['uses' => 'PurchaseController@getMeasurement']);
			$app->post('getAttributeTypeList', ['uses' => 'PurchaseController@getAttributeTypeList']);
			$app->post('addOrder', ['uses' => 'PurchaseController@addOrder']);
			$app->post('remove', ['uses' => 'PurchaseController@deletePurchaseOrder']);
			$app->post('fil', ['uses' => 'PurchaseController@fil']);
			$app->post('save', ['uses' => 'PurchaseController@savePurchase']);
			$app->post('save_po_receive', ['uses' => 'PurchaseController@savePurReceive']);
			$app->post('get_brand', ['uses' => 'PurchaseController@get_brand']);
			$app->post('get_products', ['uses' => 'PurchaseController@get_products']);
			$app->post('units', ['uses' => 'PurchaseController@units']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'report'],  function () use ($app) {
			$app->post('order', ['uses' => 'ReportController@OrderList']);
			$app->post('invoice', ['uses' => 'ReportController@InvoiceList']);
	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'vendors'],  function () use ($app) {
			$app->post('', ['uses' => 'VendorsController@getVendors']); 
			$app->get('getProducts', ['uses' => 'VendorsController@getProducts']); 
			$app->post('remove', ['uses' => 'VendorsController@deleteVendors']); 
			$app->post('save', ['uses' => 'VendorsController@saveVendors']);
			$app->post('update', ['uses' => 'VendorsController@updateVendors']); 
			$app->post('vendor_contact_update', ['uses' => 'VendorsController@updateVendorsContact']); 
			$app->post('vendor_deal_add', ['uses' => 'VendorsController@addVendorsDeal']);  
			$app->post('vendor_deal_remove', ['uses' => 'VendorsController@removeVendorsDeal']);        
			$app->get('vendorDetails/{v_id}', ['uses' => 'VendorsController@vendorDetails']); 
			$app->get('getStates', ['uses' => 'VendorsController@getStates']);     
			$app->post('getDistrict', ['uses' => 'VendorsController@getDistrict']);
			$app->post('getCity', ['uses' => 'VendorsController@getCity']);
			$app->post('getPincodes', ['uses' => 'VendorsController@getPincodes']);
			$app->get('getfranchsielist', ['uses' => 'VendorsController@getFranchsieList']);
			$app->get('locations', ['uses' => 'VendorsController@getLocations']);
			$app->post('vendor_purchase_order', ['uses' => 'VendorsController@getPurchases']);
			$app->post('locationremove',['uses' => 'VendorsController@locationremove']);
			$app->get('franchise_consumerlocationDetails/{l_id}',['uses' => 'VendorsController@franchise_consumerlocationDetails']);
			$app->post('updateLocation', ['uses' => 'VendorsController@updateLocation']);
			$app->post('savelocation', ['uses' => 'VendorsController@savelocation']);
			$app->get('orderList', ['uses' => 'VendorsController@salesOrderList']);
			$app->post('stk', ['uses' => 'VendorsController@stk']);

	});

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'sales'],  function () use ($app) {


			// $app->get('', ['uses' => 'SalesOrderController@salesOrderList']);
			$app->post('orderList', ['uses' => 'SalesOrderController@salesOrderList']);
			$app->get('getFranchise/{id}', ['uses' => 'SalesOrderController@getFranchiseList']);
			$app->post('getBrand', ['uses' => 'SalesOrderController@getBrandList']);
			$app->post('getBrandByCategory', ['uses' => 'SalesOrderController@getBrandByCategory']);
			$app->post('getProduct', ['uses' => 'SalesOrderController@getProductList']);
			$app->post('getMeasurement', ['uses' => 'SalesOrderController@getMeasurementList']);
			$app->post('saveOrder', ['uses' => 'SalesOrderController@saveOrderData']);
			$app->get('getSalesOrder/{id}', ['uses' => 'SalesOrderController@getSalesOrderDetail']);
			$app->post('invoiceList', ['uses' => 'SalesOrderController@invoiceList']);
			$app->post('saveInvoice', ['uses' => 'SalesOrderController@saveInvoice']);
			$app->post('stockTxransfer', ['uses' => 'SalesOrderController@stockTxransfer']);
			$app->get('getSalesInvoice/{id}', ['uses' => 'SalesOrderController@getSalesInvoice']);
			$app->get('getServiceDetail/{id}', ['uses' => 'SalesOrderController@getServiceDetail']);
			$app->post('getInvoicePayment', ['uses' => 'SalesOrderController@getInvoicePayment']);
			$app->post('getCategoryList', ['uses' => 'SalesOrderController@getCategoryList']);
			$app->post('reject_order', ['uses' => 'SalesOrderController@reject_order']);
			$app->post('getInvoiceId', ['uses' => 'SalesOrderController@getInvoiceId']);
			$app->post('accessory_outgoing', ['uses' => 'SalesOrderController@accessory_outgoing']);
			$app->post('transfer_outgoing', ['uses' => 'SalesOrderController@transfer_outgoing']);
			$app->post('consumption_outgoing', ['uses' => 'StockController@consumption_outgoing']);
			$app->post('payment_receiving', ['uses' => 'SalesOrderController@payment_receiving']);
			$app->post('getPendingPayment', ['uses' => 'SalesOrderController@getPendingPayment']);
			$app->post('direct_customer', ['uses' => 'SalesOrderController@direct_customer']);
			$app->post('getDirectCustomers', ['uses' => 'SalesOrderController@getDirectCustomers']);
			$app->post('transfer_stock_list', ['uses' => 'SalesOrderController@transfer_stock_list']);
			$app->get('getStockTransferDetail/{id}', ['uses' => 'SalesOrderController@getStockTransferDetail']);
			$app->post('getInvoiceEdit', ['uses' => 'SalesOrderController@getInvoiceEdit']);
			$app->post('UpdateInvoice', ['uses' => 'SalesOrderController@UpdateInvoice']);
			$app->post('service_invoice_cancel', ['uses' => 'SalesOrderController@service_invoice_cancel']);
			$app->post('deleteSalesInvoiceItem', ['uses' => 'SalesOrderController@deleteSalesInvoiceItem']);
    });

    $app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin\Master', 'prefix' => 'stock'],  function () use ($app) {
			$app->post('', ['uses' => 'ProductsController@getStockProducts']);
			$app->post('getProductDetail', ['uses' => 'ProductsController@getProductDetail']);
			$app->post('getIncomeProduct', ['uses' => 'ProductsController@getIncomeProduct']);
			$app->post('getFinishGoodDetail', ['uses' => 'ProductsController@getFinishGoodDetail']);
			$app->post('recivedProductDetail', ['uses' => 'ProductsController@recivedProductDetail']);
			$app->post('getFinishProducts', ['uses' => 'ProductsController@getFinishProducts']);
			$app->post('getBrand', ['uses' => 'ProductsController@getBrand']);
			$app->post('getProduct', ['uses' => 'ProductsController@getProductList']);
			$app->post('getMeasurement', ['uses' => 'ProductsController@getMeasurementList']);
			$app->post('updateStock', ['uses' => 'ProductsController@updateStock']);
			$app->post('saveRawProductList', ['uses' => 'ProductsController@saveRawProductList']);
			$app->get('master_measurement', ['uses' => 'ProductsController@master_measurement']);
			$app->post('manuallyStock', ['uses' => 'ProductsController@manuallyStock']);
			$app->post('imageTest', ['uses' => 'ProductsController@imageTest']);
    });

    $app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'jobcard'],  function () use ($app) {
			$app->get('', ['uses' => 'JobCardController@getProducts']);
			$app->post('save', ['uses' => 'JobCardController@saveJobCard']);
			$app->post('saveinvoice', ['uses' => 'JobCardController@saveinvoice']);
			$app->post('updateInvoice', ['uses' => 'JobCardController@updateInvoice']);
			$app->get('getList/{cust_id}', ['uses' => 'JobCardController@getJobCardList']);
			$app->get('JCDetail/{jc_id}', ['uses' => 'JobCardController@JobCardDetail']);
			$app->get('deleteJC/{jc_id}', ['uses' => 'JobCardController@JobCardDelete']);
			$app->get('getproducts', ['uses' => 'JobCardController@GetProducts']);
			$app->post('getData', ['uses' => 'JobCardController@getData']);
			$app->post('getCategory', ['uses' => 'JobCardController@getCategory']);
			$app->post('getPlan', ['uses' => 'JobCardController@getPlan']);
			$app->post('remove', ['uses' => 'JobCardController@removeProduct']);
			$app->post('get_car_company', ['uses' => 'JobCardController@get_car_company']);
			$app->post('car_model_list', ['uses' => 'JobCardController@car_model_list']);
			$app->post('updateNote', ['uses' => 'JobCardController@updateNote']);
			$app->post('getJobcardPendingPayment', ['uses' => 'JobCardController@getJobcardPendingPayment']);
			$app->post('jobcard_payment_receiving', ['uses' => 'JobCardController@jobcard_payment_receiving']);
    });

	$app->group(['middleware' => 'auth:api', 'namespace' => 'App\Http\Controllers\Admin', 'prefix' => 'customer'],  function () use ($app) {
			$app->get('', ['uses' => 'CustomerController@getProducts']);
			$app->get('franch_customers/{l_id}', ['uses' => 'CustomerController@franch_customers']);
			$app->get('customer_detail/{l_id}', ['uses' => 'CustomerController@customer_detail']);
			$app->post('customer_jobcards', ['uses' => 'CustomerController@customer_jobcards']);
			$app->post('customer_pre_srvclist', ['uses' => 'CustomerController@customer_pre_srvclist']);
			$app->post('customer_invoicelist', ['uses' => 'CustomerController@customer_invoicelist']);
			$app->get('cust_jobcardetail/{l_id}/{card_id}', ['uses' => 'CustomerController@cust_jobcardetail']);
			$app->get('cust_invoicedetail/{l_id}/{inv_id}', ['uses' => 'CustomerController@cust_invoicedetail']);
			$app->post('getallbrands/{f_id}', ['uses' => 'CustomerController@getallbrands']);
			$app->post('get_brand_wise_product', ['uses' => 'CustomerController@get_brand_wise_product']);
			$app->get('get_prdct_wise_attr', ['uses' => 'CustomerController@get_prdct_wise_attr']);
			$app->get('get_attrtype_wise_attroption', ['uses' => 'CustomerController@get_attrtype_wise_attroption']);
			$app->post('saveraw_material/{card_id}', ['uses' => 'CustomerController@saveraw_material']);
			$app->post('get_rew_matrial/{card_id}', ['uses' => 'CustomerController@get_rew_matrial']);
			$app->get('getPendingpreventive_service/{custid}/{cardid}/{franchise_id}', ['uses' => 'CustomerController@getPendingpreventive_service']);
			$app->post('save_invoice/{card_id}/{cust_id}/{franchise_id}', ['uses' => 'CustomerController@save_invoice']);
			$app->get('change_card_status/{custid}/{card_id}', ['uses' => 'CustomerController@change_card_status']);
			$app->post('close_job_card/{card_id}/{f_id}/{created_by}', ['uses' => 'CustomerController@CloseJobCard']);
			$app->post('CancelJobCard/{card_id}/{f_id}/{created_by}', ['uses' => 'CustomerController@CancelJobCard']);
			$app->post('getConsumer', ['uses' => 'CustomerController@getConsumer']);
			$app->post('changeAddress', ['uses' => 'CustomerController@changeAddress']);
	});


		///////////////  End Routs    ////////////////


