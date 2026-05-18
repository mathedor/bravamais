import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SCENES_LOJISTA, COLORS } from "../constants";
import { SceneHero } from "../scenes/lojista/SceneHero";
import { SceneProblema } from "../scenes/lojista/SceneProblema";
import { ScenePilares } from "../scenes/lojista/ScenePilares";
import { SceneFerramentas } from "../scenes/lojista/SceneFerramentas";
import { ScenePainel } from "../scenes/lojista/ScenePainel";
import { SceneDelivery } from "../scenes/lojista/SceneDelivery";
import { SceneEntregadores } from "../scenes/lojista/SceneEntregadores";
import { SceneCalculadora } from "../scenes/lojista/SceneCalculadora";
import { SceneCTA } from "../scenes/lojista/SceneCTA";

export function ApresentacaoLojista({
  withMusic = false,
}: {
  withMusic?: boolean;
}) {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      {withMusic && (
        <Audio src={staticFile("music.mp3")} volume={0.35} loop />
      )}

      <Sequence from={SCENES_LOJISTA.hero.start} durationInFrames={SCENES_LOJISTA.hero.duration}>
        <SceneHero />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.problema.start} durationInFrames={SCENES_LOJISTA.problema.duration}>
        <SceneProblema />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.pilares.start} durationInFrames={SCENES_LOJISTA.pilares.duration}>
        <ScenePilares />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.ferramentas.start} durationInFrames={SCENES_LOJISTA.ferramentas.duration}>
        <SceneFerramentas />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.painel.start} durationInFrames={SCENES_LOJISTA.painel.duration}>
        <ScenePainel />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.delivery.start} durationInFrames={SCENES_LOJISTA.delivery.duration}>
        <SceneDelivery />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.entregadores.start} durationInFrames={SCENES_LOJISTA.entregadores.duration}>
        <SceneEntregadores />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.calculadora.start} durationInFrames={SCENES_LOJISTA.calculadora.duration}>
        <SceneCalculadora />
      </Sequence>
      <Sequence from={SCENES_LOJISTA.cta.start} durationInFrames={SCENES_LOJISTA.cta.duration}>
        <SceneCTA />
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const total = Object.values(SCENES_LOJISTA).reduce((s, c) => s + c.duration, 0);
  const pct = (frame / total) * 100;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
        }}
      />
    </div>
  );
}
