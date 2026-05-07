"use client";
import { useState } from "react";
import {
  Stamp,
  PillButton,
  EditorialLabel,
  EditorialDivider,
  FormField,
  Input,
  Textarea,
  Polaroid,
  PhotoPrint,
  PaperClip,
  Sticker,
  PostageStamp,
  HandArrow,
  MuseumLabel,
  Confetti,
  Container,
  Section,
  Stack,
  Row,
  Grid,
} from "@/shared/ui";

export function KitchenScreen() {
  const [boom, setBoom] = useState(false);
  return (
    <Container>
      <Section pad="tight">
        <Stack gap={6}>
          <h1 className="font-display text-display italic text-burgundy">/_kitchen</h1>
          <p className="text-lead text-ink-soft">Atom showcase. Dev-only.</p>

          <EditorialDivider variant="number" number={1} />
          <EditorialLabel>Stamps</EditorialLabel>
          <Row gap={6}>
            <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
            <Stamp text="АРХІВ ЛІЦЕЮ 157" shape="octagon" rotation={5} animateOn="load" />
            <Stamp text="ВРУЧЕНО" shape="rect" rotation={-3} animateOn="load" trail />
          </Row>

          <EditorialDivider variant="number" number={2} />
          <EditorialLabel>Pill buttons</EditorialLabel>
          <Row gap={4}>
            <PillButton variant="primary">Primary</PillButton>
            <PillButton variant="outline-d">Outline</PillButton>
            <PillButton variant="ghost">Ghost</PillButton>
            <PillButton variant="primary" loading>
              Loading
            </PillButton>
          </Row>

          <EditorialDivider variant="number" number={3} />
          <EditorialLabel>Form fields</EditorialLabel>
          <Stack gap={5}>
            <FormField name="email-demo" label="Email" required hint="we don't spam">
              <Input placeholder="hello@example.com" />
            </FormField>
            <FormField name="bio-demo" label="Біо" error="Замало">
              <Textarea />
            </FormField>
          </Stack>

          <EditorialDivider variant="number" number={4} />
          <EditorialLabel>Decorative</EditorialLabel>
          <Grid cols={3} gap={6}>
            <Polaroid src="/textures/paper-noise.svg" alt="" caption="Маша 7-Б" />
            <PhotoPrint src="/textures/paper-noise.svg" alt="" paperClip />
            <PostageStamp />
          </Grid>
          <Row gap={6}>
            <Sticker color="yellow" signature="— Олена, мама учня 5-Б">
              Дякую за чудову роботу!
            </Sticker>
            <HandArrow dir="↗" size="l" drawOnReveal />
            <MuseumLabel
              title="Літо в Карпатах"
              author="Олена Сидоренко, 8-А"
              meta="Акварель, 30×40, 2025"
              priceUah="1200.00"
            />
          </Row>

          <EditorialDivider variant="marks" />
          <PillButton onClick={() => setBoom((b) => !b)}>Confetti!</PillButton>
          <Confetti trigger={boom} onDone={() => setBoom(false)} />
          <PaperClip />
        </Stack>
      </Section>
    </Container>
  );
}
