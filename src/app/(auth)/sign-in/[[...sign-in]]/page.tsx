import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-white shadow-2xl rounded-3xl p-2",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            formButtonPrimary:
              "bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all",
            formFieldInput:
              "rounded-xl border-gray-200 focus:border-primary focus:ring-primary",
            footerActionLink: "text-primary hover:text-primary-dark font-semibold",
            socialButtonsBlockButton:
              "border-gray-200 hover:bg-gray-50 rounded-xl transition-all",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-400",
          },
        }}
      />
    </div>
  );
}
