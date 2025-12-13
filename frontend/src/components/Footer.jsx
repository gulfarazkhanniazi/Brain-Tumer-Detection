import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} NeuroScan. AI-Powered Medical Imaging.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
