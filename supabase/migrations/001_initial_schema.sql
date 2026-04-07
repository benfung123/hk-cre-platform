-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    district VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'A+')),
    year_built INTEGER,
    total_sqft INTEGER,
    floors INTEGER,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'lease')),
    price DECIMAL(15, 2),
    price_per_sqft DECIMAL(10, 2),
    date DATE NOT NULL,
    tenant_name VARCHAR(255),
    floor_area INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenancies table
CREATE TABLE tenancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_name VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    unit VARCHAR(50),
    lease_start DATE,
    lease_end DATE,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_grade ON properties(grade);
CREATE INDEX idx_transactions_property_id ON transactions(property_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_tenancies_property_id ON tenancies(property_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Allow public read access" ON properties
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access" ON transactions
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access" ON tenancies
    FOR SELECT TO anon, authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for properties
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
