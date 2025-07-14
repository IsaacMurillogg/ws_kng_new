<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();

            # Datos básicos
            $table->unsignedBigInteger('wialon_id')->unique();
            $table->string('name');
            $table->string('imei')->nullable();
            $table->string('unit')->nullable();
            $table->string('plates')->nullable();
            $table->string('phone_number')->nullable();

            # Ubicación
            $table->string('status', 20)->default('Sin conexión')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();
            $table->integer('altitude')->nullable();
            $table->integer('orientation')->nullable();
            $table->integer('speed')->default(0);

            # Sensores y parámetros
            $table->float('main_battery')->nullable();
            $table->float('backup_battery')->nullable();
            $table->boolean('panic_button')->default(false);
            $table->integer('gsm_quality')->nullable();
            $table->boolean('engine_status')->default(false);
            $table->unsignedBigInteger('odometer')->nullable();
            $table->integer('gps_signal')->nullable();
            $table->boolean('engine_lockup')->default(false);

            $table->timestamp('last_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
