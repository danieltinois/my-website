import NavBar from "@/src/components/layout/NavBar";

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
