;
import Navbar from "../components/Navbar";
import Herosetion from "../components/Herosetion";
import Features from "../components/Features";
import BugPriority from "../components/BugPriority";
import CtaSection from "../components/CtaSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-primary">
      <Navbar />
      <Herosetion />
      <Features />
      <BugPriority />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Home;
