package firebase

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"

	"google.golang.org/api/option"
)

var firestoreClient *firestore.Client

// GetFirestoreClient returns the Firestore client
func GetFirestoreClient() (*firestore.Client, error) {
	if firestoreClient != nil {
		return firestoreClient, nil
	}

	// Try env var first (standard Google credential env var)
	credEnv := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	// Build candidate paths to check
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
		return nil, fmt.Errorf("error getting Firestore client: cannot read credentials file: looked for israelfirebase.json; set GOOGLE_APPLICATION_CREDENTIALS to the credentials file path")
	}

	opt := option.WithCredentialsFile(credPath)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	firestoreClient, err = app.Firestore(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting Firestore client: %v", err)
	}

	return firestoreClient, nil
}

// InitFirestore initializes the Firestore client
func InitFirestore() error {
	_, err := GetFirestoreClient()
	return err
}
