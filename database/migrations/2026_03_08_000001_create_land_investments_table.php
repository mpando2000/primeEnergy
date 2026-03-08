<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_investments', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_sw')->nullable();
            $table->text('description');
            $table->text('description_sw')->nullable();
            $table->string('location');
            $table->string('location_sw')->nullable();
            $table->decimal('size_acres', 10, 2);
            $table->json('investment_types');
            $table->json('investment_types_sw')->nullable();
            $table->json('features');
            $table->json('features_sw')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_investments');
    }
};
