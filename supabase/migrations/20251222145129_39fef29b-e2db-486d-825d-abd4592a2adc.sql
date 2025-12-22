
-- SEED DATA: MÓDULO ODONTOLÓGICO COMPLETO (CORRIGIDO)

-- 1. Atualizar pacientes existentes
UPDATE patients SET tenant_id = '90db0cef-ba20-4d1c-bfec-7f35a9218906' WHERE tenant_id IS NULL;

-- 2. Criar pacientes
INSERT INTO patients (name, cpf, birth_date, phone, insurance, medical_record_number, tenant_id) VALUES
('Ana Carolina Mendes', '111.222.333-44', '1988-03-15', '(11) 98765-4321', 'Amil Dental', 'OD-2001', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Pedro Henrique Silva', '222.333.444-55', '1995-07-22', '(11) 97654-3210', 'Particular', 'OD-2002', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Mariana Costa Oliveira', '333.444.555-66', '1982-11-08', '(11) 96543-2109', 'Bradesco Dental', 'OD-2003', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Lucas Gabriel Santos', '444.555.666-77', '2010-05-20', '(11) 95432-1098', 'SulAmérica Odonto', 'OD-2004', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Fernanda Rodrigues Lima', '555.666.777-88', '1975-09-30', '(11) 94321-0987', 'Particular', 'OD-2005', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Rafael Augusto Pereira', '666.777.888-99', '1990-01-12', '(11) 93210-9876', 'Amil Dental', 'OD-2006', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Camila Beatriz Souza', '777.888.999-00', '2000-06-25', '(11) 92109-8765', 'OdontoPrev', 'OD-2007', '90db0cef-ba20-4d1c-bfec-7f35a9218906'),
('Thiago Martins Alves', '888.999.000-11', '1968-12-03', '(11) 91098-7654', 'Particular', 'OD-2008', '90db0cef-ba20-4d1c-bfec-7f35a9218906');

-- 3. Criar profissionais (dentistas)
INSERT INTO profissionais (nome, cpf, registro_profissional, tipo_registro, telefone, email, ativo) VALUES
('Dr. Carlos Eduardo Santos', '123.456.789-01', 'CRO-SP 12345', 'CRO', '(11) 99999-1111', 'carlos.santos@clinica.com', true),
('Dra. Juliana Ferreira Costa', '234.567.890-12', 'CRO-SP 23456', 'CRO', '(11) 99999-2222', 'juliana.ferreira@clinica.com', true),
('Dr. Roberto Almeida Junior', '345.678.901-23', 'CRO-SP 34567', 'CRO', '(11) 99999-3333', 'roberto.almeida@clinica.com', true),
('Dra. Mariana Costa Lima', '456.789.012-34', 'CRO-SP 45678', 'CRO', '(11) 99999-4444', 'mariana.costa@clinica.com', true);

-- 4. Criar agendamentos usando subqueries
INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE, '08:00', '09:00', 60, 'Cadeira 1', 'agendado', 'Avaliação completa', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE, '09:00', '09:30', 30, 'Cadeira 1', 'confirmado', 'Limpeza', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '222.333.444-55' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE, '08:30', '10:00', 90, 'Cadeira 2', 'aguardando', 'Canal sessão 2', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '333.444.555-66' AND pr.registro_profissional = 'CRO-SP 23456';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE, '10:00', '10:30', 30, 'Cadeira 2', 'em_atendimento', 'Aplicação flúor', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '444.555.666-77' AND pr.registro_profissional = 'CRO-SP 23456';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE, '14:00', '15:00', 60, 'Cadeira 3', 'agendado', 'Extração 38', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '555.666.777-88' AND pr.registro_profissional = 'CRO-SP 34567';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, hora_chegada, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE - 7, '08:00', '08:30', 30, 'Cadeira 1', 'concluido', '07:55', 'Avaliação realizada', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO agendamentos_odonto (paciente_id, profissional_id, data, hora_inicio, hora_fim, duracao_minutos, cadeira, status, hora_chegada, observacoes, tenant_id)
SELECT p.id, pr.id, CURRENT_DATE - 14, '10:00', '11:00', 60, 'Cadeira 2', 'concluido', '09:50', 'Limpeza completa', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '222.333.444-55' AND pr.registro_profissional = 'CRO-SP 23456';

-- 5. Criar planos de tratamento
INSERT INTO planos_tratamento_odonto (patient_id, profissional_id, status, data_inicio, observacoes_gerais, tenant_id)
SELECT p.id, pr.id, 'orcamento', CURRENT_DATE, 'Reabilitação oral completa', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO planos_tratamento_odonto (patient_id, profissional_id, status, data_inicio, observacoes_gerais, tenant_id)
SELECT p.id, pr.id, 'aprovado', CURRENT_DATE - 30, 'Clareamento e restaurações', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '222.333.444-55' AND pr.registro_profissional = 'CRO-SP 23456';

INSERT INTO planos_tratamento_odonto (patient_id, profissional_id, status, data_inicio, observacoes_gerais, tenant_id)
SELECT p.id, pr.id, 'em_andamento', CURRENT_DATE - 60, 'Tratamento endodôntico', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '333.444.555-66' AND pr.registro_profissional = 'CRO-SP 12345';

-- 6. Criar itens de plano de tratamento
INSERT INTO itens_plano_tratamento (plano_id, procedimento_id, dente, valor_unitario, desconto_percentual, valor_final, status, urgencia, ordem_prioridade, observacoes, tenant_id)
SELECT pl.id, proc.id, 16, 250, 0, 250, 'planejado', 'alta', 1, 'Restauração cárie', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM planos_tratamento_odonto pl, procedimentos_odonto proc, patients p
WHERE pl.patient_id = p.id AND p.cpf = '111.222.333-44' AND proc.codigo = 'REST001' AND pl.status = 'orcamento';

INSERT INTO itens_plano_tratamento (plano_id, procedimento_id, dente, valor_unitario, desconto_percentual, valor_final, status, urgencia, ordem_prioridade, observacoes, tenant_id)
SELECT pl.id, proc.id, 17, 250, 0, 250, 'planejado', 'media', 2, 'Restauração proximal', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM planos_tratamento_odonto pl, procedimentos_odonto proc, patients p
WHERE pl.patient_id = p.id AND p.cpf = '111.222.333-44' AND proc.codigo = 'REST001' AND pl.status = 'orcamento';

INSERT INTO itens_plano_tratamento (plano_id, procedimento_id, valor_unitario, desconto_percentual, valor_final, status, urgencia, ordem_prioridade, observacoes, tenant_id)
SELECT pl.id, proc.id, 180, 0, 180, 'concluido', 'alta', 1, 'Limpeza realizada', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM planos_tratamento_odonto pl, procedimentos_odonto proc, patients p
WHERE pl.patient_id = p.id AND p.cpf = '222.333.444-55' AND proc.codigo = 'PREV001' AND pl.status = 'aprovado';

INSERT INTO itens_plano_tratamento (plano_id, procedimento_id, dente, valor_unitario, desconto_percentual, valor_final, status, urgencia, ordem_prioridade, observacoes, tenant_id)
SELECT pl.id, proc.id, 21, 800, 0, 800, 'em_andamento', 'alta', 1, 'Canal em andamento', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM planos_tratamento_odonto pl, procedimentos_odonto proc, patients p
WHERE pl.patient_id = p.id AND p.cpf = '333.444.555-66' AND proc.codigo = 'ENDO001' AND pl.status = 'em_andamento';

-- 7. Criar odontogramas
INSERT INTO odontogramas (patient_id, profissional_id, dados, observacoes, tenant_id)
SELECT p.id, pr.id, '{"16": ["carie"], "17": ["carie"], "36": ["restauracao"]}'::jsonb, 'Cáries em molares superiores', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO odontogramas (patient_id, profissional_id, dados, observacoes, tenant_id)
SELECT p.id, pr.id, '{"21": ["canal"], "22": ["carie"]}'::jsonb, 'Tratamento endodôntico', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '333.444.555-66' AND pr.registro_profissional = 'CRO-SP 12345';

-- 8. Criar histórico de odontograma
INSERT INTO odontograma_historico (odontograma_id, patient_id, profissional_id, dente, condicao, acao, observacao, tenant_id)
SELECT o.id, p.id, pr.id, 16, 'carie', 'add', 'Cárie detectada', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM odontogramas o, patients p, profissionais pr WHERE o.patient_id = p.id AND p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO odontograma_historico (odontograma_id, patient_id, profissional_id, dente, condicao, acao, observacao, tenant_id)
SELECT o.id, p.id, pr.id, 21, 'canal', 'add', 'Canal realizado', '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM odontogramas o, patients p, profissionais pr WHERE o.patient_id = p.id AND p.cpf = '333.444.555-66' AND pr.registro_profissional = 'CRO-SP 12345';

-- 9. Criar evoluções odontológicas
INSERT INTO evolucoes_odonto (paciente_id, profissional_id, queixa_principal, evolucao, procedimentos_realizados, tenant_id)
SELECT p.id, pr.id, 'Avaliação inicial', 'Paciente em bom estado. Detectadas cáries em 16 e 17.', '[{"nome": "Avaliação", "dente": null}]'::jsonb, '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '111.222.333-44' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO evolucoes_odonto (paciente_id, profissional_id, queixa_principal, evolucao, procedimentos_realizados, tenant_id)
SELECT p.id, pr.id, 'Dor no dente 21', 'Realizada pulpectomia. Curativo de demora aplicado.', '[{"nome": "Canal", "dente": 21}]'::jsonb, '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '333.444.555-66' AND pr.registro_profissional = 'CRO-SP 12345';

INSERT INTO evolucoes_odonto (paciente_id, profissional_id, queixa_principal, evolucao, procedimentos_realizados, tenant_id)
SELECT p.id, pr.id, 'Limpeza de rotina', 'Profilaxia completa realizada. Orientação de higiene bucal.', '[{"nome": "Profilaxia", "dente": null}]'::jsonb, '90db0cef-ba20-4d1c-bfec-7f35a9218906'
FROM patients p, profissionais pr WHERE p.cpf = '222.333.444-55' AND pr.registro_profissional = 'CRO-SP 23456';
