import { Composition } from "remotion";
import { ApresentacaoUsuario } from "./compositions/ApresentacaoUsuario";
import { ApresentacaoLojista } from "./compositions/ApresentacaoLojista";
import { ApresentacaoEntregador } from "./compositions/ApresentacaoEntregador";
import { ApresentacaoComercial } from "./compositions/ApresentacaoComercial";
import {
  FPS, DURATION_FRAMES, DURATION_FRAMES_LOJISTA,
  DURATION_FRAMES_ENTREGADOR, DURATION_FRAMES_COMERCIAL,
  WIDTH, HEIGHT,
} from "./constants";

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
      <Composition
        id="apresentacao-entregador"
        component={ApresentacaoEntregador}
        durationInFrames={DURATION_FRAMES_ENTREGADOR}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ withMusic: false }}
      />
      <Composition
        id="apresentacao-comercial"
        component={ApresentacaoComercial}
        durationInFrames={DURATION_FRAMES_COMERCIAL}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ withMusic: false }}
      />
    </>
  );
}
