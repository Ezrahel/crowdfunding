"use client"

import { XCircle } from "lucide-react"

const PaymentFailedError = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Enhanced Error Animation */}
      <div className="mb-6">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-lg animate-error-shake">
          <XCircle className="h-10 w-10 text-red-600 animate-error-pulse" />
        </div>
        {/* Sad face animation */}
        <div className="text-4xl animate-sad-bounce">😞</div>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Failed</h1>
      <p className="text-gray-600 mb-4">
        We were unable to process your payment. Please check your payment details and try again.
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => {
          // Handle retry logic here, e.g., redirect to payment page
          alert("Retry payment logic here")
        }}
      >
        Retry Payment
      </button>

      <style jsx>{`
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes error-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes sad-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-error-shake { animation: error-shake 0.5s ease-in-out 3; }
        .animate-error-pulse { animation: error-pulse 2s ease-in-out infinite; }
        .animate-sad-bounce { animation: sad-bounce 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default PaymentFailedError
