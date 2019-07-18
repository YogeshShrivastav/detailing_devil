import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
// import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { AddProductComponent } from './product/add-product/add-product.component';
import { DialogComponent } from './dialog/dialog.component';
import { ConvertArray } from './_Pipes/ConvertArray.pipe';
import { StrReplace } from './_Pipes/StrReplace.pipe';
import { Crypto } from './_Pipes/Crypto.pipe';
import { DatePikerFormat } from './_Pipes/DatePikerFormat.pipe';

import { ChartsModule } from 'ng2-charts';
// import { PushNotificationService } from 'ngx-push-notifications';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { PushNotificationsModule } from 'ng-push'; //import the module

import { AuthGuard } from './_guards/AuthGuard';
import { AuthGuardLog } from './_guards/AuthGuardLog';
import { DatabaseService } from './_services/DatabaseService';
import { DashboardComponent } from './dashboard/dashboard.component';
import {FooterComponent} from './footer/footer.component';
import {MasterAddTabsComponent} from './master/master-add-tabs/master-add-tabs.component';
import {ProductListComponent} from './product/product-list/product-list.component';
import {MasterListingTabsComponent} from './master/master-listing-tabs/master-listing-tabs.component';
import {EditProductComponent} from './product/edit-product/edit-product.component';
import {AddFranchisePlanComponent} from './franchise-plan/add-franchise-plan/add-franchise-plan.component';
import {FranchisePlanListComponent} from './franchise-plan/franchise-plan-list/franchise-plan-list.component';
import {ServicePlanListComponent} from './service-plan/service-plan-list/service-plan-list.component';
import {AddServicePlanComponent} from './service-plan/add-service-plan/add-service-plan.component';
import {EditServicePlanComponent} from './service-plan/edit-service-plan/edit-service-plan.component';
import {EditFranchisePlanComponent} from './franchise-plan/franchise-plan-edit/edit-franchise-plan.component';
import {AddLeadComponent} from './lead/add-lead/add-lead.component';
import {CreateFollowupComponent} from './followup/create-followup/create-followup.component';
import {FollowupListComponent} from './followup/followup-list/followup-list.component';
import {FranchiseListComponent} from './franchise/franchise-list/franchise-list.component';
import {FranchiseDetailComponent} from './franchise/franchise-detail/franchise-detail.component';
import {FranchiseLeftTabsComponent} from './master/franchise-left-tabs/franchise-left-tabs.component';
import {LeadListComponent} from './lead/lead-list/lead-list.component';
import {ConsumerLeadDetailComponent} from './lead/consumer-lead-detail/consumer-lead-detail.component';
import {FranchiseLeadDetailComponent} from './lead/franchise-lead-detail/franchise-lead-detail.component';
import {PurchaseOrderListComponent} from './purchase/purchase-order-list/purchase-order-list.component';
import {AddPurchaseComponent} from './purchase/add-purchase/add-purchase.component';
import {PurchaseDetailComponent} from './purchase/purchase-detail/purchase-detail.component';
import {ReceivedPurchaseOrderComponent} from './purchase/received-purchase-order/received-purchase-order.component';


import {StockListComponent } from './franchise/stock-list/stock-list.component';
import {InvoiceListComponent} from './franchise/invoice-list/invoice-list.component';
// import {JobcardDetailComponent} from './franchise/jobcard-detail/jobcard-detail.component';
import {CustomersComponent} from './customers/customers.component';
import {FranchisesCustomersComponent} from './franchise/customers/customers.component';
import {FranchiseLeadsComponent} from './franchise/leads/franchise-leads.component';

import {ConvertFranchiseComponent} from './lead/convert-franchise/convert-franchise.component';
import { AddFranchiseLocationComponent } from './lead/franchise-location-add/add-franchise-location.component';

import {OrderListComponent} from './franchise/order-list/order-list.component';
import {JobcardFranchiseListComponent} from './franchise/jobcard-list/jobcard-list.component';
import {ValidateJobcardCustomer} from './franchise/jobcard-popup/validate-customer.component';

import {FranchiseFollowupComponent} from './franchise/franchise-followup/franchise-followup.component';
import {FranchiseAddAdComponent} from './franchise/franchise-add/franchise-add-ad.component';
import { VendorDetailComponent } from './vendor/vendor-detail/vendor-detail.component';
import { AddVendorComponent } from './vendor/add-vendor/add-vendor.component';
import { VendorListComponent } from './vendor/vendor-list/vendor-list.component';
import { AddJobcardComponent } from './jobcard/add-jobcard/add-jobcard.component';
import { JobcardListAdComponent } from './jobcard/jobcard-list-ad/jobcard-list-ad.component';
import { FranchiseCustomerLeftTabsComponent } from './master/franchise-customer-left-tabs/franchise-customer-left-tabs.component';
import { CustomersDetailComponent } from './customers/customers-detail/customers-detail.component';
import { FrachisesCustomersDetailComponent } from './franchise/customers/customers-detail/customers-detail.component';
import {JobcardListComponent} from './franchise/customers/jobcard-list/jobcard-list.component';
import {PreventiveServiceListComponent} from './franchise/customers/preventive-servicelist/preventive-servicelist.component';
import {FranchiseDetailPlanListComponent} from './franchise/franchise-plan-list/franchise-plan-list.component';

import {CustomerInvoiceListComponent} from './franchise/customers/customerinvoice-list/customerinvoice-list.component';
import {JobcardDetailComponent} from './franchise/customers/jobcard-detail/jobcard-detail.component';
import { AddJobcardRawmaterialComponent } from './franchise/customers/add-jobcard-rawmaterial/add-jobcard-rawmaterial.component';

import {CustomerInvoiceDetailComponent} from './franchise/customers/customer_invoice_detail/customer_invoice_detail.component';
import {InvoiceDetailComponent} from './franchise/invoice-detail/invoice-detail.component';
import { CreateInvoiceCustomerComponent } from './franchise/customers/create-invoice-customer/create-invoice-customer.component';


import { SaleOrderListComponent } from './sale-order/sale-order-list/sale-order-list.component';
import { SaleOrderDetailComponent } from './sale-order/sale-order-detail/sale-order-detail.component';
import { AddSaleComponent } from './sale-order/add-sale/add-sale.component';
import { InvoiceAddAdComponent } from './invoice/invoice-add-ad/invoice-add-ad.component';
import { InvoiceListAdComponent } from './invoice/invoice-list-ad/invoice-list-ad.component';
import { InvoiceDetailAdComponent } from './invoice/invoice-detail-ad/invoice-detail-ad.component';
import { PaymentListAdComponent } from './payment/payment-list-ad/payment-list-ad.component';
import {PaymentListComponent} from './franchise/payment-list/payment-list.component';

import { UsersListComponent } from './users/users-list/users-list.component';
import { UsersAddComponent } from './users/users-add/users-add.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { FranchiseHeaderTabComponent } from './master/franchise-header-tab/franchise-header-tab.component';

import { StockListAdComponent } from './stock/stock-list-ad/stock-list-ad.component';
import { MaterialIncomingComponent } from './stock/material-incoming/material-incoming.component';
import { FinishMaterialComponent } from './stock/finish-material/finish-material.component';
import { AddFinishGoodComponent } from './stock/add-finish-good/add-finish-good.component';
import { FinishMaterialDetailComponent } from './stock/finish-material-detail/finish-material-detail.component';
import { StockTabComponent } from './master/stock-tab/stock-tab.component';
import { StockListTabComponent } from './master/stock-list-tab/stock-list-tab.component';
import { MaterialOutgoingComponent } from './stock/material-outgoing/material-outgoing.component';

import { InvoiceComponent } from './report/invoice/invoice.component';
import { SalesOrderComponent } from './report/sales-order/sales-order.component';
import { ReportTabComponent } from './master/report-tab/report-tab.component';
import { TerritoryAddComponent } from './territory/territory-add/territory-add.component';
import { TerritoryListComponent } from './territory/territory-list/territory-list.component';
import { TerritoryDetailComponent } from './territory/territory-detail/territory-detail.component';
import { AccessoryListComponent } from './accessories/accessory-list/accessory-list.component';
import { AccessoryAddComponent } from './accessories/accessory-add/accessory-add.component';
import { AccessoryEditComponent } from './accessories/accessory-edit/accessory-edit.component';
import { AccessoriesComponent } from './stock/accessories/accessories.component';

import { AssignLeadComponent } from './lead/assign-lead/assign-lead.component';
import { AssignUserComponent } from './lead/assign-user/assign-user.component';
import { ItemOutgoingComponent } from './stock/item-outgoing/item-outgoing.component';
import { ItemTabComponent } from './master/item-tab/item-tab.component';
import { FinishTabComponent } from './master/finish-tab/finish-tab.component';
import { FinishOutgoingComponent } from './stock/finish-outgoing/finish-outgoing.component';

import { CarModelListComponent } from './car-model/car-model-list/car-model-list.component';
import { ReceivePaymentComponent } from './invoice/receive-payment/receive-payment.component';
import { AddCarModelComponent } from './car-model/add-car-model/add-car-model.component';
import { AddCompanyModelComponent } from './car-model/add-company-model/add-company-model.component';
import { OrganizationComponent } from './organization/organization.component';
import { AddOrganizationComponent } from './organization/add-organization/add-organization.component';
import { EditOrganizationComponent } from './organization/edit-organization/edit-organization.component';
import { AppointmentComponent } from './franchise/appointment/appointment.component';
import { FranchiseCovertComponent } from './lead/franchise-covert/franchise-covert.component';
import { NumericWords } from './_Pipes/NumericWords.pipe';
import { JobcardPaymentListComponent } from './franchise/customers/jobcard-payment-list/jobcard-payment-list.component';
import { DirectCustomerComponent } from './invoice/direct-customer/direct-customer.component';
import { ManualIncomeComponent } from './stock/manual-income/manual-income.component';
import { FinishManualIncomeComponent } from './stock/finish-manual-income/finish-manual-income.component';
import { TransferStockComponent } from './invoice/transfer-stock/transfer-stock.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { StockTransferDetailComponent } from './stock-transfer/stock-transfer-detail/stock-transfer-detail.component';
import { TransferOutgoingComponent } from './stock/transfer-outgoing/transfer-outgoing.component';
import { FranchiseConsumptionStockListComponent } from './franchise/consumption/franchise-consumption-stock-list/franchise-consumption-stock-list.component';
import { FranchiseConsumptionStockAddComponent } from './franchise/consumption/franchise-consumption-stock-add/franchise-consumption-stock-add.component';
import { ConsumptionStockViewComponent } from './franchise/consumption/consumption-stock-view/consumption-stock-view.component';
import { ConsumptionStockListComponent } from './stock/consumption/consumption-stock-list/consumption-stock-list.component';
import { ConsumptionStockAddComponent } from './stock/consumption/consumption-stock-add/consumption-stock-add.component';
import { ConsumptionStockOutgoingComponent } from './stock/consumption/consumption-stock-outgoing/consumption-stock-outgoing.component';
import { InvoiceEditAdComponent } from './invoice/invoice-edit-ad/invoice-edit-ad.component';
import { DirectCustomerListComponent } from './direct-customer-list/direct-customer-list.component';
import { ServiceListComponent } from './service-master/service-list/service-list.component';
import { ServiceAddComponent } from './service-master/service-add/service-add.component';
import { ServiceEditComponent } from './service-master/service-edit/service-edit.component';
import { FranchiseServiceAddComponent } from './franchise/service/service-add/service-add.component';
import { FranchiseServiceListComponent } from './franchise/service/service-list/service-list.component';
import { ServiceDetailComponent } from './franchise/service/service-detail/service-detail.component';
import { FranchiseDashboardComponent } from './franchise/franchise-dashboard/franchise-dashboard.component';
import { FranchiseConsumptionOutgoingComponent } from './franchise/outgoing-stock/franchise-consumption-outgoing/franchise-consumption-outgoing.component';
import { FranchiseJobcardOutgoingComponent } from './franchise/outgoing-stock/franchise-jobcard-outgoing/franchise-jobcard-outgoing.component';
import { OutgoingTabsComponent } from './franchise/outgoing-stock/outgoing-tabs/outgoing-tabs.component';
import { CustomerEditComponent } from './franchise/customers/customer-edit/customer-edit.component';
import { ServiceStartComponent } from './franchise/service/service-start/service-start.component';
import { FranchiseServicesComponent } from './franchise-services/franchise-services.component';
import { EditJobcardComponent } from './jobcard/edit-jobcard/edit-jobcard.component';
import { FranchiseServicesPaymantComponent } from './franchise-services-paymant/franchise-services-paymant.component';
import { AssignLeadUserComponent } from './lead/assign-lead-user/assign-lead-user.component';
import { JobcardEditComponent } from './franchise/customers/jobcard-edit/jobcard-edit.component';
import { FranchiseServiceEditComponent } from './franchise/service/franchise-service-edit/franchise-service-edit.component';

const routes: Routes = [
    { path: '', component: LoginComponent, canActivate: [AuthGuardLog] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,2] } },
    // { path: 'lead', component: LeadComponent, canActivate: [AuthGuard]  , data: { expectedRole: ['1','5'] } },
    { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'products/add', component: AddProductComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] }},
    { path: 'products/:id/edit', component: EditProductComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] } },
    { path: 'franchise_plans', component: FranchisePlanListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'franchise_plans/add', component: AddFranchisePlanComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'franchise_plans/:id/edit', component: EditFranchisePlanComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'service_plans', component: ServicePlanListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'service_plans/add', component: AddServicePlanComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'service_plans/:id/edit', component: EditServicePlanComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'leads/add', component: AddLeadComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3,6] } },
    { path: 'leads', component: LeadListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,3] } },
    { path: 'franchise_leads/details/:id', component: FranchiseLeadDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3] } },
    { path: 'consumer_leads/details/:id', component: ConsumerLeadDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5,6] } },
    { path: 'followups', component: FollowupListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,6] } },
    { path: 'followups/create', component: CreateFollowupComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,6] } },
    { path: 'purchases', component: PurchaseOrderListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] } },
    { path: 'purchases/add', component: AddPurchaseComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] } },
    { path: 'purchases/:id/details', component: PurchaseDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] } },
    { path: 'purchases/:id/receive', component: ReceivedPurchaseOrderComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] } }, 
    { path: 'franchise-list', component: FranchiseListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3] } },
    { path: 'franchise-add', component: FranchiseAddAdComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'franchise-add/:franchise_id', component: FranchiseAddAdComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5] } },
  
    { path: 'accessory-list', component: AccessoryListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'accessory-add', component: AccessoryAddComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] }},
    { path: 'accessory-edit/:id', component: AccessoryEditComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] }},
    
    { path: 'franchise-detail/:franchise_id', component: FranchiseDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3,4] } },
    { path: 'franchise-dashboard/:franchise_id', component: FranchiseDashboardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise-consumers/:franchise_id', component: CustomersComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise-orders/:franchise_id', component: OrderListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise-invoice/:franchise_id', component: InvoiceListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise-followup/:franchise_id', component: FranchiseFollowupComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3,6] } },
    { path: 'franchise-stock/:franchise_id', component: StockListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'direct-customer-list', component: DirectCustomerListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
   
    
    
  
    { path: 'franchise-customers/:franchise_id/:type', component: FranchisesCustomersComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise-leads/:franchise_id', component: FranchiseLeadsComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,6,3] } },
    { path: 'franchise-leads-appointment/:franchise_id', component: AppointmentComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,6,3] } },
    { path: 'franchise/customer_details/:franchise_id/:id', component: FrachisesCustomersDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,6,3] } },
    { path: 'franchise/customer_jobcards/:franchise_id/:id', component: JobcardListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise/customer_PreventiveService/:franchise_id/:id', component: PreventiveServiceListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise/customer_invoices/:franchise_id/:id', component: CustomerInvoiceListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] } },
    { path: 'franchise/customer_jobcard-detail/:franchise_id/:id/:cardid', component: JobcardDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3,8] } },
    { path: 'franchise/customer_invoice_detail/:franchise_id/:id/:inv_id', component: CustomerInvoiceDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },
    { path: 'franchise/create_customer_invoice/:card_id/:cust_id', component: CreateInvoiceCustomerComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },
    { path: 'franchise-jobcard-list/:franchise_id', component: JobcardFranchiseListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5,8] }  },

    { path: 'franchise-jobcard-outgoing/:franchise_id/:stock_id', component: FranchiseJobcardOutgoingComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    { path: 'franchise-consumption-outgoing/:franchise_id/:stock_id', component: FranchiseConsumptionOutgoingComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    
    { path: 'customer-edit/:franchise_id/:id', component:  CustomerEditComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5,6,3] }  },
    

    { path: 'vendors/add', component: AddVendorComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'vendors', component: VendorListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'vendors/vendor-detail/:id', component:  VendorDetailComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },

    { path: 'addjobcard/:id', component:  AddJobcardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    { path: 'addjobcard/:id/:p_id/:franchise_id', component:  AddJobcardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    { path: 'editjobcard/:jc_id/:customer_id/:franchise_id', component:  JobcardEditComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    // { path: 'addjobcard/:id/:p_id/:franchise_id/:data', component:  AddJobcardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },

    { path: 'editjobcard/:id', component:  EditJobcardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
    { path: 'editjobcard/:id/:p_id/:franchise_id', component:  EditJobcardComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },

    { path: 'listjobcard/:id', component:  JobcardListAdComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },
    { path: 'listjobcard/validate-customer', component:  ValidateJobcardCustomer, canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },   
    { path: 'franchise-payment/:franchise_id', component: PaymentListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] }  },
  
    { path: 'sale-order-list', component:  SaleOrderListComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'sale-order-detail/:id', component:  SaleOrderDetailComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4,5,3] }  },
    { path: 'sale-add', component:  AddSaleComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5] }  },
    { path: 'sale-add/:id', component:  AddSaleComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,5] }  },
    { path: 'order-invoice-list', component:  InvoiceListAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'order-invoice-detail/:id', component:  InvoiceDetailAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5,2,4,3] }  },
    { path: 'order-invoice-add/:id/:orderId', component:  InvoiceAddAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'transfer-stock/:id/:orderId', component:  TransferStockComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'transfer-stock', component:  TransferStockComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'order-invoice-add', component:  InvoiceAddAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'order-invoice-edit/:id', component:  InvoiceEditAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2,4] }  },
    { path: 'invoice-payment-list', component:  PaymentListAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,2] }  },
    
    
    { path: 'users-list', component:  UsersListComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5] }  },
    { path: 'users-add', component:  UsersAddComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5] }  },
    { path: 'users-edit/:id', component:  UsersEditComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5] }  },
  
    
    { path: 'stock-list-ad', component: StockListAdComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'material-incoming/:id/:unit_id', component: MaterialIncomingComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'finish-material', component: FinishMaterialComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] } },
    
    { path: 'consumption-list', component: ConsumptionStockListComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    
    { path: 'add-finish-good', component: AddFinishGoodComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] } },
    { path: 'finish-outgoing/:id/:unit_id', component: FinishOutgoingComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] } },
    { path: 'finish-material-detail/:id/:unit_id', component: FinishMaterialDetailComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] } },
    { path: 'material-outgoing/:id/:unit_id', component: MaterialOutgoingComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] } },
    { path: 'transfer-outgoing/:id/:unit_id', component: TransferOutgoingComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] } },
    { path: 'item-outgoing/:id/:unit_id', component: ItemOutgoingComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,4] } },
    { path: 'stock-accessories', component: AccessoriesComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'manual-income/:id/:unit_id', component: ManualIncomeComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'finish-manual-income/:id/:unit_id', component: FinishManualIncomeComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    { path: 'consumption-outgoing/:id/:unit_id', component: ConsumptionStockOutgoingComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,4] }  },
    
    { path: 'report/order', component:  SalesOrderComponent , canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'report/invoice', component:  InvoiceComponent , canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'territory-add', component:TerritoryAddComponent, canActivate: [AuthGuard] , data: { expectedRole: [1] } },
    { path: 'territory-list', component: TerritoryListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'territory/territory-detail/:id', component: TerritoryDetailComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    

    { path: 'franchise/customer_invoices/:franchise_id/:id', component: CustomerInvoiceListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] } },
    { path: 'franchise/customer_invoices/:franchise_id', component: CustomerInvoiceListComponent, canActivate: [AuthGuard] , data: { expectedRole: [1,3,5] } },
    
    { path: 'franchise-consumption-stock/:franchise_id', component: FranchiseConsumptionStockListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,3] } },
    { path: 'franchise-service-add', component: FranchiseServiceAddComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,3] } },
    { path: 'franchise-service-add/:franchise_id', component: FranchiseServiceAddComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,3] } },
    { path: 'franchise-service-list/:franchise_id', component: FranchiseServiceListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,3,5] } },
    { path: 'franchise-services', component: FranchiseServicesComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1,2] } },

    
    { path: 'car-model', component: CarModelListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },

    { path: 'organization', component: OrganizationComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'organization-add', component: AddOrganizationComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'organization/edit/:id', component: EditOrganizationComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },

    { path: 'franchise-convert', component: FranchiseCovertComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'franchise-convert/:id', component: FranchiseCovertComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'transfer-stock-list', component: StockTransferComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'transfer-stock-detail/:id', component: StockTransferDetailComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    
    { path: 'service-list', component: ServiceListComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'service-add', component: ServiceAddComponent, canActivate: [AuthGuard]  , data: { expectedRole: [1] } },
    { path: 'service-detail/:id', component:  ServiceDetailComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },
    { path: 'edit-service/:id', component:  FranchiseServiceEditComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },
    { path: 'service-edit/:id', component:  ServiceEditComponent , canActivate: [AuthGuard] , data: { expectedRole: [1,5,3] }  },

    
    { path: '**', redirectTo: ''},

  
  
  ];


@NgModule({
    declarations: [
        AppComponent,
        FranchiseConsumptionStockListComponent,
        FranchiseConsumptionStockAddComponent,
        CustomerEditComponent,
        LoginComponent,
        HeaderComponent,
        AddProductComponent,
        DialogComponent,
        DashboardComponent,
        FooterComponent,
        MasterAddTabsComponent,
        AddProductComponent,
        ProductListComponent,
        EditProductComponent,
        AddFranchisePlanComponent,
        FranchisePlanListComponent,
        EditFranchisePlanComponent,
        AddServicePlanComponent,
        ServicePlanListComponent,
        EditServicePlanComponent,
        MasterListingTabsComponent,
        AddLeadComponent,
        LeadListComponent,
        FranchiseLeadDetailComponent,
        ConsumerLeadDetailComponent,
        CreateFollowupComponent,
        ConvertFranchiseComponent,
        FollowupListComponent,
        FranchiseListComponent,
        FranchiseDetailComponent,
        FranchiseLeftTabsComponent,
        PurchaseOrderListComponent,
        PurchaseDetailComponent,
        AddPurchaseComponent,
        ReceivedPurchaseOrderComponent,
        StockListComponent,
        InvoiceListComponent,
        JobcardDetailComponent,
        JobcardEditComponent,
        CustomersComponent,
        FranchisesCustomersComponent,
        FranchiseLeadsComponent,
        OrderListComponent,
        FranchiseFollowupComponent,
        FranchiseAddAdComponent,
        VendorDetailComponent,        
        AddVendorComponent,
        VendorListComponent,
        AddJobcardComponent,
        JobcardListAdComponent,
        FranchiseCustomerLeftTabsComponent,
        CustomersDetailComponent,
        FrachisesCustomersDetailComponent,
        JobcardListComponent,
        PreventiveServiceListComponent,
        CustomerInvoiceListComponent,
        CreateInvoiceCustomerComponent,
        JobcardDetailComponent,
        CustomerInvoiceDetailComponent,
        InvoiceDetailComponent,
        FranchiseDetailPlanListComponent,
        SaleOrderListComponent,
        SaleOrderDetailComponent,
        AddSaleComponent,
        InvoiceAddAdComponent,
        InvoiceListAdComponent,
        InvoiceDetailAdComponent,
        PaymentListAdComponent,
        AddJobcardRawmaterialComponent,
        JobcardFranchiseListComponent,
        ValidateJobcardCustomer,
        AddFranchiseLocationComponent,
        PaymentListComponent,
        ConvertArray,
        NumericWords,
        UsersListComponent,
        UsersAddComponent,
        UsersEditComponent,
        FranchiseHeaderTabComponent,
        StockListAdComponent,
        MaterialIncomingComponent,
        FinishMaterialComponent,
        AddFinishGoodComponent,
        FinishMaterialDetailComponent,
        StockTabComponent,
        StockListTabComponent,
        MaterialOutgoingComponent,
        StrReplace,
        Crypto,
        DatePikerFormat,
        ReportTabComponent,
        SalesOrderComponent ,    
        InvoiceComponent ,       
        TerritoryAddComponent,   
        TerritoryListComponent,  
        TerritoryDetailComponent, 
        AccessoryListComponent,
        AccessoryAddComponent,
        AccessoryEditComponent,
        AccessoriesComponent,
        AssignLeadComponent,
        AssignUserComponent,
        ItemOutgoingComponent,
        ItemTabComponent,
        FinishTabComponent,
        FinishOutgoingComponent,
        CarModelListComponent,
        ReceivePaymentComponent,
        AddCarModelComponent,
        AddCompanyModelComponent,
        OrganizationComponent,
        AddOrganizationComponent,
        EditOrganizationComponent,
        AppointmentComponent,
        FranchiseCovertComponent,
        JobcardPaymentListComponent,
        DirectCustomerComponent,
        ManualIncomeComponent,
        FinishManualIncomeComponent,
        TransferStockComponent,
        StockTransferComponent,
        StockTransferDetailComponent,
        TransferOutgoingComponent,
        ConsumptionStockViewComponent,
        ConsumptionStockListComponent,
        ConsumptionStockAddComponent,
        ConsumptionStockOutgoingComponent,
        InvoiceEditAdComponent,
        DirectCustomerListComponent,
        ServiceListComponent,
        ServiceAddComponent,
        ServiceEditComponent,
        FranchiseServiceEditComponent,
        FranchiseServiceAddComponent,
        FranchiseServiceListComponent,
        ServiceDetailComponent,
        FranchiseDashboardComponent,
        FranchiseConsumptionOutgoingComponent,
        FranchiseJobcardOutgoingComponent,
        OutgoingTabsComponent,
        ServiceStartComponent,
        FranchiseServicesComponent,
        EditJobcardComponent,
        FranchiseServicesPaymantComponent,
        AssignLeadUserComponent,
        JobcardEditComponent
    ],

    
    imports: [
        RouterModule.forRoot(routes),
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        ChartsModule,
        AutocompleteLibModule,
        PushNotificationsModule
    ],
    providers: [
      AuthGuard,
      AuthGuardLog,
      DatabaseService,
      // PushNotificationService
    ],
    entryComponents: [
      CreateFollowupComponent,
      ConvertFranchiseComponent,
      AddJobcardRawmaterialComponent,
      AddFranchiseLocationComponent,
      AssignLeadComponent,
      AssignUserComponent,
      ReceivePaymentComponent,
      FranchiseServicesPaymantComponent,
      JobcardPaymentListComponent,
      AddCompanyModelComponent,
      AddCarModelComponent,
      FranchiseConsumptionStockAddComponent,
      DirectCustomerComponent,
      ConsumptionStockViewComponent,
      ConsumptionStockAddComponent,
      ServiceStartComponent,
      AssignLeadUserComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
