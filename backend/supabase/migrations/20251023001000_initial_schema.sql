-- Initial PostgreSQL schema migration for Strata Garden Rooms
-- Migration: 20251023_001_initial_schema.sql
-- Purpose: Create all tables, indexes, RLS policies, and triggers for MongoDB to Supabase migration
-- Date: 2025-10-23

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Table: product_configurations
-- Stores garden room configuration data (previously MongoDB product_configurations collection)
CREATE TABLE product_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('garden-room', 'house-extension', 'house-build')),
  
  -- Size information
  width_m DECIMAL(8,2) NOT NULL CHECK (width_m > 0),
  depth_m DECIMAL(8,2) NOT NULL CHECK (depth_m > 0),
  height_m DECIMAL(8,2) NOT NULL CHECK (height_m > 0),
  
  -- Cladding
  cladding_area_sqm DECIMAL(10,2) NOT NULL CHECK (cladding_area_sqm >= 0),
  
  -- Bathroom configuration
  bathroom_half INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_half >= 0),
  bathroom_three_quarter INTEGER NOT NULL DEFAULT 0 CHECK (bathroom_three_quarter >= 0),
  
  -- Electrical configuration
  electrical_switches INTEGER NOT NULL DEFAULT 0 CHECK (electrical_switches >= 0),
  electrical_sockets INTEGER NOT NULL DEFAULT 0 CHECK (electrical_sockets >= 0),
  electrical_downlight INTEGER NOT NULL DEFAULT 0 CHECK (electrical_downlight >= 0),
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
  
  -- Extras
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

-- Table: glazing_elements
-- Normalized table for windows, doors, and skylights (previously embedded in glazing object)
CREATE TABLE glazing_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE CASCADE,
  element_type VARCHAR(15) NOT NULL CHECK (element_type IN ('window', 'external_door', 'skylight')),
  width_m DECIMAL(6,2) NOT NULL CHECK (width_m > 0),
  height_m DECIMAL(6,2) NOT NULL CHECK (height_m > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: permitted_development_flags
-- Normalized table for permitted development flags (previously embedded array)
CREATE TABLE permitted_development_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  label VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: quote_requests
-- Quote request data (previously MongoDB quote_requests collection)
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID NOT NULL REFERENCES product_configurations(id) ON DELETE RESTRICT,
  
  -- Customer information
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100),
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

-- Table: payment_history
-- Payment history audit trail (previously embedded in payment.history array)
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

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Product configurations indexes
CREATE INDEX idx_product_configurations_product_type ON product_configurations(product_type);
CREATE INDEX idx_product_configurations_created_at ON product_configurations(created_at);
CREATE INDEX idx_product_configurations_updated_at ON product_configurations(updated_at);

-- Glazing elements indexes
CREATE INDEX idx_glazing_elements_configuration_id ON glazing_elements(configuration_id);
CREATE INDEX idx_glazing_elements_type ON glazing_elements(element_type);

-- Permitted development flags indexes
CREATE INDEX idx_permitted_development_flags_configuration_id ON permitted_development_flags(configuration_id);
CREATE INDEX idx_permitted_development_flags_code ON permitted_development_flags(code);

-- Quote requests indexes
CREATE UNIQUE INDEX idx_quote_requests_quote_number ON quote_requests(quote_number);
CREATE INDEX idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX idx_quote_requests_payment_status ON quote_requests(payment_status);
CREATE INDEX idx_quote_requests_retention_expires_at ON quote_requests(retention_expires_at);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX idx_quote_requests_configuration_id ON quote_requests(configuration_id);

-- Payment history indexes
CREATE INDEX idx_payment_history_quote_request_id ON payment_history(quote_request_id);
CREATE INDEX idx_payment_history_timestamp ON payment_history(timestamp);
CREATE INDEX idx_payment_history_type ON payment_history(payment_type);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_product_configurations_updated_at
    BEFORE UPDATE ON product_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =============================================

-- Enable RLS on all tables
ALTER TABLE product_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE permitted_development_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policies (tighten when auth is implemented)
-- These allow all operations during the migration phase
CREATE POLICY "Allow all operations during migration" ON product_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON glazing_elements FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON permitted_development_flags FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON quote_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations during migration" ON payment_history FOR ALL USING (true);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

-- Table comments
COMMENT ON TABLE product_configurations IS 'Garden room product configurations migrated from MongoDB collection';
COMMENT ON TABLE glazing_elements IS 'Windows, doors, and skylights normalized from glazing object';
COMMENT ON TABLE permitted_development_flags IS 'Permitted development flags normalized from embedded array';
COMMENT ON TABLE quote_requests IS 'Quote requests migrated from MongoDB collection';
COMMENT ON TABLE payment_history IS 'Payment audit trail normalized from payment.history array';