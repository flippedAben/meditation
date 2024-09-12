package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type Log struct {
	Timestamp string `json:"timestamp"`
	Event     string `json:"event"`
}

func logHandler(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("%s/%s", os.Getenv("DATA_PATH"), os.Getenv("DATA_FILE_NAME"))
	if r.Method == "GET" {
		http.ServeFile(w, r, path)
		return
	} else if r.Method == "POST" {
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
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/log", logHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
