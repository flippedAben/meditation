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

	component := index()
	mux.Handle("GET /", templ.Handler(component))

	mux.HandleFunc("POST /log", postLog)

	fs := http.FileServer(http.Dir("static"))
	mux.Handle("GET /static/", http.StripPrefix("/static/", fs))

	println("Service on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func postLog(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("%s/%s", os.Getenv("DATA_PATH"), os.Getenv("DATA_FILE_NAME"))

	request_logs := r.FormValue("logs")
	if request_logs == "" {
		http.Error(w, "No logs provided", http.StatusBadRequest)
		return
	}

	var logs []Log
	if err := json.Unmarshal([]byte(request_logs), &logs); err != nil {
		http.Error(w, "Invalid logs format", http.StatusBadRequest)
		return
	}

	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		http.Error(w, "Failed to open log file", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	for _, log := range logs {
		bytes, err := json.Marshal(log)
		if err != nil {
			http.Error(w, "Failed to read json", http.StatusInternalServerError)
			return
		}

		if _, err := f.Write(bytes); err != nil {
			http.Error(w, "Failed to write data to log file", http.StatusInternalServerError)
			return
		}

		if _, err := f.Write([]byte("\n")); err != nil {
			http.Error(w, "Failed to write new line to log file", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}
