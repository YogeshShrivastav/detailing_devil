<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFranchises extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('franchises', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
            $table->string('contact_no',20);
            $table->string('email_id',50);
            $table->string('source',10);
            $table->text('address');
            $table->string('category', 10);
            $table->string('country',20);
            $table->string('state',20);
            $table->string('city',20);
            $table->string('pin_code',10)->nullable();
            $table->string('company_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_loc')->nullable();
            $table->string('year_of_est',5)->nullable();
            $table->string('city_apply_for',20)->nullable();
            $table->string('automotive_exp',20)->nullable();
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
        Schema::dropIfExists('franchises');
    }
}
