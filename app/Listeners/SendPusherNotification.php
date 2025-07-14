<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class SendPusherNotification
{
    /**
     * Maneja el evento de forma síncrona.
     */
    public function handle(TicketCreated $event): void
    {
        $ticket = $event->ticket->fresh(['alert.unit.users']);

        Log::info("Listener [SendPusherNotification] - Iniciado para ticket ID: {$ticket->id} con estado: {$ticket->status}");

        $channels = [new PrivateChannel('admin-alerts')];
        foreach ($ticket->alert->unit->users as $user) {
            $channels[] = new PrivateChannel("user-{$user->id}-alerts");
        }

        $payload = [
            'ticket' => [
                'id' => $ticket->id,
                'status' => ucfirst($ticket->status),
                'unit_name' => $ticket->alert->unit->name,
                'alert_type' => $ticket->alert->type,
                'timestamp' => $ticket->alert->timestamp->toDateTimeString(),
                'url' => route('tickets.index'), 
            ],
        ];

        $broadcastEvent = new class($channels, $payload) implements ShouldBroadcastNow {
            private array $channels;
            public array $data;

            public function __construct(array $channels, array $payload) {
                $this->channels = $channels;
                $this->data = $payload;
            }

            public function broadcastOn(): array { return $this->channels; }
            public function broadcastAs(): string { return 'ticket.created'; }
        };

        Broadcast::event($broadcastEvent);
        
        Log::info("Listener [SendPusherNotification] - Evento 'ticket.created' transmitido a ".count($channels)." canales.");
    }
}