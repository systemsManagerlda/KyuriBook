import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const files: Record<string, string> = {
  "bolos-cupcakes": "bolos-cupcakes.pdf",
  "frases-ingles": "frases-ingles.pdf",
  "ingles-em-casa": "ingles-em-casa.pdf",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fileName = files[id];
  if (!fileName) return NextResponse.json({ message: "E-book não encontrado." }, { status: 404 });

  const cookieStore = await cookies();
  const purchased = cookieStore.get("kyuribook_demo_purchases")?.value.split(",").includes(id) ?? false;
  if (!purchased) return NextResponse.json({ message: "Compra necessária." }, { status: 403 });

  const file = await fs.readFile(path.join(process.cwd(), "private", "ebooks", fileName));
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
