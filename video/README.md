# BRAVA+ · vídeo de apresentação

Projeto **Remotion** standalone pra gerar um reel de 35s do clube BRAVA+
voltado ao assinante final.

- Resolução: **1080×1920** (vertical · Instagram/TikTok/Reels/Shorts)
- Duração: **35s** a 30fps (= 1050 frames)
- 7 cenas: Hero → Problema → Solução → Mobile (carteirinha) → Calculadora → Mapa → CTA
- Paleta da marca: **amarelo, azul e preto BRAVA+**
- Música ambiente opcional (royalty-free) + narração via ElevenLabs

## Setup (uma vez)

```bash
cd video
npm install
```

## Como gerar o vídeo

### 1. (opcional) Música ambiente

Salve um MP3 royalty-free como `public/music.mp3`. Sugestões:
- [Mixkit Free](https://mixkit.co/free-stock-music) — busque "uplifting"
- [Pixabay Music](https://pixabay.com/music) — filtre por "upbeat"
- [YouTube Audio Library](https://studio.youtube.com/channel/UC/music)

### 2. Renderize

```bash
npm run render
```

Saída: `out/apresentacao-usuario.mp4` (~5-6 MB)

O script detecta automaticamente o `music.mp3` e injeta a trilha (volume 35%, loop).

## Comandos

| Comando              | O que faz                                                |
| -------------------- | -------------------------------------------------------- |
| `npm run studio`     | Studio interativo (preview com timeline + scrubbing)     |
| `npm run render`     | Gera o MP4 final                                         |
| `npm run build`      | Alias pra `render`                                       |
| `npm run narration`  | Gera narração TTS via ElevenLabs (`public/narration.mp3`) |
| `npm run voices`     | Lista vozes ElevenLabs da sua conta                      |

## Editar conteúdo

- **Timing de cada cena**: [`src/constants.ts`](src/constants.ts) → `SCENES`
- **Cores BRAVA+**: [`src/constants.ts`](src/constants.ts) → `COLORS`
- **Cenas**: [`src/scenes/`](src/scenes/)
- **Roteiro narração**: [`scripts/gen-narration.ts`](scripts/gen-narration.ts) → `ROTEIRO`

## Pasta de saída

`out/` (gitignored) — pronto pra Instagram Reels, TikTok, YouTube Shorts, WhatsApp, LinkedIn.
