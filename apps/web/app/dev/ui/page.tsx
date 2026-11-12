// Internal design-system page (M0-2). Not learner-facing, so strings are not i18n keys.
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Input,
  industry,
  lime,
  neutral,
  semantic,
} from "@sgela/ui";
import { assertDevPages } from "@/lib/dev-pages";

export const metadata = { title: "Design tokens" };

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="h-12 rounded-md border border-border" style={{ background: hex }} />
      <span className="font-semibold">{name}</span>
      <span className="text-muted">{hex}</span>
    </div>
  );
}

function ThemePanel({ theme }: { theme: "dark" | "light" }) {
  return (
    <div
      data-theme={theme}
      className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 text-foreground"
    >
      <h2 className="font-heading text-2xl font-bold capitalize">{theme} theme</h2>

      <div className="flex flex-col gap-1">
        <p className="font-heading text-4xl font-bold">Heading 1 Sora 700</p>
        <p className="font-heading text-3xl font-semibold">Heading 2 Sora 600</p>
        <p className="font-heading text-xl font-semibold">Heading 3 Sora 600</p>
        <p className="text-base">Body Manrope 400: Step inside a career, learn it, prove it.</p>
        <p className="text-sm text-muted">Muted Manrope 400 for supporting text.</p>
        <a href="#" className="text-link underline">
          Link text
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Mobile number"
          placeholder="071 234 5678"
          hint="We will SMS you a 6-digit code."
        />
        <Input label="First name" defaultValue="Thandeka" error="Please enter your first name." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Aviation Foundations</CardTitle>
          <CardDescription className="mt-1">5 topics, 3D jet engine, AR</CardDescription>
          <div className="mt-3 flex gap-2">
            <Badge tone="AVI">Aviation</Badge>
            <Badge tone="lime">Accredited via Bantsho</Badge>
          </div>
        </Card>
        <Card className="bg-surface-raised">
          <CardTitle>Raised surface</CardTitle>
          <CardDescription className="mt-1">Cards on cards use surface-raised.</CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["AVI", "ENG", "CUL", "MED", "AGR"] as const).map((c) => (
              <Badge key={c} tone={c}>
                {c}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DevUiPage() {
  assertDevPages();
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 p-4 md:p-10">
      <header>
        <h1 className="font-heading text-3xl font-bold">Sgela design tokens</h1>
        <p className="text-muted">PRD 14.1. Source: packages/ui/src/tokens.css + tokens.ts</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold">Lime ramp</h2>
        <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
          {Object.entries(lime).map(([k, v]) => (
            <Swatch key={k} name={"lime-" + k} hex={v} />
          ))}
        </div>
        <h2 className="font-heading text-xl font-semibold">Neutrals</h2>
        <div className="grid grid-cols-5 gap-3 md:grid-cols-9">
          {Object.entries(neutral).map(([k, v]) => (
            <Swatch key={k} name={"neutral-" + k} hex={v} />
          ))}
        </div>
        <h2 className="font-heading text-xl font-semibold">Industry and semantic</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-9">
          {Object.entries(industry).map(([k, v]) => (
            <Swatch key={k} name={k} hex={v} />
          ))}
          {Object.entries(semantic).map(([k, v]) => (
            <Swatch key={k} name={k} hex={v} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ThemePanel theme="dark" />
        <ThemePanel theme="light" />
      </div>
    </main>
  );
}
