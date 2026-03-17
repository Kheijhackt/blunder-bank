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
            // Default to 100.0 so new cards are immediately picked up
            $table->float('priority_score')->default(100.0)->after('last_practiced_at');
            
            // Add an index for faster sorting later
            $table->index('priority_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flash_cards', function (Blueprint $table) {
            $table->dropIndex(['priority_score']);
            $table->dropColumn('priority_score');
        });
    }
};
