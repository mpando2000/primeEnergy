import { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Admin Login" />
            
            <div className="min-h-screen flex overflow-hidden">
                {/* Left Section - Branding */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-dark to-primary flex-col items-center justify-center p-10 relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_60%)]"></div>
                    
                    <div className="text-center text-white relative z-10 animate-slide-from-left">
                        <img 
                            src="/prime-logo.png" 
                            alt="PrimeVolt Electric Logo" 
                            className="w-48 h-48 mx-auto mb-8 rounded-2xl shadow-2xl object-contain bg-white p-4"
                        />
                        <h1 className="text-3xl font-bold mb-3 tracking-wider">PrimeVolt ELECTRIC</h1>
                        <p className="text-lg opacity-90 mb-8">Admin Panel</p>
                        <p className="text-sm opacity-70 max-w-xs mx-auto leading-relaxed">
                            Your trusted partner for electrical solutions, HVAC systems, and renewable energy in Tanzania.
                        </p>
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-6 md:p-10">
                    <div className="bg-white rounded-2xl p-8 md:p-10 w-full max-w-md shadow-xl animate-slide-from-right">
                        {/* Mobile Logo */}
                        <div className="md:hidden text-center mb-8">
                            <img 
                                src="/prime-logo.png" 
                                alt="PrimeVolt Electric Logo" 
                                className="w-28 h-28 mx-auto mb-4 rounded-xl object-contain"
                            />
                            <h2 className="text-xl font-bold text-primary-dark">PrimeVolt ELECTRIC</h2>
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Sign In</h2>
                        
                        <form onSubmit={submit}>
                            {errors.email && (
                                <div className="bg-red-50 text-accent-red p-3 rounded-lg text-sm mb-5 flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{errors.email}</span>
                                </div>
                            )}

                            <div className="mb-5">
                                <label htmlFor="email" className="block mb-2 font-semibold text-gray-800 text-sm">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base bg-gray-50 transition-all focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                    placeholder="admin@primevolt.co.tz"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="password" className="block mb-2 font-semibold text-gray-800 text-sm">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base bg-gray-50 transition-all focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-primary text-white rounded-xl text-base font-semibold transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6 pt-5 border-t border-gray-200">
                            <Link 
                                href="/" 
                                className="text-gray-500 text-sm hover:text-primary transition-colors"
                            >
                                <i className="fas fa-arrow-left mr-2"></i>
                                Back to Website
                            </Link>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}
