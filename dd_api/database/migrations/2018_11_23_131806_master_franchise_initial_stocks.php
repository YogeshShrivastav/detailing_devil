<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MasterFranchiseInitialStocks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('master_franchise_initial_stocks', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('franchise_plan_id');
            $table->string('brand');
            $table->string('product');
            $table->string('unit_measurement', 50)->nullable();
            $table->string('quantity', 20)->nullable();
            $table->char('status', 1);
            $table->integer('products_id');
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
        Schema::drop('master_franchise_initial_stocks');
    }
}
