<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use Illuminate\Support\Facades\Log;
// Más adelante, aquí importaremos:
// use Kreait\Firebase\Messaging\CloudMessage;
// use Kreait\Firebase\Messaging\Notification;

class SendFirebaseNotification
{
    /**
     * Maneja el evento de forma síncrona.
     */
    public function handle(TicketCreated $event): void
    {
        $ticket = $event->ticket;
        Log::info("Listener [SendFirebaseNotification] - Iniciado para ticket ID: {$ticket->id}");

        $unitName = $ticket->alert->unit->name;
        $alertType = $ticket->alert->type;
        $usersToNotify = $ticket->alert->unit->users;

        // ---- PREPARACIÓN PARA FIREBASE ----
        
        $notificationTitle = "Nueva Alerta: {$unitName}";
        $notificationBody = "Se ha registrado una alerta de '{$alertType}'.";
        
        foreach ($usersToNotify as $user) {
            // Futuro Paso: Obtener tokens del usuario desde una tabla `fcm_tokens`
            // Ejemplo: $fcmTokens = $user->fcmTokens()->pluck('token')->toArray();
            
            Log::info("--> [Firebase] Preparando notificación para el usuario: {$user->email}");
            Log::info("    Título: {$notificationTitle}");
            Log::info("    Cuerpo: {$notificationBody}");

            /*
            // CÓDIGO FUTURO PARA ENVIAR LA NOTIFICACIÓN
            if (!empty($fcmTokens)) {
                $messaging = app('firebase.messaging');
                $message = CloudMessage::new()
                    ->withNotification(Notification::create($notificationTitle, $notificationBody))
                    ->withData(['ticket_id' => $ticket->id]); // Enviar datos extra
                
                $messaging->sendMulticast($message, $fcmTokens);
            }
            */
        }
    }
}