package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Log struct {
	Timestamp string `json:"timestamp"`
	Event     string `json:"event"`
}

func logHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		http.ServeFile(w, r, "meditation.txt")
		return
	} else if r.Method == "POST" {
		var log Log
		err := json.NewDecoder(r.Body).Decode(&log)
		defer r.Body.Close()
		if err != nil {
			http.Error(w, "Failed to parse JSON request", http.StatusInternalServerError)
			return
		}

		f, err := os.OpenFile("meditation.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		defer f.Close()
		if err != nil {
			http.Error(w, "Failed to open log file", http.StatusInternalServerError)
			return
		}

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
	}

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/log", logHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
