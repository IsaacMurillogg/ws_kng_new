// resources/js/Components/PrimaryButton.jsx
export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-6 py-3 bg-primary border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest
                hover:bg-primary-light focus:bg-primary-light active:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                transition-all ease-in-out duration-300 transform hover:scale-105
                ${disabled && 'opacity-25 cursor-not-allowed'}` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}