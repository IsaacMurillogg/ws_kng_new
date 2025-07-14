<?php

namespace App\Utils;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class WialonRequest
{
    public static function login(): ?array
    {
        $token = config('wialon.token');
        $baseUrl = config('wialon.base_url');

        if (!$token) {
            Log::channel('daily')->critical('CRÍTICO: Wialon Token no está configurado en el archivo .env.');
            throw new Exception('Wialon Token no configurado.');
        }

        try {
            $response = Http::asForm()->post($baseUrl . '/wialon/ajax.html', [
                'svc' => 'token/login', 'params' => json_encode(['token' => $token])
            ]);

            $responseData = $response->json();

            if (!$response->successful()) {
                Log::channel('daily')->error('Error HTTP en Login Wialon', ['status' => $response->status(), 'body' => $response->body()]);
                throw new Exception("Error HTTP {$response->status()} al iniciar sesión en Wialon.");
            }

            if (isset($responseData['error'])) {
                Log::channel('daily')->error('Error de API en Login Wialon', ['code' => $responseData['error'], 'reason' => $responseData['reason'] ?? 'N/A']);
                throw new Exception("Fallo al iniciar sesión en Wialon: " . ($responseData['reason'] ?? "Error código {$responseData['error']}"));
            }

            if (!empty($responseData['eid'])) {
                Log::channel('daily')->info('Login en Wialon exitoso. Session ID (eid) obtenido.');
                return ['eid' => $responseData['eid'], 'user' => (object) ($responseData['user'] ?? [])];
            }

            throw new Exception('Login en Wialon exitoso, pero no se obtuvo session ID.');

        } catch (Throwable $ex) {
            Log::channel('daily')->critical('Excepción CRÍTICA durante login Wialon.', ['error' => $ex->getMessage()]);
            throw $ex;
        }
    }

    public static function getUnitsData(string $sessionId): array
    {
        $baseUrl = config('wialon.base_url');
        $data_flags = config('wialon.data_flags', 4294967295);
    
        $paramsForWialon = [
            "spec" => [
                "itemsType" => "avl_unit",
                "propName" => "sys_name",
                "propValueMask" => "*",
                "sortType" => "sys_name"
            ],
            "force" => 1,
            "flags" => $data_flags,
            "from" => 0,
            "to" => 0
        ];
    
        $urlWithJsonFlag = "{$baseUrl}/wialon/ajax.html?flags=1024";
    
        try {
            $response = retry(3, function () use ($urlWithJsonFlag, $paramsForWialon, $sessionId) {
                return Http::timeout(10)
                    ->asForm()
                    ->post($urlWithJsonFlag, [
                        'svc' => 'core/search_items',
                        'params' => json_encode($paramsForWialon),
                        'sid' => $sessionId
                    ]);
            }, 2); 
    
            if (!$response->successful()) {
                Log::channel('daily')->error('Error HTTP al obtener unidades de Wialon.', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new Exception("Error HTTP {$response->status()}");
            }
    
            $data = $response->json();
    
            if (!$data || isset($data['error'])) {
                Log::channel('daily')->error('Error en respuesta de Wialon', [
                    'code' => $data['error'] ?? null,
                    'reason' => $data['reason'] ?? 'Sin razón definida',
                    'body' => $response->body()
                ]);
                throw new Exception('Error en la respuesta de Wialon.');
            }
    
            $items = $data['items'] ?? [];
            Log::channel('daily')->info("Se obtuvieron " . count($items) . " unidades desde Wialon.");
    
            return collect($items)->filter(fn($item) => isset($item['id'], $item['nm']))->map(function ($item) {
                $plates = null;
    
                foreach (['pflds', 'flds'] as $fieldType) {
                    if (isset($item[$fieldType]) && is_array($item[$fieldType])) {
                        foreach ($item[$fieldType] as $field) {
                            if (
                                is_array($field)
                                && isset($field['n'], $field['v'])
                                && strcasecmp(trim($field['n']), 'registration_plate') === 0
                            ) {
                                $plates = trim($field['v']);
                                break 2;
                            }
                        }
                    }
                }
    
                if (!$plates && isset($item['cfl'])) {
                    $plates = trim($item['cfl']);
                }
    
                return [
                    'id' => $item['id'],
                    'name' => $item['nm'],
                    'imei' => $item['uid'] ?? null,
                    'unit_type' => $item['hw'] ?? null,
                    'plates' => $plates,
                    'phone_number' => $item['ph'] ?? $item['ph2'] ?? null,
                    'last_message_data' => $item['lmsg'] ?? null,
                    'raw_data' => $item,
                ];
            })->values()->toArray();
    
        } catch (Throwable $ex) {
            Log::channel('daily')->critical('Excepción crítica al obtener unidades de Wialon.', [
                'message' => $ex->getMessage(),
                'trace' => $ex->getTraceAsString(),
            ]);
            throw $ex;
        }
    }
    
}
