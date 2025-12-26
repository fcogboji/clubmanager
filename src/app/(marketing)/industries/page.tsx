import Link from "next/link";
import {
  Users,
  CreditCard,
  Calendar,
  Mail,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Globe,
  Zap,
  Clock,
} from "lucide-react";

// Industry data
const industries = {
  tier1: [
    {
      id: "football",
      name: "Youth Football Clubs",
      icon: "football",
      description: "Manage teams, collect subs, and track attendance for your football club.",
      avgFee: "£25-50/month",
      features: ["Team management", "Match scheduling", "Parent payments", "Kit tracking"],
      color: "from-green-500 to-emerald-600",
      stats: { clubs: "40,000+", members: "3M+" },
    },
    {
      id: "dance",
      name: "Dance & Ballet Schools",
      icon: "dance",
      description: "Perfect for dance academies with multiple classes and recital management.",
      avgFee: "£40-80/month",
      features: ["Class scheduling", "Costume tracking", "Recital payments", "Grade progression"],
      color: "from-pink-500 to-rose-600",
      stats: { clubs: "8,000+", members: "500K+" },
    },
    {
      id: "martial-arts",
      name: "Martial Arts Academies",
      icon: "martial",
      description: "Belt progression tracking, grading fees, and monthly membership management.",
      avgFee: "£50-100/month",
      features: ["Belt/grade tracking", "Grading payments", "Class booking", "Competition entry"],
      color: "from-red-500 to-orange-600",
      stats: { clubs: "5,000+", members: "400K+" },
    },
    {
      id: "swimming",
      name: "Swimming Clubs & Academies",
      icon: "swimming",
      description: "Lesson booking, squad management, and gala entry fee collection.",
      avgFee: "£30-60/month",
      features: ["Lane booking", "Level progression", "Gala payments", "Squad management"],
      color: "from-blue-500 to-cyan-600",
      stats: { clubs: "1,500+", members: "200K+" },
    },
    {
      id: "gymnastics",
      name: "Gymnastics Clubs",
      icon: "gymnastics",
      description: "Manage gymnasts, track skills progression, and collect competition fees.",
      avgFee: "£40-80/month",
      features: ["Skill tracking", "Competition fees", "Equipment booking", "Badge progression"],
      color: "from-purple-500 to-violet-600",
      stats: { clubs: "2,000+", members: "150K+" },
    },
    {
      id: "music",
      name: "Music Schools & Tutors",
      icon: "music",
      description: "Individual and group lessons, instrument hire, and exam fee management.",
      avgFee: "£60-120/month",
      features: ["Lesson scheduling", "Instrument tracking", "Exam payments", "Practice logs"],
      color: "from-amber-500 to-yellow-600",
      stats: { clubs: "3,000+", members: "250K+" },
    },
  ],
  tier2: [
    {
      id: "drama",
      name: "Drama & Theatre Schools",
      icon: "drama",
      description: "Manage productions, rehearsals, and ticket sales all in one place.",
      avgFee: "£50-100/month",
      features: ["Production management", "Rehearsal scheduling", "Costume tracking", "Show payments"],
      color: "from-fuchsia-500 to-pink-600",
    },
    {
      id: "coding",
      name: "Coding Clubs for Kids",
      icon: "coding",
      description: "Tech-savvy parents love digital payment solutions for coding classes.",
      avgFee: "£60-100/month",
      features: ["Course tracking", "Project showcase", "Term payments", "Certificate generation"],
      color: "from-slate-600 to-gray-700",
    },
    {
      id: "scouts",
      name: "Scout & Guide Groups",
      icon: "scouts",
      description: "Manage badges, camps, and subscription fees for your troop.",
      avgFee: "£10-20/month",
      features: ["Badge tracking", "Camp payments", "Uniform orders", "Event management"],
      color: "from-teal-500 to-green-600",
    },
    {
      id: "church",
      name: "Church & Youth Groups",
      icon: "church",
      description: "Collect contributions and manage youth group activities seamlessly.",
      avgFee: "£10-30/month",
      features: ["Contribution tracking", "Event management", "Group communication", "Attendance"],
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "tutoring",
      name: "Tutoring Centres",
      icon: "tutoring",
      description: "Manage multiple students, subjects, and recurring lesson payments.",
      avgFee: "£80-200/month",
      features: ["Subject tracking", "Progress reports", "Lesson scheduling", "Multi-student families"],
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "language",
      name: "Language Schools",
      icon: "language",
      description: "Track language levels, course completion, and term-based payments.",
      avgFee: "£60-120/month",
      features: ["Level progression", "Course completion", "Exam booking", "Resource access"],
      color: "from-sky-500 to-blue-600",
    },
  ],
  tier3: [
    {
      id: "fitness",
      name: "Adult Fitness Classes",
      description: "CrossFit boxes, yoga studios, and fitness bootcamps.",
      avgFee: "£50-150/month",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "social",
      name: "Social & Networking Clubs",
      description: "Rotary, Lions, and professional networking groups.",
      avgFee: "£20-50/month",
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "hobby",
      name: "Hobby & Interest Groups",
      description: "Photography, art, crafts, and special interest clubs.",
      avgFee: "£15-40/month",
      color: "from-rose-500 to-pink-600",
    },
    {
      id: "community",
      name: "Community Centres",
      description: "Multiple activity classes under one roof.",
      avgFee: "£20-60/month",
      color: "from-cyan-500 to-teal-600",
    },
    {
      id: "afterschool",
      name: "After-School Clubs",
      description: "Childcare combined with educational activities.",
      avgFee: "£100-300/month",
      color: "from-lime-500 to-green-600",
    },
  ],
};

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Add members individually or bulk import. Track all member details, emergency contacts, and medical info.",
  },
  {
    icon: CreditCard,
    title: "Automated Payments",
    description: "Send payment links, collect recurring subscriptions, and never chase payments again.",
  },
  {
    icon: Calendar,
    title: "Class Scheduling",
    description: "Create classes, manage timetables, and let members see their schedules.",
  },
  {
    icon: Mail,
    title: "Parent Portal",
    description: "Parents can log in, view their children, and manage payments themselves.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "See revenue trends, attendance rates, and member growth at a glance.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Bank-grade security with Stripe. GDPR compliant data handling.",
  },
];

const testimonials = [
  {
    quote: "Club Manager has saved us hours every week. No more chasing parents for payments!",
    author: "Sarah Thompson",
    role: "Dance School Owner",
    industry: "Dance",
  },
  {
    quote: "The parent portal is brilliant. Parents love being able to see everything online.",
    author: "Mike Johnson",
    role: "Football Club Secretary",
    industry: "Football",
  },
  {
    quote: "Setting up was easy and the support team is incredibly helpful.",
    author: "Emma Williams",
    role: "Martial Arts Academy Owner",
    industry: "Martial Arts",
  },
];

export default function IndustriesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-welcome py-20 lg:py-32">
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -top-24 -right-24" />
        <div className="absolute w-64 h-64 rounded-full bg-white/10 bottom-24 -left-12" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Built for Every Club,<br />Class & Academy
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
            Whether you run a football club, dance school, or martial arts academy,
            Club Manager helps you spend less time on admin and more time doing what you love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#industries"
              className="w-full sm:w-auto border-2 border-white/50 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              See All Industries
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-gray-400">Active Clubs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">25,000+</div>
              <div className="text-gray-400">Members Managed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">£2M+</div>
              <div className="text-gray-400">Payments Processed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier 1 Industries */}
      <section id="industries" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect For Your Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored features for sports clubs, academies, and educational organizations.
            </p>
          </div>

          {/* Primary Industries */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              Most Popular Industries
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.tier1.map((industry) => (
                <IndustryCard key={industry.id} industry={industry} featured />
              ))}
            </div>
          </div>

          {/* Secondary Industries */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
              Education & Youth Organizations
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.tier2.map((industry) => (
                <IndustryCard key={industry.id} industry={industry} />
              ))}
            </div>
          </div>

          {/* Tertiary Industries */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></span>
              Also Great For
            </h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {industries.tier3.map((industry) => (
                <div
                  key={industry.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-4`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{industry.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{industry.description}</p>
                  <p className="text-sm font-semibold text-purple-600">{industry.avgFee}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Club
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to save you time and help your club grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Setting up your club is quick and easy. No technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: Zap,
                title: "Create Your Club",
                description: "Sign up and add your club details in under 2 minutes.",
              },
              {
                step: "2",
                icon: CreditCard,
                title: "Connect Stripe",
                description: "Link your bank account to receive payments directly.",
              },
              {
                step: "3",
                icon: Users,
                title: "Add Members",
                description: "Import your existing members or add them one by one.",
              },
              {
                step: "4",
                icon: Mail,
                title: "Send Payment Links",
                description: "Invite parents and start collecting subscriptions.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Club Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about Club Manager.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 relative"
              >
                <div className="text-6xl text-purple-200 absolute top-4 left-6">&ldquo;</div>
                <p className="text-gray-700 mb-6 relative z-10 pt-8">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No monthly fees. No hidden costs. Just a small percentage on successful payments.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                  PAY AS YOU GROW
                </div>
                <div className="flex items-end justify-center gap-2 mb-4">
                  <span className="text-6xl font-extrabold text-gray-900">10%</span>
                  <span className="text-2xl text-gray-500 mb-2">per payment</span>
                </div>
                <p className="text-gray-600">
                  Only pay when you get paid. No upfront costs.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Unlimited members",
                  "Unlimited classes",
                  "Parent portal included",
                  "Automated payment collection",
                  "Email notifications",
                  "Reports & analytics",
                  "CSV import/export",
                  "Stripe Connect integration",
                  "Priority email support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                className="block w-full gradient-primary text-white text-center py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>

              <p className="text-center text-sm text-gray-500 mt-4">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </div>

          {/* Pricing comparison */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-8">
              How Much Would You Save?
            </h3>
            <div className="bg-white/10 rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-gray-400 mb-2">50 Members @ £30/month</div>
                  <div className="text-2xl font-bold text-white">£150/month</div>
                  <div className="text-sm text-gray-500">Platform fee</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">100 Members @ £40/month</div>
                  <div className="text-2xl font-bold text-white">£400/month</div>
                  <div className="text-sm text-gray-500">Platform fee</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">200 Members @ £50/month</div>
                  <div className="text-2xl font-bold text-white">£1,000/month</div>
                  <div className="text-sm text-gray-500">Platform fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Teaser */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Works on Any Device
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Access your club dashboard from anywhere. Our mobile-friendly design means you can manage your club on the go.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Smartphone, text: "Mobile-optimized parent portal" },
                  { icon: Globe, text: "Access from any browser" },
                  { icon: Clock, text: "Real-time payment notifications" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-64">
                  <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="w-3/4 h-4 bg-gray-100 rounded mb-6"></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="aspect-square bg-purple-100 rounded-xl"></div>
                    <div className="aspect-square bg-pink-100 rounded-xl"></div>
                    <div className="aspect-square bg-blue-100 rounded-xl"></div>
                    <div className="aspect-square bg-green-100 rounded-xl"></div>
                  </div>
                  <div className="w-full h-10 gradient-primary rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-welcome">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Club?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join hundreds of clubs already saving time and collecting payments effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-white text-purple-600 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-white/70 mt-6">
            No credit card required. Set up in under 5 minutes.
          </p>
        </div>
      </section>
    </div>
  );
}

function IndustryCard({
  industry,
  featured = false,
}: {
  industry: {
    id: string;
    name: string;
    description: string;
    avgFee: string;
    features?: string[];
    color: string;
    stats?: { clubs: string; members: string };
  };
  featured?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 ${
        featured ? "ring-2 ring-purple-100" : ""
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-6`}
      >
        <Users className="w-7 h-7 text-white" />
      </div>

      <h4 className="text-xl font-bold text-gray-900 mb-3">{industry.name}</h4>
      <p className="text-gray-600 mb-4">{industry.description}</p>

      {industry.features && (
        <div className="space-y-2 mb-6">
          {industry.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {feature}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">Avg. fee:</span>
        <span className="font-bold text-purple-600">{industry.avgFee}</span>
      </div>

      {industry.stats && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{industry.stats.clubs} clubs in UK</span>
          <span>{industry.stats.members} members</span>
        </div>
      )}
    </div>
  );
}
