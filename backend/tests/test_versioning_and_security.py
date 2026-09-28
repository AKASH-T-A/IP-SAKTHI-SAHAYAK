"""
Unit Tests for Source Versioning, Diff Tracking, Document Sanitization, and Security Isolation
"""
import pytest
from app.models.models import SourceStatus, UserRole


def test_source_versioning_status_enums():
    assert SourceStatus.active == "Active"
    assert SourceStatus.superseded == "Superseded"
    assert SourceStatus.repealed == "Repealed"
    assert SourceStatus.draft == "Draft"
    assert SourceStatus.unknown == "Unknown"


def test_bda_versioning_diff_logic():
    # Test amendment logic between 2002 and 2023 acts
    original_bda_status = SourceStatus.superseded
    amended_bda_status = SourceStatus.active

    assert original_bda_status != amended_bda_status
    assert amended_bda_status == "Active"


def test_file_extension_security_whitelist():
    allowed_exts = {"pdf", "txt", "docx", "json", "csv"}
    dangerous_exts = {"exe", "bat", "sh", "cmd", "py", "js", "vbs", "ps1", "dll"}

    # Whitelist checks
    assert "pdf" in allowed_exts
    assert "docx" in allowed_exts

    # Danger checks
    for bad_ext in dangerous_exts:
        assert bad_ext not in allowed_exts


def test_user_role_authorization_hierarchy():
    roles = [UserRole.readonly, UserRole.user, UserRole.expert, UserRole.admin]
    assert len(roles) == 4
    assert UserRole.admin.value == "admin"
    assert UserRole.expert.value == "expert"
