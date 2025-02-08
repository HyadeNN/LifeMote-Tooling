from pydantic import BaseSettings


class AuthSettings(BaseSettings):
    AUTH0_DOMAIN: str
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_ALGORITHMS: list = ["RS256"]

    class Config:
        env_file = ".env"


auth_settings = AuthSettings()
