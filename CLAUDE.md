# UD Labs — Landing Page

Site estático (HTML/CSS/JS puro, sem build system). Arquivo principal: `index.html`.

## Dev server

Rode sempre na **porta 3005**.

```bash
npx serve -p 3005
```

A configuração em `.claude/launch.json` já aponta para a porta 3005 — use o preview/launch do projeto para subir o servidor.

## Guias (/guias)

`guias/index.html` é o índice: um card por guia. Cada guia tem página própria em `guias/<slug>/index.html`.

As páginas de guias usam o mesmo CSS da home, o cabeçalho com o menu, o rodapé e o botão flutuante do WhatsApp copiados de `index.html`. Se algum desses mudar na home, atualize aqui também.

Para adicionar um guia novo:
1. Copiar `guias/quadro/index.html` para `guias/<slug>/index.html` e trocar título, descrição, canonical, og:url, o conteúdo, a fonte no fim e o `page` do evento do GA4 (`guia-<slug>`).
2. Adicionar um card em `guias/index.html` (tag da categoria, título, frase, link `/guias/<slug>/`).
3. Adicionar a URL `https://udlabs.com.br/guias/<slug>/` em `sitemap.xml`.
4. Conteúdo só com fatos conferidos na fonte oficial, citada no fim do guia. Sem travessão, sem emoji.
