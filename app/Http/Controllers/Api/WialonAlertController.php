<?php

namespace App\Http\Controllers\Api;

use App\Events\AlertReceived;
use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; 
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WialonAlertController extends Controller
{
    public function handle(Request $request)
    {
        Log::info('Wialon alert received:', $request->all());

        $validator = Validator::make($request->all(), [
            'unit_id' => 'required|integer',
            'alert_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::warning('Invalid Wialon alert data:', $validator->errors()->toArray());
            return response()->json(['status' => 'error', 'message' => 'Invalid data'], 400);
        }

        $cacheKey = 'alert_throttle:' . $request->input('unit_id') . ':' . md5($request->input('alert_name'));

        if (Cache::has($cacheKey)) {
            Log::info("Throttled alert for unit_id: {$request->input('unit_id')}. Ignoring.");
            return response()->json(['status' => 'ok', 'message' => 'Alert ignored due to throttling']);
        }
        
        
        $unit = Unit::where('wialon_id', $request->input('unit_id'))->first();

        if (!$unit) {
            Log::warning('Received alert for unknown Wialon unit_id:', ['wialon_id' => $request->input('unit_id')]);
            return response()->json(['status' => 'ok', 'message' => 'Unit not tracked']);
        }

        try {
            Cache::put($cacheKey, true, 10);

            $alert = $unit->alerts()->create([
                'type' => $request->input('alert_name'),
                'payload' => $request->all(),
                'timestamp' => $request->has('t') ? date('Y-m-d H:i:s', $request->input('t')) : now(),
            ]);

            event(new AlertReceived($alert));

            return response()->json(['status' => 'ok', 'message' => 'Alert processed']);

        } catch (\Exception $e) {
            Log::error('Failed to create alert in database', ['error' => $e->getMessage(), 'data' => $request->all()]);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}