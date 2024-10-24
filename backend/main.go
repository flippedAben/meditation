package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/a-h/templ"
)

type Log struct {
	Timestamp string `json:"timestamp"`
	Event     string `json:"event"`
}

func main() {
	mux := http.NewServeMux()

	component := index("Hi")
	mux.Handle("GET /", templ.Handler(component))

	mux.HandleFunc("GET /log", getLog)
	mux.HandleFunc("POST /log", postLog)

	println("Service on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func getLog(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("%s/%s", os.Getenv("DATA_PATH"), os.Getenv("DATA_FILE_NAME"))
	http.ServeFile(w, r, path)
}

func postLog(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("%s/%s", os.Getenv("DATA_PATH"), os.Getenv("DATA_FILE_NAME"))
	var log Log
	err := json.NewDecoder(r.Body).Decode(&log)
	if err != nil {
		http.Error(w, "Failed to parse JSON request", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		http.Error(w, "Failed to open log file", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	bytes, err := json.Marshal(log)
	if err != nil {
		http.Error(w, "Failed to marshal JSON", http.StatusInternalServerError)
		return
	}

	_, err = f.Write(bytes)
	if err != nil {
		http.Error(w, "Failed to write data to log file", http.StatusInternalServerError)
		return
	}

	_, err = f.Write([]byte("\n"))
	if err != nil {
		http.Error(w, "Failed to write new line to log file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
}
