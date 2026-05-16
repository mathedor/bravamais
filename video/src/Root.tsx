import { Composition } from "remotion";
import { ApresentacaoUsuario } from "./compositions/ApresentacaoUsuario";
import { FPS, DURATION_FRAMES, WIDTH, HEIGHT } from "./constants";

export function RemotionRoot() {
  return (
    <Composition
      id="apresentacao-usuario"
      component={ApresentacaoUsuario}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withMusic: false }}
    />
  );
}
