# Manual Schema Migration Instructions

Since the Supabase CLI requires login authentication, you'll need to apply the schema migration manually through the Supabase Dashboard.

## Steps to Apply Schema Migration:

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/hnrahkugdugjplixeqfv

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New query**

4. Copy and paste the entire contents of:
   - `backend/supabase/migrations/20251023001000_initial_schema.sql`

5. Click **Run** to execute the migration

6. Verify the tables were created by checking the **Table Editor** or running:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('product_configurations', 'glazing_elements', 'permitted_development_flags', 'quote_requests', 'payment_history');
   ```

### Method 2: Supabase CLI (If you have login access)

```bash
# Login to Supabase
npx supabase login

# Link to project
npx supabase link --project-ref hnrahkugdugjplixeqfv

# Apply migrations
npx supabase db push
```

### Verification

After applying the migration, verify the schema is correct:

1. Check that all 5 tables exist
2. Verify indexes are created
3. Confirm RLS is enabled on all tables
4. Test that triggers work for timestamp updates

## Next Steps

Once the schema is applied, proceed to:
- T008: Generate TypeScript types
- T009: Create Supabase client setup
- T010: Create schema validation script