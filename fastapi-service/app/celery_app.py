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
    # Get current service info
    try:
        with httpx.Client() as client:
            response = client.get(f"{service_url}/api/health/info")
            current_info = response.json()

            # Validate version
            if not validate_semantic_version(current_info["release"], new_version):
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Invalid version upgrade",
                }

            # Simulate pre-deployment checks (2 seconds)
            time.sleep(2)

            # Simulate backup process (3 seconds)
            time.sleep(3)

            # Simulate schema migration (4 seconds)
            time.sleep(4)
            new_schema = f"schema_{new_version.replace('.', '_')}"

            # Simulate service update (5 seconds)
            time.sleep(5)

            # Update service with new version and schema
            update_payload = {
                "platform": current_info["platform"],
                "release": new_version,
                "schema": new_schema,
            }

            update_response = client.post(
                f"{service_url}/api/update", json=update_payload
            )

            if update_response.status_code != 200:
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Failed to update service",
                }

            # Final health check
            final_check = client.get(f"{service_url}/api/health/info")
            final_info = final_check.json()

            if final_info["release"] != new_version:
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Version mismatch after deployment",
                }

            return {"status": DeploymentStatus.SUCCESS.value, "info": final_info}

    except Exception as e:
        return {"status": DeploymentStatus.FAILED.value, "error": str(e)}
