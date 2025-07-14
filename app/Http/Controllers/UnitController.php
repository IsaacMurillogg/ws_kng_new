<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $baseQuery = Unit::query();

        if ($user->role === 'user') {
            $baseQuery->whereHas('users', fn($q) => $q->where('user_id', $user->id));
        }

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'moving' => (clone $baseQuery)->where('speed', '>', 0)->count(),
            'online' => (clone $baseQuery)->where('speed', '=', 0)->whereNotNull('last_message')->where('last_message', '>=', now()->subMinutes(15))->count(),
            'offline' => (clone $baseQuery)->where(function ($query) {
                $query->where('last_message', '<', now()->subMinutes(15))
                      ->orWhereNull('last_message');
            })->count(),
        ];

        $units = (clone $baseQuery)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('plates', 'like', "%{$search}%");
                });
            })
            ->orderBy('name', 'asc')
            ->paginate(12) 
            ->withQueryString();

        $transformedUnits = $units->through(fn($unit) => [
            'id' => $unit->id,
            'name' => $unit->name,
            'status' => $unit->status,
            'phone' => $unit->phone_number,
            'lastReport' => $unit->last_message ? $unit->last_message->diffForHumans() : 'N/A',
            'latitude' => $unit->latitude,
            'longitude' => $unit->longitude,
        ]);

        return Inertia::render('Units', [ 
            'units' => $transformedUnits,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }
}