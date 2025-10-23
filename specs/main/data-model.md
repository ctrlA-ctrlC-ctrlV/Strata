# Data Model: MongoDB to Supabase Migration

**Feature**: Migrate from DigitalOcean MongoDB to Supabase  
**Date**: 2025-10-22  
**Status**: Draft

## Overview

This document defines the PostgreSQL schema design that maps the existing MongoDB collections to normalized relational tables in Supabase.

## Current MongoDB Schema Analysis

### Collection: `product_configurations`
**Document Structure**:
```typescript
{
  _id: ObjectId,
  productType: 'garden-room' | 'house-extension' | 'house-build',
  size: { widthM: number; depthM: number },
  cladding: { areaSqm: number },
  bathroom: { half: number; threeQuarter: number },
  electrical: {
    switches: number,
    sockets: number,
    heater?: number,
    undersinkHeater?: number,
    elecBoiler?: number
  },
  internalDoors: number,
  internalWall: { finish: 'none' | 'panel' | 'skimPaint'; areaSqM?: number },
  heaters: number,
  glazing: {
    windows: Array<{ widthM: number; heightM: number }>,
    externalDoors: Array<{ widthM: number; heightM: number }>,
    skylights: Array<{ widthM: number; heightM: number }>
  },
  floor: { type: 'none' | 'wooden' | 'tile'; areaSqM: number },
  delivery: { distanceKm?: number; cost: number },
  extras: {
    espInsulation?: number,
    render?: number,
    steelDoor?: number,
    other: Array<{ title: string; cost: number }>
  },
  estimate: { currency: string; subtotalExVat: number; vatRate: number; totalIncVat: number },
  notes: string,
  permittedDevelopmentFlags: Array<{ code: string; label: string }>,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `quote_requests`
**Document Structure**:
```typescript
{
  _id: ObjectId,
  configId: string, // Reference to product_configurations._id
  customer: {
    firstName: string,
    lastName: string,
    email: string,
    phone: { countryPrefix: string; phoneNum: string },
    addressLine1: string,
    addressLine2?: string,
    town?: string,
    county?: string,
    eircode: string
  },
  desiredInstallTimeframe: string,
  quoteNumber: string,
  payment: {
    status: 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded',
    totalPaid: number,
    expectedInstallments?: number | null,
    lastPaymentAt?: Date | null,
    createdAt: Date,
    updatedAt: Date,
    history: Array<{
      id: string,
      type: 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT',
      amount: number,
      timestamp: Date,
      note?: string,
      installmentNo?: number | null,
      recordedBy?: string | null
    }>
  },
  retention: { expiresAt: Date },
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## PostgreSQL Schema Design

### Table: `product_configurations`

```sql
CREATE TABLE product_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('garden-room', 'house-extension', 'house-build')),
  
  -- Size information
  width_m DECIMAL(8,2) NOT NULL CHECK (width_m > 0),
  depth_m DECIMAL(8,2) NOT NULL CHECK (depth_m > 0),
  
  -- Cladding
  cladding_area_sqm DECIMAL(10,2) NOT NULL CHECK (cladding_area_sqm >= 0),
  
  -- Bathroom configuration
  bathroom_half INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_half >= 0),
  bathroom_three_quarter INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_three_quarter >= 0),
  
  -- Electrical configuration
  electrical_switches INTEGER NOT NULL DEFAULT 0 CHECK (electrical_switches >= 0),
  electrical_sockets INTEGER NOT NULL DEFAULT 0 CHECK (electrical_sockets >= 0),
  electrical_heater INTEGER CHECK (electrical_heater >= 0),
  electrical_undersink_heater INTEGER CHECK (electrical_undersink_heater >= 0),
  electrical_elec_boiler INTEGER CHECK (electrical_elec_boiler >= 0),
  
  -- Internal features
  internal_doors INTEGER NOT NULL DEFAULT 0 CHECK (internal_doors >= 0),
  internal_wall_finish VARCHAR(15) NOT NULL DEFAULT 'none' CHECK (internal_wall_finish IN ('none', 'panel', 'skimPaint')),
  internal_wall_area_sqm DECIMAL(10,2) CHECK (internal_wall_area_sqm >= 0),
  heaters INTEGER NOT NULL DEFAULT 0 CHECK (heaters >= 0),
  
  -- Floor configuration
  floor_type VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (floor_type IN ('none', 'wooden', 'tile')),
  floor_area_sqm DECIMAL(10,2) NOT NULL CHECK (floor_area_sqm >= 0),
  
  -- Delivery
  delivery_distance_km DECIMAL(8,2) CHECK (delivery_distance_km >= 0),
  delivery_cost DECIMAL(10,2) NOT NULL CHECK (delivery_cost >= 0),
  
  -- Extras (using JSONB for flexibility)
  extras_esp_insulation INTEGER CHECK (extras_esp_insulation >= 0),
  extras_render INTEGER CHECK (extras_render >= 0),
  extras_steel_door INTEGER CHECK (extras_steel_door >= 0),
  extras_other JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {title: string, cost: number}
  
  -- Estimate
  estimate_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  estimate_subtotal_ex_vat DECIMAL(12,2) NOT NULL CHECK (estimate_subtotal_ex_vat >= 0),
  estimate_vat_rate DECIMAL(5,4) NOT NULL CHECK (estimate_vat_rate >= 0),
  estimate_total_inc_vat DECIMAL(12,2) NOT NULL CHECK (estimate_total_inc_vat >= 0),
  
  -- Additional information
  notes TEXT NOT NULL DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_product_configurations_product_type ON product_configurations(product_type);
CREATE INDEX idx_product_configurations_created_at ON product_configurations(created_at);
CREATE INDEX idx_product_configurations_updated_at ON product_configurations(updated_at);
```

### Table: `glazing_elements`

```sql
CREATE TABLE glazing_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE CASCADE,
  element_type VARCHAR(15) NOT NULL CHECK (element_type IN ('window', 'external_door', 'skylight')),
  width_m DECIMAL(6,2) NOT NULL CHECK (width_m > 0),
  height_m DECIMAL(6,2) NOT NULL CHECK (height_m > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_glazing_elements_configuration_id ON glazing_elements(configuration_id);
CREATE INDEX idx_glazing_elements_type ON glazing_elements(element_type);
```

### Table: `permitted_development_flags`

```sql
CREATE TABLE permitted_development_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  label VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_permitted_development_flags_configuration_id ON permitted_development_flags(configuration_id);
CREATE INDEX idx_permitted_development_flags_code ON permitted_development_flags(code);
```

### Table: `quote_requests`

```sql
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE RESTRICT,
  
  -- Customer information
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone_country_prefix VARCHAR(10) NOT NULL,
  customer_phone_number VARCHAR(20) NOT NULL,
  customer_address_line1 VARCHAR(200) NOT NULL,
  customer_address_line2 VARCHAR(200),
  customer_town VARCHAR(100),
  customer_county VARCHAR(100),
  customer_eircode VARCHAR(10) NOT NULL,
  
  -- Quote details
  desired_install_timeframe VARCHAR(100) NOT NULL,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Payment status
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pre-quote' 
    CHECK (payment_status IN ('pre-quote', 'quoted', 'deposit-paid', 'installments', 'paid', 'overdue', 'refunded')),
  payment_total_paid DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (payment_total_paid >= 0),
  payment_expected_installments INTEGER CHECK (payment_expected_installments > 0),
  payment_last_payment_at TIMESTAMPTZ,
  payment_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Data retention
  retention_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_quote_requests_quote_number ON quote_requests(quote_number);
CREATE INDEX idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX idx_quote_requests_payment_status ON quote_requests(payment_status);
CREATE INDEX idx_quote_requests_retention_expires_at ON quote_requests(retention_expires_at);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX idx_quote_requests_configuration_id ON quote_requests(configuration_id);
```

### Table: `payment_history`

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  
  payment_type VARCHAR(15) NOT NULL CHECK (payment_type IN ('DEPOSIT', 'INSTALLMENT', 'FINAL', 'REFUND', 'ADJUSTMENT')),
  amount DECIMAL(12,2) NOT NULL,
  installment_number INTEGER CHECK (installment_number > 0),
  note TEXT,
  recorded_by VARCHAR(100),
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_history_quote_request_id ON payment_history(quote_request_id);
CREATE INDEX idx_payment_history_timestamp ON payment_history(timestamp);
CREATE INDEX idx_payment_history_type ON payment_history(payment_type);
```

## Data Type Mappings

### MongoDB → PostgreSQL Type Conversions

| MongoDB Type | PostgreSQL Type | Notes |
|--------------|-----------------|-------|
| ObjectId | UUID | Using `gen_random_uuid()` for new records |
| String | VARCHAR/TEXT | VARCHAR for limited length, TEXT for unlimited |
| Number | DECIMAL/INTEGER | DECIMAL for currency, INTEGER for counts |
| Date | TIMESTAMPTZ | Timezone-aware timestamps |
| Array of Objects | JSONB | For complex nested structures |
| Array of Primitives | Separate table | Normalized approach for simple arrays |
| Embedded Document | Flattened columns | Denormalized for performance |
| Boolean | BOOLEAN | Direct mapping |

### Data Validation Rules

1. **Check Constraints**: Ensure data integrity at database level
2. **Foreign Key Constraints**: Maintain referential integrity
3. **Not Null Constraints**: Enforce required fields
4. **Unique Constraints**: Prevent duplicate quote numbers
5. **Default Values**: Provide sensible defaults for optional fields

## Implementation Considerations

### Schema Design Principles

1. **ID Strategy**: 
   - Use PostgreSQL UUID primary keys with `gen_random_uuid()` default
   - Consistent UUID format across all tables for better distribution

2. **Data Organization**:
   - `glazing.windows/doors/skylights` → Separate `glazing_elements` table with type field
   - `permittedDevelopmentFlags` → Separate `permitted_development_flags` table
   - `payment.history` → Separate `payment_history` table for audit trail
   - `extras.other` → Keep as JSONB for flexibility while maintaining structure

3. **Data Types**:
   - Use TIMESTAMPTZ for all date/time fields (timezone-aware)
   - DECIMAL for currency and measurements (avoid floating point precision issues)
   - Appropriate VARCHAR limits for text fields with validation

4. **Constraints and Validation**:
   - Check constraints for business logic validation at database level
   - Foreign key constraints for referential integrity
   - Not null constraints for required fields
   - Unique constraints where appropriate

### Performance Optimization

1. **Indexing Strategy**:
   - Primary keys for all tables
   - Foreign key indexes for join performance
   - Query-specific indexes (email, quote number, dates)
   - Composite indexes where needed

2. **Query Patterns**:
   - Most queries will be single-quote retrieval by ID or quote number
   - Admin queries will filter by status, date ranges
   - Reporting queries may aggregate by product type, date

## Row Level Security (RLS) Policies

### Initial Policies (Permissive)

```sql
-- Enable RLS on all tables
ALTER TABLE product_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE permitted_development_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policies (tighten when auth is implemented)
CREATE POLICY "Allow all operations during migration" ON product_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON glazing_elements FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON permitted_development_flags FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON quote_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON payment_history FOR ALL USING (true);
```

## Update Triggers

```sql
-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_configurations_updated_at
    BEFORE UPDATE ON product_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Schema Versioning

The schema will be managed through Supabase migrations:

1. **Initial Schema**: Create all tables, indexes, and constraints
2. **Validation**: Test schema with sample data and application code
3. **Optimization**: Add performance indexes based on expected usage patterns
4. **Future Evolution**: Use Supabase migrations for schema changes

## Next Steps

1. Create Supabase project and apply schema migrations
2. Implement TypeScript types generated from schema
3. Create repository classes with Supabase client
4. Develop comprehensive tests for new implementation
5. Update application configuration for Supabase connection