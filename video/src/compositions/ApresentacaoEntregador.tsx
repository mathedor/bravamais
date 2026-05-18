import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SCENES_ENTREGADOR, COLORS } from "../constants";
import { SceneHero } from "../scenes/entregador/SceneHero";
import { SceneProblema } from "../scenes/entregador/SceneProblema";
import { ScenePilares } from "../scenes/entregador/ScenePilares";
import { SceneCalculadora } from "../scenes/entregador/SceneCalculadora";
import { SceneFerramentas } from "../scenes/entregador/SceneFerramentas";
import { SceneComparativo } from "../scenes/entregador/SceneComparativo";
import { SceneCTA } from "../scenes/entregador/SceneCTA";

export function ApresentacaoEntregador({ withMusic = false }: { withMusic?: boolean }) {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      {withMusic && <Audio src={staticFile("music.mp3")} volume={0.35} loop />}
      <Sequence from={SCENES_ENTREGADOR.hero.start} durationInFrames={SCENES_ENTREGADOR.hero.duration}><SceneHero /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.problema.start} durationInFrames={SCENES_ENTREGADOR.problema.duration}><SceneProblema /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.pilares.start} durationInFrames={SCENES_ENTREGADOR.pilares.duration}><ScenePilares /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.calculadora.start} durationInFrames={SCENES_ENTREGADOR.calculadora.duration}><SceneCalculadora /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.ferramentas.start} durationInFrames={SCENES_ENTREGADOR.ferramentas.duration}><SceneFerramentas /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.comparativo.start} durationInFrames={SCENES_ENTREGADOR.comparativo.duration}><SceneComparativo /></Sequence>
      <Sequence from={SCENES_ENTREGADOR.cta.start} durationInFrames={SCENES_ENTREGADOR.cta.duration}><SceneCTA /></Sequence>
      <ProgressBar />
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const total = Object.values(SCENES_ENTREGADOR).reduce((s, c) => s + c.duration, 0);
  const pct = (frame / total) * 100;
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.accent}, #f97316)` }} />
    </div>
  );
}
