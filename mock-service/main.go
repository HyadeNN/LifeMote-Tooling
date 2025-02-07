package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Info struct {
	ServiceName    string `json:"service_name"`
	Version        string `json:"version"`
	DatabaseSchema string `json:"database_schema"`
}

func main() {
	http.HandleFunc("/health/info", func(w http.ResponseWriter, r *http.Request) {
		info := Info{
			ServiceName:    "MockToolService",
			Version:        "1.2.3",
			DatabaseSchema: "v1.0",
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info)
	})

	port := 5000
	fmt.Printf("Mock service is running on port %d\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
