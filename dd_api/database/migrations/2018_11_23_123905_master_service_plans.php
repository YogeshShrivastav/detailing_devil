<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MasterServicePlans extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('master_service_plans', function (Blueprint $table) {
            $table->increments('id');
            $table->string('vehicle_type', 30);
            $table->string('category_type', 30);
            $table->string('plan_name', 30);
            $table->string('category', 10);
            $table->integer('number_of_visits');
            $table->double('price');
            $table->integer('year');
            $table->text('description');
            $table->char('status', 1);
            $table->datetime('created_at');
            $table->datetime('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('master_service_plans');
    }
}
