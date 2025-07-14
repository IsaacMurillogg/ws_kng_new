import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClockIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    TruckIcon,
    PhoneIcon,
    MapPinIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const AnimatedStatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
        className={`overflow-hidden rounded-xl p-4 shadow-lg text-white ${color}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
    >
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-white/90">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <Icon className="h-10 w-10 text-white/70" />
        </div>
    </motion.div>
);

const UnitCard = ({ unit, onClick }) => {
    const statusConfig = {
        'En Movimiento': { text: 'En Movimiento', color: 'text-blue-600', dot: 'bg-blue-500' },
        'En Línea': { text: 'En Línea', color: 'text-green-600', dot: 'bg-green-500' },
        'Sin Conexión': { text: 'Sin Conexión', color: 'text-gray-500', dot: 'bg-gray-400' },
    };
    const currentStatus = statusConfig[unit.status] || statusConfig['Sin Conexión'];
    const isMoving = unit.status === 'En Movimiento';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-200 cursor-pointer group"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(unit)}
        >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <p className="text-lg font-bold text-gray-800 truncate">{unit.name}</p>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${currentStatus.dot} ${isMoving ? 'animate-pulse' : ''}`}></div>
                    <span className={`text-sm font-semibold ${currentStatus.color}`}>{currentStatus.text}</span>
                </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Último reporte: <span className="font-medium text-gray-800">{unit.lastReport || 'N/A'}</span></span>
                </div>
                {unit.phone && (
                    <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${unit.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            {unit.phone}
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function Units({ auth, units: unitsProp, stats: statsProp, filters }) { 
    const { data: units, links: paginationLinks } = unitsProp;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedUnit, setSelectedUnit] = useState(null);

    useEffect(() => {

        if (searchTerm !== (filters.search || '')) {
            const debounce = setTimeout(() => {
                router.get(
                    route('units.index'),
                    { search: searchTerm },
                    { 
                        preserveState: true, 
                        preserveScroll: true, 
                        replace: true 
                    }
                );
            }, 300);
            
            return () => clearTimeout(debounce);
        }
    }, [searchTerm, filters.search]);;

    const handleViewOnMap = () => {
        if (selectedUnit && selectedUnit.latitude && selectedUnit.longitude) {
            const url = `https://www.google.com/maps?q=${selectedUnit.latitude},${selectedUnit.longitude}`;
            window.open(url, '_blank');
        } else {
            alert('Ubicación no disponible para esta unidad.');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Unidades" />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estado de la Flota</h1>
                        <p className="text-gray-600 mt-1">Resumen en tiempo real del estado de tus unidades.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
                        <AnimatedStatCard title="Total Unidades" value={statsProp.total} icon={TruckIcon} color="bg-gradient-to-br from-gray-700 to-gray-800" delay={0.1} />
                        <AnimatedStatCard title="En Movimiento" value={statsProp.moving} icon={TruckIcon} color="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.2} />
                        <AnimatedStatCard title="En Línea" value={statsProp.online} icon={CheckCircleIcon} color="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
                        <AnimatedStatCard title="Sin Conexión" value={statsProp.offline} icon={ExclamationTriangleIcon} color="bg-gradient-to-br from-red-500 to-red-600" delay={0.4} />
                    </div>

                    <motion.div className="mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, placa..."
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </motion.div>
                    
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {units.map((unit) => (
                                <UnitCard
                                    key={unit.id}
                                    unit={unit}
                                    onClick={setSelectedUnit}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                     
                    {units.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm mt-6"
                        >
                            <p className="text-lg font-medium">No se encontraron unidades.</p>
                            <p>Intenta con otro término de búsqueda.</p>
                        </motion.div>
                    )}

                    {/* SECCIÓN DE PAGINACIÓN CORREGIDA */}
                    {paginationLinks.length > 3 && (
                        <div className="mt-8 flex justify-center flex-wrap gap-2">
                            {paginationLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || ''}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                        link.active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`} // <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}

                    <AnimatePresence>
                        {selectedUnit && (
                            <motion.div
                                className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUnit(null)}
                            >
                                <motion.div
                                    className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
                                    initial={{ y: 50, scale: 0.9, opacity: 0 }}
                                    animate={{ y: 0, scale: 1, opacity: 1 }}
                                    exit={{ y: 50, scale: 0.9, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedUnit.name}</h2>
                                        <button onClick={() => setSelectedUnit(null)} className="text-gray-400 hover:text-gray-600">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="space-y-4 text-md">
                                        <p className="flex items-center"><CheckCircleIcon className="h-5 w-5 mr-3 text-gray-500"/><strong>Estado:</strong><span className="ml-2">{selectedUnit.status}</span></p>
                                        <p className="flex items-center"><PhoneIcon className="h-5 w-5 mr-3 text-gray-500"/><strong>Teléfono:</strong><span className="ml-2">{selectedUnit.phone ? <a href={`tel:${selectedUnit.phone}`} className="text-blue-600 hover:underline">{selectedUnit.phone}</a> : 'N/A'}</span></p>
                                        <p className="flex items-center"><ClockIcon className="h-5 w-5 mr-3 text-gray-500"/><strong>Último Reporte:</strong><span className="ml-2">{selectedUnit.lastReport || 'N/A'}</span></p>
                                    </div>
                                    <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                                        <motion.button 
                                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center" 
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }} 
                                            onClick={handleViewOnMap}
                                        >
                                            <MapPinIcon className="h-5 w-5 mr-2" />
                                            Ver en Mapa
                                        </motion.button>
                                        <motion.button className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedUnit(null)}>
                                            Cerrar
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}