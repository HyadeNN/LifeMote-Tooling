# Service Integration Guide

## Supported Response Formats

The system supports multiple response formats for service health endpoints. When adding a service, you can specify which format your service uses.

### 1. Standard Format
```json
{
    "platform": "3.12.3",
    "release": "1.0.0",
    "schema": "schema_v1"
}
```

### 2. Lifemote Special Format
```json
{
    "platform": "3.12.3",
    "release": "1.8.0-pre.2",
    "schema": "c63ac854b73f"
}
```

### 3. Simple Version Format
```json
{
    "version": "1.0.0",
    "db_version": "schema_1"
}
```

### 4. Detailed Format
```json
{
    "service": {
        "version": "1.0.0",
        "platform_version": "3.12.3",
        "database": {
            "schema_version": "v1.2"
        }
    }
}
```

### 5. Legacy Format
```json
{
    "app_version": "1.0.0",
    "runtime": "3.12.3",
    "db": "schema1"
}
```

## Best Practices

1. **Version Format Support:**
   - Semantic versioning (e.g., "1.0.0")
   - Build identifiers (e.g., "1.8.0-pre.2")
   - Hash-based versions (e.g., "c63ac854b73f")

2. **Schema Versioning:**
   - Sequential numbers (e.g., "v1", "v2")
   - Timestamps (e.g., "202402081234")
   - Hash values (e.g., "c63ac854b73f")
   - Named versions (e.g., "schema_users_added")

3. **Response Time:**
   - Health endpoint should respond within 5 seconds
   - Consider caching for faster responses

## Example Implementation

```python
from fastapi import FastAPI
from enum import Enum
from typing import Dict, Any

class ResponseFormat(str, Enum):
    STANDARD = "standard"
    LIFEMOTE = "lifemote"
    SIMPLE = "simple"
    DETAILED = "detailed"
    LEGACY = "legacy"

def parse_health_response(data: Dict[str, Any], format: ResponseFormat) -> Dict[str, str]:
    """
    Normalizes different response formats to standard format
    Returns: {
        "platform": str,
        "release": str,
        "schema": str
    }
    """
    if format == ResponseFormat.STANDARD:
        return data
        
    if format == ResponseFormat.LIFEMOTE:
        return {
            "platform": data.get("platform"),
            "release": data.get("release"),
            "schema": data.get("schema")
        }
        
    if format == ResponseFormat.SIMPLE:
        return {
            "platform": "unknown",
            "release": data.get("version"),
            "schema": data.get("db_version")
        }
        
    if format == ResponseFormat.DETAILED:
        return {
            "platform": data.get("service", {}).get("platform_version"),
            "release": data.get("service", {}).get("version"),
            "schema": data.get("service", {}).get("database", {}).get("schema_version")
        }
        
    if format == ResponseFormat.LEGACY:
        return {
            "platform": data.get("runtime"),
            "release": data.get("app_version"),
            "schema": data.get("db")
        }
```

## Notes

- No specific endpoint path is required (e.g., can be `/health`, `/api/health/info`, `/status`, etc.)
- System will try to auto-detect the response format if not specified
- Custom format mappers can be added for specific needs