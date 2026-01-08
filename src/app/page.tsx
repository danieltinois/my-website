import App from "@/src/components/features/App";
import Window from "@/src/components/features/Window";
import NavBar from "@/src/components/layout/NavBar";
import { UserAccountIcon } from "@hugeicons/core-free-icons";

// TODO - Legal adicionar resize de window
// TODO - Legal aidiconar cursor personalizado (pensando na tematica windows xp)

export default function Home() {
  return (
    <div>
      <nav className="p-3">
        <NavBar />
      </nav>
      <div className="fixed flex mx-auto w-screen h-screen items-center justify-center -translate-y-16 z-0">
        <Window title="home">
          <div>
            <App title="about" icon={UserAccountIcon} />
          </div>
        </Window>
      </div>
      <footer>
        <div className="flex absolute w-screen bottom-[1.5%] bg-(--transparent) md:flex justify-center">
          <h1>Redes</h1>
        </div>
      </footer>
    </div>
  );
}
