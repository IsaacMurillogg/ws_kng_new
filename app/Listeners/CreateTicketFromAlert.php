<?php

namespace App\Listeners;

use App\Events\AlertReceived;
use App\Events\TicketCreated;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CreateTicketFromAlert
{
    /**
     * Maneja el evento.
     */
    public function handle(AlertReceived $event): void
    {
        Log::info("Listener [CreateTicketFromAlert] - Iniciado para alerta ID: {$event->alert->id}");

        // Crea el ticket asociado a la alerta
        $ticket = Ticket::create([
            'alert_id' => $event->alert->id,
        ]);

        Log::info("Listener [CreateTicketFromAlert] - Ticket ID {$ticket->id} creado.");

        // Dispara el siguiente evento en la cadena con el ticket recién creado
        event(new TicketCreated($ticket));
    }
}