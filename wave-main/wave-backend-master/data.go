package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strings"
	"time"

	_ "github.com/denisenkom/go-mssqldb"
)

var server = "bensql67.database.windows.net"
var port = 1433
var username = "benjamin"
var password = "Cs2060684#"
var database = "wavedata"

var connString = fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;",
	server, username, password, port, database)

var db *sql.DB

func ensureDB() error {
	if db != nil {
		return nil
	}

	opened, err := sql.Open("sqlserver", connString)
	if err != nil {
		return err
	}

	if err := opened.Ping(); err != nil {
		return err
	}

	db = opened
	return nil
}

type user struct {
	id       int
	username string
	password string
}

type savedAlbum struct {
	ID                int
	Name              string
	Mood              string
	SpotifyLinkString string
	Creator           string
}

type albumResponse struct {
	ID      int      `json:"id"`
	Name    string   `json:"name"`
	Mood    string   `json:"mood"`
	Links   []string `json:"links"`
	Creator string   `json:"creator"`
}

type mashup struct {
	ID                int
	Name              string
	Creator           string
	SpotifyLinkString string
	Likes             int
	CreatedAt         time.Time
	IsPublic          bool
}

type mashupResponse struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Creator   string    `json:"creator"`
	Songs     []string  `json:"songs"`
	Likes     int       `json:"likes"`
	CreatedAt time.Time `json:"createdAt"`
	IsPublic  bool      `json:"isPublic"`
	IsLiked   bool      `json:"isLiked"`
}

func dbInit() {
}

func generateRandomDigits(digits int) int {
	if digits <= 0 {
		return 0
	}

	rand.Seed(time.Now().UnixNano())

	min := intPow(10, digits-1)
	max := intPow(10, digits) - 1

	return rand.Intn(max-min+1) + min
}

func intPow(base, exp int) int {
	result := 1
	for i := 0; i < exp; i++ {
		result *= base
	}
	return result
}

func (u *user) newUser(newusername string, newpassword string) {
	hash := sha256.Sum256([]byte(newpassword))

	// use 9 digits to stay within SQL Server INT range
	u.id = generateRandomDigits(9)
	u.username = newusername
	u.password = hex.EncodeToString(hash[:])
}

func createUser(username string, password string) (int, error) {
	if err := ensureDB(); err != nil {
		return 0, err
	}

	newuser := &user{}
	newuser.newUser(username, password)

	_, err := db.Exec("INSERT INTO users (id, username, password) VALUES (@p1, @p2, @p3)", newuser.id, newuser.username, newuser.password)
	if err != nil {
		return 0, err
	}

	return newuser.id, nil
}

func authenticate(username string, password string) (int, error) {
	if err := ensureDB(); err != nil {
		return 0, err
	}

	var id int

	hash := sha256.Sum256([]byte(password))
	hashedPassword := hex.EncodeToString(hash[:])

	err := db.QueryRow("SELECT id FROM users WHERE username=@p1 AND password=@p2", username, hashedPassword).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, err
	}
	if err != nil {
		return 0, err
	}

	return id, nil
}

func createSavedAlbum(name string, mood string, spotifyLinks []string, creator string) (int, error) {
	if err := ensureDB(); err != nil {
		return 0, err
	}

	spotifyLinkString := joinLinks(spotifyLinks)

	newsavedAlbum := &savedAlbum{
		ID:                generateRandomDigits(8),
		Name:              name,
		Mood:              mood,
		SpotifyLinkString: spotifyLinkString,
		Creator:           creator,
	}

	_, err := db.Exec("INSERT INTO savedAlbums (id, name, mood, spotifyLinkString, creator) VALUES (@p1, @p2, @p3, @p4, @p5)",
		newsavedAlbum.ID, newsavedAlbum.Name, newsavedAlbum.Mood, newsavedAlbum.SpotifyLinkString, newsavedAlbum.Creator)
	if err != nil {
		return 0, err
	}

	return newsavedAlbum.ID, nil
}

func deleteSavedAlbum(id int) error {
	if err := ensureDB(); err != nil {
		return err
	}

	_, err := db.Exec("DELETE FROM savedAlbums WHERE id=@p1", id)
	if err != nil {
		return err
	}

	return nil
}

func addSongsToAlbum(id int, links []string) error {
	if err := ensureDB(); err != nil {
		return err
	}

	album, err := getAlbumByID(id)
	if err != nil {
		return err
	}

	current := parseLinks(album.SpotifyLinkString)
	current = append(current, filterNonEmpty(links)...)
	updated := joinLinks(current)

	_, err = db.Exec("UPDATE savedAlbums SET spotifyLinkString=@p1 WHERE id=@p2", updated, id)
	return err
}

func removeSongsFromAlbum(id int, links []string) error {
	if err := ensureDB(); err != nil {
		return err
	}

	album, err := getAlbumByID(id)
	if err != nil {
		return err
	}

	current := parseLinks(album.SpotifyLinkString)
	filterSet := make(map[string]struct{})
	for _, l := range links {
		if l == "" {
			continue
		}
		filterSet[l] = struct{}{}
	}

	var remaining []string
	for _, l := range current {
		if _, exists := filterSet[l]; !exists {
			remaining = append(remaining, l)
		}
	}

	updated := joinLinks(remaining)
	_, err = db.Exec("UPDATE savedAlbums SET spotifyLinkString=@p1 WHERE id=@p2", updated, id)
	return err
}

func getAlbumByID(id int) (*savedAlbum, error) {
	if err := ensureDB(); err != nil {
		return nil, err
	}

	var album savedAlbum
	err := db.QueryRow("SELECT id, name, mood, spotifyLinkString, creator FROM savedAlbums WHERE id=@p1", id).
		Scan(&album.ID, &album.Name, &album.Mood, &album.SpotifyLinkString, &album.Creator)
	if err != nil {
		return nil, err
	}

	return &album, nil
}

func getAllAlbums(username string) ([]albumResponse, error) {
	if err := ensureDB(); err != nil {
		return nil, err
	}

	rows, err := db.Query("SELECT id, name, mood, spotifyLinkString, creator FROM savedAlbums WHERE creator=@p1", username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var albums []albumResponse

	for rows.Next() {
		var a savedAlbum
		if err := rows.Scan(&a.ID, &a.Name, &a.Mood, &a.SpotifyLinkString, &a.Creator); err != nil {
			return nil, err
		}

		albums = append(albums, albumResponse{
			ID:      a.ID,
			Name:    a.Name,
			Mood:    a.Mood,
			Links:   parseLinks(a.SpotifyLinkString),
			Creator: a.Creator,
		})
	}

	return albums, nil
}

func joinLinks(links []string) string {
	filtered := filterNonEmpty(links)
	return strings.Join(filtered, ".")
}

func parseLinks(raw string) []string {
	if raw == "" {
		return []string{}
	}

	parts := strings.Split(raw, ".")
	return filterNonEmpty(parts)
}

func filterNonEmpty(values []string) []string {
	var result []string
	for _, v := range values {
		trimmed := strings.TrimSpace(v)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// Mashup functions
func createMashup(name string, creator string, songs []string, isPublic bool) (int, error) {
	if err := ensureDB(); err != nil {
		return 0, err
	}

	songString := joinLinks(songs)

	newMashup := &mashup{
		ID:                generateRandomDigits(8),
		Name:              name,
		Creator:           creator,
		SpotifyLinkString: songString,
		Likes:             0,
		CreatedAt:         time.Now(),
		IsPublic:          isPublic,
	}

	_, err := db.Exec("INSERT INTO mashups (id, name, creator, spotifyLinkString, likes, createdAt, isPublic) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)",
		newMashup.ID, newMashup.Name, newMashup.Creator, newMashup.SpotifyLinkString, newMashup.Likes, newMashup.CreatedAt, newMashup.IsPublic)
	if err != nil {
		return 0, err
	}

	return newMashup.ID, nil
}

func getMashupByID(id int, username string) (*mashupResponse, error) {
	if err := ensureDB(); err != nil {
		return nil, err
	}

	var m mashup
	err := db.QueryRow("SELECT id, name, creator, spotifyLinkString, likes, createdAt, isPublic FROM mashups WHERE id=@p1", id).
		Scan(&m.ID, &m.Name, &m.Creator, &m.SpotifyLinkString, &m.Likes, &m.CreatedAt, &m.IsPublic)
	if err != nil {
		return nil, err
	}

	isLiked := false
	if username != "" {
		isLiked, _ = checkIfUserLikedMashup(id, username)
	}

	return &mashupResponse{
		ID:        m.ID,
		Name:      m.Name,
		Creator:   m.Creator,
		Songs:     parseLinks(m.SpotifyLinkString),
		Likes:     m.Likes,
		CreatedAt: m.CreatedAt,
		IsPublic:  m.IsPublic,
		IsLiked:   isLiked,
	}, nil
}

func getUserMashups(username string) ([]mashupResponse, error) {
	if err := ensureDB(); err != nil {
		return nil, err
	}

	rows, err := db.Query("SELECT id, name, creator, spotifyLinkString, likes, createdAt, isPublic FROM mashups WHERE creator=@p1 ORDER BY createdAt DESC", username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mashups []mashupResponse

	for rows.Next() {
		var m mashup
		if err := rows.Scan(&m.ID, &m.Name, &m.Creator, &m.SpotifyLinkString, &m.Likes, &m.CreatedAt, &m.IsPublic); err != nil {
			return nil, err
		}

		isLiked, _ := checkIfUserLikedMashup(m.ID, username)

		mashups = append(mashups, mashupResponse{
			ID:        m.ID,
			Name:      m.Name,
			Creator:   m.Creator,
			Songs:     parseLinks(m.SpotifyLinkString),
			Likes:     m.Likes,
			CreatedAt: m.CreatedAt,
			IsPublic:  m.IsPublic,
			IsLiked:   isLiked,
		})
	}

	return mashups, nil
}

func getPublicMashups(username string) ([]mashupResponse, error) {
	if err := ensureDB(); err != nil {
		return nil, err
	}

	rows, err := db.Query("SELECT id, name, creator, spotifyLinkString, likes, createdAt, isPublic FROM mashups WHERE isPublic=1 ORDER BY likes DESC, createdAt DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mashups []mashupResponse

	for rows.Next() {
		var m mashup
		if err := rows.Scan(&m.ID, &m.Name, &m.Creator, &m.SpotifyLinkString, &m.Likes, &m.CreatedAt, &m.IsPublic); err != nil {
			return nil, err
		}

		isLiked := false
		if username != "" {
			isLiked, _ = checkIfUserLikedMashup(m.ID, username)
		}

		mashups = append(mashups, mashupResponse{
			ID:        m.ID,
			Name:      m.Name,
			Creator:   m.Creator,
			Songs:     parseLinks(m.SpotifyLinkString),
			Likes:     m.Likes,
			CreatedAt: m.CreatedAt,
			IsPublic:  m.IsPublic,
			IsLiked:   isLiked,
		})
	}

	return mashups, nil
}

func likeMashup(mashupID int, username string) error {
	if err := ensureDB(); err != nil {
		return err
	}

	// Check if already liked
	alreadyLiked, err := checkIfUserLikedMashup(mashupID, username)
	if err != nil {
		return err
	}
	if alreadyLiked {
		return fmt.Errorf("already liked")
	}

	// Insert like record
	_, err = db.Exec("INSERT INTO mashupLikes (mashupId, username) VALUES (@p1, @p2)", mashupID, username)
	if err != nil {
		return err
	}

	// Increment like count
	_, err = db.Exec("UPDATE mashups SET likes = likes + 1 WHERE id=@p1", mashupID)
	return err
}

func unlikeMashup(mashupID int, username string) error {
	if err := ensureDB(); err != nil {
		return err
	}

	// Check if liked
	alreadyLiked, err := checkIfUserLikedMashup(mashupID, username)
	if err != nil {
		return err
	}
	if !alreadyLiked {
		return fmt.Errorf("not liked")
	}

	// Delete like record
	_, err = db.Exec("DELETE FROM mashupLikes WHERE mashupId=@p1 AND username=@p2", mashupID, username)
	if err != nil {
		return err
	}

	// Decrement like count
	_, err = db.Exec("UPDATE mashups SET likes = likes - 1 WHERE id=@p1", mashupID)
	return err
}

func checkIfUserLikedMashup(mashupID int, username string) (bool, error) {
	if err := ensureDB(); err != nil {
		return false, err
	}

	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM mashupLikes WHERE mashupId=@p1 AND username=@p2", mashupID, username).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func deleteMashup(id int) error {
	if err := ensureDB(); err != nil {
		return err
	}

	// Delete likes first
	_, err := db.Exec("DELETE FROM mashupLikes WHERE mashupId=@p1", id)
	if err != nil {
		return err
	}

	// Delete mashup
	_, err = db.Exec("DELETE FROM mashups WHERE id=@p1", id)
	if err != nil {
		return err
	}

	return nil
}
