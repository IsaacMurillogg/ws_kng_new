<?php

namespace App\Console\Commands;

use App\Services\WialonSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncUnits extends Command
{
    protected $signature = 'wialon:sync-units';
    protected $description = 'Sincroniza las unidades desde Wialon con la base de datos local';

    public function __construct(private WialonSyncService $wialonSyncService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Iniciando sincronización de unidades con Wialon...');

        try {
            $result = $this->wialonSyncService->syncUnits();

            // Mostrar resumen
            $this->info("Unidades creadas: {$result['created']}");
            $this->info("Unidades actualizadas: {$result['updated']}");
            $this->info("Unidades sin cambios: {$result['no_change']}");
            $this->info("Unidades fallidas: {$result['failed']}");
            $this->info("Mensaje: {$result['message']}");

            // Log
            Log::channel('daily')->info('Sincronización Wialon ejecutada', $result);

            if ($result['failed'] > 0 || str_contains(strtolower($result['message']), 'error')) {
                $this->error('Se detectaron errores durante la sincronización.');
                return Command::FAILURE;
            }

            $this->info('Sincronización completada con éxito.');
            return Command::SUCCESS;

        } catch (Throwable $e) {
            $this->error("Se produjo una excepción no controlada: " . $e->getMessage());
            Log::channel('daily')->critical('Excepción en comando SyncUnits', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Command::FAILURE;
        }
    }
}
