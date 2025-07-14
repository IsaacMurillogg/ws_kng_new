<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usamos updateOrCreate para poder ejecutar el seeder múltiples veces
        // sin crear usuarios duplicados. Busca por email, y si no existe, lo crea.
        // Si existe, lo actualiza con estos datos.

        // 1. Crear el Usuario Administrador
        User::updateOrCreate(
            ['email' => 'admin@kng.com'],
            [
                'name' => 'Admin KNG',
                'password' => Hash::make('password'), // ¡Usa una contraseña segura en producción!
                'role' => 'admin',
                'email_verified_at' => now(), // Marcarlo como verificado
            ]
        );

        // 2. Crear el Usuario Normal
        User::updateOrCreate(
            ['email' => 'user@kng.com'],
            [
                'name' => 'Usuario Normal',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}