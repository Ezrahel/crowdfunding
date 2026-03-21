package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"server/auth"
	"server/database"
	"server/internal/server"
	"server/jobs"
)

func gracefulShutdown(apiServer *http.Server, done chan bool) {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	<-ctx.Done()

	log.Println("shutting down gracefully, press Ctrl+C again to force")
	stop()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := apiServer.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}
	if err := jobs.Shutdown(ctx); err != nil {
		log.Printf("Kafka jobs shutdown error: %v", err)
	}

	log.Println("Server exiting")
	done <- true
}

func main() {
	if err := auth.InitAuthClient(); err != nil {
		log.Fatalf("Failed to initialize Firebase Auth Client: %v", err)
	}
	fmt.Println("Firebase Auth client initialized successfully")

	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize PostgreSQL: %v", err)
	}
	fmt.Println("PostgreSQL initialized successfully")

	db, err := database.GetDB()
	if err != nil {
		log.Fatalf("Failed to get PostgreSQL connection: %v", err)
	}

	if err := jobs.Init(db); err != nil {
		log.Fatalf("Failed to initialize Kafka jobs: %v", err)
	}
	jobs.Start()
	fmt.Printf("Background jobs initialized successfully (mode=%s)\n", jobs.Mode())

	server.InitRoutes(db)

	apiServer := server.NewServer()
	done := make(chan bool, 1)
	go gracefulShutdown(apiServer, done)

	err = apiServer.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}

	<-done
	log.Println("Graceful shutdown complete.")
}
