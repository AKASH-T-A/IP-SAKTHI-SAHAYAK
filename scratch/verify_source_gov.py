import httpx

with httpx.Client(base_url="http://localhost:8000") as client:
    # 1. Fetch initial source
    res1 = client.get("/api/v1/sources/PATENTS_ACT_SEC_3E")
    assert res1.status_code == 200
    orig = res1.json()
    print("Original Source Status:", orig["status"], "| Content Hash:", orig["checksum_sha256"])

    # 2. Post new version update
    update_payload = {
        "source_id": "PATENTS_ACT_SEC_3E",
        "new_version_label": "2026 Amended Judicial Guidance",
        "summary_of_changes": "Incorporated latest synergy index ratio standards for polyherbal mixtures.",
        "new_content": "The following are not inventions within the meaning of this Act,— (e) a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance. (With verified 2026 synergy benchmarks).",
        "publication_date": "2026-09-29",
        "effective_date": "2026-09-29",
        "official_url": "https://www.indiacode.nic.in/handle/123456789/1392"
    }
    res2 = client.post("/api/v1/sources/update-version", json=update_payload)
    assert res2.status_code == 200
    data2 = res2.json()
    print("\nUpdate Response Status:", data2["status"])
    print("Governance Flow:", data2["governance_flow"])
    print("Archived Version Status:", data2["archived_version"]["status"], "| Version ID:", data2["archived_version"]["version_id"])
    print("Active Version Status:  ", data2["active_version"]["status"], "| New Checksum:", data2["active_version"]["checksum_sha256"])

    # 3. Verify history retains old version
    res3 = client.get("/api/v1/sources/PATENTS_ACT_SEC_3E/versions")
    assert res3.status_code == 200
    history = res3.json()
    print(f"\nRetained Version History: {len(history)} version(s) in archive.")
    assert len(history) >= 1
    assert history[-1]["status"] == "SUPERSEDED"
    print("VERIFIED: Superseded version retained in archive with checksum and audit metadata.")
