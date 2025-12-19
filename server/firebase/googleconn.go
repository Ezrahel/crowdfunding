package firebase

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"

	"google.golang.org/api/option"
)

func GetAuthClient() (*auth.Client, error) {
	// Try env var first (standard Google credential env var)
	credEnv := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	// Build candidate paths to check (cwd-relative and common project-relative)
	cwd, _ := os.Getwd()
	candidates := []string{}
	if credEnv != "" {
		candidates = append(candidates, credEnv)
	}
	candidates = append(candidates,
		filepath.Join(cwd, "israelfirebase.json"),
		filepath.Join(cwd, "..", "israelfirebase.json"),
		filepath.Join(cwd, "..", "..", "israelfirebase.json"),
		filepath.Join(cwd, "server", "israelfirebase.json"),
	)

	var credPath string
	for _, p := range candidates {
		if p == "" {
			continue
		}
		if _, err := os.Stat(p); err == nil {
			credPath = p
			break
		}
	}
	if credPath == "" {
		return nil, fmt.Errorf("error getting Auth client: cannot read credentials file: looked for israelfirebase.json; set GOOGLE_APPLICATION_CREDENTIALS to the credentials file path")
	}

	opt := option.WithCredentialsFile(credPath)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}
	authClient, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting Auth client: %v", err)
	}

	return authClient, nil
}
