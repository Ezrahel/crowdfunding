package utils

import (
	"log"
	"time"
)

// LogRequest logs HTTP request details for audit trail
func LogRequest(method, path, userID, requestID string, statusCode int, duration time.Duration) {
	log.Printf("[%s] %s %s | User: %s | Status: %d | Duration: %v",
		requestID, method, path, userID, statusCode, duration)
}

// LogFinancialOperation logs financial operations for audit
func LogFinancialOperation(operation, userID, entityID, requestID string, amount float64, currency string) {
	log.Printf("[AUDIT] [%s] %s | User: %s | Entity: %s | Amount: %.2f %s",
		requestID, operation, userID, entityID, amount, currency)
}

// LogSecurityEvent logs security-related events
func LogSecurityEvent(event, userID, requestID, details string) {
	log.Printf("[SECURITY] [%s] %s | User: %s | Details: %s",
		requestID, event, userID, details)
}

