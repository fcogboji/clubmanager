export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      {/* Decorative circles */}
      <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 -top-12 -right-12" />
      <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full bg-white/10 bottom-12 -left-8" />

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
