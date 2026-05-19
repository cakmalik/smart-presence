<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('operator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('event_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('attendance_type', ['dhuhur', 'event']);
            $table->date('attendance_date');
            $table->time('attended_at');
            $table->timestamps();

            $table->unique(['school_id', 'student_id', 'attendance_type', 'attendance_date', 'event_id'], 'unique_attendance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
