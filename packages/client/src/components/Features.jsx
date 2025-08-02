;
import {
  MessageCircle,
  Bell,
  Clock,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: <MessageCircle className="h-6 w-6 text-blue-500" />,
    title: "Real-time Chat",
    description:
      "Instant communication between reporters and developers with typing indicators and file attachments",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Bell className="h-6 w-6 text-yellow-500" />,
    title: "Live Notifications",
    description:
      "Get notified instantly when bugs are assigned, updated, or resolved with real-time push notifications",
    bg: "bg-yellow-500/10",
  },
  {
    icon: <Clock className="h-6 w-6 text-green-500" />,
    title: "Smart Tracking",
    description:
      "Complete bug lifecycle tracking from report to resolution with automated status updates",
    bg: "bg-green-500/10",
  },
  {
    icon: <Users className="h-6 w-6 text-purple-500" />,
    title: "Role-based Access",
    description:
      "Granular permissions for reporters, developers, and admins with team management tools",
    bg: "bg-purple-500/10",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
    title: "Advanced Analytics",
    description:
      "Comprehensive dashboards with bug trends, resolution times, and team performance metrics",
    bg: "bg-indigo-500/10",
  },
  {
    icon: <Shield className="h-6 w-6 text-red-500" />,
    title: "Enterprise Security",
    description:
      "JWT authentication, data encryption, and SOC 2 compliance for enterprise-grade security",
    bg: "bg-red-500/10",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="py-20 bg-[#101014] backdrop-blur-sm text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to streamline bug reporting and accelerate
            development cycles
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-white/10 bg-primary hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${feature.bg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
