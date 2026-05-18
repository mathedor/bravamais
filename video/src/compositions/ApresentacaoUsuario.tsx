import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SCENES, COLORS } from "../constants";
import { SceneHero } from "../scenes/usuario/SceneHero";
import { SceneProblema } from "../scenes/usuario/SceneProblema";
import { SceneSolucao } from "../scenes/usuario/SceneSolucao";
import { SceneMobile } from "../scenes/usuario/SceneMobile";
import { SceneCalculadora } from "../scenes/usuario/SceneCalculadora";
import { SceneDesktop } from "../scenes/usuario/SceneDesktop";
import { SceneCTA } from "../scenes/usuario/SceneCTA";

export function ApresentacaoUsuario({
  withMusic = false,
}: {
  withMusic?: boolean;
}) {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      {withMusic && (
        <Audio src={staticFile("music.mp3")} volume={0.35} loop />
      )}

      <Sequence from={SCENES.hero.start} durationInFrames={SCENES.hero.duration}>
        <SceneHero />
      </Sequence>
      <Sequence from={SCENES.problema.start} durationInFrames={SCENES.problema.duration}>
        <SceneProblema />
      </Sequence>
      <Sequence from={SCENES.solucao.start} durationInFrames={SCENES.solucao.duration}>
        <SceneSolucao />
      </Sequence>
      <Sequence from={SCENES.mobile.start} durationInFrames={SCENES.mobile.duration}>
        <SceneMobile />
      </Sequence>
      <Sequence from={SCENES.calculadora.start} durationInFrames={SCENES.calculadora.duration}>
        <SceneCalculadora />
      </Sequence>
      <Sequence from={SCENES.desktop.start} durationInFrames={SCENES.desktop.duration}>
        <SceneDesktop />
      </Sequence>
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.duration}>
        <SceneCTA />
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const total = Object.values(SCENES).reduce((s, c) => s + c.duration, 0);
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
