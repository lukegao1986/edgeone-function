export default function onRequest(context) {
  const { id } = context.params;

  return new Response(JSON.stringify({
    userId: id,
    note: "\u52a8\u6001\u8def\u7531\u7531 [id].js \u6355\u83b7"
  }), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
