<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Alert::with('unit:id,name')->latest('timestamp');

        // --- Filtrado por Rol ---
        if ($user->role === 'user') {
            $query->whereHas('unit.users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // --- Filtrado desde el Frontend ---
        $query->when($request->input('filters.unit') && $request->input('filters.unit') !== 'all', function ($q, $unitId) {
            $q->where('unit_id', $unitId);
        });
        
        $query->when($request->input('filters.startDate'), function ($q, $startDate) {
            $q->where('timestamp', '>=', $startDate);
        });

        $query->when($request->input('filters.endDate'), function ($q, $endDate) {
            $q->where('timestamp', '<=', date('Y-m-d H:i:s', strtotime($endDate . ' +1 day -1 second')));
        });


        $alerts = $query->get(); // Por ahora, obtenemos todas. Se puede paginar si son muchas.

        $transformedAlerts = $alerts->map(fn ($alert) => [
            'id' => 'AL-' . str_pad($alert->id, 5, '0', STR_PAD_LEFT),
            'unit' => $alert->unit->name,
            'time' => $alert->timestamp->toDateTimeString(),
            'location' => $alert->payload['loc'] ?? 'Ubicación no disponible',
        ]);

        return Inertia::render('Alerts', [
            'alerts' => $transformedAlerts,
            'filters' => $request->input('filters', []), // Pasa los filtros de vuelta
            'userUnits' => ($user->role === 'user') ? $user->units()->get(['id', 'name']) : \App\Models\Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }
}