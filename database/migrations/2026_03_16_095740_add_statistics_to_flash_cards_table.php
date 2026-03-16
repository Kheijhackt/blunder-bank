<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('flash_cards', function (Blueprint $table) {
            // Statistics
            $table->unsignedInteger('times_correct')->default(0)->after('note');
            $table->unsignedInteger('times_wrong')->default(0)->after('times_correct');
            
            // Context
            $table->integer('user_elo_at_time')->nullable()->after('times_wrong');
            $table->string('opening_name')->nullable()->after('user_elo_at_time');
            
            // Scheduling
            $table->timestamp('last_practiced_at')->nullable()->after('opening_name');
            
            // Linkage
            $table->string('source_game_url')->nullable()->after('last_practiced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flash_cards', function (Blueprint $table) {
            $table->dropColumn([
                'times_correct',
                'times_wrong',
                'user_elo_at_time',
                'opening_name',
                'last_practiced_at',
                'source_game_url',
            ]);
        });
    }
};
