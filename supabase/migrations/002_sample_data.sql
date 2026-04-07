-- Insert sample Hong Kong commercial properties

-- Central District Properties
INSERT INTO properties (name, address, district, grade, year_built, total_sqft, floors, lat, lng) VALUES
('International Finance Centre (IFC)', '8 Finance Street, Central', 'Central', 'A+', 2003, 4300000, 88, 22.2850, 114.1580),
('Exchange Square', '8 Connaught Place, Central', 'Central', 'A+', 1985, 2100000, 52, 22.2835, 114.1590),
('Cheung Kong Center', '2 Queen''s Road Central, Central', 'Central', 'A+', 1999, 1300000, 63, 22.2795, 114.1595),
('HSBC Main Building', '1 Queen''s Road Central, Central', 'Central', 'A+', 1985, 1000000, 47, 22.2790, 114.1590),
('Bank of China Tower', '1 Garden Road, Central', 'Central', 'A+', 1990, 1100000, 72, 22.2792, 114.1615),
('Jardine House', '1 Connaught Place, Central', 'Central', 'A', 1972, 850000, 52, 22.2830, 114.1600),
('Man Yee Building', '68 Des Voeux Road Central, Central', 'Central', 'A', 1999, 450000, 35, 22.2835, 114.1565),
('World Wide House', '19 Des Voeux Road Central, Central', 'Central', 'A', 1981, 380000, 40, 22.2820, 114.1570),
('The Center', '99 Queen''s Road Central, Central', 'Central', 'A+', 1998, 1400000, 73, 22.2845, 114.1550),
('Chater House', '8 Connaught Road Central, Central', 'Central', 'A', 2003, 550000, 30, 22.2825, 114.1585);

-- Admiralty Properties
INSERT INTO properties (name, address, district, grade, year_built, total_sqft, floors, lat, lng) VALUES
('Pacific Place', '88 Queensway, Admiralty', 'Admiralty', 'A+', 1988, 2100000, 46, 22.2770, 114.1660),
('Lippo Centre', '89 Queensway, Admiralty', 'Admiralty', 'A', 1988, 750000, 46, 22.2780, 114.1650),
('United Centre', '95 Queensway, Admiralty', 'Admiralty', 'A', 1980, 420000, 35, 22.2765, 114.1655),
('Far East Finance Centre', '16 Harcourt Road, Admiralty', 'Admiralty', 'A', 1982, 380000, 38, 22.2795, 114.1640),
('Admiralty Centre', '18 Harcourt Road, Admiralty', 'Admiralty', 'A', 1980, 520000, 34, 22.2785, 114.1645);

-- Tsim Sha Tsui Properties
INSERT INTO properties (name, address, district, grade, year_built, total_sqft, floors, lat, lng) VALUES
('International Commerce Centre (ICC)', '1 Austin Road West, Tsim Sha Tsui', 'Tsim Sha Tsui', 'A+', 2010, 2800000, 118, 22.3030, 114.1605),
('The Gateway', '25 Canton Road, Tsim Sha Tsui', 'Tsim Sha Tsui', 'A', 1996, 1200000, 65, 22.2970, 114.1690),
('Ocean Centre', '5 Canton Road, Tsim Sha Tsui', 'Tsim Sha Tsui', 'A', 1977, 680000, 30, 22.2960, 114.1695),
('World Trade Centre', '280 Gloucester Road, Causeway Bay', 'Causeway Bay', 'A', 1975, 450000, 38, 22.2805, 114.1830),
('Times Square', '1 Matheson Street, Causeway Bay', 'Causeway Bay', 'A+', 1994, 1800000, 52, 22.2785, 114.1820),
('Sino Plaza', '255 Gloucester Road, Causeway Bay', 'Causeway Bay', 'A', 1992, 380000, 28, 22.2810, 114.1835);

-- Sample Transactions
INSERT INTO transactions (property_id, type, price, price_per_sqft, date, tenant_name, floor_area) 
SELECT 
    id as property_id,
    'lease' as type,
    CASE 
        WHEN grade = 'A+' THEN 150000 + (random() * 100000)::int
        WHEN grade = 'A' THEN 80000 + (random() * 70000)::int
        ELSE 50000 + (random() * 30000)::int
    END as price,
    CASE 
        WHEN grade = 'A+' THEN 80 + (random() * 40)::int
        WHEN grade = 'A' THEN 50 + (random() * 30)::int
        ELSE 30 + (random() * 20)::int
    END as price_per_sqft,
    (CURRENT_DATE - (random() * 365)::int) as date,
    CASE (random() * 5)::int
        WHEN 0 THEN 'HSBC'
        WHEN 1 THEN 'JP Morgan'
        WHEN 2 THEN 'Goldman Sachs'
        WHEN 3 THEN 'Standard Chartered'
        WHEN 4 THEN 'Bank of America'
        ELSE 'Deutsche Bank'
    END as tenant_name,
    (1000 + random() * 5000)::int as floor_area
FROM properties
WHERE district = 'Central'
LIMIT 20;

-- More transactions for other districts
INSERT INTO transactions (property_id, type, price, price_per_sqft, date, tenant_name, floor_area) 
SELECT 
    id as property_id,
    CASE WHEN random() > 0.7 THEN 'sale' ELSE 'lease' END as type,
    CASE 
        WHEN grade = 'A+' THEN 200000 + (random() * 150000)::int
        WHEN grade = 'A' THEN 100000 + (random() * 100000)::int
        ELSE 60000 + (random() * 40000)::int
    END as price,
    CASE 
        WHEN grade = 'A+' THEN 100 + (random() * 50)::int
        WHEN grade = 'A' THEN 60 + (random() * 40)::int
        ELSE 35 + (random() * 25)::int
    END as price_per_sqft,
    (CURRENT_DATE - (random() * 730)::int) as date,
    CASE (random() * 10)::int
        WHEN 0 THEN 'HSBC'
        WHEN 1 THEN 'JP Morgan'
        WHEN 2 THEN 'Goldman Sachs'
        WHEN 3 THEN 'Standard Chartered'
        WHEN 4 THEN 'Bank of America'
        WHEN 5 THEN 'Apple'
        WHEN 6 THEN 'Google'
        WHEN 7 THEN 'Microsoft'
        WHEN 8 THEN 'KPMG'
        WHEN 9 THEN 'PwC'
        ELSE 'Deloitte'
    END as tenant_name,
    (800 + random() * 4000)::int as floor_area
FROM properties
WHERE district != 'Central'
LIMIT 30;

-- Sample Tenancies
INSERT INTO tenancies (property_id, tenant_name, floor, unit, lease_start, lease_end, industry)
SELECT 
    id as property_id,
    CASE (random() * 12)::int
        WHEN 0 THEN 'HSBC'
        WHEN 1 THEN 'JP Morgan'
        WHEN 2 THEN 'Goldman Sachs'
        WHEN 3 THEN 'Standard Chartered'
        WHEN 4 THEN 'Bank of America'
        WHEN 5 THEN 'Apple'
        WHEN 6 THEN 'Google'
        WHEN 7 THEN 'Microsoft'
        WHEN 8 THEN 'KPMG'
        WHEN 9 THEN 'PwC'
        WHEN 10 THEN 'Deloitte'
        WHEN 11 THEN 'EY'
        ELSE 'Citi'
    END as tenant_name,
    (10 + (random() * 50)::int)::text || 'F' as floor,
    CASE (random() * 4)::int
        WHEN 0 THEN 'A'
        WHEN 1 THEN 'B'
        WHEN 2 THEN 'C'
        WHEN 3 THEN 'D'
        ELSE 'E'
    END as unit,
    (CURRENT_DATE - (random() * 365)::int) as lease_start,
    (CURRENT_DATE + (random() * 730)::int) as lease_end,
    CASE (random() * 6)::int
        WHEN 0 THEN 'Banking & Finance'
        WHEN 1 THEN 'Technology'
        WHEN 2 THEN 'Professional Services'
        WHEN 3 THEN 'Legal'
        WHEN 4 THEN 'Insurance'
        WHEN 5 THEN 'Consulting'
        ELSE 'Real Estate'
    END as industry
FROM properties
LIMIT 40;
