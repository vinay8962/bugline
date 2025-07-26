import React from "react";
import { Zap } from "lucide-react";

const CtaSection = () => {
  return (
    <section className="py-20  bg-second-primary relative overflow-hidden text-white">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Ready to Transform Your Bug Tracking?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of development teams already using BugLine to ship
          better software faster.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA */}
          <button className="bg-primary text-white hover:text-primary font-semibold rounded-xl text-lg px-8 py-4 flex items-center justify-center gap-2 hover:bg-gray-100 transition">
            Start Free Trial
            <Zap className="h-5 w-5" />
          </button>

          {/* Secondary CTA */}
          <button className="border border-white/30 text-white text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
