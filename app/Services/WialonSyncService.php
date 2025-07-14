<?php

namespace App\Services;

use App\Models\Unit;
use App\Utils\WialonRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Throwable;

class WialonSyncService
{
    private const OFFLINE_THRESHOLD_MINUTES = 15;

    protected $description = 'Sincroniza las unidades desde Wialon con la base de datos local';


    public function syncUnits(): array
    {
        $result = ['created' => 0, 'updated' => 0, 'failed' => 0, 'no_change' => 0, 'message' => ''];

        try {
            $session = $this->attemptApiCall(function() {
                return WialonRequest::login();
            });
            $sessionId = $session['eid'] ?? null;

            if (empty($sessionId)) {
                throw new \Exception('Error al iniciar sesión en Wialon: No se obtuvo ID de sesión después de 3 intentos.');
            }

            $wialonUnits = $this->attemptApiCall(function() use ($sessionId) {
                return WialonRequest::getUnitsData($sessionId);
            });

            if (empty($wialonUnits)) {
                $result['message'] = 'No se encontraron unidades en Wialon para sincronizar.';
                return $result;
            }

            DB::beginTransaction();

            foreach ($wialonUnits as $wialonUnitData) {
                try {
                    $wialonId = $wialonUnitData['id'] ?? null;
                    if (!$wialonId) {
                        $result['failed']++;
                        continue;
                    }

                    $processedData = $this->processWialonUnitData($wialonUnitData);
                    $updatedUnit = Unit::updateOrCreate(['wialon_id' => $wialonId], $processedData);

                    if ($updatedUnit->wasRecentlyCreated) $result['created']++;
                    elseif ($updatedUnit->wasChanged()) $result['updated']++;
                    else $result['no_change']++;

                } catch (Throwable $eUnit) {
                    Log::channel('daily')->error("Error procesando unidad Wialon ID: {$wialonId}", ['error' => $eUnit->getMessage(), 'trace' => $eUnit->getTraceAsString()]);
                    $result['failed']++;
                }
            }

            DB::commit();
            $result['message'] = 'Sincronización completada.';

        } catch (Throwable $e) {
            if (DB::transactionLevel() > 0) DB::rollBack();
            $result['message'] = 'Error GRAVE durante la sincronización: ' . $e->getMessage();
            Log::channel('daily')->critical("Error CRÍTICO en WialonSyncService", ['exception' => $e]);
        }

        return $result;
    }

    private function processWialonUnitData(array $wialonUnit): array
    {
        $lastMessage = $wialonUnit['last_message_data'] ?? null;
        $position = $lastMessage['pos'] ?? null;
        $params = $lastMessage['p'] ?? [];
        $rawData = $wialonUnit['raw_data'] ?? [];
    
        $speed = $position['s'] ?? 0;
        $lastReportTimestamp = $lastMessage['t'] ?? 0;
        $lastReportAt = $lastReportTimestamp > 0 ? Carbon::createFromTimestamp($lastReportTimestamp) : null;
        $status = $this->determineStatus($speed, $lastReportAt);
    
        $odometer = $rawData['cnm_km'] ?? $params['mileage'] ?? $params['odometer'] ?? null;
        $ignParam = $params['io_1'] ?? $this->getParameterValue($params, 'ign');
    
        $data = [
            'wialon_id' => $wialonUnit['id'] ?? null,
            'name' => $wialonUnit['name'],
            'imei' => $wialonUnit['imei'],
            'unit' => $wialonUnit['unit_type'],
            'plates' => $wialonUnit['plates'],
            'phone_number' => $wialonUnit['phone_number'] ?? $wialonUnit['ph'] ?? null,
            'status' => $status,
            'latitude' => $position['y'] ?? null,
            'longitude' => $position['x'] ?? null,
            'altitude' => $position['z'] ?? null,
            'orientation' => $position['c'] ?? null,
            'speed' => $speed,
            'last_message' => $lastReportAt,
            'gps_signal' => $position['sc'] ?? null,
            'main_battery' => $this->getParameterValue($params, 'pwr_ext'),
            'backup_battery' => $this->getParameterValue($params, 'pwr_int'),
            'odometer' => $odometer,
            'engine_status' => isset($ignParam) ? (bool)$ignParam : false,
            'panic_button' => isset($params['io_9']) ? (bool)$params['io_9'] : false,
            'gsm_quality' => $params['gsm'] ?? null,
            'engine_lockup' => isset($params['io_179']) ? (bool)$params['io_179'] : false,
        ];
    
        return Arr::only($data, (new Unit)->getFillable());
    }

    private function getParameterValue(array $params, string $name, $default = null): mixed
    {
        if (empty($params)) {
            return $default;
        }

        if (isset($params[$name])) {
            return is_array($params[$name]) && isset($params[$name]['v']) ? $params[$name]['v'] : $params[$name];
        }

        foreach ($params as $param) {
            if (is_array($param) && isset($param['n']) && $param['n'] === $name) {
                return $param['v'] ?? $default;
            }
        }

        return $default;
    }

    private function determineStatus(int $speed, ?Carbon $lastReportAt): string
    {
        if ($speed > 0) return 'En movimiento';
        if ($lastReportAt && $lastReportAt->diffInMinutes(now()) <= self::OFFLINE_THRESHOLD_MINUTES) return 'En línea';
        return 'Sin conexión';
    }

    private function attemptApiCall(callable $callback, int $maxAttempts = 3, int $delay = 2): mixed
    {
        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $callback();
            } catch (Throwable $e) {
                Log::warning("Intento de llamada a la API #{$attempt}/{$maxAttempts} falló.", ['error' => $e->getMessage()]);
                if ($attempt === $maxAttempts) throw $e;
                sleep($delay);
            }
        }
        throw new \Exception("La llamada a la API falló después de {$maxAttempts} intentos.");
    }
}
