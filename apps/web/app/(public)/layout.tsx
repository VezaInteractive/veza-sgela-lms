import { SimpleShell } from "@/components/simple-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SimpleShell>{children}</SimpleShell>;
}
