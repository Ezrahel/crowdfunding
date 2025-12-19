package paystack

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const (
	PaystackBaseURL = "https://api.paystack.co"
)

// Client represents a Paystack API client
type Client struct {
	SecretKey  string
	PublicKey  string
	httpClient *http.Client
}

// NewClient creates a new Paystack client
func NewClient() *Client {
	return &Client{
		SecretKey: os.Getenv("PAYSTACK_SECRET_KEY"),
		PublicKey: os.Getenv("PAYSTACK_PUBLIC_KEY"),
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// VirtualAccountRequest represents a request to create a virtual account
type VirtualAccountRequest struct {
	Email         string `json:"email"`
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Phone         string `json:"phone,omitempty"`
	PreferredBank string `json:"preferred_bank,omitempty"`
}

// VirtualAccountResponse represents the response from Paystack
type VirtualAccountResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Customer struct {
			ID           int    `json:"id"`
			Email        string `json:"email"`
			CustomerCode string `json:"customer_code"`
			FirstName    string `json:"first_name"`
			LastName     string `json:"last_name"`
			Phone        string `json:"phone"`
		} `json:"customer"`
		AccountName   string `json:"account_name"`
		AccountNumber string `json:"account_number"`
		Bank          struct {
			Name string `json:"name"`
			ID   int    `json:"id"`
			Slug string `json:"slug"`
		} `json:"bank"`
		Active      bool        `json:"active"`
		CreatedAt   string      `json:"created_at"`
		UpdatedAt   string      `json:"updated_at"`
		Assignment  interface{} `json:"assignment"`
		Domain      string      `json:"domain"`
		SplitCode   interface{} `json:"split_code"`
		SplitConfig interface{} `json:"split_config"`
	} `json:"data"`
}

// CreateVirtualAccount creates a dedicated virtual account for a customer
func (c *Client) CreateVirtualAccount(req VirtualAccountRequest) (*VirtualAccountResponse, error) {
	if c.SecretKey == "" {
		return nil, fmt.Errorf("Paystack secret key not configured")
	}

	url := fmt.Sprintf("%s/dedicated_account", PaystackBaseURL)

	payload := map[string]interface{}{
		"email":      req.Email,
		"first_name": req.FirstName,
		"last_name":  req.LastName,
	}

	if req.Phone != "" {
		payload["phone"] = req.Phone
	}

	if req.PreferredBank != "" {
		payload["preferred_bank"] = req.PreferredBank
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.SecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var paystackResp VirtualAccountResponse
	if err := json.Unmarshal(body, &paystackResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !paystackResp.Status {
		return nil, fmt.Errorf("Paystack API error: %s", paystackResp.Message)
	}

	return &paystackResp, nil
}

// GetVirtualAccount retrieves virtual account details
func (c *Client) GetVirtualAccount(customerCode string) (*VirtualAccountResponse, error) {
	if c.SecretKey == "" {
		return nil, fmt.Errorf("Paystack secret key not configured")
	}

	url := fmt.Sprintf("%s/dedicated_account?customer=%s", PaystackBaseURL, customerCode)

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.SecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var paystackResp struct {
		Status  bool   `json:"status"`
		Message string `json:"message"`
		Data    []struct {
			Customer struct {
				ID           int    `json:"id"`
				Email        string `json:"email"`
				CustomerCode string `json:"customer_code"`
			} `json:"customer"`
			AccountName   string `json:"account_name"`
			AccountNumber string `json:"account_number"`
			Bank          struct {
				Name string `json:"name"`
			} `json:"bank"`
			Active bool `json:"active"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &paystackResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !paystackResp.Status || len(paystackResp.Data) == 0 {
		return nil, fmt.Errorf("virtual account not found")
	}

	// Convert to VirtualAccountResponse format
	result := &VirtualAccountResponse{
		Status:  paystackResp.Status,
		Message: paystackResp.Message,
	}
	if len(paystackResp.Data) > 0 {
		account := paystackResp.Data[0]
		// Only copy fields that exist in the response
		result.Data.Customer.ID = account.Customer.ID
		result.Data.Customer.Email = account.Customer.Email
		result.Data.Customer.CustomerCode = account.Customer.CustomerCode
		// FirstName, LastName, Phone are not in the response, leave as empty strings
		result.Data.AccountName = account.AccountName
		result.Data.AccountNumber = account.AccountNumber
		result.Data.Bank.Name = account.Bank.Name
		result.Data.Active = account.Active
	}

	return result, nil
}

// VerifyTransaction verifies a Paystack transaction
func (c *Client) VerifyTransaction(reference string) (map[string]interface{}, error) {
	if c.SecretKey == "" {
		return nil, fmt.Errorf("Paystack secret key not configured")
	}

	url := fmt.Sprintf("%s/transaction/verify/%s", PaystackBaseURL, reference)

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.SecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return result, nil
}
