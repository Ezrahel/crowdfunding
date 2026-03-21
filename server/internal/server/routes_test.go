package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHelloWorldHandler(t *testing.T) {
	s := &Server{}
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.HelloWorldHandler)

	req, err := http.NewRequest(http.MethodGet, "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Fatalf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	body := rr.Body.String()
	if !strings.Contains(body, `"message":"Crowdfunding API Server"`) {
		t.Fatalf("Handler returned unexpected body: %v", body)
	}
	if !strings.Contains(body, `"version":"1.0.0"`) {
		t.Fatalf("Handler returned unexpected body: %v", body)
	}
}
