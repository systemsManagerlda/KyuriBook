"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button, Card, Chip, Input } from "@heroui/react";

const books = [
  {
    id: "bolos-cupcakes",
    title: "Bolos & Cupcakes Caseiros",
    subtitle: "105 receitas para transformar ingredientes simples em momentos inesquecíveis",
    category: "Culinária",
    price: 299,
    pages: 109,
    cover: "/images/bolos-cupcakes-cover.jpg",
    preview: "/previews/bolos-cupcakes-preview.pdf",
    description: "Um livro de receitas com 105 opções de bolos e cupcakes, incluindo receitas clássicas, gourmet e funcionais.",
    source: "E-book de 109 páginas",
  },
  {
    id: "frases-ingles",
    title: "Frases Essenciais em Inglês",
    subtitle: "Frases usadas em situações do dia a dia",
    category: "Idiomas",
    price: 199,
    pages: 13,
    cover: "/images/frases-ingles-cover.jpg",
    preview: "/previews/frases-ingles-preview.pdf",
    description: "Material prático com frases úteis, traduções, exemplos de diálogos e actividades de fixação para situações reais.",
    source: "E-book de 13 páginas",
  },
  {
    id: "ingles-em-casa",
    title: "Inglês em Casa",
    subtitle: "Curso prático para iniciantes",
    category: "Educação",
    price: 249,
    pages: 19,
    cover: "/images/ingles-em-casa-cover.jpg",
    preview: "/previews/ingles-em-casa-preview.pdf",
    description: "Curso para adultos e adolescentes que estão a começar inglês, com 10 aulas progressivas, exercícios e plano de estudo de 30 dias.",
    source: "E-book de 19 páginas",
  },
];

const categories = ["Todos", "Educação", "Idiomas", "Culinária", "Negócios", "Desenvolvimento pessoal"];
type Book = (typeof books)[number];
type PaymentMethod = "mpesa" | "emola";
type AppDialog = "preview" | "checkout" | "account" | "terms" | "privacy" | null;

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialog, setDialog] = useState<AppDialog>(null);
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<"login" | "signup">("login");

  const filteredBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return books.filter((book) => {
      const text = `${book.title} ${book.subtitle} ${book.category}`.toLowerCase();
      return (category === "Todos" || book.category === category) && text.includes(term);
    });
  }, [query, category]);

  const closeDialog = () => {
    setDialog(null);
    setNotice("");
  };

  const openPreview = (book: Book) => {
    setSelectedBook(book);
    setDialog("preview");
    setNotice("");
  };

  const openCheckout = (book: Book) => {
    setSelectedBook(book);
    setDialog("checkout");
    setNotice("");
  };

  const simulatePayment = async () => {
    if (!selectedBook) return;
    if (phone.trim().length < 8) {
      setNotice("Introduza um número de telefone válido para continuar.");
      return;
    }

    try {
      const response = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ebookId: selectedBook.id, method: payment, phone: phone.trim() }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice(result.message ?? "Não foi possível criar o pedido.");
        return;
      }

      setPaid((current) => [...new Set([...current, selectedBook.id])]);
      setNotice(`Pagamento ${payment === "mpesa" ? "M-Pesa" : "e-Mola"} confirmado em modo de demonstração. O e-book já está disponível.`);
    } catch {
      setNotice("Não foi possível contactar o servidor. Verifique se o Next.js está a correr.");
    }
  };

  const downloadBook = (book: Book) => {
    if (!paid.includes(book.id)) {
      openCheckout(book);
      return;
    }
    window.open(`/api/ebooks/${book.id}`, "_blank", "noopener,noreferrer");
  };

  const openAccount = (mode: "login" | "signup") => {
    setAccountMode(mode);
    setDialog("account");
    setMenuOpen(false);
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => scrollTo("inicio")} className="shrink-0 cursor-pointer" aria-label="Ir para o início">
            <Image src="/images/kyuribook-logo-crop.png" alt="KyuriBook" width={150} height={127} className="h-12 w-auto object-contain sm:h-14" priority />
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <button type="button" onClick={() => scrollTo("inicio")} className="transition-colors hover:text-[#087fe8]">Início</button>
            <button type="button" onClick={() => scrollTo("ebooks")} className="transition-colors hover:text-[#087fe8]">E-books</button>
            <button type="button" onClick={() => scrollTo("categorias")} className="transition-colors hover:text-[#087fe8]">Categorias</button>
            <button type="button" onClick={() => scrollTo("como-funciona")} className="transition-colors hover:text-[#087fe8]">Como funciona</button>
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Button variant="tertiary" onPress={() => openAccount("login")}>Entrar</Button>
            <Button onPress={() => openAccount("signup")} className="bg-gradient-to-r from-[#08265f] to-[#087fe8] font-bold text-white">Criar conta</Button>
          </div>

          <Button isIconOnly variant="tertiary" className="ml-auto sm:hidden" aria-label="Abrir menu" onPress={() => setMenuOpen((v) => !v)}>
            <span className="text-xl">☰</span>
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg sm:hidden">
            <div className="grid gap-1">
              <button type="button" onClick={() => scrollTo("inicio")} className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">Início</button>
              <button type="button" onClick={() => scrollTo("ebooks")} className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">E-books</button>
              <button type="button" onClick={() => scrollTo("categorias")} className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">Categorias</button>
              <button type="button" onClick={() => scrollTo("como-funciona")} className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">Como funciona</button>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Button variant="secondary" onPress={() => openAccount("login")}>Entrar</Button>
                <Button onPress={() => openAccount("signup")} className="bg-[#08265f] font-bold text-white">Criar conta</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div>
            <Chip variant="soft" className="mb-5 border border-blue-100 bg-blue-50 font-bold text-blue-700">A sua biblioteca digital</Chip>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-[#08265f] sm:text-6xl lg:text-[4.5rem]">
              Leia, aprenda e evolua <span className="bg-gradient-to-r from-[#087fe8] to-[#ff8a00] bg-clip-text text-transparent">onde estiver.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Encontre e-books práticos, veja o preview antes de comprar e tenha acesso digital após a confirmação do pagamento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onPress={() => scrollTo("ebooks")} className="bg-[#ff8a00] px-7 font-black text-white shadow-lg shadow-orange-500/20">Explorar e-books</Button>
              <Button size="lg" variant="secondary" onPress={() => scrollTo("como-funciona")} className="px-7 font-bold text-[#08265f]">Como funciona</Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Preview antes da compra', 'M-Pesa', 'e-Mola', 'Acesso digital'].map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">✓ {item}</span>)}
            </div>
          </div>

          <Card className="overflow-hidden border-0 bg-transparent shadow-none">
            <Card.Content className="rounded-[30px] bg-gradient-to-br from-[#061b45] via-[#0a4a9d] to-[#087fe8] p-6 text-white shadow-2xl shadow-blue-900/20 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Em destaque</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Inglês em Casa</h2></div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black tracking-widest">KYURIBOOK</span>
              </div>
              <div className="mt-7 grid grid-cols-[120px_1fr] gap-5 rounded-2xl bg-white/10 p-4">
                <div className="overflow-hidden rounded-xl bg-white shadow-xl"><Image src={books[2].cover} alt={books[2].title} width={220} height={280} className="h-40 w-full object-cover" /></div>
                <div className="flex flex-col justify-center"><p className="text-xs font-bold uppercase tracking-widest text-orange-200">{books[2].category}</p><p className="mt-2 text-sm leading-6 text-blue-100">{books[2].subtitle}</p><Button size="sm" onPress={() => openPreview(books[2])} className="mt-4 w-fit bg-white font-black text-[#08265f]">Ver preview</Button></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[['10','aulas'],['30','dias'],['PDF','digital']].map(([n,t]) => <div key={t} className="rounded-xl bg-white/10 p-3"><b className="block text-xl">{n}</b><span className="text-xs text-blue-100">{t}</span></div>)}
              </div>
            </Card.Content>
          </Card>
        </div>
      </section>

      <section id="ebooks" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="font-black text-orange-500">CATÁLOGO</p><h2 className="mt-1 text-3xl font-black text-[#08265f] sm:text-4xl">Encontre o próximo e-book</h2><p className="mt-2 max-w-2xl text-slate-500">Veja o preview, escolha o seu título e compre com pagamento móvel.</p></div>
          <div className="w-full max-w-md"><label htmlFor="search" className="mb-1.5 block text-sm font-bold text-slate-700">Pesquisar e-books</label><Input id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: inglês, receitas..." variant="secondary" className="w-full" /></div>
        </div>

        <div id="categorias" className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => <Button key={item} size="sm" variant={category === item ? "primary" : "tertiary"} onPress={() => setCategory(item)} className={category === item ? "bg-[#08265f] font-bold text-white" : "bg-white font-semibold text-slate-600"}>{item}</Button>)}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const owned = paid.includes(book.id);
            return (
              <Card key={book.id} className="group overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100"><Image src={book.cover} alt={book.title} fill className="object-cover transition duration-500 group-hover:scale-105" /></div>
                <Card.Content className="p-5">
                  <div className="flex items-center justify-between gap-3"><Chip size="sm" variant="soft" className="bg-blue-50 font-bold text-blue-700">{book.category}</Chip><span className="text-xs font-bold text-slate-400">{book.pages} páginas</span></div>
                  <h3 className="mt-4 text-xl font-black text-[#08265f]">{book.title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{book.subtitle}</p>
                  <div className="mt-5 flex items-end justify-between gap-3"><div><span className="text-xs font-semibold text-slate-400">Preço</span><p className="text-2xl font-black text-[#08265f]">{book.price} MT</p></div>{owned && <Chip color="success" variant="soft">Adquirido</Chip>}</div>
                  <div className="mt-5 grid grid-cols-2 gap-2"><Button variant="secondary" onPress={() => openPreview(book)} className="font-bold text-[#08265f]">Preview</Button><Button onPress={() => owned ? downloadBook(book) : openCheckout(book)} className="bg-gradient-to-r from-[#087fe8] to-[#08265f] font-bold text-white">{owned ? "Baixar" : "Comprar"}</Button></div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
        {filteredBooks.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">Nenhum e-book encontrado para a pesquisa actual.</div>}
      </section>

      <section id="como-funciona" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-black text-orange-500">SIMPLES E RÁPIDO</p><h2 className="mt-1 text-3xl font-black text-[#08265f] sm:text-4xl">Como funciona</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-4">
            {[['01','Escolha','Encontre um e-book no catálogo.'],['02','Faça preview','Abra as primeiras páginas antes de comprar.'],['03','Pague','Escolha M-Pesa ou e-Mola e informe o seu número.'],['04','Aceda','Após a confirmação, o e-book fica disponível para download.']].map(([n,t,d]) => <Card key={n} className="border border-slate-200 shadow-sm"><Card.Content className="p-6"><span className="text-sm font-black text-orange-500">{n}</span><h3 className="mt-3 text-lg font-black text-[#08265f]">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></Card.Content></Card>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f0f6ff]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div><p className="text-xs font-black uppercase tracking-widest text-orange-500">Compra segura</p><h3 className="mt-2 text-xl font-black text-[#08265f]">Preview antes de pagar</h3><p className="mt-2 text-sm leading-6 text-slate-600">Veja o conteúdo disponível no preview antes de tomar a decisão de compra.</p></div>
          <div><p className="text-xs font-black uppercase tracking-widest text-orange-500">Pagamento</p><h3 className="mt-2 text-xl font-black text-[#08265f]">M-Pesa e e-Mola</h3><p className="mt-2 text-sm leading-6 text-slate-600">Escolha o método de pagamento móvel disponível para si.</p></div>
          <div><p className="text-xs font-black uppercase tracking-widest text-orange-500">Acesso</p><h3 className="mt-2 text-xl font-black text-[#08265f]">A sua biblioteca digital</h3><p className="mt-2 text-sm leading-6 text-slate-600">Após a confirmação, o conteúdo adquirido fica disponível para descarregar.</p></div>
        </div>
      </section>

      <footer className="bg-[#061b45] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_.7fr_.7fr]">
            <div><Image src="/images/kyuribook-logo-crop.png" alt="KyuriBook" width={125} height={106} className="h-12 w-auto object-contain" /><p className="mt-4 max-w-md text-sm leading-6 text-blue-200">KyuriBook é uma plataforma digital para descoberta e aquisição de e-books, com preview e opções de pagamento móvel.</p></div>
            <div><h4 className="font-black">Plataforma</h4><div className="mt-4 grid gap-2 text-sm text-blue-200"><button type="button" onClick={() => scrollTo("ebooks")} className="text-left hover:text-white">E-books</button><button type="button" onClick={() => scrollTo("como-funciona")} className="text-left hover:text-white">Como funciona</button><button type="button" onClick={() => openAccount("login")} className="text-left hover:text-white">Entrar</button></div></div>
            <div><h4 className="font-black">Legal</h4><div className="mt-4 grid gap-2 text-sm text-blue-200"><button type="button" onClick={() => setDialog("terms")} className="text-left hover:text-white">Termos e condições</button><button type="button" onClick={() => setDialog("privacy")} className="text-left hover:text-white">Política de privacidade</button></div></div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} KyuriBook. Todos os direitos reservados.</span><span>Moçambique · M-Pesa · e-Mola</span></div>
        </div>
      </footer>

      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) closeDialog(); }}>
          <div className={`relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ${dialog === "preview" ? "max-w-6xl" : dialog === "terms" || dialog === "privacy" ? "max-w-3xl" : "max-w-lg"}`}>
            <button type="button" onClick={closeDialog} className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/10 text-lg font-bold text-slate-700 hover:bg-slate-900/20" aria-label="Fechar">×</button>

            {dialog === "preview" && selectedBook && (
              <>
                <div className="border-b border-slate-200 px-5 py-4 pr-14"><p className="text-xl font-black text-[#08265f]">Preview — {selectedBook.title}</p><p className="mt-1 text-sm text-slate-500">Veja o conteúdo antes de comprar.</p></div>
                <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-4"><iframe title={`Preview de ${selectedBook.title}`} src={`${selectedBook.preview}#page=1&toolbar=1`} className="h-[58vh] w-full rounded-xl border border-slate-200 bg-white sm:h-[68vh]" /></div>
                <div className="flex flex-col gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end"><Button variant="tertiary" onPress={closeDialog}>Fechar</Button><Button variant="secondary" onPress={() => window.open(selectedBook.preview, "_blank", "noopener,noreferrer")}>Abrir PDF</Button><Button onPress={() => openCheckout(selectedBook)} className="bg-[#ff8a00] font-black text-white">Comprar este e-book</Button></div>
              </>
            )}

            {dialog === "checkout" && selectedBook && (
              <>
                <div className="border-b border-slate-200 px-6 py-5 pr-14"><p className="text-xl font-black text-[#08265f]">Comprar e-book</p><p className="mt-1 text-sm text-slate-500">{selectedBook.title}</p></div>
                <div className="overflow-y-auto p-6">
                  <div className="flex gap-4 rounded-2xl bg-slate-50 p-4"><Image src={selectedBook.cover} alt={selectedBook.title} width={80} height={105} className="h-24 w-20 rounded-lg object-cover" /><div><p className="font-black text-[#08265f]">{selectedBook.title}</p><p className="mt-1 text-sm text-slate-500">{selectedBook.pages} páginas</p><p className="mt-2 text-xl font-black text-[#08265f]">{selectedBook.price} MT</p></div></div>
                  <p className="mt-6 text-sm font-semibold text-slate-600">Escolha o método de pagamento:</p>
                  <div className="mt-3 grid grid-cols-2 gap-3"><Button onPress={() => setPayment("mpesa")} variant={payment === "mpesa" ? "primary" : "secondary"} className={payment === "mpesa" ? "bg-[#e91e63] font-black text-white" : "font-bold"}>M-Pesa</Button><Button onPress={() => setPayment("emola")} variant={payment === "emola" ? "primary" : "secondary"} className={payment === "emola" ? "bg-[#087fe8] font-black text-white" : "font-bold"}>e-Mola</Button></div>
                  <div className="mt-5"><label htmlFor="phone" className="mb-2 block text-sm font-bold text-slate-700">Número de telefone</label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="84 / 85 / 86 / 87..." variant="secondary" /></div>
                  {notice && <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">{notice}</div>}
                  <p className="mt-4 text-xs leading-5 text-slate-400">O ambiente actual utiliza confirmação de demonstração. A integração real com as APIs oficiais de M-Pesa/e-Mola deve ser configurada no servidor.</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-200 p-4"><Button variant="tertiary" onPress={closeDialog}>Cancelar</Button><Button onPress={simulatePayment} className="bg-gradient-to-r from-[#087fe8] to-[#08265f] font-black text-white">Confirmar pagamento</Button></div>
              </>
            )}

            {dialog === "account" && (
              <div className="p-7 pt-12"><p className="text-xs font-black uppercase tracking-widest text-orange-500">KyuriBook</p><h2 className="mt-2 text-2xl font-black text-[#08265f]">{accountMode === "login" ? "Entrar na sua conta" : "Criar a sua conta"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">A área de conta está preparada para ser ligada ao sistema de autenticação do projecto.</p><div className="mt-6 grid gap-3"><Input aria-label="E-mail" placeholder="E-mail" variant="secondary" /><Input aria-label="Palavra-passe" type="password" placeholder="Palavra-passe" variant="secondary" /><Button onPress={() => setNotice("A autenticação será activada quando o backend de utilizadores estiver configurado.")} className="mt-2 bg-[#08265f] font-black text-white">{accountMode === "login" ? "Entrar" : "Criar conta"}</Button>{notice && <p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{notice}</p>}</div></div>
            )}

            {(dialog === "terms" || dialog === "privacy") && (
              <div className="overflow-y-auto p-7 pt-12">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">KyuriBook</p>
                {dialog === "terms" ? (
                  <><h2 className="mt-2 text-2xl font-black text-[#08265f]">Termos e Condições</h2><div className="mt-5 space-y-5 text-sm leading-7 text-slate-600"><p><strong>1. Utilização.</strong> A KyuriBook disponibiliza conteúdos digitais para aquisição e acesso através da plataforma.</p><p><strong>2. Preview.</strong> Os previews destinam-se a permitir ao utilizador conhecer parte do conteúdo antes da compra. O preview não representa necessariamente o livro completo.</p><p><strong>3. Pagamentos.</strong> Os preços são apresentados em Meticais. A confirmação real do pagamento depende da integração e validação do respectivo serviço de pagamento.</p><p><strong>4. Conteúdo digital.</strong> Após a confirmação da compra, o acesso ao e-book adquirido é disponibilizado de acordo com as regras da plataforma.</p><p><strong>5. Uso indevido.</strong> É proibida a redistribuição, venda, cópia ou disponibilização pública dos conteúdos sem autorização dos respectivos titulares.</p><p><strong>6. Alterações.</strong> Estes termos podem ser actualizados para reflectir alterações na plataforma ou nos serviços.</p></div></>
                ) : (
                  <><h2 className="mt-2 text-2xl font-black text-[#08265f]">Política de Privacidade</h2><div className="mt-5 space-y-5 text-sm leading-7 text-slate-600"><p><strong>1. Dados recolhidos.</strong> A plataforma pode recolher dados necessários para prestar os serviços, como dados de contacto e informações relacionadas com pedidos.</p><p><strong>2. Finalidade.</strong> Os dados são utilizados para processar pedidos, responder ao utilizador, disponibilizar conteúdos e melhorar a plataforma.</p><p><strong>3. Pagamentos.</strong> Dados necessários para transacções devem ser tratados através dos mecanismos apropriados dos serviços de pagamento integrados.</p><p><strong>4. Segurança.</strong> São aplicadas medidas técnicas e organizacionais adequadas para proteger os dados tratados pela plataforma.</p><p><strong>5. Direitos.</strong> O utilizador poderá solicitar informações sobre os seus dados e pedir a respectiva correcção quando aplicável.</p></div></>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
