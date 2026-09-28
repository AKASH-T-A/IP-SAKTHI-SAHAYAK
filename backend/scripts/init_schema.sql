-- ==============================================================================
-- IP-SAKTI Sahayak — PostgreSQL + pgvector Production Schema
-- SIH Problem Statement: SIH26045
-- Domain: Multilingual AI + Ayurveda IP & Regulatory Intelligence
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Custom Enumerations
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'expert', 'user', 'readonly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE jurisdiction_enum AS ENUM ('India', 'International', 'EU', 'US');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('Act', 'Rule', 'Regulation', 'Notification', 'Treaty', 'Guidance', 'TK Evidence', 'Patent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_status AS ENUM ('Active', 'Superseded', 'Repealed', 'Draft', 'Unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_strength AS ENUM ('High', 'Moderate', 'Low', 'Insufficient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ip_type AS ENUM ('Patent', 'Trademark', 'Geographical Indication', 'Copyright', 'Industrial Design', 'Plant Variety Protection');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255),
    role user_role DEFAULT 'user',
    language_preference VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 4. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status case_status DEFAULT 'draft',
    jurisdiction jurisdiction_enum DEFAULT 'India',
    language VARCHAR(10) DEFAULT 'en',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_cases_user_active ON cases(user_id, deleted_at);

-- 5. Formulations Table (Formulation DNA)
CREATE TABLE IF NOT EXISTS formulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID UNIQUE NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name VARCHAR(500),
    product_type VARCHAR(100),
    dosage_form VARCHAR(100),
    ingredients JSONB,
    preparation_method TEXT,
    classical_basis TEXT,
    intended_use TEXT,
    consumer_target VARCHAR(200),
    commercial_intent VARCHAR(100),
    target_market VARCHAR(200),
    traditional_knowledge_flag BOOLEAN DEFAULT false,
    biodiversity_flag BOOLEAN DEFAULT false,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Classifications Table
CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    classification_type VARCHAR(200),
    sub_classification VARCHAR(200),
    rule_ids JSONB,
    candidate_classifications JSONB,
    evidence_strength evidence_strength,
    ai_explanation TEXT,
    missing_information JSONB,
    citations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_classifications_case ON classifications(case_id);

-- 7. IP Pathways Table
CREATE TABLE IF NOT EXISTS ip_pathways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    ip_type ip_type NOT NULL,
    relevance_status VARCHAR(50) DEFAULT 'Possibly Relevant',
    pathway_steps JSONB,
    requirements JSONB,
    evidence_strength evidence_strength,
    ai_explanation TEXT,
    citations JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ip_pathways_case ON ip_pathways(case_id);

-- 8. Sources Table (Statutory Knowledge Corpus)
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    authority VARCHAR(200) NOT NULL,
    jurisdiction jurisdiction_enum NOT NULL,
    source_type source_type NOT NULL,
    version_label VARCHAR(200),
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    status source_status DEFAULT 'Unknown',
    url VARCHAR(1000),
    document_hash VARCHAR(64),
    retrieved_at TIMESTAMP WITH TIME ZONE,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_version_id UUID REFERENCES sources(id),
    authority_rank INTEGER DEFAULT 5
);
CREATE INDEX IF NOT EXISTS ix_sources_authority ON sources(authority);
CREATE INDEX IF NOT EXISTS ix_sources_type ON sources(source_type);

-- 9. Source Versions & Diff Tracking (Regulatory Time Machine)
CREATE TABLE IF NOT EXISTS source_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    version_label VARCHAR(200) NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE,
    effective_date TIMESTAMP WITH TIME ZONE,
    status source_status DEFAULT 'Active',
    gazette_reference VARCHAR(300),
    summary_of_changes TEXT,
    diff_clauses JSONB,
    official_url VARCHAR(1000),
    hash_sha256 VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_source_versions_source_status ON source_versions(source_id, status);

-- 10. Source Chunks Table (pgvector Semantic & Keyword Retrieval)
CREATE TABLE IF NOT EXISTS source_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    legal_path VARCHAR(500),
    chunk_index INTEGER NOT NULL,
    token_count INTEGER,
    embedding VECTOR(1536),
    embedding_json TEXT,
    bm25_tokens TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_source_chunks_source ON source_chunks(source_id);
-- HNSW / IVFFlat Vector Index for Cosine Distance
CREATE INDEX IF NOT EXISTS ix_source_chunks_embedding_cosine ON source_chunks 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 11. Documents Table (Secure Case Uploads)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename_sanitized VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    storage_key VARCHAR(1000) NOT NULL,
    extraction_status VARCHAR(50) DEFAULT 'pending',
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_documents_case_user ON documents(case_id, user_id);

-- 12. Evidence Gaps Table
CREATE TABLE IF NOT EXISTS evidence_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    gap_key VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    why_it_matters TEXT NOT NULL,
    what_to_provide TEXT NOT NULL,
    decision_affected VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_evidence_gaps_case_status ON evidence_gaps(case_id, status);

-- 13. Case Reports Table (Case Dossiers)
CREATE TABLE IF NOT EXISTS case_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_reference VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'comprehensive_intelligence_dossier',
    status VARCHAR(50) DEFAULT 'generated',
    snapshot_dna JSONB,
    executive_summary TEXT,
    report_payload JSONB NOT NULL,
    corpus_version_hash VARCHAR(64),
    disclaimers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_case_reports_case_time ON case_reports(case_id, created_at);

-- 14. Assistant Sessions & Messages Table
CREATE TABLE IF NOT EXISTS assistant_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    title VARCHAR(300) DEFAULT 'Case Decision Session',
    language_code VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assistant_sessions_user_case ON assistant_sessions(user_id, case_id);

CREATE TABLE IF NOT EXISTS assistant_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    structured_sections JSONB,
    detected_intent VARCHAR(100),
    language_code VARCHAR(10) DEFAULT 'en',
    citations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assistant_messages_session_time ON assistant_messages(session_id, created_at);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(200) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    log_metadata JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_time ON audit_logs(user_id, created_at);
