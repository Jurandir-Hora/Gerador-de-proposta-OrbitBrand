# SKILL: Dynamic Layout Intelligence Engine

## OBJETIVO
Escolher automaticamente o layout ideal de proposta com base no perfil estratégico do cliente.

---

## INPUTS ANALISADOS
- ticket_medio
- segmento_cliente
- tom_do_briefing
- nivel_formalidade
- tipo_producao
- cidade

---

## REGRAS DE DECISÃO

### REGRA 1 — BLACK EDITION
Usar quando:
- ticket_medio >= 20000
- cliente pertence a elite empresarial
- produção envolve posicionamento premium
- cidade com forte presença de elite regional (ex: Ilhéus BA)

### REGRA 2 — CINEMATIC EDITION
Usar quando:
- ticket_medio entre 8000 e 20000
- cliente busca autoridade e impacto visual
- foco em branding ou institucional

### REGRA 3 — EXECUTIVE CLEAN
Usar quando:
- ticket_medio < 8000
- foco em orçamento prático
- cliente busca clareza e objetividade

---

## SAÍDA
Antigravity deve:
1. Escolher layout automaticamente
2. Gerar proposta no template correspondente
3. Ajustar linguagem para o nível socioeconômico do cliente
4. Manter compatibilidade com html2canvas + jsPDF