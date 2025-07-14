<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {   
        $user = Auth::user();

        $baseQuery = Unit::query();

        if ($user->role === 'user') {
            $baseQuery->whereHas('users', fn($q) => $q->where('user_id', $user->id));
        }

        $onlineThreshold = now()->subMinutes(15);

        $stats = [
            'total'   => (clone $baseQuery)->count(), 
            'moving'  => (clone $baseQuery)->where('speed', '>', 0)->count(),
            'online'  => (clone $baseQuery)->where('speed', '=', 0)->whereNotNull('last_message')->where('last_message', '>=', $onlineThreshold)->count(),
            'offline' => (clone $baseQuery)->where(function ($query) use ($onlineThreshold) {
                $query->where('last_message', '<', $onlineThreshold)
                      ->orWhereNull('last_message');
            })->count(),
        ];

        return Inertia::render('Dashboard', [
            'unitStats' => $stats,
        ]);
    }
}