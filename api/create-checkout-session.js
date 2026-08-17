export default async function handler(request) {
  return new Response(JSON.stringify({ 
    message: "API is working",
    hasKey: !!process.env.STRIPE_SECRET_KEY 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
