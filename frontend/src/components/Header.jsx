import React, { useState, useEffect } from 'react';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {/* Logo Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${scrolled ? 'bg-blue-600' : 'bg-white'}`}>
                        <svg className={`w-6 h-6 ${scrolled ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'} bg-clip-text`}>
                        NeuroScan
                    </span>
                </div>
                <nav className="hidden md:flex items-center space-x-8">
                    <a href="#" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</a>
                    <a href="#features" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                    <a href="#about" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Technology</a>
                    <a href="#analyze" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                        Launch App
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
