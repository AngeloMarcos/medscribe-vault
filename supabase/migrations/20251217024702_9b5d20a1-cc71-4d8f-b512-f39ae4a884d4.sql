-- Table for queue tickets (senhas)
CREATE TABLE queue_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  ticket_number VARCHAR(10) NOT NULL,
  ticket_type VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'priority', 'elderly', 'disability'
  patient_id UUID REFERENCES patients(id),
  patient_name VARCHAR(200),
  sector VARCHAR(50) NOT NULL DEFAULT 'reception', -- 'reception', 'nursing', 'medical', 'pharmacy', 'exam'
  status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'called', 'in_service', 'completed', 'cancelled', 'no_show'
  guiche VARCHAR(20), -- counter/window number
  called_at TIMESTAMPTZ,
  called_by UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_ticket_type CHECK (ticket_type IN ('normal', 'priority', 'elderly', 'disability')),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'called', 'in_service', 'completed', 'cancelled', 'no_show'))
);

-- Indexes for performance
CREATE INDEX idx_queue_tickets_tenant_status ON queue_tickets(tenant_id, status);
CREATE INDEX idx_queue_tickets_created_at ON queue_tickets(created_at DESC);
CREATE INDEX idx_queue_tickets_sector ON queue_tickets(sector, status);

-- Enable RLS
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view tickets from their tenant"
  ON queue_tickets FOR SELECT
  USING (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Users can insert tickets in their tenant"
  ON queue_tickets FOR INSERT
  WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Users can update tickets in their tenant"
  ON queue_tickets FOR UPDATE
  USING (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Enable realtime for queue_tickets
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;

-- Table for call history (for display panel history)
CREATE TABLE queue_call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  ticket_id UUID REFERENCES queue_tickets(id),
  ticket_number VARCHAR(10) NOT NULL,
  guiche VARCHAR(20) NOT NULL,
  called_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_queue_call_history_tenant ON queue_call_history(tenant_id, called_at DESC);

-- Enable RLS
ALTER TABLE queue_call_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view call history from their tenant"
  ON queue_call_history FOR SELECT
  USING (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Users can insert call history in their tenant"
  ON queue_call_history FOR INSERT
  WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Enable realtime for queue_call_history
ALTER PUBLICATION supabase_realtime ADD TABLE queue_call_history;