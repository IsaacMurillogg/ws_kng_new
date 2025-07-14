<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Carga la página principal del Hub de Usuarios con todos los datos necesarios.
     */
    public function index(): Response
    {
        return Inertia::render('Users', [ 
            'users' => User::with('units:id') 
                ->orderBy('name')
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'assignedUnits' => $user->units->pluck('id'),
                    'lastLogin' => $user->last_login_at ?? null,
                ]),
            'allUnits' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Crea un nuevo usuario.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:admin,user',
            'assignedUnits' => 'nullable|array',
            'assignedUnits.*' => 'exists:units,id' 
        ]);

        $user = User::create($request->only('name', 'email', 'role') + ['password' => Hash::make($request->password)]);
        
        $user->units()->sync($request->input('assignedUnits', []));

        return to_route('admin.users.index')->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Actualiza un usuario existente.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:admin,user',
            'assignedUnits' => 'nullable|array',
            'assignedUnits.*' => 'exists:units,id'
        ]);

        $user->update($request->only('name', 'email', 'role'));

        // Si se envía una contraseña, actualizarla.
        if ($request->filled('password')) {
            $request->validate(['password' => ['confirmed', Rules\Password::defaults()]]);
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->units()->sync($request->input('assignedUnits', []));

        return to_route('admin.users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Elimina un usuario.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return to_route('admin.users.index')->with('error', 'No puedes eliminar tu propio usuario.');
        }
        
        $user->delete();
        
        return to_route('admin.users.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}