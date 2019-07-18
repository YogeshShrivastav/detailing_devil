<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;

class UserDetailsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('user_details')->insert([
            ['user_id' => 1, 'first_name' => 'Admin', 'last_name' => 'Abacus Desk', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now() ],
        ]);
    }
}
