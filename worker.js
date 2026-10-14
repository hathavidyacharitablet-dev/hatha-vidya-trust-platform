const ALLOWED_ORIGINS = new Set([
"https://hatha-vidya-trust-platform.pages.dev",
"https://hathavidyacharitabletrust.org",
"https://www.hathavidyacharitabletrust.org",
]);

function corsHeaders(request) {
const origin = request.headers.get("Origin") || "";
const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://hatha-vidya-trust-platform.pages.dev";
return {
"Access-Control-Allow-Origin": allowedOrigin,
"Access-Control-Allow-Methods": "GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type",
"Vary": "Origin",
"Content-Type": "application/json; charset=utf-8",
"Cache-Control": "no-store",
"X-Content-Type-Options": "nosniff",
};
}

function jsonResponse(data, status, headers) {
return new Response(JSON.stringify(data), { status, headers });
}

export default {
async fetch(request, env) {
const headers = corsHeaders(request);

if (request.method === "OPTIONS") {  
  return new Response(null, { status: 204, headers });  
}  

const url = new URL(request.url);  

if (url.pathname === "/api/health" && request.method === "GET") {  
  if (!env.DB) {  
    return jsonResponse(  
      { ok: false, worker: "running", database: "not_connected", message: "D1 binding named DB is missing." },  
      503,  
      headers,  
    );  
  }  

  try {  
    await env.DB.prepare("SELECT 1 AS ok").first();  
    return jsonResponse(  
      { ok: true, worker: "running", database: "connected", message: "Worker and D1 connection are working." },  
      200,  
      headers,  
    );  
  } catch (_error) {  
    return jsonResponse(  
      { ok: false, worker: "running", database: "connection_error", message: "D1 query failed. Check the DB binding and database selection in Cloudflare." },  
      503,  
      headers,  
    );  
  }  
}  

return jsonResponse({ ok: false, message: "Not found" }, 404, headers);

},
};
