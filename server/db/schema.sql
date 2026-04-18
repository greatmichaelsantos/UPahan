-- UPahan Database Schema

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'tenant' CHECK (role IN ('admin', 'tenant')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
  unit_id SERIAL PRIMARY KEY,
  unit_code VARCHAR(10) UNIQUE NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  vacancy_status VARCHAR(20) DEFAULT 'vacant' CHECK (vacancy_status IN ('vacant', 'occupied', 'under_maintenance')),
  floor_plan TEXT,
  location VARCHAR(255),
  description TEXT,
  admin_id INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unit_photos (
  photo_id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(unit_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  unit_id INTEGER REFERENCES units(unit_id),
  lease_start_date DATE,
  lease_end_date DATE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(tenant_id),
  unit_id INTEGER REFERENCES units(unit_id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE,
  payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'partial', 'late', 'advance', 'pending')),
  month_covered VARCHAR(7),
  payment_type VARCHAR(20) DEFAULT 'full' CHECK (payment_type IN ('full', 'partial', 'advance')),
  payment_method VARCHAR(50),
  notes TEXT,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  request_id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(tenant_id),
  unit_id INTEGER REFERENCES units(unit_id),
  issue_category VARCHAR(50) CHECK (issue_category IN ('plumbing', 'electrical', 'structural', 'others')),
  subject VARCHAR(255),
  description TEXT,
  priority_level VARCHAR(10) DEFAULT 'low' CHECK (priority_level IN ('high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_photos (
  photo_id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
