import App from "@/src/components/features/App";
import Window from "@/src/components/features/Window";
import NavBar from "@/src/components/layout/NavBar";
import {
  FavouriteCircleFreeIcons,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import About from "../components/features/About";
import Teste from "../components/features/Teste";
import { WindowManagerProvider } from "../context/WindowManager";

// TODO - Legal adicionar resize de window
// TODO - Legal aidiconar cursor personalizado (pensando na tematica windows xp)

export default function Home() {
  return (
    <WindowManagerProvider>
      <div>
        <nav className="p-3">
          <NavBar />
        </nav>
        <div className="fixed flex mx-auto w-screen h-screen items-center justify-center -translate-y-16 z-0">
          <Window title="home" disabled={true}>
            <div className="flex flex-row flex-wrap justify-center content-center h-full gap-6 p-8">
              <App
                title="about"
                icon={UserAccountIcon}
                windowContent={<About />}
              />
              <App
                title="teste"
                icon={FavouriteCircleFreeIcons}
                windowContent={<Teste />}
              />
            </div>
          </Window>
        </div>
        <footer>
          <div className="flex absolute w-screen bottom-[1.5%] bg-(--transparent) md:flex justify-center">
            <h1>Redes</h1>
          </div>
        </footer>
      </div>
    </WindowManagerProvider>
  );
}
