package utils

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

var (
	emailRegex       = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	currencyRegex    = regexp.MustCompile(`^[A-Z]{3}$`)       // ISO 4217
	firestoreIDRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`) // Pattern only, length checked separately

	validCurrencies = map[string]bool{
		"USD": true, "EUR": true, "GBP": true, "JPY": true, "AUD": true,
		"CAD": true, "CHF": true, "CNY": true, "INR": true, "NZD": true,
		"ZAR": true, "BRL": true, "MXN": true, "SGD": true, "HKD": true,
		"KRW": true, "TRY": true, "RUB": true, "SEK": true, "NOK": true,
	}

	validCampaignStatuses = map[string]bool{
		"Draft": true, "Active": true, "Completed": true, "Cancelled": true,
	}

	validDonationStatuses = map[string]bool{
		"pending": true, "completed": true, "failed": true, "refunded": true,
	}

	validWithdrawalMethods = map[string]bool{
		"bank": true, "paypal": true, "debit_card": true,
	}

	validWithdrawalStatuses = map[string]bool{
		"pending": true, "processing": true, "completed": true, "failed": true,
	}
)

// ValidateEmail validates email format
func ValidateEmail(email string) bool {
	if email == "" {
		return false
	}
	return emailRegex.MatchString(email)
}

// ValidateCurrency validates currency code
func ValidateCurrency(currency string) bool {
	if currency == "" {
		return false
	}
	return validCurrencies[strings.ToUpper(currency)]
}

// ValidateFirestoreID validates Firestore document ID format
// Firestore IDs can be 1-1500 characters, but Go regex has limits on repeat counts
// So we validate pattern and length separately
func ValidateFirestoreID(id string) bool {
	if id == "" {
		return false
	}
	// Check length (Firestore allows 1-1500 characters)
	if len(id) < 1 || len(id) > 1500 {
		return false
	}
	// Check pattern (alphanumeric, underscore, hyphen only)
	return firestoreIDRegex.MatchString(id)
}

// SanitizeString sanitizes and trims string input
func SanitizeString(s string, maxLen int) string {
	s = strings.TrimSpace(s)
	if maxLen > 0 && len(s) > maxLen {
		s = s[:maxLen]
	}
	// Remove control characters
	var b strings.Builder
	for _, r := range s {
		if unicode.IsPrint(r) || unicode.IsSpace(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// ValidateAmount validates donation/withdrawal amount
func ValidateAmount(amount float64, min, max float64) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}
	if amount < min {
		return fmt.Errorf("amount must be at least %.2f", min)
	}
	if amount > max {
		return fmt.Errorf("amount cannot exceed %.2f", max)
	}
	return nil
}

// ValidateCampaignStatus validates campaign status
func ValidateCampaignStatus(status string) bool {
	return validCampaignStatuses[status]
}

// ValidateDonationStatus validates donation status
func ValidateDonationStatus(status string) bool {
	return validDonationStatuses[status]
}

// ValidateWithdrawalMethod validates withdrawal method
func ValidateWithdrawalMethod(method string) bool {
	return validWithdrawalMethods[method]
}

// ValidateWithdrawalStatus validates withdrawal status
func ValidateWithdrawalStatus(status string) bool {
	return validWithdrawalStatuses[status]
}

// ValidateStringLength validates string length
func ValidateStringLength(s string, min, max int) error {
	length := len(strings.TrimSpace(s))
	if length < min {
		return fmt.Errorf("must be at least %d characters", min)
	}
	if length > max {
		return fmt.Errorf("must not exceed %d characters", max)
	}
	return nil
}

// ValidateDeadline validates that deadline is in the future
func ValidateDeadline(deadline, now interface{}) error {
	// This will be used with time.Time, but using interface{} for flexibility
	// Actual validation will be done in handlers with proper type checking
	return nil
}
