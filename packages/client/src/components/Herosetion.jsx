;
import { Zap, CheckCircle } from "lucide-react";
import heroImage from "../assets/971-removebg-preview.png"; // Update path as needed
const Herosetion = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 border border-white/20 rounded-full text-sm text-white bg-white/5 w-fit">
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              Real-time Bug Tracking
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Report Bugs.
              <br />
              <span className="bg-second-primary bg-clip-text text-transparent">
                Chat Live.
              </span>
              <br />
              Ship Faster.
            </h1>

            {/* Subtext */}
            <p className="text-xl text-gray-300 max-w-2xl">
              Connect testers and developers with real-time bug reporting,
              instant chat, and live status updates. Streamline your development
              workflow like never before.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-second-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:scale-105 transition-transform duration-300 flex items-center gap-2 shadow-lg">
                Start Free Trial <Zap className="h-5 w-5" />
              </button>
              <button className="border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors duration-300">
                Watch Demo
              </button>
            </div>

            {/* Info Notes */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400 pt-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={heroImage}
                alt="BugLine Dashboard"
                className="w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Herosetion;
