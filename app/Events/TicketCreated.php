<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Ticket $ticket;

    public function __construct(Ticket $ticket)
    {
        // Cargar relaciones aquí sigue siendo una buena práctica.
        $this->ticket = $ticket->load(['alert.unit.users']);
    }

 function broadcastOn(): array
    {
        $channels = [new PrivateChannel('admin-alerts')];

        foreach ($this->ticket->alert->unit->users as $user) {
            $channels[] = new PrivateChannel("user-{$user->id}-alerts");
        }
        
        return $channels;
    }


    public function broadcastAs(): string
    {
        return 'ticket.created';
    }


    public function broadcastWith(): array
    {
        return [
            'ticket' => [
                'id' => $this->ticket->id,
                'status' => ucfirst($this->ticket->status),
                'unit_name' => $this->ticket->alert->unit->name,
                'alert_type' => $this->ticket->alert->type,
                'timestamp' => $this->ticket->alert->timestamp->toDateTimeString(),
                'url' => route('tickets.index'),
            ],
        ];
    }
}