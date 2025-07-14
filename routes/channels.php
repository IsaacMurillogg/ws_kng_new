<?php
// routes/channels.php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user-{userId}-alerts', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('admin-alerts', function ($user) {
    return $user->role === 'admin';
});