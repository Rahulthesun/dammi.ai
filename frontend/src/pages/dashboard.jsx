import React from "react";
import { CheckCircle, Smartphone } from "lucide-react";

const Dashboard = () => {
    return (
        <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
                <Smartphone size={48} className="text-green-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Connected to Whatsapp</h1>
                <CheckCircle size={32} className="text-green-500 mb-4" />
                <p className="text-gray-600 text-center">
                    Your Whatsapp integration is active and ready to use.
                </p>
            </div>
        </div>
        
        </>
        
    );
};

export default Dashboard;       