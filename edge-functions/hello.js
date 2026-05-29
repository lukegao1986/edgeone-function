export default function onRequest(context) {
  return new Response(JSON.stringify({
    message: "Hello EdgeOne!",
    from: "hello.js"
  }), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
