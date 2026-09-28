"""
Regression tests for Authentication Endpoints:
- registration success
- duplicate email
- invalid registration (invalid email, weak password)
- login after registration
- authentication failure
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_registration_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"user_{uuid.uuid4().hex[:8]}@ipsakti.in"
        payload = {
            "name": "Integration User",
            "email": unique_email,
            "password": "Password@123",
            "language_preference": "en",
        }
        res = await client.post("/api/v1/auth/register", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["name"] == "Integration User"


@pytest.mark.asyncio
async def test_registration_duplicate_email():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@ipsakti.in"
        payload = {
            "name": "First Instance",
            "email": unique_email,
            "password": "Password@123",
            "language_preference": "hi",
        }
        res1 = await client.post("/api/v1/auth/register", json=payload)
        assert res1.status_code == 201

        # Duplicate registration
        res2 = await client.post("/api/v1/auth/register", json=payload)
        assert res2.status_code == 400
        assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_registration_invalid_inputs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid email
        res1 = await client.post("/api/v1/auth/register", json={
            "name": "Invalid Email User",
            "email": "not-an-email",
            "password": "Password@123",
        })
        assert res1.status_code == 422

        # Password too short
        res2 = await client.post("/api/v1/auth/register", json={
            "name": "Short Pwd User",
            "email": f"short_{uuid.uuid4().hex[:8]}@ipsakti.in",
            "password": "Short1",
        })
        assert res2.status_code == 422

        # Password without uppercase
        res3 = await client.post("/api/v1/auth/register", json={
            "name": "No Upper User",
            "email": f"noupper_{uuid.uuid4().hex[:8]}@ipsakti.in",
            "password": "password123",
        })
        assert res3.status_code == 422

        # Password without number
        res4 = await client.post("/api/v1/auth/register", json={
            "name": "No Num User",
            "email": f"nonum_{uuid.uuid4().hex[:8]}@ipsakti.in",
            "password": "PasswordOnly",
        })
        assert res4.status_code == 422


@pytest.mark.asyncio
async def test_login_after_registration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email = f"login_{uuid.uuid4().hex[:8]}@ipsakti.in"
        password = "SecurePassword@123"

        # Register
        reg_res = await client.post("/api/v1/auth/register", json={
            "name": "Login Tester",
            "email": email,
            "password": password,
            "language_preference": "ta",
        })
        assert reg_res.status_code == 201

        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password,
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["user"]["email"] == email


@pytest.mark.asyncio
async def test_authentication_failure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Wrong password
        res_wrong_pw = await client.post("/api/v1/auth/login", json={
            "email": "testuser@ipsakti.in",
            "password": "WrongPassword@999",
        })
        assert res_wrong_pw.status_code == 401
        assert "Invalid email or password" in res_wrong_pw.json()["detail"]

        # Non-existent user
        res_no_user = await client.post("/api/v1/auth/login", json={
            "email": "nonexistent_ghost_user@ipsakti.in",
            "password": "Password@123",
        })
        assert res_no_user.status_code == 401
        assert "Invalid email or password" in res_no_user.json()["detail"]
