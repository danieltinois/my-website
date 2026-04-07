import { UserAccountIcon } from "@hugeicons/core-free-icons";
import About from "@/features/about/components/About";
import DesktopApp from "@/features/desktop/components/DesktopApp";
import { WindowManagerProvider } from "@/features/window-manager/WindowManagerProvider";
import Window from "@/shared/components/window/Window";
import Footer from "@/widgets/footer/Footer";
import NavBar from "@/widgets/navbar/NavBar";

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
              <DesktopApp
                title="about"
                icon={UserAccountIcon}
                windowContent={<About />}
              />
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
