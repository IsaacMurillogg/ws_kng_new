// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx', 
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'kng-purple': '#642869',
                'kng-green': '#63B32E',
                'whatsapp': '#01C501',
                'whatsapp-dark': '#128c7e',
            }
        },
    },

    plugins: [require('@tailwindcss/forms')],
};
