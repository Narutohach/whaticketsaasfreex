import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { makeStyles } from "../../styles/makeStyles";
import {
  ArrowForward,
  AutoAwesome,
  CheckCircleOutlineOutlined,
  Close,
  Code,
  HelpOutlineOutlined,
  MenuBook,
  MessageRounded,
  PlayCircleOutlineOutlined,
  Security,
  SettingsOutlined,
  Speed,
  SupportAgent,
  WhatsApp,
} from "@mui/icons-material";
import HactoLogo from "../../components/Logo";
import commandCenter from "../../assets/portal-command-center.png";

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    overflow: "hidden",
    color: "#f8fafc",
    background: "#070b13",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1240,
    margin: "0 auto",
    padding: "22px 28px",
    borderBottom: "1px solid rgba(148,163,184,.12)",
  },
  logo: { display: "flex", alignItems: "center", minWidth: 174 },
  nav: { display: "flex", alignItems: "center", gap: 28, color: "#94a3b8", fontSize: 14, fontWeight: 600 },
  navLink: { color: "inherit", textDecoration: "none", transition: "color .2s ease", "&:hover": { color: "#fff" } },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  signIn: { color: "#cbd5e1", textTransform: "none", fontWeight: 700, borderRadius: 10, padding: "9px 14px" },
  primary: { background: "#10b981", color: "#04110c", textTransform: "none", fontWeight: 800, borderRadius: 10, padding: "11px 18px", boxShadow: "0 12px 28px rgba(16,185,129,.18)", "&:hover": { background: "#34d399" } },
  hero: { position: "relative", maxWidth: 1240, margin: "0 auto", padding: "78px 28px 68px", display: "grid", gridTemplateColumns: "1.04fr .96fr", gap: 56, alignItems: "center", "@media (max-width: 850px)": { gridTemplateColumns: "1fr", paddingTop: 54, gap: 40 } },
  glow: { position: "absolute", width: 620, height: 620, left: -260, top: -250, background: "radial-gradient(circle, rgba(16,185,129,.18), transparent 68%)", filter: "blur(20px)", pointerEvents: "none" },
  grid: { position: "absolute", inset: 0, opacity: .28, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(148,163,184,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.06) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "linear-gradient(to bottom, black, transparent 78%)" },
  heroCopy: { position: "relative", zIndex: 1 },
  eyebrow: { display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 11px", border: "1px solid rgba(52,211,153,.28)", borderRadius: 999, background: "rgba(16,185,129,.09)", color: "#6ee7b7", fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" },
  title: { margin: "22px 0 18px", maxWidth: 690, fontSize: "clamp(2.7rem, 6vw, 5.35rem)", lineHeight: 1.02, letterSpacing: "-.07em", fontWeight: 850 },
  accent: { color: "#34d399" },
  description: { maxWidth: 610, margin: 0, color: "#94a3b8", fontSize: 18, lineHeight: 1.65 },
  ctas: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 },
  secondary: { border: "1px solid rgba(148,163,184,.22)", color: "#e2e8f0", textTransform: "none", fontWeight: 750, borderRadius: 10, padding: "11px 17px", "&:hover": { borderColor: "#34d399", background: "rgba(16,185,129,.08)" } },
  proof: { display: "flex", flexWrap: "wrap", gap: 18, marginTop: 28, color: "#64748b", fontSize: 12, fontWeight: 650 },
  proofItem: { display: "inline-flex", alignItems: "center", gap: 6 },
  showcase: { position: "relative", zIndex: 1, minHeight: 470, overflow: "hidden", border: "1px solid rgba(148,163,184,.24)", borderRadius: 22, background: "#07111b", boxShadow: "0 30px 90px rgba(0,0,0,.5)", transform: "rotate(1.2deg)", "@media (max-width: 850px)": { transform: "none", minHeight: 430 } },
  heroImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "65% center", opacity: .86 },
  showcaseShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(3,10,18,.16) 0%, rgba(3,10,18,.12) 34%, rgba(3,10,18,.9) 100%)" },
  windowBar: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 18px 14px", color: "#cbd5e1", fontSize: 11 },
  windowDots: { display: "flex", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#334155" },
  panel: { position: "absolute", zIndex: 2, left: 18, right: 18, bottom: 18, border: "1px solid rgba(148,163,184,.2)", borderRadius: 14, background: "rgba(7,15,27,.86)", backdropFilter: "blur(16px)", padding: 16 },
  panelTop: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 15, borderBottom: "1px solid rgba(148,163,184,.1)" },
  panelTitle: { display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 14 },
  panelMark: { display: "flex", alignItems: "center", justifyContent: "center", width: 29, height: 29, borderRadius: 9, background: "#10b981", color: "#04110c" },
  live: { display: "flex", alignItems: "center", gap: 5, color: "#6ee7b7", fontSize: 11, fontWeight: 750 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 0 4px rgba(52,211,153,.12)" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, marginTop: 14 },
  metric: { padding: 12, borderRadius: 11, background: "rgba(148,163,184,.06)", border: "1px solid rgba(148,163,184,.08)" },
  metricValue: { fontSize: 21, fontWeight: 850, color: "#f8fafc" },
  metricLabel: { marginTop: 4, color: "#64748b", fontSize: 10, fontWeight: 650 },
  ticket: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 9, padding: "11px 12px", borderRadius: 10, background: "#101c2d", border: "1px solid rgba(148,163,184,.09)" },
  ticketText: { color: "#cbd5e1", fontSize: 11, fontWeight: 700 },
  tag: { padding: "4px 7px", borderRadius: 6, color: "#6ee7b7", background: "rgba(16,185,129,.11)", fontSize: 9, fontWeight: 800 },
  section: { maxWidth: 1240, margin: "0 auto", padding: "24px 28px 84px" },
  sectionHeader: { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 22 },
  sectionTitle: { margin: 0, fontSize: 25, letterSpacing: "-.035em", fontWeight: 820 },
  sectionText: { maxWidth: 450, margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.55, textAlign: "right", "@media (max-width: 650px)": { textAlign: "left" } },
  cards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, 1fr)" }, "@media (max-width: 520px)": { gridTemplateColumns: "1fr" } },
  card: { minHeight: 165, padding: 19, border: "1px solid rgba(148,163,184,.13)", borderRadius: 15, background: "#0b1320", transition: "transform .2s ease, border-color .2s ease", "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(52,211,153,.42)" } },
  cardIcon: { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 11, color: "#6ee7b7", background: "rgba(16,185,129,.11)" },
  cardTitle: { margin: "18px 0 7px", fontSize: 15, fontWeight: 800 },
  cardText: { margin: 0, color: "#64748b", fontSize: 12, lineHeight: 1.55 },
  help: { display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16, marginTop: 12, "@media (max-width: 800px)": { gridTemplateColumns: "1fr" } },
  helpCard: { padding: 24, border: "1px solid rgba(148,163,184,.13)", borderRadius: 17, background: "linear-gradient(135deg, #0e1928, #0b1320)" },
  helpTitle: { display: "flex", alignItems: "center", gap: 10, margin: 0, fontSize: 19, fontWeight: 820 },
  helpCopy: { margin: "12px 0 20px", color: "#94a3b8", fontSize: 13, lineHeight: 1.6 },
  helpLinks: { display: "grid", gap: 9 },
  helpLink: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 12px", borderRadius: 10, color: "#cbd5e1", background: "rgba(148,163,184,.06)", textDecoration: "none", fontSize: 12, fontWeight: 700, "&:hover": { color: "#6ee7b7", background: "rgba(16,185,129,.1)" } },
  modal: { background: "#0b1320", color: "#f8fafc", border: "1px solid rgba(148,163,184,.16)", borderRadius: 18, padding: 8, minWidth: 340 },
  modalTitle: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 21, fontWeight: 820 },
  faq: { padding: "14px 0", borderBottom: "1px solid rgba(148,163,184,.12)" },
  faqButton: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, border: 0, background: "transparent", color: "#e2e8f0", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 750 },
  faqAnswer: { margin: "10px 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.6 },
  footer: { borderTop: "1px solid rgba(148,163,184,.12)", padding: "22px 28px", color: "#475569", textAlign: "center", fontSize: 12 },
}));

const faqs = [
  ["Como conecto meu primeiro WhatsApp?", "Entre no sistema, abra Conexões e escaneie o QR Code com o WhatsApp do aparelho. A conexão aparece online em poucos segundos."],
  ["Posso criar usuários e filas?", "Sim. No menu Usuários você controla permissões, e em Filas organiza o atendimento por equipe ou assunto."],
  ["Onde encontro ajuda para a API?", "Acesse Mensagens API dentro do Desk ou use a documentação técnica pelo atalho abaixo."],
];

const Portal = () => {
  const classes = useStyles();
  const [helpOpen, setHelpOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <Link to="/" className={classes.logo} aria-label="HACTO Desk">
          <HactoLogo size="small" showTagline={false} />
        </Link>
        <nav className={classes.nav} aria-label="Navegação principal">
          <a className={classes.navLink} href="#recursos">Recursos</a>
          <a className={classes.navLink} href="#ajuda">Central de ajuda</a>
          <a className={classes.navLink} href="#faq">FAQ</a>
        </nav>
        <div className={classes.headerActions}>
          <Button component={Link} to="/login" className={classes.signIn}>Entrar</Button>
          <Button component={Link} to="/login" className={classes.primary} endIcon={<ArrowForward />}>Acessar Desk</Button>
        </div>
      </header>

      <main>
        <section className={classes.hero}>
          <div className={classes.glow} />
          <div className={classes.grid} />
          <div className={classes.heroCopy}>
            <div className={classes.eyebrow}><AutoAwesome fontSize="small" /> Atendimento conectado</div>
            <h1 className={classes.title}>Seu atendimento, mais <span className={classes.accent}>inteligente.</span></h1>
            <p className={classes.description}>O HACTO Desk reúne WhatsApp, equipes, filas e inteligência artificial em um único espaço para sua operação atender melhor e responder mais rápido.</p>
            <div className={classes.ctas}>
              <Button component={Link} to="/login" className={classes.primary} endIcon={<ArrowForward />}>Entrar no sistema</Button>
              <Button onClick={() => setHelpOpen(true)} className={classes.secondary} startIcon={<PlayCircleOutlineOutlined />}>Conhecer a plataforma</Button>
            </div>
            <div className={classes.proof}>
              <span className={classes.proofItem}><CheckCircleOutlineOutlined fontSize="small" className={classes.accent} /> WhatsApp oficial</span>
              <span className={classes.proofItem}><CheckCircleOutlineOutlined fontSize="small" className={classes.accent} /> Multiempresa</span>
              <span className={classes.proofItem}><CheckCircleOutlineOutlined fontSize="small" className={classes.accent} /> IA integrada</span>
            </div>
          </div>

          <div className={classes.showcase} aria-label="Prévia do HACTO Desk">
            <img className={classes.heroImage} src={commandCenter} alt="Centro de operações de atendimento conectado" />
            <div className={classes.showcaseShade} />
            <div className={classes.windowBar}><div className={classes.windowDots}><span className={classes.dot} /><span className={classes.dot} /><span className={classes.dot} /></div><span>whats.hacto.com.br</span></div>
            <div className={classes.panel}>
              <div className={classes.panelTop}><div className={classes.panelTitle}><span className={classes.panelMark}><MessageRounded fontSize="small" /></span> Visão geral</div><div className={classes.live}><span className={classes.liveDot} /> Sistema online</div></div>
              <div className={classes.metrics}><div className={classes.metric}><div className={classes.metricValue}>24</div><div className={classes.metricLabel}>Tickets abertos</div></div><div className={classes.metric}><div className={classes.metricValue}>08</div><div className={classes.metricLabel}>Em atendimento</div></div><div className={classes.metric}><div className={classes.metricValue}>96%</div><div className={classes.metricLabel}>Satisfação</div></div></div>
              <div className={classes.ticket}><span className={classes.ticketText}>Nova mensagem de cliente</span><span className={classes.tag}>WhatsApp</span></div>
              <div className={classes.ticket}><span className={classes.ticketText}>Assistente IA classificou o ticket</span><span className={classes.tag}>Resolvido</span></div>
              <div className={classes.ticket}><span className={classes.ticketText}>Fila Comercial atualizada</span><span className={classes.tag}>Agora</span></div>
            </div>
          </div>
        </section>

        <section id="recursos" className={classes.section}>
          <div className={classes.sectionHeader}><h2 className={classes.sectionTitle}>Tudo para a operação fluir.</h2><p className={classes.sectionText}>Do primeiro contato ao encerramento, cada parte do atendimento fica no mesmo lugar.</p></div>
          <div className={classes.cards}>
            <div className={classes.card}><div className={classes.cardIcon}><WhatsApp /></div><h3 className={classes.cardTitle}>WhatsApp conectado</h3><p className={classes.cardText}>Centralize conversas e acompanhe o histórico completo de cada cliente.</p></div>
            <div className={classes.card}><div className={classes.cardIcon}><AutoAwesome /></div><h3 className={classes.cardTitle}>IA no atendimento</h3><p className={classes.cardText}>Automatize triagem, respostas e fluxos sem perder o toque humano.</p></div>
            <div className={classes.card}><div className={classes.cardIcon}><Speed /></div><h3 className={classes.cardTitle}>Filas e equipes</h3><p className={classes.cardText}>Distribua tickets, acompanhe produtividade e reduza o tempo de espera.</p></div>
            <div className={classes.card}><div className={classes.cardIcon}><Security /></div><h3 className={classes.cardTitle}>Controle e segurança</h3><p className={classes.cardText}>Permissões, sessões e dados organizados para sua empresa crescer.</p></div>
          </div>
        </section>

        <section id="ajuda" className={classes.section}>
          <div className={classes.help}>
            <div className={classes.helpCard}><h2 className={classes.helpTitle}><HelpOutlineOutlined className={classes.accent} /> Central de ajuda</h2><p className={classes.helpCopy}>Encontre o caminho mais rápido para configurar sua operação, conectar canais e aproveitar todos os recursos do HACTO Desk.</p><div className={classes.helpLinks}><a className={classes.helpLink} href="/helps">Guias dentro do sistema <ArrowForward fontSize="small" /></a><a className={classes.helpLink} href="/messages-api">Documentação da API <Code fontSize="small" /></a></div></div>
            <div className={classes.helpCard}><h2 className={classes.helpTitle}><SupportAgent className={classes.accent} /> Precisa falar com alguém?</h2><p className={classes.helpCopy}>Nossa equipe ajuda você a colocar o atendimento para funcionar e encontrar a melhor configuração.</p><Button className={classes.primary} startIcon={<WhatsApp />}>Falar no WhatsApp</Button></div>
          </div>
        </section>

        <section id="faq" className={classes.section}>
          <div className={classes.sectionHeader}><h2 className={classes.sectionTitle}>Perguntas frequentes</h2><p className={classes.sectionText}>Respostas rápidas para começar com segurança.</p></div>
          <div className={classes.helpCard}>{faqs.map(([question, answer], index) => <div className={classes.faq} key={question}><button type="button" className={classes.faqButton} onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}>{question}<span>{faqOpen === index ? "−" : "+"}</span></button>{faqOpen === index && <p className={classes.faqAnswer}>{answer}</p>}</div>)}</div>
        </section>
      </main>

      <footer className={classes.footer}>HACTO Desk · Atendimento Omnichannel & IA · © {new Date().getFullYear()} HACTO Tecnologia</footer>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} PaperProps={{ className: classes.modal }}><DialogContent><div className={classes.modalTitle}>Conheça o HACTO Desk <IconButton onClick={() => setHelpOpen(false)} aria-label="Fechar" color="inherit"><Close /></IconButton></div><p className={classes.helpCopy}>Uma central de atendimento para sua equipe trabalhar com mais contexto, velocidade e controle.</p><div className={classes.helpLinks}><a className={classes.helpLink} href="#recursos" onClick={() => setHelpOpen(false)}>Ver recursos <ArrowForward fontSize="small" /></a><Button component={Link} to="/login" onClick={() => setHelpOpen(false)} className={classes.primary} endIcon={<ArrowForward />}>Acessar agora</Button></div></DialogContent></Dialog>
    </div>
  );
};

export default Portal;
