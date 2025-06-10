"use client"

import { AlertTriangle } from "lucide-react"

const WithdrawalFailedError = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Enhanced Warning Animation */}
      <div className="mb-6">
        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-lg animate-warning-glow">
          <AlertTriangle className="h-10 w-10 text-amber-600 animate-warning-sway" />
        </div>
        {/* Concerned face */}
        <div className="text-4xl animate-concerned-blink">😟</div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Withdrawal Failed</h2>
      <p className="text-gray-600 text-center">
        We encountered an issue processing your withdrawal. Please try again later.
      </p>

      <style jsx>{`
        @keyframes warning-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.5); }
        }
        
        @keyframes warning-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        
        @keyframes concerned-blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        
        .animate-warning-glow { animation: warning-glow 3s ease-in-out infinite; }
        .animate-warning-sway { animation: warning-sway 2s ease-in-out infinite; }
        .animate-concerned-blink { animation: concerned-blink 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default WithdrawalFailedError
