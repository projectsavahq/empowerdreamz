//import Navbar from "../components/Navbar";
//import Footer from "../components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
     {/* <NavBar /> */}
      <main className="pt-[100px]">
        {children}
      </main>
      {/* <Footer /> */}
    </>
  );
}