import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Timeline from './components/Timeline';
import Attractions from './components/Attractions';
import Culture from './components/Culture';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Timeline />
      <Attractions />
      <Culture />
      <Gallery />
      <Footer />
      <BackToTop />
    </>
  );
}