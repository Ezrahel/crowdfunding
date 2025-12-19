package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"server/middleware"

	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	port int
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8090
	}
	NewServer := &Server{
		port: port,
	}

	// Get routes handler
	routes := NewServer.RegisterRoutes()

	// Apply middleware stack (order matters!)
	handler := middleware.RequestID(routes)
	handler = middleware.MaxBodySize(middleware.MaxRequestBodySize)(handler)
	handler = middleware.RequestTimeout(middleware.DefaultRequestTimeout)(handler)
	handler = middleware.RateLimit(100, time.Minute)(handler) // 100 requests per minute per IP

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      handler,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
