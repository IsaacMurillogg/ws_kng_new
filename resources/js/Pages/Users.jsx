import React, { useMemo, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlusIcon, MagnifyingGlassIcon, TrashIcon, XMarkIcon, 
    ShieldCheckIcon, UsersIcon, CheckIcon, ArrowPathIcon, ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';


const StatusDot = ({ lastLogin }) => {
    const isActive = useMemo(() => {
        if (!lastLogin) return false;
        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const diffDays = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
        return diffDays < 30;
    }, [lastLogin]);

    const statusColor = isActive ? 'bg-green-500' : 'bg-gray-400';
    const statusLabel = isActive ? 'Activo' : 'Inactivo';

    return (
        <span className="flex items-center gap-1.5" title={isActive ? `Última vez activo: ${new Date(lastLogin).toLocaleDateString()}` : 'Sin actividad reciente'}>
            <span className={`h-2 w-2 rounded-full ${statusColor}`}></span>
            <span className="text-xs text-gray-500">{statusLabel}</span>
        </span>
    );
};

const UserCard = ({ user, onSelect, isSelected }) => {
    const isAdmin = user.role === 'admin';
    const cardColor = isSelected 
        ? 'bg-blue-50 border-blue-500 scale-[1.02] shadow-lg' 
        : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/50';

    return (
        <motion.div
            layoutId={`user-card-${user.id}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={() => onSelect(user)}
            role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(user)}
            aria-label={`Ver detalles de ${user.name}`}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${cardColor}`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative">
                        <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        {isAdmin && <ShieldCheckIcon className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-600 bg-white rounded-full p-0.5 shadow-md" title="Administrador"/>}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Unidades</p>
                    <p className="font-bold text-lg text-blue-600">{user.assignedUnits.length}</p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
                <StatusDot lastLogin={user.lastLogin} />
            </div>
        </motion.div>
    );
};

const UserDetailPane = ({ user, allUnits, onClose, onSave, onDelete, formHook }) => {
    const { data, setData, errors, processing } = formHook;
    const [activeTab, setActiveTab] = useState('details');
    const [unitSearch, setUnitSearch] = useState('');

    const handleUnitToggle = (unitId) => {
        const currentUnits = data.assignedUnits || [];
        const newUnits = currentUnits.includes(unitId)
            ? currentUnits.filter(id => id !== unitId)
            : [...currentUnits, unitId];
        setData('assignedUnits', newUnits);
    };

    const filteredUnits = useMemo(() => {
        if (!unitSearch) return allUnits;
        return allUnits.filter(u => u.name.toLowerCase().includes(unitSearch.toLowerCase()));
    }, [allUnits, unitSearch]);

    return (
        <motion.form
            onSubmit={onSave}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            className="fixed inset-0 z-40 bg-gray-50 flex flex-col shadow-2xl md:relative md:inset-auto md:h-full md:rounded-2xl md:shadow-lg md:border md:border-gray-200"
        >
            <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white md:rounded-t-2xl">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{data.id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                    {data.id && <p className="text-sm text-gray-600 truncate">{user.name}</p>}
                </div>
                <button type="button" onClick={onClose} aria-label="Cerrar panel" className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="h-6 w-6" /></button>
            </header>
            
            <div className="border-b border-gray-200 bg-white">
                <nav className="flex gap-4 px-4 -mb-px">
                    <button type="button" onClick={() => setActiveTab('details')} className={`py-3 px-2 font-semibold text-sm transition-all ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Detalles</button>
                    <button type="button" onClick={() => setActiveTab('units')} className={`py-3 px-2 font-semibold text-sm transition-all ${activeTab === 'units' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Unidades</button>
                </nav>
            </div>

            <main className="flex-grow overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div><label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">Nombre Completo</label><input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
                                <div><label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Correo Electrónico</label><input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                                <div><label htmlFor="role" className="text-sm font-medium text-gray-700 block mb-1">Rol</label><select id="role" value={data.role} onChange={e => setData('role', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="user">Usuario</option><option value="admin">Administrador</option></select>{errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}</div>
                                <div className="border-t pt-4 space-y-4">
                                    <p className="text-sm font-medium text-gray-600">{data.id ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}</p>
                                    <div><label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label><input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>{errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}</div>
                                    <div><label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 block mb-1">Confirmar Contraseña</label><input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg"/></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'units' && (
                            <div>
                                <input type="text" placeholder="Buscar unidad..." value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mb-4"/>
                                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {filteredUnits.length > 0 ? filteredUnits.map(unit => (
                                        <div key={unit.id} onClick={() => handleUnitToggle(unit.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${data.assignedUnits.includes(unit.id) ? 'bg-blue-50 border-blue-400 font-semibold' : 'border-transparent hover:bg-gray-100'}`}>
                                            <div className={`h-5 w-5 flex-shrink-0 rounded-md flex items-center justify-center border-2 ${data.assignedUnits.includes(unit.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>{data.assignedUnits.includes(unit.id) && <CheckIcon className="h-4 w-4 text-white"/>}</div>
                                            <span className="text-gray-800">{unit.name}</span>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-4">No se encontraron unidades.</p>}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="p-4 flex justify-between items-center border-t border-gray-200 bg-white/80 backdrop-blur-sm md:rounded-b-2xl">
                <button type="button" onClick={() => onDelete(user)} disabled={!data.id || processing} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed">
                    <TrashIcon className="h-5 w-5" /> Eliminar
                </button>
                <motion.button type="submit" disabled={processing} className="flex items-center justify-center gap-2 w-32 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait" whileHover={{ scale: processing ? 1 : 1.05 }} whileTap={{ scale: processing ? 1 : 0.95 }}>
                    {processing ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <><CheckIcon className="h-5 w-5"/> Guardar</>}
                </motion.button>
            </footer>
        </motion.form>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                    initial={{ y: 50, scale: 0.9, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 50, scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <ExclamationTriangleIcon className="h-7 w-7 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                        <div className="mt-2 text-sm text-gray-600">{children}</div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-3">
                        <button onClick={onClose} className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-100">Cancelar</button>
                        <motion.button onClick={onConfirm} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Sí, Confirmar</motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);


export default function UsersPageHub({ auth }) {
    const { users: serverUsers, allUnits, flash = {}, errors: pageErrors } = usePage().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showFlash, setShowFlash] = useState(true);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, recentlySuccessful } = useForm({
        id: null, name: '', email: '', role: 'user', password: '', password_confirmation: '', assignedUnits: [],
    });

    useEffect(() => {
        if (selectedUser) {
            setData({ ...selectedUser, password: '', password_confirmation: '' });
        }
    }, [selectedUser]);

    useEffect(() => {
        if (recentlySuccessful) {
            const timer = setTimeout(() => {
                reset();
                if (flash.success) setSelectedUser(null);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    useEffect(() => {
        if (flash.success || flash.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const filteredUsers = useMemo(() => serverUsers.filter(user =>
        (activeFilter === 'Todos' || user.role === activeFilter.toLowerCase()) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [serverUsers, searchTerm, activeFilter]);

    const handleCreate = () => setSelectedUser({ id: null, name: '', email: '', role: 'user', assignedUnits: [] });

    const handleSave = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true };
        if (data.id) {
            put(route('admin.users.update', data.id), options);
        } else {
            post(route('admin.users.store'), options);
        }
    };

    const handleDelete = () => {
        if (!userToDelete) return;
        destroy(route('admin.users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setUserToDelete(null),
        });
    };
    
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestion de Usuarios" />
            <div className="bg-gray-100 min-h-screen">
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Centro de Mando de Usuarios</h1>
                        <p className="text-gray-600 mt-1">Visualiza, filtra y gestiona a todos los miembros de tu equipo.</p>
                    </motion.header>

                    {showFlash && (flash.success || flash.error) && (
                         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-4 rounded-md shadow-md ${flash.success ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
                             {flash.success || flash.error}
                         </motion.div>
                    )}

                    <div className="relative grid grid-cols-1 md:grid-cols-2 md:gap-6 lg:grid-cols-5 lg:gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                                <div className="relative w-full">
                                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                                    <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"/>
                                </div>
                                <motion.button onClick={handleCreate} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <UserPlusIcon className="h-5 w-5"/> Crear Usuario
                                </motion.button>
                            </div>
                            <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4">
                                {['Todos', 'Admin', 'User'].map(filter => (
                                     <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeFilter === filter ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                         {filter === 'Admin' ? 'Admins' : (filter === 'User' ? 'Usuarios' : 'Todos')}
                                     </button>
                                ))}
                            </div>
                            <motion.div layout className="space-y-3 h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <AnimatePresence>
                                    {filteredUsers.length > 0 
                                     ? filteredUsers.map(user => <UserCard key={user.id} user={user} onSelect={setSelectedUser} isSelected={selectedUser?.id === user.id} />)
                                     : <p className="text-center text-gray-500 pt-16">No se encontraron usuarios.</p>
                                    }
                                </AnimatePresence>
                            </motion.div>
                        </div>
                        
                        <div className="hidden md:block lg:col-span-3 relative">
                            <AnimatePresence>
                                {selectedUser && (
                                    <UserDetailPane 
                                        key={selectedUser.id || 'new-user'} 
                                        user={selectedUser} 
                                        allUnits={allUnits} 
                                        onClose={() => setSelectedUser(null)} 
                                        onSave={handleSave} 
                                        onDelete={() => setUserToDelete(selectedUser)}
                                        formHook={{ data, setData, errors, processing }}
                                    />
                                )}
                            </AnimatePresence>
                            {!selectedUser && (
                                <div className="h-full flex flex-col items-center justify-center text-center bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
                                    <UsersIcon className="h-16 w-16 text-gray-400" />
                                    <p className="mt-4 font-semibold text-gray-600">Selecciona un usuario para ver detalles</p>
                                    <p className="text-sm text-gray-500 mt-1">O crea uno nuevo para empezar a gestionar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            
            <div className="block md:hidden">
                <AnimatePresence>
                    {selectedUser && (
                        <>
                           <motion.div 
                                className="fixed inset-0 bg-black/40 z-30"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedUser(null)}
                           />
                           <UserDetailPane 
                               key={selectedUser.id || 'new-user-mobile'} 
                               user={selectedUser} allUnits={allUnits} 
                               onClose={() => setSelectedUser(null)} onSave={handleSave} onDelete={() => setUserToDelete(selectedUser)}
                               formHook={{ data, setData, errors, processing }}
                           />
                        </>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmationModal 
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar Usuario"
            >
                <p>¿Estás seguro de que quieres eliminar a <span className="font-semibold">{userToDelete?.name}</span>? Esta acción es permanente y no se puede deshacer.</p>
            </ConfirmationModal>
        </AuthenticatedLayout>
    );
}