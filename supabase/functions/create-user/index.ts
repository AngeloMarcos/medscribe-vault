import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
  professional_id?: string;
  phone?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create client with user's token to verify they are admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the requesting user
    const { data: { user: requestingUser }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !requestingUser) {
      console.error("Error getting user:", userError);
      throw new Error("Não autorizado");
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      console.error("User is not admin:", roleError);
      throw new Error("Apenas administradores podem criar usuários");
    }

    // Parse the request body
    const body: CreateUserRequest = await req.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.full_name || !body.role) {
      throw new Error("Campos obrigatórios: email, password, full_name, role");
    }

    console.log(`Creating user: ${body.email} with role: ${body.role}`);

    // Create the user using admin API (doesn't create a session)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: body.full_name,
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      if (authError.message?.includes("already been registered")) {
        throw new Error("Este email já está cadastrado");
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Falha ao criar usuário");
    }

    const userId = authData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Wait a bit for the profile trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile with additional data
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: body.full_name,
        professional_id: body.professional_id || null,
        phone: body.phone || null,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't throw, just log - the user was created successfully
    }

    // Insert the user role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: body.role,
      });

    if (roleInsertError) {
      console.error("Error inserting role:", roleInsertError);
      // If it's a duplicate, try updating
      if (roleInsertError.code === "23505") {
        const { error: updateError } = await supabaseAdmin
          .from("user_roles")
          .update({ role: body.role })
          .eq("user_id", userId);
        
        if (updateError) {
          console.error("Error updating role:", updateError);
        }
      }
    }

    console.log(`User ${body.email} created successfully with role ${body.role}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        message: "Usuário criado com sucesso",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao criar usuário",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
