import React, { useState, useRef } from 'react';
import { predictImage } from '../services/api';
import Hero from '../components/Hero';
import Features from '../components/Features';
import InfoSection from '../components/InfoSection';

const HomePage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Ref for scrolling to upload section
    const uploadSectionRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToUpload = () => {
        uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileSelect = (file) => {
        setError(null);
        setResult(null);

        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setError("Please upload a valid image (JPG, JPEG, PNG)");
            return;
        }

        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);

        try {
            const data = await predictImage(selectedFile);
            setResult(data);
        } catch (err) {
            setError(err.message || "Something went wrong during prediction.");
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="flex flex-col">
            <Hero onStart={scrollToUpload} />

            <div id="features">
                <Features />
            </div>

            {/* Analysis Dashboard Section */}
            <section id="analyze" ref={uploadSectionRef} className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Diagnostic Tool</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Analyze Your MRI Scan</h2>
                            <p className="text-slate-600">Securely upload your scan for instant AI analysis.</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
                            {/* Loading Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-blue-600 font-semibold animate-pulse">Analyzing Neural Structures...</p>
                                </div>
                            )}

                            <div className="p-8 md:p-12">
                                <div className="grid md:grid-cols-2 gap-12 items-start">
                                    {/* Upload Area */}
                                    <div className="space-y-6">
                                        <div
                                            className={`
                                                relative border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer overflow-hidden group
                                                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                                                ${previewUrl ? 'border-none p-0 bg-slate-100' : ''}
                                            `}
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            onClick={() => !previewUrl && fileInputRef.current.click()}
                                        >
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(e.target.files[0])}
                                            />

                                            {previewUrl ? (
                                                <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                resetAnalysis();
                                                            }}
                                                            className="bg-white text-slate-900 px-6 py-2 rounded-full font-medium hover:bg-slate-100"
                                                        >
                                                            Change Image
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Click to Upload</h3>
                                                    <p className="text-slate-500 text-sm mb-4">or drag and drop here</p>
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
                                                        <span>JPG</span>
                                                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                        <span>PNG</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpload}
                                            disabled={!selectedFile || loading}
                                            className={`
                                                w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 transition-all
                                                ${!selectedFile || loading
                                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-95'}
                                            `}
                                        >
                                            Start Analysis
                                        </button>

                                        {error && (
                                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {error}
                                            </div>
                                        )}
                                    </div>

                                    {/* Result Area */}
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center">
                                            {result ? (
                                                <div className="w-full animate-fade-in">
                                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Analysis Complete</h3>
                                                    <p className="text-slate-500 mb-8">The image has been successfully processed.</p>

                                                    <div className="space-y-4 w-full">
                                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                                            <span className="text-slate-500 font-medium">Prediction</span>
                                                            <span className="text-lg font-bold text-slate-900 capitalize">{result.predicted_label}</span>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                                            <span className="text-slate-500 font-medium">Confidence Score</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: result.confidence + '%' }}></div>
                                                                </div>
                                                                <span className="font-bold text-blue-600">{result.confidence}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-400">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                    </div>
                                                    <p>Results will replace this placeholder <br /> once analysis is complete.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div id="about">
                <InfoSection />
            </div>
        </div>
    );
};

export default HomePage;
