import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Store from "@/components/Store";
import BookingSystem from "@/components/BookingSystem";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Header />
    <Hero />
    <Services />
    <Store />
    <BookingSystem />
    <Gallery />
    <Contact />
    <Footer />
  </div>
);

export default Index;
