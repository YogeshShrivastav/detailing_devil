<?php

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UsersTableSeeder::class);
        $this->call(UserDetailsTableSeeder::class);
//        factory(App\User::class, 10)->create();
//        Model::unguard();
//        // Register the user seeder
//
//        Model::reguard();
    }
}
