export default function onRequest(context) {
  return new Response("\ud83d\udc4b \u8fd9\u662f\u9996\u9875\uff08\u5bf9\u5e94 index.js\uff09", {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
