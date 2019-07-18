<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MasterServiceVisitRawMaterials extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('master_service_visit_raw_materials', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('service_plan_id');
            $table->integer('service_visit_type_id');
            $table->string('raw_materials', 20);
            $table->char('status', 1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('master_service_visit_raw_materials');
    }
}
