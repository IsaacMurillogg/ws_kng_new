<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controladores
use App\Http\Controllers\AlertController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketResponseController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\Admin\UserController;

/*
|--------------------------------------------------------------------------
| Rutas Públicas y de Autenticación
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

require __DIR__.'/auth.php';


/*
|--------------------------------------------------------------------------
| Rutas para Usuarios Autenticados (Todos los roles)
|--------------------------------------------------------------------------
|
| Protegidas por los middlewares 'auth' y 'verified'.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Perfil de Usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Módulos Principales
    Route::get('/units', [UnitController::class, 'index'])->name('units.index');
    Route::get('/alerts', [AlertController::class, 'index'])->name('alerts.index');

    // Gestión de Tickets
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/responses', [TicketResponseController::class, 'store'])->name('tickets.responses.store');
    
});


/*
|--------------------------------------------------------------------------
| Rutas EXCLUSIVAS para Administradores
|--------------------------------------------------------------------------
|
| Protegidas por el middleware 'admin'.
|
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::resource('users', UserController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

});