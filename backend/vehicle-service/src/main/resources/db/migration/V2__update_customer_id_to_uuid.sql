-- Migration to update customer_id from BIGINT to VARCHAR(36) for UUID support

-- First, create a temporary column
ALTER TABLE vehicles ADD COLUMN customer_id_new VARCHAR(36);

-- Update the temporary column with the string representation of the existing IDs
UPDATE vehicles SET customer_id_new = CAST(customer_id AS VARCHAR);

-- Drop the old column
ALTER TABLE vehicles DROP COLUMN customer_id;

-- Rename the temporary column
ALTER TABLE vehicles RENAME COLUMN customer_id_new TO customer_id;

-- Add NOT NULL constraint
ALTER TABLE vehicles ALTER COLUMN customer_id SET NOT NULL;

-- Create index for performance
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);