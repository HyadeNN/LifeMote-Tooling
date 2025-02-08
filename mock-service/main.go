package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
)

type ServiceInfo struct {
    Platform string `json:"platform"`
    Release  string `json:"release"`
    Schema   string `json:"schema"`
}

var (
    currentInfo ServiceInfo
    mu          sync.RWMutex
)

func init() {
    currentInfo = ServiceInfo{
        Platform: "3.12.3",
        Release:  "1.0.0",
        Schema:   "initial_schema",
    }
}

func main() {
    // Health/Info endpoint
    http.HandleFunc("/api/health/info", handleHealthInfo)
    
    // Update endpoint for simulating deployments
    http.HandleFunc("/api/update", handleUpdate)

    port := 5000
    fmt.Printf("Mock service is running on port %d\n", port)
    log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func handleHealthInfo(w http.ResponseWriter, r *http.Request) {
    mu.RLock()
    defer mu.RUnlock()

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(currentInfo)
}

func handleUpdate(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var updateInfo ServiceInfo
    if err := json.NewDecoder(r.Body).Decode(&updateInfo); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    mu.Lock()
    currentInfo = updateInfo
    mu.Unlock()

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "success",
        "message": "Service updated successfully",
    })
}

