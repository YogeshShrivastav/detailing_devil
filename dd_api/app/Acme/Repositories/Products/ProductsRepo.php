<?php



namespace Acme\Repositories\Products;



use App\MasterProductAttrOption;

use App\MasterProduct;

use App\MasterProductAttrType;

use App\MasterProductMeasurementPrice;

use Illuminate\Support\Facades\DB;



class ProductsRepo

{

    public function get_products($per_page, $search = null, $type = 'Product' ) {

        $product = MasterProduct::where('master_products.status', '!=', 'X');

        $product->where('category', '=',  ''.$type.'' );

        if($search){

            $product->where(function($query) use($search) {
                $query->where('brand_name', 'LIKE', '%'.$search.'%')
                ->orWhere('product_name', 'LIKE', '%'.$search.'%');
            });

        }


            // $product->where('brand_name', 'LIKE', '%'.$search.'%')->orWhere('product_name','LIKE','%'.$search.'%');

        return $product->select( 'id', 'brand_name', 'product_name', 'gst','hsn_code','stock_alert')->orderBy('id','Desc')->groupBy('master_products.id')->paginate($per_page);

    }



    public function get_product_attr_types($products) {

        $attr_types = [];

        foreach($products as $val) {

            $data = MasterProductAttrType::where('product_id', $val->id)->where('status', '!=' ,'X')->select('id as attr_id', 'product_id', 'attr_type')->get()->toArray();

            if(count($data)) array_push($attr_types, $data);

        }

        return $attr_types;

    }





    public function get_products_options($attr_types) {

        $attr_options = [];

        foreach($attr_types as $type) {

            foreach($type as $val) {

                $data = MasterProductAttrOption::where('attr_type_id', $val['attr_id'])->select('product_id', 'attr_type_id', DB::raw('group_concat(attr_option) as attr_option'))->get()->toArray();

                if(count($data)) array_push($attr_options, $data);

            }

        }

        return $attr_options;

    }



    public function get_product_options($attr_types) {

        $attr_options = [];

        foreach($attr_types as $val) {

            $data = MasterProductAttrOption::where('attr_type_id', $val['attr_id'])->select('product_id', 'attr_type_id', DB::raw('group_concat(attr_option) as attr_option'))->get();

            if(count($data)) array_push($attr_options, $data);

        }

        return $attr_options;

    }



    public function get_unit_price($products) {

        $unit_data = [];

        foreach($products as $val) {

            $data = MasterProductMeasurementPrice::where('status', '=', 'A')->where('product_id', $val->id)->get()->toArray();

            if(count($data)) array_push($unit_data, $data);

        }

        return $unit_data;

    }











    public function getStockProducts($per_page, $search = null, $type) {

        $product = MasterProduct::where('master_products.status', '!=', 'X')->where('master_products.category', '=', $type);



        
        if($search){

            $product->where(function($query) use($search) {
                $query->where('brand_name', 'LIKE', '%'.$search.'%')
                ->orWhere('product_name', 'LIKE', '%'.$search.'%');
            });

        }


        return $product->select( 'id', 'brand_name', 'product_name', 'gst')->groupBy('master_products.id')->get();

    }

    

    public function getUnitPrice($products) {

        $unit_data = [];

        $purchase_products = [];

        foreach($products as $val) {

            $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('purchase_price', '!=', '0')->where('product_id', $val->id)->select('product_id', 'unit_of_measurement', 'sale_price', 'purchase_price','id')->get()->toArray();

            if(count($data)){

               array_push($unit_data, $data);

               array_push($purchase_products, $val);

           }



       }

       return array('unit_data' => $unit_data,'products' => $purchase_products );



   }





   public function getStockQty($products) {

    $unit_data = [];

    $purchase_products = [];

    foreach($products as $val) {

        $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('purchase_price', '!=', '0')->where('product_id', $val->id)->select('*')->get()->toArray();

        if(count($data)){

           array_push($unit_data, $data);



       }

   }

   return $unit_data;

}





public function getStockTotal($products) {

    $unit_data = [];

    foreach($products as $val) {

        $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('purchase_price', '!=', '0')->where('product_id', $val->id)->select('product_id', 'unit_of_measurement', 'stock_qty', 'stock_total')->get()->toArray();

        if(count($data)) array_push($unit_data, $data);

    }

    return $unit_data;

}



public function getFinishProducts($per_page, $search = null) {




    $product = MasterProduct::where('master_products.status', '!=', 'X')->where('master_products.category', '=', 'Product');

    if($search){

        $product->where(function($query) use($search) {
            $query->where('brand_name', 'LIKE', '%'.$search.'%')
            ->orWhere('product_name', 'LIKE', '%'.$search.'%');
        });

       
    }





    return $product->select( 'id', 'brand_name', 'product_name', 'gst')->groupBy('master_products.id')->get();

}



public function getFinishPrice($products) {

    $unit_data = [];

    $purchase_products = [];

    foreach($products as $val) {

        $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('sale_price', '!=', '0')->where('product_id', $val->id)->select('product_id', 'unit_of_measurement', 'sale_price', 'purchase_price','id')->get()->toArray();

        if(count($data)){

           array_push($unit_data, $data);

           array_push($purchase_products, $val);

       }



   }

   return array('unit_data' => $unit_data,'products' => $purchase_products );



}





public function getFinishQty($products) {

    $unit_data = [];

    $purchase_products = [];

    foreach($products as $val) {

        $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('sale_price', '!=', '0')->where('product_id', $val->id)->select('*')->get()->toArray();

        if(count($data)){

           array_push($unit_data, $data);



       }

   }

   return $unit_data;

}





public function getFinishTotal($products) {

    $unit_data = [];

    foreach($products as $val) {

        $data = MasterProductMeasurementPrice::where('status', '!=', 'X')->where('sale_price', '!=', '0')->where('product_id', $val->id)->select('product_id', 'unit_of_measurement', 'stock_qty', 'stock_total','sale_qty')->get()->toArray();

        if(count($data)) array_push($unit_data, $data);

    }

    return $unit_data;

}



    ///////  Product  /////





public function save_product($data) {

    $product = new MasterProduct();

    $product->category =  $data->category;

    $product->brand_name = $data->brand;

    $product->product_name = $data->product;

    $product->gst = $data->gst;

    $product->hsn_code = $data->hsn_code;

    $product->status = 'A';

    if($product->save()) {

        $this->save_product_measurement($product->id, $data->unitData);

        $this->save_product_attr($product->id, $data->attrData);

        return $product;

    }

    return false;

}



private function save_product_measurement($p_id, $unitData) {

    foreach($unitData as $val) {

        $val = (object) $val;

        $product = new MasterProductMeasurementPrice();

        $product->product_id =  $p_id;

        $product->description =  $val->description;

        $product->unit_of_measurement = $val->measurement_value.' '.$val->measurement;

        if($val->sale_price) $product->sale_price = $val->sale_price;

        if($val->purchase_price) $product->purchase_price = $val->purchase_price;

        $product->status = 'A';

        $product->save();

    }

    return true;

}



private function save_product_attr($p_id, $attr_datas) {

    foreach($attr_datas as $key => $attr_data) {

        $attr_data = (object) $attr_data;

        $attr = new MasterProductAttrType();

        $attr->product_id = $p_id;

        $attr->attr_type = $attr_data->attr_type;

        $attr->status = 'A';

        $attr->save();

        $this->save_attr_options($p_id, $attr->id, $attr_data->attr_options);

    }

    return true;

}



private function save_attr_options($p_id, $attr_type_id, $attr_options) {

    foreach($attr_options as $val) {

        $attr = new MasterProductAttrOption();

        $attr->product_id = $p_id;

        $attr->attr_type_id = $attr_type_id;

        $attr->attr_option = $val;

        $attr->status = 'A';

        $attr->save();

    }

    return true;

}





    /////// End  //// 







    /////// accessory /// 









    //   public function save_accessory($data) {

    //     $product = new MasterProduct();

    //     // $product->category = 'Accessory';

    //     $product->brand_name = $data->brand;

    //     $product->product_name = $data->product;

    //     $product->gst = $data->gst;

    //     $product->hsn_code = $data->hsn_code;

    //     $product->status = 'A';

    //     if($product->save()) {

    //         $this->save_product_measurement($product->id, $data->unitData);

    //         $this->save_product_attr($product->id, $data->attrData);

    //         return $product;

    //     }

    //     return false;

    // }



    // private function save_product_measurement($p_id, $unitData) {

    //     foreach($unitData as $val) {

    //         $val = (object) $val;

    //         $product = new MasterProductMeasurementPrice();

    //         $product->product_id =  $p_id;

    //         $product->unit_of_measurement = $val->measurement_value.' '.$val->measurement;

    //         // if($val->sale_price) $product->sale_price = $val->sale_price;

    //         if($val->purchase_price) $product->purchase_price = $val->purchase_price;

    //         $product->status = 'A';

    //         $product->save();

    //     }

    //     return true;

    // }



    // private function save_product_attr($p_id, $attr_datas) {

    //     foreach($attr_datas as $key => $attr_data) {

    //         $attr_data = (object) $attr_data;

    //         $attr = new MasterProductAttrType();

    //         $attr->product_id = $p_id;

    //         $attr->attr_type = $attr_data->attr_type;

    //         $attr->status = 'A';

    //         $attr->save();

    //         $this->save_attr_options($p_id, $attr->id, $attr_data->attr_options);

    //     }

    //     return true;

    // }



    // private function save_attr_options($p_id, $attr_type_id, $attr_options) {

    //     foreach($attr_options as $val) {

    //         $attr = new MasterProductAttrOption();

    //         $attr->product_id = $p_id;

    //         $attr->attr_type_id = $attr_type_id;

    //         $attr->attr_option = $val;

    //         $attr->status = 'A';

    //         $attr->save();

    //     }

    //     return true;

    // }





    /////// end /// 







public function get_product_details($p_id) {

    return MasterProduct::where('master_products.id', $p_id)->where('status', '!=', 'X')->select('id as product_id', 'brand_name', 'product_name', 'gst','hsn_code','stock_alert')->first();

}



public function get_product_units($p_id) {

    return MasterProductMeasurementPrice::where('product_id', $p_id)->where('status', 'A')->select('id as unit_id', 'unit_of_measurement', 'sale_price', 'purchase_price', 'description')->get();

}



public function get_product_attr_details($p_id) {

    $data = MasterProductAttrType::where('product_id', $p_id)->where('status', '!=' ,'X')->select('id as attr_id', 'product_id', 'attr_type')->get()->toArray();

    return $data;

}



public function remove_unit_data($unit_id) {

    $unit_data = MasterProductMeasurementPrice::where('id', $unit_id)->first();

    $unit_data->status = 'X';

    return $unit_data->save();

}



public function remove_attr_data($attr_id) {

    $attr_data = MasterProductAttrType::where('id', $attr_id)->first();

    $attr_data->status = 'X';

    return $attr_data->save();

}



public function update_product($data) {

    $product = MasterProduct::where('id', $data->product_id)->first();

    $product->brand_name = $data->brand;

    $product->product_name = $data->product;

    $product->gst = $data->gst;

    $product->hsn_code = $data->hsn_code;

    $product->stock_alert = $data->stock_alert;

    $product->status = 'A';

    if($product->save()) {

        $this->save_product_measurement($product->id, $data->unitData);

        $this->save_product_attr($product->id, $data->attrData);

        return $product;

    }

    return false;

}



public function update_product_attr($p_id, $attr_types, $attr_options) {

    foreach($attr_types as $key => $attr_type) {

        foreach($attr_options[$key] as $attr_option) {

            $attr_option_id = $this->get_attr_name_id($attr_option);

            $attr = new MasterProductAttrType();

            $attr->product_id = $p_id;

            $attr->attr_type = $attr_type;

            $attr->attr_option_id = $attr_option_id;

            $attr->status = 'A';

            $attr->save();

        }

    }

    return true;

}



public function get_product_brand_names($type) {

    return MasterProduct::where('status', '!=', 'X')->where('category', '=', $type)->select(DB::RAW('DISTINCT(brand_name) as name'))->get();

}



public function get_product_names($brand_name = null, $product_name = null, $type = null) {

    $product = MasterProduct::where('status', '!=', 'X');

    $product->where('category', '=', $type);

    if($brand_name) $product->where('brand_name', $brand_name);

    if($product_name) $product->where('product_name', $product_name);

    return $product->select(DB::RAW('DISTINCT(product_name) as name'))->get();

}



public function get_product_attrs($brand_name = null, $product_name = null, $category = null) {

    return MasterProduct::join('master_product_measurement_prices', function($join) {

        $join->on('master_products.id', '=', 'master_product_measurement_prices.product_id')->where('master_product_measurement_prices.status', '=', 'A');})->where('master_products.status', '!=', 'X')->where('category', $category)->where('brand_name', $brand_name)->where('product_name', $product_name)->select(DB::RAW('DISTINCT(unit_of_measurement) as unit'),'master_product_measurement_prices.id')->get();

}



public function get_product_unit_measurements() {

    return MasterProductMeasurementPrice::where('status', '!=', 'X')->select(DB::RAW('DISTINCT(unit_of_measurement) as name'))->get();

}



public function get_product_attr_type() {

    return MasterProductAttrType::where('status', '!=', 'X')->select(DB::RAW('DISTINCT(attr_type) as name'))->get();

}



public function get_product_attr_option($attr_name) {

    return MasterProductAttrType::join('master_product_attr_options', 'master_product_attr_types.attr_option_id', '=', 'master_product_attr_options.id')->where('master_product_attr_types.attr_type', $attr_name)->where('master_product_attr_types.status', '!=', 'X')->select(DB::RAW('DISTINCT(master_product_attr_options.name) as name'))->get();

}



public function remove_product($p_id) {

    return MasterProduct::where('id', $p_id)->update(['status' => 'X']);

}



















}