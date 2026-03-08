<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TrainingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// API: Get translations for frontend
Route::get('/api/translations/{locale}', [App\Http\Controllers\TranslationController::class, 'getForLocale'])
    ->where('locale', 'en|sw');

Route::get('/about', function () {
    $teamMembers = App\Models\Media::where('type', 'team')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();
    return Inertia::render('About', [
        'teamMembers' => $teamMembers,
    ]);
})->name('about');

Route::get('/services', [ServiceController::class, 'index'])->name('services');

Route::get('/investments', [App\Http\Controllers\LandInvestmentController::class, 'index'])->name('investments');

Route::get('/projects', [ProjectController::class, 'index'])->name('projects');
Route::get('/projects/{id}', [ProjectController::class, 'show'])->name('projects.show');

Route::get('/training', [TrainingController::class, 'index'])->name('training');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

// Sitemap for SEO
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index']);

// Contact form submission
Route::post('/contact', [App\Http\Controllers\MessageController::class, 'store'])->name('contact.store');

Route::get('/managing-director', function () {
    $mdProfile = App\Models\Media::where('type', 'md')
        ->where('is_active', true)
        ->first();
    return Inertia::render('ManagingDirector', [
        'mdProfile' => $mdProfile,
    ]);
})->name('managing-director');

Route::get('/dashboard', function () {
    return redirect('/admin/dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'active'])->prefix('admin')->group(function () {
    Route::get('/', fn() => redirect()->route('admin.dashboard'));
    
    // Dashboard - requires dashboard.view permission
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('admin.dashboard');
    Route::get('/dashboard/stats', [App\Http\Controllers\DashboardController::class, 'stats'])
        ->middleware('permission:dashboard.view')
        ->name('admin.dashboard.stats');
    
    // Messages
    Route::get('/messages', [App\Http\Controllers\MessageController::class, 'index'])
        ->middleware('permission:messages.view')
        ->name('admin.messages');
    Route::patch('/messages/{id}/read', [App\Http\Controllers\MessageController::class, 'markAsRead'])
        ->middleware('permission:messages.manage')
        ->name('admin.messages.read');
    Route::patch('/messages/{id}/star', [App\Http\Controllers\MessageController::class, 'toggleStar'])
        ->middleware('permission:messages.manage')
        ->name('admin.messages.star');
    Route::patch('/messages/{id}/archive', [App\Http\Controllers\MessageController::class, 'archive'])
        ->middleware('permission:messages.manage')
        ->name('admin.messages.archive');
    Route::post('/messages/{id}/reply', [App\Http\Controllers\MessageController::class, 'reply'])
        ->middleware('permission:messages.manage')
        ->name('admin.messages.reply');
    Route::post('/messages/upload-attachment', [App\Http\Controllers\MessageController::class, 'uploadAttachment'])
        ->middleware('permission:messages.manage')
        ->name('admin.messages.upload-attachment');
    Route::get('/messages/attachment/{id}', [App\Http\Controllers\MessageController::class, 'downloadAttachment'])
        ->middleware('permission:messages.view')
        ->name('admin.messages.download-attachment');
    Route::delete('/messages/{id}', [App\Http\Controllers\MessageController::class, 'destroy'])
        ->middleware('permission:messages.delete')
        ->name('admin.messages.destroy');
    
    // Profile - all authenticated users
    Route::get('/profile', [App\Http\Controllers\AdminProfileController::class, 'index'])->name('admin.profile');
    Route::patch('/profile', [App\Http\Controllers\AdminProfileController::class, 'update'])->name('admin.profile.update');
    Route::put('/profile/password', [App\Http\Controllers\AdminProfileController::class, 'updatePassword'])->name('admin.profile.password');
    Route::post('/profile/avatar', [App\Http\Controllers\AdminProfileController::class, 'updateAvatar'])->name('admin.profile.avatar');
    Route::delete('/profile/avatar', [App\Http\Controllers\AdminProfileController::class, 'removeAvatar'])->name('admin.profile.avatar.remove');
    
    // Notifications - all authenticated users
    Route::patch('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('admin.notifications.mark-all-read');
    
    // Content/Translations
    Route::get('/content', [App\Http\Controllers\TranslationController::class, 'index'])
        ->middleware('permission:content.view')
        ->name('admin.content');
    Route::post('/content/update', [App\Http\Controllers\TranslationController::class, 'update'])
        ->middleware('permission:content.edit')
        ->name('admin.content.update');
    Route::post('/content/bulk-update', [App\Http\Controllers\TranslationController::class, 'bulkUpdate'])
        ->middleware('permission:content.edit')
        ->name('admin.content.bulk-update');
    Route::post('/content/import', [App\Http\Controllers\TranslationController::class, 'import'])
        ->middleware('permission:content.edit')
        ->name('admin.content.import');
    
    // Projects
    Route::get('/projects', [ProjectController::class, 'adminIndex'])
        ->middleware('permission:projects.view')
        ->name('admin.projects');
    Route::post('/projects', [ProjectController::class, 'store'])
        ->middleware('permission:projects.create')
        ->name('admin.projects.store');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])
        ->middleware('permission:projects.edit')
        ->name('admin.projects.update');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])
        ->middleware('permission:projects.delete')
        ->name('admin.projects.destroy');
    Route::post('/upload-image', [ProjectController::class, 'uploadImage'])
        ->middleware('permission:projects.create,gallery.upload')
        ->name('admin.upload-image');
    
    // Training
    Route::get('/training', [TrainingController::class, 'adminIndex'])
        ->middleware('permission:training.view')
        ->name('admin.training');
    Route::post('/training', [TrainingController::class, 'store'])
        ->middleware('permission:training.create')
        ->name('admin.training.store');
    Route::put('/training/{id}', [TrainingController::class, 'update'])
        ->middleware('permission:training.edit')
        ->name('admin.training.update');
    Route::delete('/training/{id}', [TrainingController::class, 'destroy'])
        ->middleware('permission:training.delete')
        ->name('admin.training.destroy');
    Route::post('/training/upload-image', [TrainingController::class, 'uploadImage'])
        ->middleware('permission:training.create')
        ->name('admin.training.upload-image');
    
    // Services
    Route::get('/services', [ServiceController::class, 'adminIndex'])
        ->middleware('permission:services.view')
        ->name('admin.services');
    Route::post('/services', [ServiceController::class, 'store'])
        ->middleware('permission:services.create')
        ->name('admin.services.store');
    Route::put('/services/{id}', [ServiceController::class, 'update'])
        ->middleware('permission:services.edit')
        ->name('admin.services.update');
    Route::delete('/services/{id}', [ServiceController::class, 'destroy'])
        ->middleware('permission:services.delete')
        ->name('admin.services.destroy');
    Route::post('/services/{serviceId}/sub', [ServiceController::class, 'storeSubService'])
        ->middleware('permission:services.create')
        ->name('admin.services.sub.store');
    Route::put('/services/{serviceId}/sub/{subId}', [ServiceController::class, 'updateSubService'])
        ->middleware('permission:services.edit')
        ->name('admin.services.sub.update');
    Route::delete('/services/{serviceId}/sub/{subId}', [ServiceController::class, 'destroySubService'])
        ->middleware('permission:services.delete')
        ->name('admin.services.sub.destroy');
    
    // Land Investments
    Route::get('/investments', [App\Http\Controllers\LandInvestmentController::class, 'adminIndex'])
        ->middleware('permission:projects.view')
        ->name('admin.investments');
    Route::post('/investments', [App\Http\Controllers\LandInvestmentController::class, 'store'])
        ->middleware('permission:projects.create')
        ->name('admin.investments.store');
    Route::put('/investments/{id}', [App\Http\Controllers\LandInvestmentController::class, 'update'])
        ->middleware('permission:projects.edit')
        ->name('admin.investments.update');
    Route::delete('/investments/{id}', [App\Http\Controllers\LandInvestmentController::class, 'destroy'])
        ->middleware('permission:projects.delete')
        ->name('admin.investments.destroy');
    Route::post('/investments/upload-image', [App\Http\Controllers\LandInvestmentController::class, 'uploadImage'])
        ->middleware('permission:projects.create')
        ->name('admin.investments.upload-image');
    
    // Gallery/Media
    Route::get('/gallery', [App\Http\Controllers\MediaController::class, 'index'])
        ->middleware('permission:gallery.view')
        ->name('admin.gallery');
    Route::post('/gallery', [App\Http\Controllers\MediaController::class, 'store'])
        ->middleware('permission:gallery.upload')
        ->name('admin.gallery.store');
    Route::post('/gallery/{media}', [App\Http\Controllers\MediaController::class, 'update'])
        ->middleware('permission:gallery.edit')
        ->name('admin.gallery.update');
    Route::delete('/gallery/{media}', [App\Http\Controllers\MediaController::class, 'destroy'])
        ->middleware('permission:gallery.delete')
        ->name('admin.gallery.destroy');
    Route::post('/gallery/reorder', [App\Http\Controllers\MediaController::class, 'updateOrder'])
        ->middleware('permission:gallery.edit')
        ->name('admin.gallery.reorder');
    Route::patch('/gallery/{media}/toggle', [App\Http\Controllers\MediaController::class, 'toggleActive'])
        ->middleware('permission:gallery.edit')
        ->name('admin.gallery.toggle');
    Route::put('/banners/{banner}', [App\Http\Controllers\PageBannerController::class, 'update'])
        ->middleware('permission:gallery.edit')
        ->name('admin.banners.update');
    
    // Settings
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index'])
        ->middleware('permission:settings.view')
        ->name('admin.settings');
    Route::put('/settings', [App\Http\Controllers\SettingController::class, 'update'])
        ->middleware('permission:settings.edit')
        ->name('admin.settings.update');
    
    // Users
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index'])
        ->middleware('permission:users.view')
        ->name('admin.users');
    Route::post('/users', [App\Http\Controllers\UserController::class, 'store'])
        ->middleware('permission:users.create')
        ->name('admin.users.store');
    Route::put('/users/{id}', [App\Http\Controllers\UserController::class, 'update'])
        ->middleware('permission:users.edit')
        ->name('admin.users.update');
    Route::delete('/users/{id}', [App\Http\Controllers\UserController::class, 'destroy'])
        ->middleware('permission:users.delete')
        ->name('admin.users.destroy');
    Route::patch('/users/{id}/toggle-status', [App\Http\Controllers\UserController::class, 'toggleStatus'])
        ->middleware('permission:users.edit')
        ->name('admin.users.toggle-status');
    
    // Roles & Permissions
    Route::get('/roles', [App\Http\Controllers\RoleController::class, 'index'])
        ->middleware('permission:roles.manage')
        ->name('admin.roles');
    Route::post('/roles', [App\Http\Controllers\RoleController::class, 'store'])
        ->middleware('permission:roles.manage')
        ->name('admin.roles.store');
    Route::put('/roles/{role}', [App\Http\Controllers\RoleController::class, 'update'])
        ->middleware('permission:roles.manage')
        ->name('admin.roles.update');
    Route::delete('/roles/{role}', [App\Http\Controllers\RoleController::class, 'destroy'])
        ->middleware('permission:roles.manage')
        ->name('admin.roles.destroy');
    
    // Pages Management
    Route::get('/pages', [App\Http\Controllers\PageController::class, 'index'])
        ->middleware('permission:settings.view')
        ->name('admin.pages');
    Route::put('/pages/{page}', [App\Http\Controllers\PageController::class, 'update'])
        ->middleware('permission:settings.edit')
        ->name('admin.pages.update');
    Route::patch('/pages/{page}/toggle-status', [App\Http\Controllers\PageController::class, 'toggleStatus'])
        ->middleware('permission:settings.edit')
        ->name('admin.pages.toggle-status');
});

require __DIR__.'/auth.php';
