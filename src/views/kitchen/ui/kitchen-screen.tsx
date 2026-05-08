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
  ImageSlot,
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
          <EditorialLabel>ImageSlot variants</EditorialLabel>
          <Grid cols={3} gap={6}>
            <ImageSlot
              slot="kitchen/polaroid/3-4"
              ratio="3/4"
              variant="polaroid"
              caption="Polaroid 3:4"
            />
            <ImageSlot
              slot="kitchen/photo-print/4-5"
              ratio="4/5"
              variant="photo-print"
              caption="Photo print 4:5"
            />
            <ImageSlot
              slot="kitchen/interlude/16-9"
              ratio="16/9"
              variant="interlude"
              caption="Interlude 16:9"
            />
            <ImageSlot
              slot="kitchen/portrait/16-9"
              ratio="16/9"
              variant="portrait"
              caption="Portrait 16:9"
            />
            <ImageSlot slot="kitchen/stamp/1-1" ratio="1/1" variant="stamp" caption="Stamp 1:1" />
            <ImageSlot slot="kitchen/plain/1-1" ratio="1/1" variant="plain" caption="Plain 1:1" />
          </Grid>

          <EditorialDivider variant="marks" />
          <PillButton onClick={() => setBoom((b) => !b)}>Confetti!</PillButton>
          <Confetti trigger={boom} onDone={() => setBoom(false)} />
          <PaperClip />
        </Stack>
      </Section>
    </Container>
  );
}
