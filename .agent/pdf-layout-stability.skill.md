# SKILL: PDF Pagination Stability Engine

## OBJETIVO
Eliminar erros de quebra de página em modelos exportados via html2canvas ou jsPDF.

---

## REGRAS OBRIGATÓRIAS

1. Cada página deve usar container `.pdf-page`
2. Altura fixa: 1123px
3. Largura fixa: 794px
4. Padding superior mínimo: 70px
5. Padding inferior mínimo: 100px
6. Rodapé com position:absolute
7. Nunca depender apenas de page-break-before
8. Evitar conteúdo ultrapassar 90% da altura útil

---

## PROIBIDO
- Layouts sem controle de altura
- Conteúdo encostando no topo
- Rodapé fora do container fixo
- Overflow visível

---

## RESULTADO ESPERADO
Documento premium com paginação estável e previsível.