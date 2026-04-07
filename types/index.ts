export interface Property {
  id: string;
  name: string;
  address: string;
  district: string;
  grade: 'A+' | 'A' | 'B' | 'C';
  year_built: number | null;
  total_sqft: number | null;
  floors: number | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  property_id: string;
  type: 'sale' | 'lease';
  price: number | null;
  price_per_sqft: number | null;
  date: string;
  tenant_name: string | null;
  floor_area: number | null;
  created_at: string;
}

export interface Tenancy {
  id: string;
  property_id: string;
  tenant_name: string;
  floor: string | null;
  unit: string | null;
  lease_start: string | null;
  lease_end: string | null;
  industry: string | null;
  created_at: string;
}

export interface PropertyWithDetails extends Property {
  transactions: Transaction[];
  tenancies: Tenancy[];
}

export interface MarketStats {
  totalProperties: number;
  avgRentPerSqft: number;
  totalTransactions: number;
  avgPricePerSqft: number;
}

export interface DistrictStats {
  district: string;
  propertyCount: number;
  avgPricePerSqft: number;
  transactionCount: number;
}
