import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import {
  Card,
  Badge,
  Pill,
  Stat,
  Banner,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Drawer,
  Sidebar,
  Inline,
  Stack,
} from '@/components/ui';

export const Route = createFileRoute('/components')({
  component: ComponentsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '32px 0', borderTop: '1px solid var(--border)' }}>
      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 28,
          marginBottom: 18,
          color: 'var(--text)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ComponentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [bannerShown, setBannerShown] = useState(true);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <header style={{ paddingBottom: 28 }}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          Internal · QA
        </div>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 44,
            lineHeight: 1.1,
            color: 'var(--text)',
          }}
        >
          UI primitives
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 14, maxWidth: 680 }}>
          This page renders every UI primitive for regression sanity-checking. It is not linked from
          main navigation. Visit /components by URL.
        </p>
      </header>

      <Section title="Card">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          <Card header="Default">
            <p>A neutral content surface for the most common case.</p>
          </Card>
          <Card variant="elevated" header="Elevated">
            <p>Lifted background and a stronger shadow.</p>
          </Card>
          <Card variant="outlined" header="Outlined">
            <p>Transparent body, visible border only.</p>
          </Card>
          <Card variant="subtle" header="Subtle">
            <p>Dashed border, lowest visual weight.</p>
          </Card>
          <Card accent="accent" header="Accent stripe" footer="Footer slot">
            <p>Left border accent for chapter callouts.</p>
          </Card>
          <Card accent="teal" header="Teal stripe">
            <p>For magnetic / equipotential contexts.</p>
          </Card>
          <Card accent="pink" header="Pink stripe">
            <p>Positive-charge or warning contexts.</p>
          </Card>
          <Card accent="blue" header="Blue stripe">
            <p>Negative-charge or info contexts.</p>
          </Card>
        </div>
      </Section>

      <Section title="Badge">
        <Inline gap={10}>
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="teal">Teal</Badge>
          <Badge variant="pink">Pink</Badge>
          <Badge variant="blue">Blue</Badge>
          <Badge variant="subtle">Subtle</Badge>
        </Inline>
        <div style={{ marginTop: 14 }}>
          <Inline gap={10}>
            <Badge size="sm">SM</Badge>
            <Badge size="md">MD</Badge>
            <Badge size="sm" variant="accent">
              v2.0
            </Badge>
            <Badge size="md" variant="teal">
              μ = 1.26×10⁻⁶
            </Badge>
          </Inline>
        </div>
      </Section>

      <Section title="Pill">
        <Inline gap={10}>
          <Pill>Chapter 1</Pill>
          <Pill variant="accent">Capstone</Pill>
          <Pill variant="teal" icon="∮">
            Maxwell
          </Pill>
          <Pill variant="pink" icon="+">
            Positive
          </Pill>
          <Pill variant="blue" icon="−">
            Negative
          </Pill>
          <Pill variant="subtle">Reference</Pill>
        </Inline>
        <div style={{ marginTop: 14 }}>
          <Inline gap={10}>
            <Pill interactive onClick={() => alert('clicked')}>
              Clickable
            </Pill>
            <Pill interactive variant="accent" icon="→">
              Go deeper
            </Pill>
            <Pill interactive variant="teal">
              See lab
            </Pill>
          </Inline>
        </div>
      </Section>

      <Section title="Stat">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
          }}
        >
          <Stat label="Voltage" value="12.0" unit="V" />
          <Stat label="Current" value="0.50" unit="A" accent="accent" delta="+5.2%" />
          <Stat label="Resistance" value="24" unit="Ω" accent="teal" />
          <Stat label="Charge (Q1)" value="+1.6e−19" unit="C" accent="pink" />
          <Stat label="Charge (Q2)" value="−1.6e−19" unit="C" accent="blue" />
          <Stat label="Power" value="6.0" unit="W" delta="−0.4 dB" />
        </div>
      </Section>

      <Section title="Banner">
        <Stack gap={12}>
          <Banner variant="info" icon="i">
            Informational notice. The Drude model gives the right order of magnitude for σ at room
            temperature.
          </Banner>
          <Banner variant="warn" icon="!">
            Heads-up. Visual scaling is applied — readouts always show the real physical value.
          </Banner>
          <Banner variant="success" icon="✓">
            Build clean. All citations resolve against sources.ts.
          </Banner>
          <Banner variant="danger" icon="×">
            Error. Cite key not found in this page's source array — renders as [?].
          </Banner>
          {bannerShown && (
            <Banner variant="info" icon="i" onDismiss={() => setBannerShown(false)}>
              Dismissible banner. Click × to hide.
            </Banner>
          )}
          {!bannerShown && (
            <button
              type="button"
              onClick={() => setBannerShown(true)}
              style={{
                appearance: 'none',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
              }}
            >
              restore dismissed banner
            </button>
          )}
        </Stack>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="electric">
          <TabList>
            <Tab id="electric">Electric</Tab>
            <Tab id="magnetic">Magnetic</Tab>
            <Tab id="poynting">Poynting</Tab>
            <Tab id="disabled" disabled>
              Disabled
            </Tab>
          </TabList>
          <TabPanel id="electric">
            <p style={{ color: 'var(--text-dim)' }}>
              E-field panel: <code>E = F/q</code>. Units: V/m or N/C.
            </p>
          </TabPanel>
          <TabPanel id="magnetic">
            <p style={{ color: 'var(--text-dim)' }}>
              B-field panel: <code>F = qv×B</code>. Units: tesla.
            </p>
          </TabPanel>
          <TabPanel id="poynting">
            <p style={{ color: 'var(--text-dim)' }}>
              S = (1/μ₀) E×B. Energy flows through the field, not the wire.
            </p>
          </TabPanel>
          <TabPanel id="disabled">
            <p>You shouldn't see this.</p>
          </TabPanel>
        </Tabs>
      </Section>

      <Section title="Accordion">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}
            >
              Single-open
            </div>
            <Accordion defaultValue={['a']}>
              <AccordionItem id="a">
                <AccordionTrigger>What is charge?</AccordionTrigger>
                <AccordionContent>
                  A conserved quantity that sources the electromagnetic field.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="b">
                <AccordionTrigger>What is field?</AccordionTrigger>
                <AccordionContent>
                  A real vector quantity defined at every point in space.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem id="c">
                <AccordionTrigger>What is voltage?</AccordionTrigger>
                <AccordionContent>
                  Work done per unit charge moving between two points.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}
            >
              Multi-open
            </div>
            <Accordion multiple defaultValue={['x', 'y']}>
              <AccordionItem id="x">
                <AccordionTrigger>Coulomb 1785</AccordionTrigger>
                <AccordionContent>Torsion balance, inverse-square law.</AccordionContent>
              </AccordionItem>
              <AccordionItem id="y">
                <AccordionTrigger>Faraday 1832</AccordionTrigger>
                <AccordionContent>Induction.</AccordionContent>
              </AccordionItem>
              <AccordionItem id="z">
                <AccordionTrigger>Maxwell 1865</AccordionTrigger>
                <AccordionContent>Unification.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Section>

      <Section title="Drawer">
        <Inline gap={10}>
          <Pill interactive variant="accent" onClick={() => setDrawerOpen(true)}>
            Open right drawer
          </Pill>
          <Pill interactive variant="teal" onClick={() => setBottomDrawerOpen(true)}>
            Open bottom drawer
          </Pill>
        </Inline>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer · right">
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.65 }}>
            A right-side drawer rendered with a native &lt;dialog&gt; element using showModal().
            Press Escape, click the backdrop, or click × to close.
          </p>
          <div style={{ marginTop: 14 }}>
            <Stack gap={8}>
              <Stat label="Field strength" value="12.0" unit="kV/m" accent="accent" />
              <Stat label="Frequency" value="60" unit="Hz" />
            </Stack>
          </div>
        </Drawer>
        <Drawer
          open={bottomDrawerOpen}
          onClose={() => setBottomDrawerOpen(false)}
          title="Drawer · bottom"
          side="bottom"
        >
          <p style={{ color: 'var(--text-dim)' }}>
            A bottom drawer. Good for mobile-shaped panels.
          </p>
        </Drawer>
      </Section>

      <Section title="Sidebar">
        <div
          style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'start' }}
        >
          <Sidebar title="Navigation" collapsible>
            <Stack gap={6}>
              <Pill variant="subtle">Ch 1 · Charge</Pill>
              <Pill variant="subtle">Ch 2 · Voltage</Pill>
              <Pill variant="accent">Ch 8 · Poynting</Pill>
              <Pill variant="subtle">Ch 12 · AC</Pill>
            </Stack>
          </Sidebar>
          <Card variant="outlined" header="Main content">
            <p>The sidebar at left is sticky and collapsible. Click ‹ to collapse it.</p>
          </Card>
        </div>
      </Section>

      <Section title="Inline + Stack">
        <Stack gap={16}>
          <Card variant="subtle" header="Inline">
            <Inline gap={12}>
              <Badge variant="accent">Inline</Badge>
              <Badge variant="teal">layout</Badge>
              <Badge>flex row</Badge>
              <Badge variant="subtle">gap=12</Badge>
            </Inline>
          </Card>
          <Card variant="subtle" header="Stack">
            <Stack gap={8} align="start">
              <Badge variant="pink">Stack</Badge>
              <Badge variant="blue">layout</Badge>
              <Badge>flex column</Badge>
              <Badge variant="subtle">align=start</Badge>
            </Stack>
          </Card>
          <Card variant="subtle" header="Inline · space-between">
            <Inline gap={12} justify="space-between">
              <Pill icon="←">Prev</Pill>
              <Pill variant="accent">Ch 4</Pill>
              <Pill icon="→">Next</Pill>
            </Inline>
          </Card>
        </Stack>
      </Section>

      <footer
        style={{
          marginTop: 56,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
        }}
      >
        Field · Theory · UI primitives · src/components/ui/*
      </footer>
    </div>
  );
}
