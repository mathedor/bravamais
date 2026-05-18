import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SCENES_COMERCIAL, COLORS } from "../constants";
import { SceneHero } from "../scenes/comercial/SceneHero";
import { SceneProblema } from "../scenes/comercial/SceneProblema";
import { ScenePilares } from "../scenes/comercial/ScenePilares";
import { SceneCalculadora } from "../scenes/comercial/SceneCalculadora";
import { SceneFerramentas } from "../scenes/comercial/SceneFerramentas";
import { SceneFluxo } from "../scenes/comercial/SceneFluxo";
import { SceneCTA } from "../scenes/comercial/SceneCTA";

export function ApresentacaoComercial({ withMusic = false }: { withMusic?: boolean }) {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      {withMusic && <Audio src={staticFile("music.mp3")} volume={0.35} loop />}
      <Sequence from={SCENES_COMERCIAL.hero.start} durationInFrames={SCENES_COMERCIAL.hero.duration}><SceneHero /></Sequence>
      <Sequence from={SCENES_COMERCIAL.problema.start} durationInFrames={SCENES_COMERCIAL.problema.duration}><SceneProblema /></Sequence>
      <Sequence from={SCENES_COMERCIAL.pilares.start} durationInFrames={SCENES_COMERCIAL.pilares.duration}><ScenePilares /></Sequence>
      <Sequence from={SCENES_COMERCIAL.calculadora.start} durationInFrames={SCENES_COMERCIAL.calculadora.duration}><SceneCalculadora /></Sequence>
      <Sequence from={SCENES_COMERCIAL.ferramentas.start} durationInFrames={SCENES_COMERCIAL.ferramentas.duration}><SceneFerramentas /></Sequence>
      <Sequence from={SCENES_COMERCIAL.fluxo.start} durationInFrames={SCENES_COMERCIAL.fluxo.duration}><SceneFluxo /></Sequence>
      <Sequence from={SCENES_COMERCIAL.cta.start} durationInFrames={SCENES_COMERCIAL.cta.duration}><SceneCTA /></Sequence>
      <ProgressBar />
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const total = Object.values(SCENES_COMERCIAL).reduce((s, c) => s + c.duration, 0);
  const pct = (frame / total) * 100;
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.accent}, #6366f1)` }} />
    </div>
  );
}
