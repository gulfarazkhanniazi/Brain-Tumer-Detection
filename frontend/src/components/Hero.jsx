import React from 'react';
import heroBrain from '../assets/hero_brain.png';

const Hero = ({ onStart }) => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-cyan-100 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                        <div className="inline-block px-4 py-2 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm animate-fade-in">
                            AI-Powered Medical Imaging
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-slide-up">
                            Detect Brain Tumors with <br />
                            <span className="text-gradient">Precise AI Analysis</span>
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Leverage state-of-the-art Deep Learning models to analyze MRI scans instantly. accurate, fast, and secure diagnostic support.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <button
                                onClick={onStart}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
                            >
                                Start Diagnosis
                            </button>
                            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-gray-50 transition-all w-full sm:w-auto">
                                Learn More
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>98% Accuracy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Instant Results</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative">
                        <div className="relative z-10 animate-float">
                            <img
                                src={heroBrain}
                                alt="AI Brain Visualization"
                                className="w-full max-w-2xl mx-auto drop-shadow-2xl rounded-3xl"
                            />

                            {/* Floating Cards */}
                            <div className="absolute top-10 -left-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 animate-pulse-slow hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-semibold text-slate-800">System Online</span>
                                </div>
                            </div>
                            <div className="absolute bottom-20 -right-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 animate-pulse-slow hidden lg:block" style={{ animationDelay: '1s' }}>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Model Confidence</p>
                                    <p className="text-2xl font-bold text-blue-600">99.2%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
