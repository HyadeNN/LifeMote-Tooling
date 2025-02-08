import requests
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

from .config import auth_settings


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

        # Auth0 public key cache
        self._jwks = None

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)

        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

        if not credentials.scheme == "Bearer":
            raise HTTPException(
                status_code=403, detail="Invalid authentication scheme."
            )

        try:
            payload = self.decode_jwt(credentials.credentials)
        except Exception as e:
            raise HTTPException(status_code=403, detail=str(e))

        return payload

    def decode_jwt(self, token: str) -> dict:
        if not self._jwks:
            self._jwks = requests.get(
                f"https://{auth_settings.AUTH0_DOMAIN}/.well-known/jwks.json"
            ).json()

        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError:
            raise HTTPException(status_code=403, detail="Invalid token header")

        rsa_key = {}
        for key in self._jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break

        if not rsa_key:
            raise HTTPException(
                status_code=403, detail="Unable to find appropriate key"
            )

        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=auth_settings.AUTH0_ALGORITHMS,
                audience=auth_settings.AUTH0_CLIENT_ID,
                issuer=f"https://{auth_settings.AUTH0_DOMAIN}/",
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=403, detail="Token has expired")
        except jwt.JWTClaimsError:
            raise HTTPException(status_code=403, detail="Invalid claims")
        except Exception:
            raise HTTPException(status_code=403, detail="Unable to parse token")

        return payload


auth = JWTBearer()
