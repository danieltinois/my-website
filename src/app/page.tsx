import { UserAccountIcon } from "@hugeicons/core-free-icons";
import About from "../components/features/About";
import Decor from "../components/layout/Decor";
import DesktopApp from "../components/features/DesktopApp";
import Window from "../components/features/Window";
import Footer from "@/src/components/layout/Footer";
import NavBar from "@/src/components/layout/NavBar";
import { WindowManagerProvider } from "../context/WindowManager";
import { catSvg, duckSvg, mugSvg, trashSvg } from "@/src/lib/critters";

// TODO - Legal adicionar resize de window
// TODO - Legal aidiconar cursor personalizado (pensando na tematica windows xp)

const desktopApps = [
  {
    title: "about",
    icon: UserAccountIcon,
    windowContent: <About />,
  },
];

export default function Home() {
  return (
    <WindowManagerProvider>
      <div>
        <Decor
          catSvg={catSvg(140)}
          duckSvg={duckSvg(120)}
          mugSvg={mugSvg(130)}
          trashSvg={trashSvg(92)}
        />
        <nav className="p-3">
          <NavBar />
        </nav>
        <div className="fixed flex mx-auto w-screen h-screen items-center justify-center -translate-y-16 z-0">
          <Window title="home" disabled={true}>
            <div className="flex flex-row flex-wrap justify-center content-center h-full gap-6 p-8">
              {desktopApps.map((app) => (
                <DesktopApp key={app.title} {...app} />
              ))}
            </div>
          </Window>
        </div>
        <footer>
          <div className="flex absolute w-screen bottom-[1.5%] bg-(--transparent) md:flex justify-center">
            <Footer />
          </div>
        </footer>
      </div>
    </WindowManagerProvider>
  );
}