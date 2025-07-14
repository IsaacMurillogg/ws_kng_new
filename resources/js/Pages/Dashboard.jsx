import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    UsersIcon,
    TruckIcon,
    ExclamationTriangleIcon,
    TicketIcon,
    ArrowUpRightIcon,
} from '@heroicons/react/24/outline'; 

const DashboardCard = ({ title, icon: Icon, children, className = '', link = '#' }) => (
    <motion.div
        className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 flex flex-col ${className}`}
        variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
        }}
        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
    >
        <div className="flex items-center justify-between text-gray-500 mb-4">
            <div className="flex items-center">
                <Icon className="h-6 w-6 mr-3" />
                <h2 className="font-semibold text-lg">{title}</h2>
            </div>
            <a href={link} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <ArrowUpRightIcon className="h-5 w-5" />
            </a>
        </div>
        <div className="flex-grow flex flex-col justify-center">
            {children}
        </div>
    </motion.div>
);

const WelcomeUserCard = ({ user }) => (
    <DashboardCard title="Bienvenido" icon={UsersIcon} className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
            <h3 className="text-4xl font-bold text-gray-800">Hola, {user.name.split(' ')[0]}</h3>
            <p className="text-gray-600 mt-2">Aquí tienes un resumen de tu actividad.</p>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
            <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-500">Tickets Activos</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-sm text-gray-500">Alertas Críticas</p>
            </div>
        </div>
    </DashboardCard>
);


const UnitsStatusCard = ({ stats }) => {
    
    const total = stats.moving + stats.online + stats.offline;
    
    const DonutChart = ({ stats, size = 120 }) => {
        const segments = [
            { value: stats.moving, color: 'stroke-blue-500' },
            { value: stats.online, color: 'stroke-green-600' },
            { value: stats.offline, color: 'stroke-red-600' }, 
        ];

        const radius = size / 2 - 10;
        const circumference = 2 * Math.PI * radius;
        let accumulatedPercentage = 0;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size/2} cy={size/2} r={radius} strokeWidth="12" className="stroke-gray-200" fill="transparent" />
                    
                    {segments.map((segment, index) => {
                        if (segment.value === 0) return null;

                        const percentage = total > 0 ? segment.value / total : 0;
                        const offset = circumference - (percentage * circumference);
                        const rotation = accumulatedPercentage * 360;
                        accumulatedPercentage += percentage;

                        return (
                            <motion.circle
                                key={index}
                                cx={size/2}
                                cy={size/2}
                                r={radius}
                                strokeWidth="12"
                                className={segment.color}
                                fill="transparent"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
                                style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{total}</span>
                    <span className="text-xs text-gray-500">Unidades</span>
                </div>
            </div>
        );
    };

    return (
        <DashboardCard title="Estado de Unidades" icon={TruckIcon} className="lg:col-span-2" link={route('units.index')}>
            <div className="flex flex-col sm:flex-row items-center justify-around h-full">
                <DonutChart stats={stats} />
                <div className="space-y-3 mt-4 sm:mt-0">
                    <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-blue-500 mr-3"></span>
                        <div>
                            <p className="font-semibold text-gray-800">{stats.moving} En Movimiento</p>
                            <p className="text-xs text-gray-500">{total > 0 ? ((stats.moving/total)*100).toFixed(0) : 0}% del total</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-green-600 mr-3"></span>
                        <div>
                            <p className="font-semibold text-gray-800">{stats.online} En Línea</p>
                            <p className="text-xs text-gray-500">{total > 0 ? ((stats.online/total)*100).toFixed(0) : 0}% del total</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-red-600 mr-3"></span>
                        <div>
                            <p className="font-semibold text-gray-800">{stats.offline} Sin Conexión</p>
                            <p className="text-xs text-gray-500">{total > 0 ? ((stats.offline/total)*100).toFixed(0) : 0}% del total</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};


const AlertsListCard = () => {
    const alerts = [
        { id: 1, text: 'Exceso de velocidad en Unidad 301', unit: 'KNG-02', time: 'hace 5m', level: 'critica' },
        { id: 2, text: 'Botón de pánico activado', unit: 'TR-1255', time: 'hace 22m', level: 'critica' },
        { id: 3, text: 'Salida de geocerca "Almacén"', unit: 'KNG-08', time: 'hace 1h', level: 'normal' },
    ];
    return (
        <DashboardCard title="Últimas Alertas" icon={ExclamationTriangleIcon} link="/alerts">
            <ul className="space-y-4">
                {alerts.map(alert => (
                    <li key={alert.id} className="flex items-center">
                        <div className={`p-2 rounded-full mr-4 ${alert.level === 'critica' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                           <ExclamationTriangleIcon className={`h-5 w-5 ${alert.level === 'critica' ? 'text-red-600' : 'text-yellow-600'}`}/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{alert.text}</p>
                            <p className="text-xs text-gray-500">{alert.unit} • {alert.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};

const TicketsListCard = () => {
    const tickets = [
        { id: 1, text: 'Falla en sensor de puerta', unit: 'KNG-11', status: 'Abierto' },
        { id: 2, text: 'Mantenimiento preventivo', unit: 'P-04', status: 'En Progreso' },
        { id: 3, text: 'Revisión de frenos', unit: 'KNG-04', status: 'Resuelto' },
    ];
    const statusColor = { 'Abierto': 'bg-red-500', 'En Progreso': 'bg-yellow-500', 'Resuelto': 'bg-green-500' };
    
    return (
        <DashboardCard title="Estado de Tickets" icon={TicketIcon} link="/tickets">
             <ul className="space-y-4">
                {tickets.map(ticket => (
                    <li key={ticket.id} className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800">{ticket.text}</p>
                            <p className="text-xs text-gray-500">{ticket.unit}</p>
                        </div>
                        <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full mr-2 ${statusColor[ticket.status]}`}></span>
                            <span className="text-xs font-semibold text-gray-600">{ticket.status}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};


// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
export default function Dashboard({ auth, unitStats }) {
    
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['unitStats'] });
        }, 30000); 

        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />
            
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <WelcomeUserCard user={auth.user} />
                        <UnitsStatusCard stats={unitStats} />
                        <AlertsListCard />
                        <TicketsListCard />
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}