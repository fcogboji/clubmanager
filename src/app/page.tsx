import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Calendar, CreditCard, ArrowRight } from "lucide-react";
import { AuthAwareLink } from "@/components/AuthAwareLink";

export default async function WelcomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen gradient-welcome relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-white/10 -top-24 -right-24" />
      <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 bottom-24 -left-12" />
      <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full bg-white/5 top-1/3 -right-8" />

      <div className="relative z-10 min-h-screen flex flex-col px-6 md:px-8 py-12 md:py-16">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white flex items-center justify-center shadow-2xl">
              <Users className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Club Manager
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Manage your club members, classes, and payments all in one place
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-12">
            <FeatureItem
              icon={<Users className="w-5 h-5 text-white" />}
              text="Member Management"
            />
            <FeatureItem
              icon={<Calendar className="w-5 h-5 text-white" />}
              text="Class Scheduling"
            />
            <FeatureItem
              icon={<CreditCard className="w-5 h-5 text-white" />}
              text="Payment Tracking"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="max-w-lg mx-auto w-full space-y-4">
          <AuthAwareLink
            signedOutHref="/sign-up"
            className="flex items-center justify-center gap-2 w-full bg-white text-primary font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </AuthAwareLink>

          <AuthAwareLink
            signedOutHref="/sign-in"
            className="flex items-center justify-center w-full text-white/90 font-medium py-4 hover:text-white transition-colors"
          >
            Already have an account? Sign In
          </AuthAwareLink>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 px-5">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-white font-medium">{text}</span>
    </div>
  );
}
