import React, { useState, useRef } from 'react';
import { predictImage } from '../services/api';

const HomePage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Brain Tumor <span className="text-blue-600">Detection</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload an MRI scan to detect the presence of a brain tumor using our advanced Deep Learning model.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">

                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
              ${previewUrl ? 'border-none p-0' : ''}
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
                            <div className="relative group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-96 mx-auto rounded-lg shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewUrl(null);
                                            setSelectedFile(null);
                                            setResult(null);
                                        }}
                                        className="bg-white/90 text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-white hover:scale-105 transition-all"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    Upload MRI Scan
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Drag & drop or click to browse
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Supports JPG, PNG (Max 16MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {selectedFile && !result && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className={`
                  px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 transition-all 
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'}
                `}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Analyzing...</span>
                                    </span>
                                ) : (
                                    "Analyze Image"
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center animate-fade-in">
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-xl animate-fade-in-up">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Analysis Complete</h2>
                                <div className="my-4 h-px bg-green-200/50 w-full max-w-xs mx-auto"></div>

                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-white p-4 rounded-lg shadow-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Diagnosis</p>
                                        <p className="text-lg font-bold text-gray-900 capitalize">{result.predicted_label}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Confidence</p>
                                        <p className="text-lg font-bold text-blue-600">{result.confidence}%</p>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-gray-400">
                                    * This is an AI-generated result and should not be used as a medical diagnosis.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
