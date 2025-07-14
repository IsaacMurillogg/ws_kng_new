<?php

namespace App\Events;

use App\Models\Alert;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AlertReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * La instancia de la alerta que ha sido recibida.
     *
     * @var \App\Models\Alert
     */
    public $alert; 

    /**
     * Create a new event instance.
     */
    public function __construct(Alert $alert) // <-- Inyección de dependencias del modelo
    {
        $this->alert = $alert;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}