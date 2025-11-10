-- Create appointments table if not exists
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(255) PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(255) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    booking_date_time TIMESTAMP NOT NULL,
    additional_note TEXT,
    payment_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'CREATED' NOT NULL,
    is_assigned BOOLEAN DEFAULT FALSE NOT NULL,
    assigned_employee_id BIGINT,
    duration INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);