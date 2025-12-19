package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

// APIError represents a standardized API error response
type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// WriteError writes a standardized error response
func WriteError(w http.ResponseWriter, status int, message string, code string) {
	if code != "" {
		log.Printf("API Error [%s]: %s", code, message)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIError{
		Message: message,
		Code:    code,
	})
}

// WriteInternalError writes an internal server error without exposing details
func WriteInternalError(w http.ResponseWriter, err error) {
	log.Printf("Internal error: %v", err)
	WriteError(w, http.StatusInternalServerError, "An internal error occurred", "INTERNAL_ERROR")
}

// WriteBadRequest writes a bad request error
func WriteBadRequest(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusBadRequest, message, "BAD_REQUEST")
}

// WriteUnauthorized writes an unauthorized error
func WriteUnauthorized(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusUnauthorized, message, "UNAUTHORIZED")
}

// WriteForbidden writes a forbidden error
func WriteForbidden(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusForbidden, message, "FORBIDDEN")
}

// WriteNotFound writes a not found error
func WriteNotFound(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusNotFound, message, "NOT_FOUND")
}

// WriteValidationError writes a validation error
func WriteValidationError(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusUnprocessableEntity, message, "VALIDATION_ERROR")
}

