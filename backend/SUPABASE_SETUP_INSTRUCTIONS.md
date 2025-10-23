# Supabase Setup Instructions

## Task T001: Create Supabase Project

**Manual Step Required**: Go to https://supabase.com and create a new project with the following settings:

1. Project name: `strata-garden-rooms-prod`
2. Organization: Choose your organization
3. Database password: Use a strong password and save it securely
4. Region: Choose closest to your users (eu-west-1 recommended for Ireland)
5. Pricing plan: Start with Free tier, upgrade as needed

After creating the project:

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL (anon key)
   - Public anon key
   - Secret service_role key (keep this secure!)

3. Update the .env file with these values (see T004 instructions below)

## Next Steps

Once the project is created, proceed with the automated tasks T002-T005.