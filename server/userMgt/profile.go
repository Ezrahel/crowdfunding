package usermgt

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/session"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type ClerkUser struct {
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Username  string `json:"username" binding:"required"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type UserResponse struct {
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

const CreateUserTable = `CREATE TABLE IF NOT EXISTS user (
id SERIAL PRIMARY KEY,)`

func GetUserInfo(ctx *gin.Context) {
	wd, err := os.Getwd()
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Error location env file",
		})
		return
	}
	envPath := filepath.Join(wd, "/../../.env")
	err = godotenv.Load(envPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "error locating env",
		})
		return
	}
	env := os.Getenv("CLERK_KEY")
	if env == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "CLERK_KEY not found in environment variables",
		})
		return
	}

	clerk.SetKey(env)

	// Get the Authorization header
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "authorization header not provided",
		})
		return
	}

	// Extract the token from the Authorization header
	// Format: "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid authorization header format",
		})
		return
	}
	token := parts[1]

	// Verify the session token and get the session
	sess, err := session.Verify(ctx, &session.VerifyParams{
		Token: &token,
	})
	if err != nil {
		fmt.Printf("Token verification error: %v\n", err)
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid session token: " + err.Error(),
		})
		return
	}

	if sess == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "session is nil after verification",
		})
		return
	}

	// Get user from Clerk using the session's user ID
	user, err := user.Get(ctx, sess.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not get user: " + err.Error(),
		})
		return
	}

	response := UserResponse{
		Username:  *user.Username,
		FirstName: *user.FirstName,
		LastName:  *user.LastName,
		Email:     user.EmailAddresses[0].EmailAddress,
	}

	ctx.JSON(http.StatusOK, response)
}

func ClerkUserMgt(ctx *gin.Context) {
	wd, err := os.Getwd()
	if err != nil {
		fmt.Printf("Error getting working directory: %v\n", err)
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Error location env file",
		})
		return
	}
	envPath := filepath.Join(wd, "/../../.env")
	err = godotenv.Load(envPath)
	if err != nil {
		fmt.Printf("Error loading env file: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "error locating env",
		})
		return
	}
	env := os.Getenv("CLERK_KEY")
	if env == "" {
		fmt.Printf("CLERK_KEY not found in environment\n")
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "CLERK_KEY not found in environment variables",
		})
		return
	}

	clerk.SetKey(env)

	var userData ClerkUser
	if err := ctx.ShouldBindJSON(&userData); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request data: " + err.Error(),
		})
		return
	}

	fmt.Printf("Creating user with data: %+v\n", userData)

	newUser, err := user.Create(ctx, &user.CreateParams{
		EmailAddresses: &[]string{userData.Email},
		Username:       &userData.Username,
		Password:       &userData.Password,
		FirstName:      &userData.FirstName,
		LastName:       &userData.LastName,
	})
	if err != nil {
		fmt.Printf("Error creating user: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not create user: " + err.Error(),
		})
		return
	}

	fmt.Printf("Successfully created user: %+v\n", newUser)
	ctx.JSON(http.StatusCreated, newUser)
	http.Redirect(ctx.Writer, ctx.Request, "http://localhost:3000/dashboard", http.StatusTemporaryRedirect)
}
