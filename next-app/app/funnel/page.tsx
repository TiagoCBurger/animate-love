"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Play,
  ChevronDown,
  Sparkles,
  Target,
  Clock,
  FileCheck,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FunnelPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Animalove</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm text-zinc-400 hover:text-white transition">Como Funciona</a>
              <a href="#beneficios" className="text-sm text-zinc-400 hover:text-white transition">Benefícios</a>
              <a href="#depoimentos" className="text-sm text-zinc-400 hover:text-white transition">Depoimentos</a>
              <a href="#precos" className="text-sm text-zinc-400 hover:text-white transition">Preços</a>
            </div>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0">
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Plataforma #1 em Marketing de Influência
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Conecte sua marca aos
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                influenciadores certos
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Encontre, contrate e gerencie campanhas com influenciadores de forma simples.
              Contratos prontos, pagamentos seguros e resultados garantidos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="flex-1 max-w-md">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                  <Button className="h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 whitespace-nowrap">
                    Acessar Grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Suporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Video Placeholder */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1">
              <div className="rounded-xl bg-zinc-900/50 backdrop-blur aspect-video flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-zinc-400">Veja como funciona em 2 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500 mb-8">Empresas que confiam em nós</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {["Empresa A", "Empresa B", "Empresa C", "Empresa D", "Empresa E"].map((company, i) => (
              <div key={i} className="text-xl font-bold text-zinc-400">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O marketing de influência está
              <span className="text-red-400"> quebrado</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Se você já tentou trabalhar com influenciadores, provavelmente enfrentou esses problemas:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Dificuldade em encontrar",
                description: "Passar horas navegando em redes sociais tentando achar o influenciador ideal para sua marca."
              },
              {
                icon: FileCheck,
                title: "Contratos confusos",
                description: "Não saber o que incluir no contrato e correr riscos legais por falta de proteção."
              },
              {
                icon: Clock,
                title: "Gestão manual",
                description: "Acompanhar entregas, prazos e pagamentos em planilhas desorganizadas."
              }
            ].map((problem, i) => (
              <Card key={i} className="p-6 bg-white/[0.02] border-white/5 hover:border-red-500/30 transition-colors">
                <problem.icon className="w-10 h-10 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">{problem.title}</h3>
                <p className="text-zinc-400">{problem.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              A Solução
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Uma plataforma completa para
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> suas campanhas</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Tudo que você precisa para encontrar influenciadores, fechar contratos seguros e gerenciar campanhas em um só lugar.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: Users,
                  title: "Marketplace de Influenciadores",
                  description: "Acesso a milhares de criadores verificados com métricas reais de engajamento."
                },
                {
                  icon: FileCheck,
                  title: "Contratos Automatizados",
                  description: "Modelos jurídicos prontos com tudo que você precisa: entregáveis, prazos, exclusividade."
                },
                {
                  icon: Shield,
                  title: "Pagamentos Seguros",
                  description: "Escrow inteligente: o influenciador só recebe após entregar o combinado."
                },
                {
                  icon: TrendingUp,
                  title: "Analytics em Tempo Real",
                  description: "Acompanhe o desempenho das suas campanhas com métricas que importam."
                }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">{feature.title}</h3>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-2xl" />
              <div className="relative rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-violet-400/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              3 passos simples para começar
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Da busca ao resultado em minutos, não em semanas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Encontre",
                description: "Use nossos filtros inteligentes para encontrar influenciadores que combinam com sua marca e orçamento.",
                gradient: "from-blue-500 to-violet-500"
              },
              {
                step: "02",
                title: "Contrate",
                description: "Envie propostas, negocie e feche contratos digitais com segurança jurídica em poucos cliques.",
                gradient: "from-violet-500 to-fuchsia-500"
              },
              {
                step: "03",
                title: "Gerencie",
                description: "Acompanhe entregas, aprove conteúdos e libere pagamentos em uma única dashboard.",
                gradient: "from-fuchsia-500 to-pink-500"
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`} />
                <Card className="relative p-8 bg-white/[0.02] border-white/5 h-full">
                  <div className={`text-5xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Benefícios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher a nossa plataforma?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "10x mais rápido", description: "Encontre e contrate em horas, não semanas" },
              { icon: Shield, title: "100% seguro", description: "Contratos e pagamentos protegidos" },
              { icon: Users, title: "+50.000 criadores", description: "O maior marketplace do Brasil" },
              { icon: TrendingUp, title: "ROI garantido", description: "Métricas reais de performance" }
            ].map((benefit, i) => (
              <Card key={i} className="p-6 bg-white/[0.02] border-white/5 text-center hover:border-violet-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{benefit.title}</h3>
                <p className="text-sm text-zinc-400">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marina Silva",
                role: "Head de Marketing, TechCo",
                content: "Reduzimos em 80% o tempo gasto com gestão de influenciadores. A plataforma é incrível!",
                rating: 5
              },
              {
                name: "Carlos Mendes",
                role: "CEO, E-commerce XYZ",
                content: "Os contratos automatizados nos deram segurança jurídica que não tínhamos antes. Recomendo!",
                rating: 5
              },
              {
                name: "Ana Paula",
                role: "Social Media Manager",
                content: "Finalmente uma plataforma que entende as necessidades de quem trabalha com influenciadores.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 bg-white/[0.02] border-white/5">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-24 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
              Preços
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todo tipo de negócio
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Comece gratuitamente e escale conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Grátis",
                description: "Perfeito para começar",
                features: ["3 campanhas/mês", "Acesso ao marketplace", "Contratos básicos", "Suporte por email"],
                cta: "Começar Grátis",
                highlighted: false
              },
              {
                name: "Pro",
                price: "R$297",
                period: "/mês",
                description: "Para equipes em crescimento",
                features: ["Campanhas ilimitadas", "Analytics avançado", "Contratos personalizados", "Suporte prioritário", "API access"],
                cta: "Teste 14 dias grátis",
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Sob consulta",
                description: "Para grandes operações",
                features: ["Tudo do Pro", "Account manager dedicado", "SLA garantido", "Integrações customizadas", "Treinamento da equipe"],
                cta: "Falar com vendas",
                highlighted: false
              }
            ].map((plan, i) => (
              <Card
                key={i}
                className={`p-8 relative ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 border-violet-500/30"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-400">{plan.period}</span>}
                </div>
                <p className="text-zinc-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Como funciona o sistema de contratos?",
                answer: "Nossa plataforma oferece modelos de contratos pré-aprovados por advogados especializados. Você pode personalizar entregáveis, prazos, direitos de uso de imagem e cláusulas de exclusividade. Tudo é assinado digitalmente com validade jurídica."
              },
              {
                question: "Os pagamentos são seguros?",
                answer: "Sim! Utilizamos um sistema de escrow (custódia) onde o valor fica protegido até que o influenciador entregue o combinado. Você aprova as entregas e só então o pagamento é liberado."
              },
              {
                question: "Posso usar o conteúdo em anúncios pagos?",
                answer: "Isso depende do contrato. Nossa plataforma permite que você inclua cláusulas específicas sobre direito de uso de imagem para tráfego pago, definindo período e canais permitidos."
              },
              {
                question: "Qual o tamanho mínimo de influenciador?",
                answer: "Temos criadores de todos os tamanhos, desde nano-influenciadores (1-10k seguidores) até grandes celebridades. Você pode filtrar por tamanho de audiência, nicho, localização e engajamento."
              },
              {
                question: "Tem período de teste?",
                answer: "Sim! O plano Starter é gratuito para sempre. Para o plano Pro, oferecemos 14 dias de teste grátis com todas as funcionalidades liberadas."
              }
            ].map((faq, i) => (
              <Card
                key={i}
                className="bg-white/[0.02] border-white/5 overflow-hidden cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-zinc-400">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyaDR2Mmgtdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Pronto para revolucionar suas campanhas?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Junte-se a mais de 5.000 marcas que já transformaram sua estratégia de marketing de influência.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="h-12 px-8 bg-white text-violet-600 hover:bg-white/90 font-semibold">
                  Começar Gratuitamente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="h-12 px-8 bg-transparent border-white/30 text-white hover:bg-white/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar com especialista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Animalove</span>
              </div>
              <p className="text-sm text-zinc-400">
                A plataforma completa para marketing de influência no Brasil.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Empresa</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2024 Animalove. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
