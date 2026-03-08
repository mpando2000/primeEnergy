<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // message, user_created, project, service, training
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('icon')->default('fa-bell');
            $table->string('icon_bg')->default('#2E7D32'); // background color for icon
            $table->string('link')->nullable(); // URL to navigate to
            $table->unsignedBigInteger('user_id')->nullable(); // target user (null = all admins)
            $table->unsignedBigInteger('actor_id')->nullable(); // who triggered the notification
            $table->boolean('read')->default(false);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'read', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
