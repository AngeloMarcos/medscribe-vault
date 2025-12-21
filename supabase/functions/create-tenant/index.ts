import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateTenantRequest {
  name: string;
  type: 'clinica_geral' | 'consultorio_medico' | 'consultorio_odonto' | 'policlinica' | 'hospital';
  logo_url?: string;
  primary_color?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .substring(0, 50); // Limit length
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token for auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client to verify user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: CreateTenantRequest = await req.json();
    
    if (!body.name || !body.type) {
      return new Response(
        JSON.stringify({ error: 'Nome e tipo são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating tenant for user:', user.id, 'with name:', body.name);

    // Check if user already has a tenant
    const { data: existingTenantUser, error: checkError } = await supabaseAdmin
      .from('tenant_users')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing tenant:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar tenant existente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingTenantUser) {
      console.log('User already has a tenant:', existingTenantUser.tenant_id);
      return new Response(
        JSON.stringify({ error: 'Você já possui um estabelecimento cadastrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(body.name);
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness
    while (true) {
      const { data: existingSlug } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!existingSlug) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log('Generated slug:', slug);

    // Create the tenant
    const { data: newTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: body.name.trim(),
        slug: slug,
        type: body.type,
        logo_url: body.logo_url || null,
        theme: { primary: body.primary_color || '#009688' },
        settings: {},
        is_active: true,
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar estabelecimento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tenant created:', newTenant.id);

    // Create the tenant_user relationship (user as owner)
    const { error: tenantUserError } = await supabaseAdmin
      .from('tenant_users')
      .insert({
        tenant_id: newTenant.id,
        user_id: user.id,
        is_owner: true,
        is_active: true,
      });

    if (tenantUserError) {
      console.error('Error creating tenant_user:', tenantUserError);
      // Rollback: delete the tenant if we can't create the relationship
      await supabaseAdmin.from('tenants').delete().eq('id', newTenant.id);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao associar usuário ao estabelecimento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tenant user created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        tenant: newTenant,
        message: 'Estabelecimento criado com sucesso!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
