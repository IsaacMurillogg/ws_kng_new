<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
class ClearCache extends Command
{
    protected $signature = 'app:clearcache'; 

    protected $description = 'Limpia todas las cachés relevantes de la aplicación (config, route, view, cache, events, compiled)';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Iniciando limpieza de cachés...');

        $this->line('Limpiando caché de configuración...');
        Artisan::call('config:clear');
        $this->info('Caché de configuración limpiada.');

        $this->line('Limpiando caché de rutas...');
        Artisan::call('route:clear');
        $this->info('Caché de rutas limpiada.');

        $this->line('Limpiando caché de vistas...');
        Artisan::call('view:clear');
        $this->info('Caché de vistas limpiada.');

        $this->line('Limpiando caché de aplicación...');
        Artisan::call('cache:clear');
        $this->info('Caché de aplicación limpiada.');

        if (method_exists(\Illuminate\Foundation\Application::class, 'getCachedEventsPath')) {
            $this->line('Limpiando caché de eventos...');
            Artisan::call('event:clear');
            $this->info('Caché de eventos limpiada.');
        }

        $this->line('Limpiando archivos compilados...');
        Artisan::call('clear-compiled');
        $this->info('Archivos compilados limpiados.');

        $this->info('¡Todas las cachés relevantes han sido limpiadas!');

        return 0;
    }
}