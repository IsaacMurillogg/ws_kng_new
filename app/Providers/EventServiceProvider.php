<?php

namespace App\Providers;

use App\Events\AlertReceived;
use App\Events\TicketCreated;
use App\Listeners\CreateTicketFromAlert;
use App\Listeners\SendFirebaseNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        AlertReceived::class => [
            CreateTicketFromAlert::class,
        ],
        TicketCreated::class => [
            SendFirebaseNotification::class,
        ],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}