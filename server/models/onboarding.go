package models

import (
	"time"
)

// OnboardingStatus represents the status of user onboarding
type OnboardingStatus string

const (
	OnboardingStatusPending   OnboardingStatus = "pending"
	OnboardingStatusInProgress OnboardingStatus = "in_progress"
	OnboardingStatusCompleted OnboardingStatus = "completed"
	OnboardingStatusSkipped   OnboardingStatus = "skipped"
)

// Onboarding represents user onboarding information
type Onboarding struct {
	ID                string           `json:"id" firestore:"id"`
	UserID            string           `json:"user_id" firestore:"user_id"`
	Status            OnboardingStatus `json:"status" firestore:"status"`
	NationalIDNumber  string           `json:"national_id_number" firestore:"national_id_number"` // NIN
	BVN               string           `json:"bvn" firestore:"bvn"`                                 // Bank Verification Number
	TIN               string           `json:"tin" firestore:"tin"`                                 // Tax Identification Number
	VirtualAccountID  string           `json:"virtual_account_id" firestore:"virtual_account_id"`   // Paystack virtual account ID
	VirtualAccountNumber string        `json:"virtual_account_number" firestore:"virtual_account_number"`
	VirtualAccountName   string        `json:"virtual_account_name" firestore:"virtual_account_name"`
	VirtualAccountBank   string        `json:"virtual_account_bank" firestore:"virtual_account_bank"`
	PaystackCustomerCode string        `json:"paystack_customer_code" firestore:"paystack_customer_code"`
	CreatedAt         time.Time        `json:"created_at" firestore:"created_at"`
	UpdatedAt         time.Time        `json:"updated_at" firestore:"updated_at"`
	CompletedAt       *time.Time       `json:"completed_at" firestore:"completed_at,omitempty"`
}

// OnboardingRequest represents the request payload for onboarding submission
type OnboardingRequest struct {
	NationalIDNumber string `json:"national_id_number"`
	BVN             string `json:"bvn"`
	TIN             string `json:"tin"`
}

