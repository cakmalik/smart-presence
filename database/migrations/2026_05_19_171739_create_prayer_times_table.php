<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('prayer_type', 50);
            $table->string('label', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->unique(['school_id', 'prayer_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_times');
    }
};
