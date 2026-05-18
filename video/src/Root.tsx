import { Composition } from "remotion";
import { ApresentacaoUsuario } from "./compositions/ApresentacaoUsuario";
import { ApresentacaoLojista } from "./compositions/ApresentacaoLojista";
import { FPS, DURATION_FRAMES, DURATION_FRAMES_LOJISTA, WIDTH, HEIGHT } from "./constants";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="apresentacao-usuario"
        component={ApresentacaoUsuario}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ withMusic: false }}
      />
      <Composition
        id="apresentacao-lojista"
        component={ApresentacaoLojista}
        durationInFrames={DURATION_FRAMES_LOJISTA}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ withMusic: false }}
      />
    </>
  );
}
