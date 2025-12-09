-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL,
  center_lat NUMERIC(10, 7) NOT NULL,
  center_lng NUMERIC(10, 7) NOT NULL,
  is_covered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  phone TEXT,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  salesperson_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, salesperson_id)
);

-- Create route_customers junction table
CREATE TABLE route_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  visit_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, customer_id)
);

-- Create deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered')) DEFAULT 'pending',
  visit_order INTEGER NOT NULL,
  proof_photo TEXT,
  notes TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivered_latitude NUMERIC(10, 7),
  delivered_longitude NUMERIC(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendances table
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_in_latitude NUMERIC(10, 7),
  clock_in_longitude NUMERIC(10, 7),
  clock_out_time TIMESTAMP WITH TIME ZONE,
  clock_out_latitude NUMERIC(10, 7),
  clock_out_longitude NUMERIC(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_auth_user_id ON employees(auth_user_id);
CREATE INDEX idx_customers_region_id ON customers(region_id);
CREATE INDEX idx_routes_date ON routes(date);
CREATE INDEX idx_routes_salesperson_id ON routes(salesperson_id);
CREATE INDEX idx_route_customers_route_id ON route_customers(route_id);
CREATE INDEX idx_route_customers_customer_id ON route_customers(customer_id);
CREATE INDEX idx_deliveries_route_id ON deliveries(route_id);
CREATE INDEX idx_deliveries_customer_id ON deliveries(customer_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_attendances_employee_id ON attendances(employee_id);
CREATE INDEX idx_attendances_date ON attendances(date);

-- Enable Row Level Security
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regions (everyone can read)
CREATE POLICY "Regions are viewable by everyone" ON regions
  FOR SELECT USING (true);

-- RLS Policies for employees
CREATE POLICY "Employees are viewable by authenticated users" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert employees" ON employees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for customers (everyone can read, admins can modify)
CREATE POLICY "Customers are viewable by authenticated users" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for routes
CREATE POLICY "Routes are viewable by authenticated users" ON routes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sales can view their own routes" ON routes
  FOR SELECT USING (
    salesperson_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all routes" ON routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sales can create their own routes" ON routes
  FOR INSERT WITH CHECK (
    salesperson_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policies for route_customers
CREATE POLICY "Route customers are viewable by authenticated users" ON route_customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage route customers" ON route_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sales can manage route customers for their routes" ON route_customers
  FOR ALL USING (
    route_id IN (
      SELECT r.id FROM routes r
      JOIN employees e ON r.salesperson_id = e.id
      WHERE e.auth_user_id = auth.uid()
    )
  );

-- RLS Policies for deliveries
CREATE POLICY "Deliveries are viewable by authenticated users" ON deliveries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all deliveries" ON deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sales can manage deliveries for their routes" ON deliveries
  FOR ALL USING (
    route_id IN (
      SELECT r.id FROM routes r
      JOIN employees e ON r.salesperson_id = e.id
      WHERE e.auth_user_id = auth.uid()
    )
  );

-- RLS Policies for attendances
CREATE POLICY "Attendances are viewable by authenticated users" ON attendances
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all attendances" ON attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can manage their own attendances" ON attendances
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

