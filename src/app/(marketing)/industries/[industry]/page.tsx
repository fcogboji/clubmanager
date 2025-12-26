import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  CreditCard,
  Calendar,
  Mail,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Shield,
  Clock,
  Smartphone,
} from "lucide-react";

// Industry data with full details
const industryData: Record<string, {
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  avgFee: string;
  color: string;
  gradient: string;
  features: string[];
  painPoints: { title: string; solution: string }[];
  useCases: string[];
  stats: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; role: string };
}> = {
  "football": {
    name: "Youth Football Clubs",
    headline: "The Ultimate Management Platform for Football Clubs",
    subheadline: "Manage players, collect subs, and run your club like a pro",
    description: "Club Manager helps football clubs of all sizes manage their players, collect monthly subscriptions, and communicate with parents. From grassroots to semi-pro, we've got you covered.",
    avgFee: "£25-50/month",
    color: "from-green-500 to-emerald-600",
    gradient: "from-green-600 via-emerald-600 to-teal-600",
    features: [
      "Player registration and profiles",
      "Team and squad management",
      "Monthly subscription collection",
      "Parent portal for families",
      "Match and training scheduling",
      "Attendance tracking",
      "Kit and equipment tracking",
      "Emergency contact management",
    ],
    painPoints: [
      {
        title: "Chasing parents for subs",
        solution: "Automated payment links sent directly to parents with recurring billing",
      },
      {
        title: "Spreadsheet chaos",
        solution: "All player info, payments, and attendance in one organized dashboard",
      },
      {
        title: "Communication headaches",
        solution: "Parent portal gives families direct access to schedules and payment history",
      },
      {
        title: "End of season admin",
        solution: "Easy reports and data export for AGMs and league registrations",
      },
    ],
    useCases: [
      "Grassroots youth football clubs",
      "Sunday league teams",
      "Football academies",
      "5-a-side leagues",
      "Girls football clubs",
      "Walking football groups",
    ],
    stats: [
      { label: "Football clubs in UK", value: "40,000+" },
      { label: "Youth players", value: "3M+" },
      { label: "Avg. monthly subs", value: "£30" },
      { label: "Time saved weekly", value: "5+ hours" },
    ],
    testimonial: {
      quote: "We used to spend hours every week chasing parents for subs. Now it's all automated and parents love the portal.",
      author: "Mike Johnson",
      role: "Club Secretary, Riverside FC",
    },
  },
  "dance": {
    name: "Dance & Ballet Schools",
    headline: "Beautiful Software for Beautiful Dancers",
    subheadline: "Class scheduling, payments, and parent communication made simple",
    description: "From ballet to hip-hop, Club Manager helps dance schools manage multiple classes, collect term fees, and keep parents informed. Perfect for studios of all sizes.",
    avgFee: "£40-80/month",
    color: "from-pink-500 to-rose-600",
    gradient: "from-pink-600 via-rose-600 to-red-600",
    features: [
      "Multi-class management",
      "Grade and level tracking",
      "Term-based or monthly payments",
      "Recital and show fee collection",
      "Costume and uniform tracking",
      "Exam registration management",
      "Waiting list management",
      "Sibling discount handling",
    ],
    painPoints: [
      {
        title: "Managing multiple classes",
        solution: "Assign students to unlimited classes with individual scheduling",
      },
      {
        title: "Recital payment chaos",
        solution: "Collect costume fees, show tickets, and extras through one system",
      },
      {
        title: "Tracking progression",
        solution: "Record grades, levels, and achievements for each dancer",
      },
      {
        title: "Sibling billing complexity",
        solution: "Easy family management with discounts for multiple children",
      },
    ],
    useCases: [
      "Ballet schools",
      "Contemporary dance studios",
      "Hip-hop and street dance",
      "Ballroom and Latin",
      "Irish dance schools",
      "Tap and jazz academies",
    ],
    stats: [
      { label: "Dance schools in UK", value: "8,000+" },
      { label: "Dance students", value: "500K+" },
      { label: "Avg. term fee", value: "£180" },
      { label: "Shows managed", value: "1,000+" },
    ],
    testimonial: {
      quote: "Managing 15 different classes used to be a nightmare. Now parents book, pay, and see schedules all in one place.",
      author: "Sarah Thompson",
      role: "Owner, Thompson Dance Academy",
    },
  },
  "martial-arts": {
    name: "Martial Arts Academies",
    headline: "Powerful Software for Martial Arts Schools",
    subheadline: "Belt tracking, grading fees, and membership management",
    description: "Whether you teach karate, judo, BJJ, or taekwondo, Club Manager helps you track student progression, collect monthly dues, and manage grading events.",
    avgFee: "£50-100/month",
    color: "from-red-500 to-orange-600",
    gradient: "from-red-600 via-orange-600 to-amber-600",
    features: [
      "Belt and grade tracking",
      "Grading fee collection",
      "Monthly membership billing",
      "Class and session booking",
      "Competition entry management",
      "Equipment and gi sales",
      "Trial class management",
      "Student progress notes",
    ],
    painPoints: [
      {
        title: "Tracking belt progression",
        solution: "Visual belt/grade system showing each student's journey",
      },
      {
        title: "Grading day admin",
        solution: "Collect grading fees and manage registrations automatically",
      },
      {
        title: "Trial to member conversion",
        solution: "Track trial students and convert to paying members seamlessly",
      },
      {
        title: "Competition entries",
        solution: "Collect entry fees and manage event registrations",
      },
    ],
    useCases: [
      "Karate dojos",
      "Judo clubs",
      "Brazilian Jiu-Jitsu academies",
      "Taekwondo schools",
      "Kickboxing gyms",
      "MMA academies",
      "Kung Fu schools",
    ],
    stats: [
      { label: "Martial arts clubs in UK", value: "5,000+" },
      { label: "Active practitioners", value: "400K+" },
      { label: "Avg. monthly fee", value: "£60" },
      { label: "Gradings processed", value: "10,000+" },
    ],
    testimonial: {
      quote: "The belt tracking feature is brilliant. Parents can see their child's progression and it motivates the students too.",
      author: "Sensei David Park",
      role: "Head Instructor, Park's Martial Arts",
    },
  },
  "swimming": {
    name: "Swimming Clubs & Academies",
    headline: "Dive Into Better Club Management",
    subheadline: "Lesson booking, squad management, and gala entries made easy",
    description: "From learn-to-swim programs to competitive squads, Club Manager helps swimming clubs manage lessons, track swimmer progression, and collect fees.",
    avgFee: "£30-60/month",
    color: "from-blue-500 to-cyan-600",
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
    features: [
      "Lesson level tracking",
      "Squad and lane management",
      "Gala entry and fee collection",
      "Pool lane booking",
      "Swim times and PB tracking",
      "Badge and certificate management",
      "Parent viewing sessions",
      "Holiday course booking",
    ],
    painPoints: [
      {
        title: "Level assessments",
        solution: "Track swimmer levels and move them between groups easily",
      },
      {
        title: "Gala entries chaos",
        solution: "Collect entry fees and manage event registrations online",
      },
      {
        title: "Lane capacity management",
        solution: "See exactly how many swimmers are in each session",
      },
      {
        title: "Holiday course admin",
        solution: "Set up and manage intensive courses with separate pricing",
      },
    ],
    useCases: [
      "Learn-to-swim schools",
      "Competitive swimming clubs",
      "Masters swimming groups",
      "Triathlon swim squads",
      "Water polo clubs",
      "Diving academies",
    ],
    stats: [
      { label: "Swim clubs in UK", value: "1,500+" },
      { label: "Active swimmers", value: "200K+" },
      { label: "Avg. monthly fee", value: "£45" },
      { label: "Galas managed", value: "500+" },
    ],
    testimonial: {
      quote: "Gala entries used to take hours. Now parents enter online and payments are automatic. Game changer!",
      author: "Coach Emma Williams",
      role: "Head Coach, City Swimmers",
    },
  },
  "gymnastics": {
    name: "Gymnastics Clubs",
    headline: "Flip Your Club Management",
    subheadline: "Skills tracking, competition fees, and class management",
    description: "Club Manager helps gymnastics clubs track athlete progression, manage multiple ability groups, and collect competition entry fees.",
    avgFee: "£40-80/month",
    color: "from-purple-500 to-violet-600",
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    features: [
      "Skill and badge tracking",
      "Ability group management",
      "Competition fee collection",
      "British Gymnastics integration",
      "Squad selection management",
      "Equipment booking",
      "Trial and taster sessions",
      "Holiday camp booking",
    ],
    painPoints: [
      {
        title: "Tracking progression",
        solution: "Record badges, skills, and achievements for every gymnast",
      },
      {
        title: "Competition admin",
        solution: "Collect entry fees and manage registrations seamlessly",
      },
      {
        title: "Managing ability groups",
        solution: "Move gymnasts between groups as they progress",
      },
      {
        title: "BG membership tracking",
        solution: "Track British Gymnastics membership expiry dates",
      },
    ],
    useCases: [
      "Recreational gymnastics clubs",
      "Competitive gymnastics squads",
      "Tumbling and trampoline clubs",
      "Cheerleading squads",
      "Acrobatic gymnastics",
      "Rhythmic gymnastics",
    ],
    stats: [
      { label: "Gymnastics clubs in UK", value: "2,000+" },
      { label: "Active gymnasts", value: "150K+" },
      { label: "Avg. monthly fee", value: "£55" },
      { label: "Competitions managed", value: "800+" },
    ],
    testimonial: {
      quote: "Parents love seeing their child's badge progression. It keeps them motivated and shows the value of our coaching.",
      author: "Coach Lisa Chen",
      role: "Head Coach, Elite Gymnastics",
    },
  },
  "music": {
    name: "Music Schools & Tutors",
    headline: "Orchestrate Your Music School",
    subheadline: "Lesson scheduling, grade tracking, and payment collection",
    description: "Whether you're a solo tutor or a large music school, Club Manager helps you manage students, schedule lessons, and collect payments effortlessly.",
    avgFee: "£60-120/month",
    color: "from-amber-500 to-yellow-600",
    gradient: "from-amber-600 via-yellow-600 to-orange-600",
    features: [
      "Individual lesson scheduling",
      "Group class management",
      "Grade and exam tracking",
      "Instrument hire tracking",
      "Practice log for students",
      "Recital and concert fees",
      "Theory class bookings",
      "Holiday lesson credits",
    ],
    painPoints: [
      {
        title: "Scheduling individual lessons",
        solution: "Flexible scheduling for one-to-one and group sessions",
      },
      {
        title: "Tracking exam grades",
        solution: "Record ABRSM, Trinity, and other exam results",
      },
      {
        title: "Managing cancellations",
        solution: "Easy rescheduling and credit management",
      },
      {
        title: "Instrument hire admin",
        solution: "Track who has which instruments and manage fees",
      },
    ],
    useCases: [
      "Piano teachers",
      "Guitar schools",
      "Violin and string tutors",
      "Drum academies",
      "Vocal coaches",
      "Music theory schools",
      "Orchestra and band programs",
    ],
    stats: [
      { label: "Music schools in UK", value: "3,000+" },
      { label: "Music students", value: "250K+" },
      { label: "Avg. lesson fee", value: "£30/hr" },
      { label: "Exams tracked", value: "5,000+" },
    ],
    testimonial: {
      quote: "As a solo piano teacher with 40 students, this saves me hours every week on admin and chasing payments.",
      author: "James Wilson",
      role: "Private Piano Teacher",
    },
  },
  "drama": {
    name: "Drama & Theatre Schools",
    headline: "Take Centre Stage with Better Management",
    subheadline: "Production management, rehearsals, and show payments",
    description: "From youth theatre to drama schools, manage your productions, collect costume fees, and keep cast members informed.",
    avgFee: "£50-100/month",
    color: "from-fuchsia-500 to-pink-600",
    gradient: "from-fuchsia-600 via-pink-600 to-rose-600",
    features: [
      "Production management",
      "Rehearsal scheduling",
      "Costume fee collection",
      "Show ticket management",
      "Cast and crew lists",
      "Script distribution",
      "Audition management",
      "Term-based enrollment",
    ],
    painPoints: [
      {
        title: "Production costs",
        solution: "Collect costume, prop, and production fees easily",
      },
      {
        title: "Rehearsal chaos",
        solution: "Clear schedules that cast and parents can access",
      },
      {
        title: "Managing multiple shows",
        solution: "Separate productions with their own casts and fees",
      },
      {
        title: "Communication overload",
        solution: "Parent portal keeps everyone informed automatically",
      },
    ],
    useCases: [
      "Youth theatre groups",
      "Drama schools",
      "Musical theatre academies",
      "Stage schools",
      "Acting workshops",
      "Improv groups",
    ],
    stats: [
      { label: "Drama schools in UK", value: "2,500+" },
      { label: "Young performers", value: "200K+" },
      { label: "Avg. term fee", value: "£200" },
      { label: "Shows managed", value: "1,500+" },
    ],
  },
  "coding": {
    name: "Coding Clubs for Kids",
    headline: "Debug Your Admin Problems",
    subheadline: "Course management and payments for coding schools",
    description: "Tech-savvy parents expect digital solutions. Manage your coding courses, track student projects, and collect fees online.",
    avgFee: "£60-100/month",
    color: "from-slate-600 to-gray-700",
    gradient: "from-slate-700 via-gray-700 to-zinc-700",
    features: [
      "Course and module tracking",
      "Project portfolio management",
      "Certificate generation",
      "Term and holiday courses",
      "Equipment loan tracking",
      "Online resource access",
      "Parent progress updates",
      "Sibling discounts",
    ],
    painPoints: [
      {
        title: "Course progression",
        solution: "Track which modules each student has completed",
      },
      {
        title: "Holiday course booking",
        solution: "Separate booking and payment for intensive courses",
      },
      {
        title: "Showing value to parents",
        solution: "Share project portfolios and certificates online",
      },
      {
        title: "Equipment management",
        solution: "Track loaned laptops and equipment",
      },
    ],
    useCases: [
      "Code Club groups",
      "Scratch programming classes",
      "Python courses for kids",
      "Robotics clubs",
      "Game development workshops",
      "Web design courses",
    ],
    stats: [
      { label: "Coding clubs in UK", value: "1,500+" },
      { label: "Young coders", value: "100K+" },
      { label: "Avg. course fee", value: "£80/term" },
      { label: "Projects tracked", value: "50,000+" },
    ],
  },
  "tutoring": {
    name: "Tutoring Centres",
    headline: "Grade A Club Management",
    subheadline: "Multi-subject tutoring made manageable",
    description: "Manage multiple subjects, track student progress, and collect payments from families with multiple children.",
    avgFee: "£80-200/month",
    color: "from-emerald-500 to-teal-600",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    features: [
      "Multi-subject management",
      "Progress report generation",
      "Lesson scheduling",
      "Homework assignment tracking",
      "Parent communication portal",
      "Family account management",
      "Resource library access",
      "Exam preparation tracking",
    ],
    painPoints: [
      {
        title: "Multiple subjects per student",
        solution: "Track progress across all subjects in one place",
      },
      {
        title: "Family billing",
        solution: "One invoice for families with multiple children",
      },
      {
        title: "Progress reporting",
        solution: "Generate and share progress reports easily",
      },
      {
        title: "Scheduling complexity",
        solution: "Manage individual and group sessions flexibly",
      },
    ],
    useCases: [
      "Maths tutoring centres",
      "English tuition",
      "Science tutors",
      "11+ exam preparation",
      "GCSE and A-Level support",
      "SEN tutoring",
    ],
    stats: [
      { label: "Tutoring centres in UK", value: "4,000+" },
      { label: "Tutored students", value: "1M+" },
      { label: "Avg. hourly rate", value: "£35" },
      { label: "Exams prepared for", value: "100K+" },
    ],
  },
  "scouts": {
    name: "Scout & Guide Groups",
    headline: "Be Prepared with Better Management",
    subheadline: "Badge tracking, camp fees, and subscription collection",
    description: "Manage your scout or guide group, track badge progression, and collect camp fees and subscriptions from families.",
    avgFee: "£10-20/month",
    color: "from-teal-500 to-green-600",
    gradient: "from-teal-600 via-green-600 to-emerald-600",
    features: [
      "Badge and award tracking",
      "Camp fee collection",
      "Uniform order management",
      "Event registration",
      "Parent consent forms",
      "Subscription collection",
      "Volunteer management",
      "Activity planning",
    ],
    painPoints: [
      {
        title: "Chasing subscriptions",
        solution: "Automated recurring payment collection",
      },
      {
        title: "Camp payments",
        solution: "Collect deposits and balances online",
      },
      {
        title: "Badge record keeping",
        solution: "Track every scout's badge progression",
      },
      {
        title: "Consent form chaos",
        solution: "Digital consent and emergency contact management",
      },
    ],
    useCases: [
      "Scout groups (all sections)",
      "Guide units",
      "Brownie packs",
      "Cub packs",
      "Explorer units",
      "Ranger units",
    ],
    stats: [
      { label: "Scout groups in UK", value: "7,000+" },
      { label: "Young people", value: "400K+" },
      { label: "Avg. annual sub", value: "£120" },
      { label: "Camps managed", value: "5,000+" },
    ],
  },
  "language": {
    name: "Language Schools",
    headline: "Speak the Language of Efficiency",
    subheadline: "Course management for language learning centres",
    description: "Manage language courses, track student levels, and collect term fees for your language school.",
    avgFee: "£60-120/month",
    color: "from-sky-500 to-blue-600",
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
    features: [
      "Level and CEFR tracking",
      "Course progression",
      "Exam registration",
      "Term-based payments",
      "Resource access management",
      "Conversation class booking",
      "Intensive course management",
      "Certificate generation",
    ],
    painPoints: [
      {
        title: "Level management",
        solution: "Track CEFR levels and move students appropriately",
      },
      {
        title: "Mixed course types",
        solution: "Manage group classes, 1-1 lessons, and intensives",
      },
      {
        title: "Exam coordination",
        solution: "Register students for external exams and collect fees",
      },
      {
        title: "Resource access",
        solution: "Control access to online learning materials",
      },
    ],
    useCases: [
      "English language schools",
      "French classes",
      "Spanish courses",
      "Mandarin schools",
      "German language centres",
      "ESOL providers",
    ],
    stats: [
      { label: "Language schools in UK", value: "3,500+" },
      { label: "Language learners", value: "300K+" },
      { label: "Avg. course fee", value: "£200/term" },
      { label: "Exams facilitated", value: "20,000+" },
    ],
  },
  "fitness": {
    name: "Adult Fitness Classes",
    headline: "Power Up Your Fitness Business",
    subheadline: "Class booking, membership management, and payments",
    description: "From CrossFit boxes to yoga studios, manage your classes, memberships, and payments in one place.",
    avgFee: "£50-150/month",
    color: "from-orange-500 to-red-600",
    gradient: "from-orange-600 via-red-600 to-rose-600",
    features: [
      "Class booking system",
      "Membership tiers",
      "Drop-in payment collection",
      "Waitlist management",
      "Attendance tracking",
      "Workout logging",
      "Challenge management",
      "PT session booking",
    ],
    painPoints: [
      {
        title: "Class capacity management",
        solution: "Automatic waitlists when classes fill up",
      },
      {
        title: "Multiple membership types",
        solution: "Unlimited, class packs, and drop-in options",
      },
      {
        title: "No-show management",
        solution: "Track attendance and manage cancellation policies",
      },
      {
        title: "PT session admin",
        solution: "Separate booking and payment for personal training",
      },
    ],
    useCases: [
      "CrossFit boxes",
      "Yoga studios",
      "Pilates classes",
      "Bootcamp groups",
      "Spin studios",
      "HIIT classes",
    ],
    stats: [
      { label: "Fitness studios in UK", value: "8,000+" },
      { label: "Active members", value: "2M+" },
      { label: "Avg. membership", value: "£80/month" },
      { label: "Classes booked", value: "500K+" },
    ],
  },
  "church": {
    name: "Church & Youth Groups",
    headline: "Faith-Based Group Management",
    subheadline: "Contributions, events, and youth group management",
    description: "Manage your congregation, collect contributions, and run youth programs with ease.",
    avgFee: "£10-30/month",
    color: "from-indigo-500 to-blue-600",
    gradient: "from-indigo-600 via-blue-600 to-violet-600",
    features: [
      "Contribution tracking",
      "Event management",
      "Youth group enrollment",
      "Volunteer scheduling",
      "Communication tools",
      "Camp and retreat payments",
      "Small group management",
      "Attendance tracking",
    ],
    painPoints: [
      {
        title: "Contribution tracking",
        solution: "Easy recurring giving and one-time donations",
      },
      {
        title: "Event registration",
        solution: "Online signup and payment for events",
      },
      {
        title: "Youth program admin",
        solution: "Manage multiple youth groups and activities",
      },
      {
        title: "Volunteer coordination",
        solution: "Schedule and communicate with volunteers",
      },
    ],
    useCases: [
      "Church youth groups",
      "Sunday schools",
      "Faith-based camps",
      "Religious education",
      "Community outreach programs",
      "Small groups",
    ],
    stats: [
      { label: "Churches in UK", value: "40,000+" },
      { label: "Youth group members", value: "500K+" },
      { label: "Avg. contribution", value: "£50/month" },
      { label: "Events managed", value: "10,000+" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(industryData).map((industry) => ({
    industry,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }) {
  const resolvedParams = await params;
  const industry = industryData[resolvedParams.industry];
  if (!industry) {
    return { title: "Industry Not Found" };
  }
  return {
    title: `${industry.name} Management Software | Club Manager`,
    description: industry.description,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const resolvedParams = await params;
  const industry = industryData[resolvedParams.industry];

  if (!industry) {
    notFound();
  }

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${industry.gradient} py-20 lg:py-32`}>
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -top-24 -right-24" />
        <div className="absolute w-64 h-64 rounded-full bg-white/10 bottom-24 -left-12" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm mb-6">
              Built for {industry.name}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              {industry.headline}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10">
              {industry.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-up"
                className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="border-2 border-white/50 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all text-center"
              >
                See Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {industry.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-600 leading-relaxed">
            {industry.description}
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Solve Your Biggest Challenges
            </h2>
            <p className="text-xl text-gray-600">
              Common problems faced by {industry.name.toLowerCase()} - and how we fix them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {industry.painPoints.map((point, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 font-bold">!</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Problem: {point.title}</h3>
                    <div className="flex items-start gap-3 mt-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">
                        <span className="font-semibold text-green-600">Solution:</span> {point.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features Built for {industry.name}
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to run your organization efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industry.features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <CheckCircle2 className="w-6 h-6 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {industry.useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 font-medium text-gray-700"
              >
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {industry.testimonial && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-3xl p-12 text-center relative">
              <div className="text-8xl text-purple-200 absolute top-4 left-8">&ldquo;</div>
              <p className="text-2xl text-gray-700 mb-8 relative z-10 pt-8">
                {industry.testimonial.quote}
              </p>
              <div>
                <div className="font-bold text-gray-900 text-lg">{industry.testimonial.author}</div>
                <div className="text-gray-600">{industry.testimonial.role}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Features */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Core Platform Features
            </h2>
            <p className="text-xl text-gray-400">
              Powerful tools that work for any organization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Member Management",
                description: "Add, edit, and organize all your members in one place.",
              },
              {
                icon: CreditCard,
                title: "Payment Collection",
                description: "Automated recurring payments and one-time fee collection.",
              },
              {
                icon: Calendar,
                title: "Scheduling",
                description: "Manage classes, sessions, and events with ease.",
              },
              {
                icon: Mail,
                title: "Parent Portal",
                description: "Give parents access to schedules, payments, and updates.",
              },
              {
                icon: BarChart3,
                title: "Reports & Analytics",
                description: "Track revenue, attendance, and growth metrics.",
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Bank-grade security with GDPR compliance.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              No monthly fees. Just 10% of payments processed.
            </p>

            <div className="bg-gray-50 rounded-3xl p-8 mb-8">
              <div className="text-5xl font-extrabold text-gray-900 mb-2">10%</div>
              <div className="text-gray-600 mb-6">per successful payment</div>

              <div className="text-left space-y-3 mb-8">
                {[
                  "Unlimited members",
                  "Unlimited classes",
                  "Parent portal included",
                  "All features included",
                  "Email support",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                className="block w-full gradient-primary text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              Average fee for {industry.name.toLowerCase()}: {industry.avgFee}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 bg-gradient-to-br ${industry.gradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your {industry.name.split(" ")[0]}?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join hundreds of organizations already using Club Manager.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/70 mt-6">
            No credit card required. Set up in under 5 minutes.
          </p>
        </div>
      </section>

      {/* Other Industries */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Also great for other industries
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(industryData)
              .filter(([key]) => key !== resolvedParams.industry)
              .slice(0, 6)
              .map(([key, ind]) => (
                <Link
                  key={key}
                  href={`/industries/${key}`}
                  className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  {ind.name}
                </Link>
              ))}
            <Link
              href="/industries"
              className="bg-purple-100 px-4 py-2 rounded-lg text-purple-600 font-medium hover:bg-purple-200 transition-colors"
            >
              View all industries →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
