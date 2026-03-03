# SKILL: PDF Stability Engine (A4 Fidelity)

## OBJETIVO
Garantir fidelidade 1:1 entre o Preview HTML e o PDF gerado, blindando os templates contra interferências de temas (Neumorphism) e bugs do motor `html2canvas`.

---

## 🛡️ REGRAS DE OURO (STABILITY ENGINE)

### 1. Soberania dos Estilos Inline
**Obrigatório:** Use `style={{ ... }}` em vez de Tailwind para cores de fundo e texto.
- **Por quê?** O `html2canvas` às vezes ignora classes Tailwind se houver conflitos no DOM. Estilos inline têm prioridade máxima.
- **Exemplos:**
  - ✅ `style={{ backgroundColor: '#ffffff', color: '#171717' }}`
  - ❌ `className="bg-white text-neutral-900"` (Risco de sequestro pelo tema da interface)

### 2. Blindagem contra Temas (Antidote)
**Obrigatório:** Todos os containers de página devem ter o atributo `data-proposal-preview="true"`.
- **Por quê?** O arquivo `index.css` possui um "Stability Antidote" que protege qualquer elemento dentro desse atributo contra as sombras e cores do Neumorphism da barra lateral.

### 3. Fundo Escuro vs Gradientes
**Melhor Prática:** Para fundos escuros, prefira `background: linear-gradient` sutil ou o shorthand `background`.
- **Por quê?** O `html2canvas` tem um bug conhecido onde `background-color` em tons muito escuros às vezes é renderizado como preto absoluto no PDF, escondendo o texto.
- **Exemplo:** `background: 'linear-gradient(135deg, #0b0b0c 0%, #111112 100%)'`

### 4. Proteção de Dados (Filtro Anti-NaN)
**Obrigatório:** Proteja todo cálculo financeiro contra valores `undefined` ou `null`.
- **Por quê?** Multiplicar por `NaN` trava o motor de formatação de moeda do navegador e impede a geração do PDF.
- **Exemplo:** `service.price * (service.quantity || 1)`

---

## 📏 DIMENSÕES CRÍTICAS (A4)
- **Largura Fixa:** `794px`
- **Altura Fixa:** `1123px`
- **Padding:** Mínimo `70px` (L/R) e `80px` (Top/Bottom).
- **Rodapé:** Deve ser `position: absolute` dentro do container da página.

---

## 🚫 PROIBIDO
- **Display Grid:** Use apenas `flexbox`. O `grid` causa cortes aleatórios no `html2canvas`.
- **Scale > 2:** Use `scale: 2` no editor de PDF. Valores maiores estouram a memória RAM do navegador em layouts complexos.
- **!important no Tailwind:** Nunca use `!text-white` no PDF; use styles inline.

---

## ✅ CHECKLIST DO NOVO TEMPLATE
- [ ] Usa `PdfPage` como container principal.
- [ ] Atributo `darkTheme` condiz com a cor de fundo (ajuda o motor de captura).
- [ ] Estilos de fundo e texto são **Inline**.
- [ ] Cálculos de preço têm fallback `|| 1`.
- [ ] O componente é exportado e registrado no `TemplateManager.tsx`.