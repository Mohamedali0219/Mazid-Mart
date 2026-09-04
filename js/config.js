// MazidMart Public Config — free endpoints only (anon key is public by Supabase design)
window.MAZID_CONFIG = {
  SUPABASE_URL: "https://aqxymuqjcmdenlgctzou.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeHltdXFqY21kZW5sZ2N0em91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjcwNzksImV4cCI6MjA4NzIwMzA3OX0.k2bTRYx8199Ea0O8lUJ0aCE941WiVGZ3G8tTh0AMuM4",
  get RPC_BASE() { return this.SUPABASE_URL + "/rest/v1/rpc/"; }
};
