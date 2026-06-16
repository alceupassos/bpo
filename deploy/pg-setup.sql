ALTER ROLE bpo WITH LOGIN PASSWORD 'bpo_angra_2026';
GRANT ALL PRIVILEGES ON DATABASE angra_bpo TO bpo;
\connect angra_bpo
ALTER SCHEMA public OWNER TO bpo;
GRANT ALL ON SCHEMA public TO bpo;
