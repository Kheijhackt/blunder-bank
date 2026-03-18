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
        Schema::table('users', function (Blueprint $table) {
            // Total career answers
            $table->unsignedInteger('stats_total_correct')->default(0)->after('remember_token');
            $table->unsignedInteger('stats_total_wrong')->default(0)->after('stats_total_correct');
            
            // Streak logic
            $table->unsignedInteger('stats_current_streak')->default(0)->after('stats_total_wrong');
            $table->timestamp('stats_last_practiced_at')->nullable()->after('stats_current_streak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            Schema::table('users', function (Blueprint $table) 
            {
                // Drop the columns in reverse order of creation (optional but clean)
                $table->dropColumn([
                    'stats_last_practiced_at',
                    'stats_current_streak',
                    'stats_total_wrong',
                    'stats_total_correct',
                ]);
            });
        });
    }
};
