package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type authRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type createAlbumRequest struct {
	Name    string   `json:"name" binding:"required"`
	Mood    string   `json:"mood" binding:"required"`
	Links   []string `json:"links" binding:"required"`
	Creator string   `json:"creator" binding:"required"`
}

type linksPayload struct {
	Links []string `json:"links" binding:"required"`
}

type createMashupRequest struct {
	Name     string   `json:"name" binding:"required"`
	Creator  string   `json:"creator" binding:"required"`
	Songs    []string `json:"songs" binding:"required"`
	IsPublic bool     `json:"isPublic"`
}

type likeMashupRequest struct {
	Username string `json:"username" binding:"required"`
}

func main() {
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.POST("/auth/createUser", func(ctx *gin.Context) {
		var req authRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "MISSINGPARAMS"})
			return
		}

		id, err := createUser(req.Username, req.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusCreated, gin.H{"id": id})
	})

	router.POST("/auth", func(ctx *gin.Context) {
		var req authRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "MISSINGPARAMS"})
			return
		}

		id, err := authenticate(req.Username, req.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"id": id})
	})

	router.POST("/albums/create", func(ctx *gin.Context) {
		var req createAlbumRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		id, err := createSavedAlbum(req.Name, req.Mood, req.Links, req.Creator)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusCreated, gin.H{"id": id})
	})

	router.GET("/albums/:username", func(ctx *gin.Context) {
		username := ctx.Param("username")
		albums, err := getAllAlbums(username)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"albums": albums})
	})

	router.DELETE("/albums/:id", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}
		if err := deleteSavedAlbum(id); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.Status(http.StatusNoContent)
	})

	router.POST("/albums/:id/addsong", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		var payload linksPayload
		if err := ctx.ShouldBindJSON(&payload); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := addSongsToAlbum(id, payload.Links); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	})

	router.DELETE("/albums/:id/removesong", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		var payload linksPayload
		if err := ctx.ShouldBindJSON(&payload); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := removeSongsFromAlbum(id, payload.Links); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	})

	// Mashup endpoints
	router.POST("/mashups/create", func(ctx *gin.Context) {
		var req createMashupRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		id, err := createMashup(req.Name, req.Creator, req.Songs, req.IsPublic)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusCreated, gin.H{"id": id})
	})

	router.GET("/mashups/:id", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		username := ctx.Query("username")
		mashup, err := getMashupByID(id, username)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, mashup)
	})

	router.GET("/mashups/user/:username", func(ctx *gin.Context) {
		username := ctx.Param("username")
		mashups, err := getUserMashups(username)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"mashups": mashups})
	})

	router.GET("/mashups/public", func(ctx *gin.Context) {
		username := ctx.Query("username")
		mashups, err := getPublicMashups(username)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"mashups": mashups})
	})

	router.POST("/mashups/:id/like", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		var req likeMashupRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := likeMashup(id, req.Username); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	})

	router.POST("/mashups/:id/unlike", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		var req likeMashupRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := unlikeMashup(id, req.Username); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	})

	router.DELETE("/mashups/:id", func(ctx *gin.Context) {
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "BADID"})
			return
		}

		if err := deleteMashup(id); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	})

	router.Run(":8080")
}
