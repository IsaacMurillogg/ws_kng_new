import React, { useState, Fragment, useMemo, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Popover, Transition } from '@headlessui/react';
import { Toaster, toast } from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import {
    HomeIcon, TruckIcon, TicketIcon, BellAlertIcon, UsersIcon, UserCircleIcon,
    ArrowLeftOnRectangleIcon, FireIcon, XMarkIcon
} from '@heroicons/react/24/solid';

// --- Componentes Auxiliares ---

const KngLogo = ({ className = '' }) => (
    <img src="/img/kng.png" alt="KNG Logo" className={className} />
);

const getNavigationLinks = (user) => {
    const links = [
        { name: 'Dashboard', href: route('dashboard'), icon: HomeIcon, current: route().current('dashboard') },
        { name: 'Unidades', href: route('units.index'), icon: TruckIcon, current: route().current('units.index') },
        { name: 'Tickets', href: route('tickets.index'), icon: TicketIcon, current: route().current('tickets.index') },
        { name: 'Alertas', href: route('alerts.index'), icon: BellAlertIcon, current: route().current('alerts.index') },
    ];

    if (user && user.role === 'admin') {
        links.push({
            name: 'Usuarios',
            href: route('admin.users.index'),
            icon: UsersIcon,
            current: route().current('admin.users.*')
        });
    }
    
    return links;
};

const NotificationToast = ({ t, ticket }) => {
    const handleToastClick = () => {
        router.visit(ticket.url || route('tickets.index'));
        toast.dismiss(t.id);
    };

    return (
        <motion.div
            layout initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5"
        >
            <div className="flex-1 w-0 p-4 cursor-pointer" onClick={handleToastClick}>
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <FireIcon className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-gray-900">Nueva Alerta: {ticket.unit_name}</p>
                        <p className="mt-1 text-sm text-gray-600">{ticket.alert_type}</p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button
                    onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                    className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <XMarkIcon className="h-5 w-5"/>
                </button>
            </div>
        </motion.div>
    );
};

// --- Componentes de Navegación ---

function Sidebar({ expanded, setExpanded }) {
    const { auth } = usePage().props;
    const navigationLinks = useMemo(() => getNavigationLinks(auth.user), [auth.user]);

    return (
        <aside
            className={`hidden md:flex md:flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}
            onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}
            style={{ width: expanded ? '16rem' : '5rem' }}
        >
            <div className="flex flex-col flex-1">
                <div className="flex h-20 items-center justify-center shrink-0 px-4">
                    <KngLogo className={`h-8 w-auto transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`} />
                    <KngLogo className={`h-8 w-8 absolute transition-opacity duration-300 ${!expanded ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                
                <nav className="flex-1 space-y-2 px-4 py-4">
                    {navigationLinks.map((item) => (
                        <Link key={item.name} href={item.href} className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${ item.current ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-600' }`}>
                            <item.icon className="h-6 w-6 shrink-0" />
                            <span className={`ml-4 transition-opacity duration-200 whitespace-nowrap ${!expanded && 'opacity-0'}`}>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="px-4 py-2">
                    <a href="https://wa.me/5216142125211" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg transition-colors duration-200 text-green-500 hover:bg-green-100 hover:text-green-700">
                        <FaWhatsapp className="h-6 w-6 shrink-0" />
                        <span className={`ml-4 transition-opacity duration-200 whitespace-nowrap ${!expanded && 'opacity-0'}`}>Soporte</span>
                    </a>
                </div>
                <div className="mt-auto p-4 border-t border-gray-200">
                    <Popover className="relative">
                        <Popover.Button className="w-full flex items-center p-2 rounded-lg text-left hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500">
                            <span className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold shrink-0">{auth.user.name.charAt(0)}</span>
                            <div className={`ml-3 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-gray-900 ${!expanded && 'opacity-0'}`}>
                                <p className="text-sm font-semibold">{auth.user.name}</p>
                                <p className="text-xs text-gray-500">Ver Opciones</p>
                            </div>
                        </Popover.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Popover.Panel className="absolute bottom-full left-0 mb-3 w-56 z-10">
                                <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                                    <div className="p-2 text-gray-800">
                                        <Link href={route('profile.edit')} className="flex items-center p-3 text-sm rounded-md hover:bg-gray-100"><UserCircleIcon className="w-5 h-5 mr-3 text-gray-500"/> Perfil</Link>
                                        <Link href={route('logout')} method="post" as="button" className="w-full flex items-center p-3 text-sm rounded-md hover:bg-gray-100"><ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500"/> Cerrar Sesión</Link>
                                    </div>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </Popover>
                </div>
            </div>
        </aside>
    );
}

function FloatingPillMenu() {
    const { auth } = usePage().props;
    const navigationLinks = useMemo(() => getNavigationLinks(auth.user), [auth.user]);
    return (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-50">
            <div className="w-full max-w-md mx-auto h-16 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-between px-3">
                <div className="flex items-center gap-x-1">
                    {navigationLinks.map((item) => (
                        <Link key={item.name} href={item.href} title={item.name} className={`relative flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors ${ item.current ? 'bg-blue-100' : '' }`}>
                           <item.icon className={`h-6 w-6 transition-colors ${item.current ? 'text-blue-600' : 'text-gray-500'}`} />
                        </Link>
                    ))}
                </div>
                <Popover className="relative">
                    <Popover.Button className="w-12 h-12 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500">
                        <span className="w-10 h-10 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center font-bold text-gray-700">{auth.user.name.charAt(0)}</span>
                    </Popover.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                        <Popover.Panel className="absolute bottom-full right-0 mb-3 w-56">
                            <div className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
                                <div className="p-2">
                                    <Link href={route('profile.edit')} className="flex items-center p-3 text-sm rounded-lg hover:bg-gray-100"><UserCircleIcon className="w-5 h-5 mr-3 text-gray-500"/> Perfil</Link>
                                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center p-3 text-sm rounded-lg hover:bg-gray-100"><ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500"/> Cerrar Sesión</Link>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </Popover>
            </div>
        </div>
    );
}

// --- Componente Principal del Layout ---

export default function AuthenticatedLayout({ children }) {
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const { auth } = usePage().props;
    const lastProcessedTicketId = useRef(null);

    useEffect(() => {
        // Pre-carga del sonido de notificación
        const notificationAudio = new Audio('/sounds/notification.mp3');
        notificationAudio.preload = 'auto';

        // Definición de canales y nombre del evento
        const userChannel = `user-${auth.user.id}-alerts`;
        const adminChannel = 'admin-alerts';
        const eventName = 'ticket.created';
        
        const handleTicketCreated = (payload) => {
            const { ticket } = payload;
            
            // Evita procesar el mismo ticket dos veces (si se recibe en ambos canales)
            if (!ticket || lastProcessedTicketId.current === ticket.id) {
                return;
            }
            lastProcessedTicketId.current = ticket.id;

            // Reproduce sonido
            notificationAudio.play().catch(e => console.error("Error al reproducir sonido:", e));

            // Muestra notificación toast
            toast.custom(
                (t) => (<NotificationToast t={t} ticket={ticket} />), 
                {
                  id: `ticket-${ticket.id}`,
                  duration: 10000, 
                  position: 'top-right' 
                }
            );
            
            // Si estamos en la página de tickets, recarga los datos
            if (route().current('tickets.index')) {
                router.reload({ only: ['tickets'], preserveScroll: true });
            }
        };
        
        // Suscripción a los canales de Laravel Echo
        const userSubscription = window.Echo.private(userChannel).listen(eventName, handleTicketCreated);
        let adminSubscription = null;

        if (auth.user.role === 'admin') {
            adminSubscription = window.Echo.private(adminChannel).listen(eventName, handleTicketCreated);
        }
        
        // Limpieza al desmontar el componente
        return () => {
            userSubscription.stopListening(eventName);
            window.Echo.leave(userChannel);
            if (adminSubscription) {
                adminSubscription.stopListening(eventName);
                window.Echo.leave(adminChannel);
            }
        };
    }, [auth.user.id, auth.user.role]); 

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster />
            <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{children}</main>
            </div>
            <FloatingPillMenu />
        </div>
    );
}