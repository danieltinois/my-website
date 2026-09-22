import { UserAccountIcon, SquareTerminalIcon, FolderCodeIcon, ComputerActivityIcon } from "@hugeicons/core-free-icons";
import About from "../components/features/About";
import Terminal from "../components/features/Terminal";
import Projects from "../components/features/Projects";
import SystemMonitor from "../components/features/SystemMonitor";
import Decor from "../components/layout/Decor";
import DesktopApp from "../components/features/DesktopApp";
import Window from "../components/features/Window";
import Footer from "@/src/components/layout/Footer";
import NavBar from "@/src/components/layout/NavBar";
import { WindowManagerProvider } from "../context/WindowManager";

// TODO - Legal adicionar cursor personalizado (pensando na tematica windows xp)

const desktopApps = [
  {
    title: "about",
    icon: UserAccountIcon,
    windowContent: <About />,
  },
  {
    title: "terminal",
    icon: SquareTerminalIcon,
    windowContent: <Terminal />,
  },
  {
    title: "projects",
    icon: FolderCodeIcon,
    windowContent: <Projects />,
  },
  {
    title: "monitor",
    icon: ComputerActivityIcon,
    windowContent: <SystemMonitor />,
  },
];

export default function Home() {
  return (
    <WindowManagerProvider>
      <div>
        <Decor />
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
        <footer className="z-[9998]">
          <div className="flex absolute w-screen bottom-[1.5%] bg-(--transparent) md:flex justify-center">
            <Footer />
          </div>
        </footer>
      </div>
    </WindowManagerProvider>
  );
}