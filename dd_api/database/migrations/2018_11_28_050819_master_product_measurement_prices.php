<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MasterProductMeasurementPrices extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('master_product_measurement_prices', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('product_id')->index();
            $table->string('unit_of_measurement');
            $table->string('sale_price');
            $table->string('purchase_price');
            $table->char('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('master_product_measurement_prices');
    }
}
