export const dynamic = "force-static";

const APP_ID = "YXSF57PF32.br.academy.marcos.Macro";

export function GET() {
  const body = {
    applinks: {
      details: [{ appIDs: [APP_ID], components: [{ "/": "/v/*" }] }],
    },
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}
