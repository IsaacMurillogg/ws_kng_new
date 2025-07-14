<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    /**
     * Muestra la lista de tickets, filtrada por el rol del usuario.
     */
    public function index(): InertiaResponse
    {
        $user = Auth::user();
        
        $query = Ticket::with(['alert.unit'])->latest();

        if ($user->role === 'user') {
            $query->whereHas('alert.unit.users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $tickets = $query->get();

        $transformedTickets = $tickets->map(fn ($ticket) => [
            'id' => 'TKT-' . str_pad($ticket->id, 3, '0', STR_PAD_LEFT),
            'title' => $ticket->alert->type,
            'unit' => $ticket->alert->unit->name,
            'priority' => $this->determinePriority($ticket->alert->type),
            'status' => match($ticket->status) {
                'abierto' => 'Abierto',
                'en_seguimiento' => 'En Proceso',
                'cerrado' => 'Resuelto',
                default => 'Desconocido',
            },
            'description' => $this->getAlertDescription($ticket->alert),
        ]);

        return Inertia::render('Tickets', [
            'tickets' => $transformedTickets,
        ]);
    }

    /**
     * Devuelve los datos de un ticket específico para el modal, incluyendo sus respuestas.
     */
    public function show(Ticket $ticket): JsonResponse
    {
        // En un futuro, puedes añadir una política de seguridad aquí:
        // $this->authorize('view', $ticket);

        $ticket->load(['alert.unit', 'responses.user']);

        return response()->json($ticket);
    }

    private function determinePriority(string $alertType): string
    {
        $alertTypeLower = strtolower($alertType);
        if (str_contains($alertTypeLower, 'pánico') || str_contains($alertTypeLower, 'sin reportar')) return 'Alta';
        if (str_contains($alertTypeLower, 'velocidad') || str_contains($alertTypeLower, 'geocerca')) return 'Media';
        return 'Baja';
    }
    
    private function getAlertDescription(\App\Models\Alert $alert): string
    {
        $text = $alert->payload['text'] ?? 'No hay descripción detallada.';
        $speed = $alert->payload['speed'] ?? null;
        if (str_contains(strtolower($alert->type), 'velocidad') && $speed) {
            return "La unidad superó el límite de velocidad, alcanzando {$speed} km/h.";
        }
        return $text;
    }
}