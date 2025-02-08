from typing import Any, Dict, Optional

import httpx

from .models import ResponseFormat
from .schemas import HealthResponse


class HealthCheckService:
    @staticmethod
    def parse_response(data: Dict[str, Any], format: str) -> Optional[HealthResponse]:
        try:
            if format == ResponseFormat.AUTO.value:
                return HealthCheckService._auto_detect_and_parse(data)

            parser = getattr(HealthCheckService, f"_parse_{format}", None)
            if parser:
                result = parser(data)
                print(
                    f"Parsed result: {result.dict() if result else None}"
                )  # Debug log
                return result

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
                        print(f"Auto-detected format: {format.value}")
                        return result
                except Exception as e:
                    print(f"Parser {format.value} failed: {str(e)}")
                    continue

        return None

    @staticmethod
    def _parse_standard(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if all(key in data for key in ["platform", "release", "schema"]):
            return HealthResponse(
                platform=data["platform"],
                release=data["release"],
                schema=data["schema"],
            )
        return None

    @staticmethod
    def _parse_lifemote(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "release" in data and "schema" in data:
            return HealthResponse(
                platform=data.get("platform"),
                release=data["release"],
                schema=data["schema"],
            )
        return None

    @staticmethod
    def _parse_simple(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "version" in data and "db_version" in data:
            return HealthResponse(
                platform=None, release=data["version"], schema=data["db_version"]
            )
        return None

    @staticmethod
    def _parse_detailed(data: Dict[str, Any]) -> Optional[HealthResponse]:
        try:
            service = data.get("service", {})
            return HealthResponse(
                platform=service.get("platform_version"),
                release=service["version"],
                schema=service["database"]["schema_version"],
            )
        except KeyError:
            return None

    @staticmethod
    def _parse_legacy(data: Dict[str, Any]) -> Optional[HealthResponse]:
        if "app_version" in data and "db" in data:
            return HealthResponse(
                platform=data.get("runtime"),
                release=data["app_version"],
                schema=data["db"],
            )
        return None

    @staticmethod
    async def check_service_health(url: str, format: str) -> Optional[HealthResponse]:
        try:
            print(f"Checking health for URL: {url} with format: {format}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                print(f"Received response: {data}")
                result = HealthCheckService.parse_response(data, format)
                print(f"Final parsed result: {result.dict() if result else None}")
                return result
        except Exception as e:
            print(f"Health check failed for {url}: {str(e)}")
            return None
