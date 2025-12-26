import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Verify club exists
  const club = await prisma.club.findUnique({
    where: { slug },
    select: { id: true, name: true, logoUrl: true },
  });

  if (!club) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
