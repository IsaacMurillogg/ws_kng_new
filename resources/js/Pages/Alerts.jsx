import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BellAlertIcon,
    MapPinIcon,
    CalendarDaysIcon,
    TruckIcon,
    FunnelIcon,
    ArrowPathIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/solid';

const RECORDS_PER_PAGE = 20;

// --- SUB-COMPONENTE: Panel de Filtros (Dinámico) ---
const FilterPanel = ({ onApply, onClear, initialFilters, userUnits }) => {
    // El estado local de los filtros se inicializa con los filtros que vienen del servidor
    const [filters, setFilters] = useState(initialFilters || { startDate: '', endDate: '', unit: 'all' });

    const handleApply = () => onApply(filters);
    const handleClear = () => {
        const clearedFilters = { startDate: '', endDate: '', unit: 'all' };
        setFilters(clearedFilters);
        onClear(clearedFilters);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-2xl shadow-md border border-gray-200/80 mb-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-end lg:gap-4 space-y-4 lg:space-y-0">
                <div className="flex-grow grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="startDate" className="text-xs font-medium text-gray-500 flex items-center mb-1"><CalendarDaysIcon className="h-4 w-4 mr-1"/>Desde</label>
                        <input id="startDate" type="date" value={filters.startDate || ''} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="text-xs font-medium text-gray-500 flex items-center mb-1"><CalendarDaysIcon className="h-4 w-4 mr-1"/>Hasta</label>
                        <input id="endDate" type="date" value={filters.endDate || ''} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm"/>
                    </div>
                </div>
                <div className="lg:flex-grow">
                    <label htmlFor="unitFilter" className="text-xs font-medium text-gray-500 flex items-center mb-1"><TruckIcon className="h-4 w-4 mr-1"/>Unidad</label>
                    <select id="unitFilter" value={filters.unit || 'all'} onChange={e => setFilters({...filters, unit: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                        <option value="all">Todas las Unidades</option>
                        {userUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={handleClear} className="w-full lg:w-auto flex items-center justify-center gap-2 p-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm"><ArrowPathIcon className="h-4 w-4"/> Limpiar</button>
                    <button onClick={handleApply} className="w-full lg:w-auto flex items-center justify-center gap-2 p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm"><FunnelIcon className="h-4 w-4"/> Filtrar</button>
                </div>
            </div>
        </motion.div>
    );
}

// --- SUB-COMPONENTE: Tarjeta del Timeline ---
const TimelineCard = ({ alert }) => {
    const alertTime = new Date(alert.time);
    const timeString = alertTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 ring-8 ring-gray-50">
                    <BellAlertIcon className="h-5 w-5 text-red-600" />
                </div>
                <div className="w-0.5 h-full bg-gray-200" />
            </div>
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex-grow bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm mb-4"
            >
                <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-800">{alert.unit}</p>
                    <p className="text-xs font-medium text-gray-500">{timeString}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{alert.location}</span>
                </p>
            </motion.div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA (ORQUESTADOR) ---
export default function AlertsPage({ auth, alerts: initialAlerts, filters: initialFilters, userUnits }) {
    // Los datos ahora vienen del backend. Si no llegan, usamos un array vacío.
    const allAlerts = initialAlerts || [];
    
    // El estado del orden y la paginación se maneja localmente en el frontend
    const [sortOrder, setSortOrder] = useState('desc');
    const [visibleCount, setVisibleCount] = useState(RECORDS_PER_PAGE);

    // Los datos se ordenan en el frontend para una respuesta instantánea al cambiar el orden
    const sortedAlerts = useMemo(() => {
        return [...allAlerts].sort((a, b) => {
            const dateA = new Date(a.time).getTime();
            const dateB = new Date(b.time).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [allAlerts, sortOrder]);
    
    // Las alertas se agrupan por fecha para mostrarlas en el timeline
    const groupedAndPaginatedAlerts = useMemo(() => {
        const visibleAlerts = sortedAlerts.slice(0, visibleCount);
        return visibleAlerts.reduce((acc, alert) => {
            const date = new Date(alert.time).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(alert);
            return acc;
        }, {});
    }, [sortedAlerts, visibleCount]);
    
    // Función para formatear las cabeceras de fecha (Hoy, Ayer, etc.)
    const formatDateHeader = (dateStr) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (new Date(dateStr).toDateString() === today.toDateString()) return 'Hoy';
        if (new Date(dateStr).toDateString() === yesterday.toDateString()) return 'Ayer';
        return dateStr;
    };

    // Función que se ejecuta cuando el usuario aplica o limpia los filtros
    const handleFilter = (filters) => {
        router.get(route('alerts.index'), { filters }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        // Reseteamos la paginación al aplicar nuevos filtros
        setVisibleCount(RECORDS_PER_PAGE);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Historial de Alertas" />

            <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto">
                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historial de Alertas</h1>
                            <p className="text-gray-600 mt-1">Línea de tiempo de todos los eventos registrados.</p>
                        </div>
                        <motion.button
                            onClick={() => setSortOrder(current => (current === 'desc' ? 'asc' : 'desc'))}
                            className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium"
                            title={`Ordenar ${sortOrder === 'desc' ? 'ascendente' : 'descendente'}`}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            <ArrowsUpDownIcon className="h-5 w-5 text-gray-600" />
                        </motion.button>
                    </header>
                    
                    {/* El panel de filtros ahora es completamente funcional */}
                    <FilterPanel
                        onApply={handleFilter}
                        onClear={handleFilter}
                        initialFilters={initialFilters}
                        userUnits={userUnits}
                    />

                    {/* El contenedor del timeline */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {Object.keys(groupedAndPaginatedAlerts).map(date => (
                                <motion.div key={date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                                    <h2 className="font-semibold text-gray-500 mb-2 ml-4">{formatDateHeader(date)}</h2>
                                    {groupedAndPaginatedAlerts[date].map((alert) => (
                                        <TimelineCard key={alert.id} alert={alert} />
                                    ))}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Botón para cargar más registros */}
                    {visibleCount < sortedAlerts.length && (
                        <div className="mt-8 text-center">
                            <motion.button 
                                onClick={() => setVisibleCount(c => c + RECORDS_PER_PAGE)} 
                                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-transform" 
                                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                            >
                                Cargar más registros
                            </motion.button>
                        </div>
                    )}
                    
                    {/* Mensaje cuando no hay resultados */}
                    {allAlerts.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <BellAlertIcon className="h-12 w-12 mx-auto text-gray-400 mb-3"/>
                            <p className="font-semibold">No se encontraron alertas</p>
                            <p className="text-sm">Intenta con otros filtros o espera a que se genere una nueva alerta.</p>
                        </div>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}