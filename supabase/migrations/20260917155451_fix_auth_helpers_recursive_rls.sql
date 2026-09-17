-- auth_panaderia_id() / auth_rol() are used inside RLS policies on public.users.
-- As SECURITY INVOKER, their internal `select ... from users` re-triggers the same
-- policy on public.users, causing infinite recursion ("stack depth limit exceeded")
-- on every query against users (including login). Marking them SECURITY DEFINER
-- makes the internal lookup bypass RLS, breaking the recursion.
alter function public.auth_panaderia_id() security definer;
alter function public.auth_rol() security definer;

revoke all on function public.auth_panaderia_id() from public;
revoke all on function public.auth_rol() from public;
grant execute on function public.auth_panaderia_id() to anon, authenticated;
grant execute on function public.auth_rol() to anon, authenticated;
