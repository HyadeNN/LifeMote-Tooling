from typing import Dict, Any, Optional
import httpx
from .models import ResponseFormat
from .schemas import HealthResponse

class HealthCheckService:
    @staticmethod
    def parse_response(data: Dict[str, Any], format: ResponseFormat) -> Optional[HealthResponse]:
        try:
            if format == ResponseFormat.AUTO:
                return HealthCheckService._auto_detect_and_parse(data)
            
            parser = getattr(HealthCheckService, f"_parse_{format.value}", None)
            if parser:
                return parser(data)
            
            return None
        except Exception as e:
            print(f"Parse error: {str(e)}")
            return None

    @staticmethod
    def _auto_detect_and_parse(data: Dict[str, Any]) -> Optional[HealthResponse]:
        # Try all parsers until one works
        for format in ResponseFormat:
            if format == ResponseFormat.AUTO:
                continue
                
            parser = getattr(HealthCheckService, f"_parse_{format.value}", None)
            if parser:
                try:
                    result = parser(data)
                    if result:
                        return result
                except Exception:
                    continue
        
        return None

    @staticmethod
    def _parse_standard(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if all(key in data for key in ["platform", "release", "schema"]):
            return HealthResponse(
                platform=data["platform"],
                release=data["release"],
                database_schema=data["schema"]
            )
        return None

    @staticmethod
    def _parse_lifemote(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "release" in data and "schema" in data:
            return HealthResponse(
                platform=data.get("platform"),
                release=data["release"],
                database_schema=data["schema"]
            )
        return None

    @staticmethod
    def _parse_simple(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "version" in data and "db_version" in data:
            return HealthResponse(
                platform=None,
                release=data["version"],
                database_schema=data["db_version"]
            )
        return None

    @staticmethod
    def _parse_detailed(data: Dict[str, Any]) -> Optional[HealthResponse]:
        try:
            service = data.get("service", {})
            return HealthResponse(
                platform=service.get("platform_version"),
                release=service["version"],
                database_schema=service["database"]["schema_version"]
            )
        except KeyError:
            return None

    @staticmethod
    def _parse_legacy(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "app_version" in data and "db" in data:
            return HealthResponse(
                platform=data.get("runtime"),
                release=data["app_version"],
                database_schema=data["db"]
            )
        return None

    @staticmethod
    async def check_service_health(url: str, format: ResponseFormat) -> Optional[HealthResponse]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return HealthCheckService.parse_response(data, format)
        except Exception as e:
            print(f"Health check failed for {url}: {str(e)}")
            return None