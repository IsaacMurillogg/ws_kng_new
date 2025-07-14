import React, { useMemo, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    FireIcon, ClockIcon, CheckCircleIcon, XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';

// --- SUB-COMPONENTE: Tarjeta de Ticket ---
const TicketCard = ({ ticket, onSelect }) => {
    const priorityConfig = {
        'Alta': { color: 'bg-red-100 text-red-700', icon: FireIcon },
        'Media': { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
        'Baja': { color: 'bg-blue-100 text-blue-700', icon: CheckCircleIcon },
    };
    const currentPriority = priorityConfig[ticket.priority] || priorityConfig['Baja'];

    return (
        <motion.div
            layout="position" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-200/80 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            onClick={() => onSelect(ticket.id)}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentPriority.color} flex items-center`}>
                    <currentPriority.icon className="h-4 w-4 mr-1.5" />
                    {ticket.priority}
                </span>
                <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-1 truncate">{ticket.title}</h4>
            <div className="text-right text-xs text-gray-500 pt-3 mt-3 border-t border-gray-100">
                <span>Unidad: <span className="font-semibold text-gray-700">{ticket.unit}</span></span>
            </div>
        </motion.div>
    );
};

// --- SUB-COMPONENTE: Pestañas de Filtro ---
const TicketTabs = ({ tabs, activeTab, setActiveTab }) => (
    <div className="bg-gray-200/70 p-1 rounded-full flex items-center">
        {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-4 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>
                {activeTab === tab.id && ( <motion.div layoutId="active-tab-indicator" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: 'spring', stiffness: 300, damping: 25 }}/> )}
                <div className="relative z-10"><tab.icon className={`h-5 w-5 ${tab.color}`} /></div>
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            </button>
        ))}
    </div>
);

// --- SUB-COMPONENTE: Modal de Detalles y Comentarios ---
const TicketDetailModal = ({ ticketDetails, onClose, onCommentAdded }) => {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    const submitComment = (e) => {
        e.preventDefault();
        post(route('tickets.responses.store', ticketDetails.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                onCommentAdded();
            },
        });
    };

    return (
        <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 40 }} onClick={(e) => e.stopPropagation()}>
                <header className="p-5 border-b border-gray-200 flex justify-between items-start flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{ticketDetails.alert.type}</h2>
                        <p className="text-sm text-gray-500">Ticket #{ticketDetails.id} para la unidad <span className="font-semibold">{ticketDetails.alert.unit.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors"><XMarkIcon className="h-6 w-6" /></button>
                </header>

                <main className="flex-grow p-5 overflow-y-auto space-y-4 bg-gray-50">
                    {ticketDetails.responses && ticketDetails.responses.length > 0 ? (
                        ticketDetails.responses.map(response => (
                            <div key={response.id} className={`flex gap-3 ${response.user_id === auth.user.id ? 'flex-row-reverse' : ''}`}>
                                <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0"/>
                                <div className={`w-fit max-w-md p-3 rounded-xl ${response.user_id === auth.user.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    <p className="font-bold text-sm">{response.user.name}</p>
                                    <p className="text-base break-words">{response.message}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(response.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400"><ChatBubbleBottomCenterTextIcon className="h-12 w-12 mx-auto mb-2"/><p>Aún no hay respuestas.</p><p className="text-sm">Sé el primero en añadir un comentario.</p></div>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <form onSubmit={submitComment} className="flex items-center gap-3">
                        <input type="text" value={data.message} onChange={e => setData('message', e.target.value)} placeholder="Escribe tu respuesta..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" disabled={processing}/>
                        <button type="submit" className="p-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors" disabled={processing}><PaperAirplaneIcon className="h-5 w-5"/></button>
                    </form>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </footer>
            </motion.div>
        </motion.div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA (ORQUESTADOR) ---
export default function Tickets({ auth, tickets: initialTicketsData }) {
    const [allTickets, setAllTickets] = useState(initialTicketsData || []);
    const [activeStatus, setActiveStatus] = useState('Abierto');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [ticketDetails, setTicketDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { props } = usePage();
    useEffect(() => { setAllTickets(props.tickets || []); }, [props.tickets]);

    const fetchTicketDetails = async (ticketId) => {
        if (!ticketId) return;
        setIsLoading(true);
        setSelectedTicketId(ticketId);
        try {
            const numericId = ticketId.replace('TKT-', '').replace(/^0+/, '');
            const response = await axios.get(route('tickets.show', numericId));
            setTicketDetails(response.data);
        } catch (error) {
            console.error("Error al cargar detalles del ticket:", error);
            setSelectedTicketId(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const TABS = [
        { id: 'Abierto', label: 'Nuevas', icon: FireIcon, color: 'text-red-500' },
        { id: 'En Proceso', label: 'En Atención', icon: ClockIcon, color: 'text-yellow-600' },
        { id: 'Resuelto', label: 'Resueltas', icon: CheckCircleIcon, color: 'text-green-500' },
    ];

    const filteredTickets = useMemo(() => allTickets.filter((t) => t.status === activeStatus), [activeStatus, allTickets]);
    const listContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Centro de Alertas" />

            <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <div><h1 className="text-3xl font-bold text-gray-900">Centro de Alertas</h1><p className="text-gray-600 mt-1">Gestiona las alertas generadas automáticamente.</p></div>
                </header>

                <div className="mb-8 flex justify-center"><TicketTabs tabs={TABS} activeTab={activeStatus} setActiveTab={setActiveStatus} /></div>

                <motion.div key={activeStatus} variants={listContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredTickets.map((ticket) => ( <TicketCard key={ticket.id} ticket={ticket} onSelect={fetchTicketDetails} /> ))}
                </motion.div>

                <AnimatePresence>
                    {filteredTickets.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500">
                            <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" /><p className="font-medium">Todo en orden por aquí.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            <AnimatePresence>
                {ticketDetails && (
                    <TicketDetailModal
                        ticketDetails={ticketDetails}
                        onClose={() => setTicketDetails(null)}
                        onCommentAdded={() => fetchTicketDetails(selectedTicketId)}
                    />
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}