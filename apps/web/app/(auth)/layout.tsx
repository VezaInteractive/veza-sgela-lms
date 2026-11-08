import { SimpleShell } from "@/components/simple-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SimpleShell>{children}</SimpleShell>;
}
