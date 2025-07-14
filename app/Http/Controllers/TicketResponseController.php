<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class TicketResponseController extends Controller
{
    /**
     * Almacena una nueva respuesta para un ticket.
     */
    public function store(Request $request, Ticket $ticket): RedirectResponse
    {
        $request->validate(['message' => 'required|string|min:2|max:1000']);

        $ticket->responses()->create([
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        if ($ticket->status === 'abierto') {
            $ticket->update(['status' => 'en_seguimiento']);
        }

        return back()->with('success', 'Respuesta añadida.');
    }
}