import time
from enum import Enum

import httpx
import semver
from celery import Celery


class DeploymentStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"


celery_app = Celery(
    "tooling_worker", broker="redis://redis:6379/0", backend="redis://redis:6379/0"
)


def validate_semantic_version(current_version: str, new_version: str) -> bool:
    """
    Validates if new version follows semantic versioning and is greater than current version
    """
    try:
        current = semver.VersionInfo.parse(current_version)
        new = semver.VersionInfo.parse(new_version)
        return new > current
    except ValueError:
        return False


@celery_app.task
def deploy_service(service_id: int, service_url: str, new_version: str):
    """
    Simulates a deployment process with the following steps:
    1. Pre-deployment checks
    2. Backup
    3. Schema migration
    4. Service update
    5. Health check
    """
    try:
        with httpx.Client() as client:
            # Get current service info
            response = client.get(f"{service_url}/api/health/info")
            current_info = response.json()

            # Validate version
            if not validate_semantic_version(current_info["release"], new_version):
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Invalid version upgrade",
                }

            # Simulate deployment process
            time.sleep(2)  # Pre-deployment checks
            time.sleep(3)  # Backup
            time.sleep(4)  # Schema migration

            # Update service
            try:
                update_response = client.post(
                    f"{service_url}/api/update",
                    json={
                        "platform": current_info["platform"],
                        "release": new_version,
                        "schema": f"schema_{new_version.replace('.', '_')}",
                    },
                )
                update_response.raise_for_status()
            except Exception as e:
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": f"Failed to update service: {str(e)}",
                }

            # Final health check
            check_response = client.get(f"{service_url}/api/health/info")
            final_info = check_response.json()

            if final_info["release"] != new_version:
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Version mismatch after deployment",
                }

            return {
                "status": DeploymentStatus.SUCCESS.value,
                "info": final_info,
            }

    except Exception as e:
        return {
            "status": DeploymentStatus.FAILED.value,
            "error": str(e),
        }
