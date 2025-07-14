// resources/js/Layouts/GuestLayout.jsx
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {

    const kngPurpleColor = '#642869';

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center px-4 pt-8 pb-12 sm:px-6 lg:px-8"
            style={{
                background: 'linear-gradient(160deg, #f0f4f8 0%, #dde4ec 100%)', 
       
            }}
        >
            <div className="mb-6 sm:mb-8">
                <Link href="/">
                    <img
                        src="/img/kng.png" 
                        alt="KNG Logo"
                        className="mx-auto h-auto w-28 sm:w-32 transition-all hover:opacity-90"
                    />
                </Link>
            </div>

            <div
                className="w-full max-w-md overflow-hidden rounded-xl shadow-2xl border"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(10px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(180%)', 
                    borderColor: 'rgba(209, 213, 219, 0.3)',
                    borderTopWidth: '4px',
                    borderTopColor: kngPurpleColor,
                }}
                
            >
                <div className="px-6 py-8 sm:px-8 sm:py-10"> 
                    {children}
                </div>
            </div>

            <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} KNG. Todos los derechos reservados.
            </footer>
        </div>
    );
}
