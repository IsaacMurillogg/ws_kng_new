import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Alert,
    keyframes
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// --- ANIMACIONES DEFINIDAS CON KEYFRAMES ---
const gradientAnimation = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translate3d(0, 40px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
`;

// --- COMPONENTE DE LAYOUT REUTILIZABLE ---
const GuestLayout = ({ children }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(-45deg, #e0eafc, #cfdef3, #eef2f7, #d8e1e8)',
            backgroundSize: '400% 400%',
            animation: `${gradientAnimation} 15s ease infinite`,
            p: { xs: 2, sm: 3 },
            overflow: 'hidden',
        }}
    >
        {children}
    </Box>
);

// --- COMPONENTE PRINCIPAL DE LOGIN ---
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset('password');
    }, [reset]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />
            
            <Paper
                elevation={0}
                sx={{
                    padding: { xs: 3, sm: 4, md: 5 },
                    width: '100%',
                    maxWidth: '420px',
                    borderRadius: '24px', // Más redondeado
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(209, 213, 219, 0.5)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                    animation: `${fadeInUp} 0.8s ease-out forwards`,
                }}
            >
                {/* Contenedor animado para los elementos internos */}
                <Box sx={{
                    opacity: 0,
                    animation: `${fadeInUp} 0.8s 0.2s ease-out forwards`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Box component="img" src="/img/kng.png" alt="Logo KNG" sx={{ width: 80, height: 80, mb: 2 }} />

                    <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
                        Ingresa para acceder a tu dashboard.
                    </Typography>

                    {status && (
                        <Alert severity="success" sx={{ width: '100%', mb: 2, borderRadius: '12px' }}>
                            {status}
                        </Alert>
                    )}
                    {errors.email && !status && (
                        <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2, borderRadius: '12px' }}>
                            {errors.email}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={submit} noValidate sx={{ width: '100%', mt: 1 }}>
                        <TextField
                            variant="filled"
                            hiddenLabel
                            placeholder="Correo Electrónico"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={!!errors.email && !status}
                            sx={{
                                '& .MuiFilledInput-root': { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.04)' },
                                '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': { borderBottom: 'none' },
                            }}
                        />
                        <TextField
                            variant="filled"
                            hiddenLabel
                            placeholder="Contraseña"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            sx={{
                                '& .MuiFilledInput-root': { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.04)' },
                                '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': { borderBottom: 'none' },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                            <FormControlLabel
                                control={<Checkbox color="primary" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />}
                                label={<Typography variant="body2">Recuérdame</Typography>}
                            />
                            {/* Si habilitas el reseteo de contraseña, puedes usar este enlace */}
                            {/* <Link href={route('password.request')} variant="body2">¿Olvidaste tu contraseña?</Link> */}
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={processing}
                            sx={{
                                py: '14px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: '16px',
                                textTransform: 'none',
                                color: '#ffffff',
                                background: 'linear-gradient(45deg, #642869 30%, #8A3B90 90%)',
                                boxShadow: '0 4px 20px 0 rgba(100, 40, 105, 0.35)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 6px 25px 0 rgba(100, 40, 105, 0.45)',
                                    transform: 'translateY(-2px)',
                                },
                                '&.Mui-disabled': {
                                    background: 'rgba(0, 0, 0, 0.12)',
                                    boxShadow: 'none',
                                    color: 'rgba(0, 0, 0, 0.26)',
                                },
                            }}
                        >
                            {processing ? 'Verificando...' : 'Iniciar Sesión'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 5, opacity: 0, animation: `${fadeInUp} 1s 0.6s ease-out forwards` }}>
                Plataforma KNG © {new Date().getFullYear()}
            </Typography>
        </GuestLayout>
    );
}