import React from 'react';

const InfoSection = () => {
    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="w-full lg:w-1/2">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-lg rounded-3xl"></div>
                            <div className="relative bg-slate-800 p-8 rounded-3xl border border-slate-700">
                                <h3 className="text-2xl font-bold mb-4">Why AI for Diagnosis?</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-blue-400 font-bold">1</span>
                                        </div>
                                        <p className="text-slate-300">Reduces diagnostic time from hours to seconds, allowing faster intervention.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-blue-400 font-bold">2</span>
                                        </div>
                                        <p className="text-slate-300">Acts as a second opinion to reduce human error and fatigue-related oversights.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-blue-400 font-bold">3</span>
                                        </div>
                                        <p className="text-slate-300">Continuous learning model that improves with more data over time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Empowering Radiologists with <span className="text-blue-400">Deep Learning</span>
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            Our system utilizes a Convolutional Neural Network (CNN) trained on thousands of MRI scans. By identifying subtle patterns in tissue density and structure, NeuroScan assists medical professionals in early identification of Glioma, Meningioma, and Pituitary tumors.
                        </p>
                        <ul className="grid grid-cols-2 gap-4">
                            {['Early Detection', 'High Precision', 'Secure Processing', 'User Friendly'].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-medium text-slate-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InfoSection;
