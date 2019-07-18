<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            ['username' => 'Admin', 'email' => 'admin', 'password' => Hash::make('654321'), 'first_name' => 'Admin', 'is_active' => 1, 'access_level' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now() ],
        ]);
    }
}
