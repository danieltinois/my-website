import NavBar from "@/src/components/layout/NavBar";

// TODO - Legal adicionar resize de window
// TODO - Legal aidiconar cursor personalizado (pensando na tematica windows xp)

export default function Home() {
  return (
    <div>
      <NavBar />
      <div className="fixed flex mx-auto w-screen h-screen items-center justify-center z-0">
        <h1>Hello to my web-site</h1>
      </div>
    </div>
  );
}
