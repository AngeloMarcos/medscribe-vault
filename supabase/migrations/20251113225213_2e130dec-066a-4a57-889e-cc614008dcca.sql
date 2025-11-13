-- Update procedures table to make fields required
ALTER TABLE public.procedures 
  ALTER COLUMN date_time SET NOT NULL,
  ALTER COLUMN description SET NOT NULL;

-- Update exam_requests table to make fields required
ALTER TABLE public.exam_requests 
  ALTER COLUMN exams_list SET NOT NULL;

-- Update reports table to make fields required
ALTER TABLE public.reports 
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN text SET NOT NULL;