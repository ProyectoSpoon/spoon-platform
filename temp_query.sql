SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'handle_new_user_app' AND n.nspname = 'public';
