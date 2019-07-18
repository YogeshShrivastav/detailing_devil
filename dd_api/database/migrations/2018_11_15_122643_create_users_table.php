<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('username', 20);
            $table->string('phone', 20)->nullable();
            $table->string('email', 50)->unique();
            $table->string('password');
            $table->rememberToken();
            $table->string('avatar')->nullable();
            $table->string('first_name', 50);
            $table->tinyInteger('is_active')->default(0);
            $table->integer('access_level')->default(0);
            $table->string('api_token', 60)->unique()->nullable();
            $table->dateTime('last_login_at')->nullable();
            $table->dateTime('created_at');
            $table->dateTime('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
    }
}
