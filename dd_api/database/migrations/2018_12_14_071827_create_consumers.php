<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateConsumers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('consumers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('vehicle_type', 50);
            $table->integer('country_id');
            $table->integer('location');
            $table->string('interested_in',10);
            $table->string('source', 10);
            $table->string('category', 10);
            $table->string('first_name',20);
            $table->string('last_name',20);
            $table->string('phone',20);
            $table->string('email',10);
            $table->string('car_model');
            $table->text('address');
            $table->text('message')->nullable();
            $table->char('is_consumer', 1)->default(0);
            $table->char('is_franchise', 1)->default(0);
            $table->integer('created_by');
            $table->integer('updated_by')->nullable();
            $table->char('status', 1);
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
        Schema::dropIfExists('consumers');
    }
}
