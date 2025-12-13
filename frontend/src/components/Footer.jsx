import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-900">NeuroScan</span>
                        </div>
                        <p className="text-slate-500 max-w-sm">
                            Advanced AI-powered tool for assisting medical professionals in the early detection and classification of brain tumors from MRI scans.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Features</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Technology</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Accuracy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Disclaimer</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} NeuroScan AI. All rights reserved.
                    </p>
                    <p className="text-slate-400 text-xs mt-2 md:mt-0">
                        *Not a replacement for professional medical advice.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
