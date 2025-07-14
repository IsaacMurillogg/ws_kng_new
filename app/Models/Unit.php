<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany; 
use Illuminate\Support\Carbon; 
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'units';

    protected $fillable = [
        'wialon_id',
        'name',
        'imei',
        'unit',
        'status',
        'latitude',
        'longitude',
        'plates',
        'phone_number',
        'altitude',
        'main_battery',
        'backup_battery',
        'speed',
        'panic_button',
        'gsm_quality',
        'engine_status',
        'orientation',
        'odometer',
        'gps_signal',
        'engine_lockup',
        'last_message',
    ];

    protected $casts = [
        'wialon_id' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'altitude' => 'integer',
        'main_battery' => 'float',
        'backup_battery' => 'float',
        'speed' => 'integer',
        'panic_button' => 'boolean',
        'gsm_quality' => 'integer',
        'engine_status' => 'boolean',
        'orientation' => 'integer',
        'odometer' => 'integer',
        'gps_signal' => 'integer',
        'engine_lockup' => 'boolean',
        'last_message' => 'datetime',
        'phone_number' => 'string',
    ];

    private const OFFLINE_THRESHOLD_MINUTES = 15;

    protected function status(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($this->speed > 0) {
                    return 'En Movimiento';
                }
                if ($this->last_message && $this->last_message->diffInMinutes(now()) <= self::OFFLINE_THRESHOLD_MINUTES) {
                    return 'En Línea';
                }
                return 'Sin Conexión';
            }
        );
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function alerts(): HasMany 
    {
        return $this->hasMany(Alert::class);
    }
}
