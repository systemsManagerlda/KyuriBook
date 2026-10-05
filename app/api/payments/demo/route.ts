import { NextResponse } from "next/server";

const allowed = new Set(["bolos-cupcakes", "frases-ingles", "ingles-em-casa"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = body?.ebookId;
  const method = body?.method;
  const phone = String(body?.phone ?? "").trim();

  if (!allowed.has(id) || !["mpesa", "emola"].includes(method) || phone.length < 8) {
    return NextResponse.json({ ok: false, message: "Dados de pagamento inválidos." }, { status: 400 });
  }

  // Demonstração: em produção este ponto deve criar a cobrança no provedor,
  // aguardar o callback/webhook e só então libertar o ficheiro.
  const response = NextResponse.json({ ok: true, status: "paid", paymentMethod: method });
  const current = request.headers.get("cookie")?.match(/(?:^|; )kyuribook_demo_purchases=([^;]*)/)?.[1] ?? "";
  const purchases = Array.from(new Set([...current.split(",").filter(Boolean), id])).join(",");
  response.cookies.set("kyuribook_demo_purchases", purchases, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
