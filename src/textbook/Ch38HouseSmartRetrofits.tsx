/**
 * Chapter 38 — Smart-switch retrofits
 *
 * Fourth DIY-with-theory chapter. Inside a smart switch (radio + MCU +
 * triac/SSR + power-conversion stage), the four ecosystems
 * (Caséta / Z-Wave / Zigbee / Matter+Thread), NEC 404.2(C) neutral
 * rule, no-neutral bleeder dimming and its LED problem, 3-way smart
 * pairs, leading- vs trailing-edge LED phase choice, and what Matter
 * actually changed.
 *
 * Sources whitelisted on chapter.sources:
 *   nec-2023, lutron-dimmer-app-note, ul-498, nema-wd-6,
 *   horowitz-hill-2015, codata-2018
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch38HouseSmartRetrofits() {
  const chapter = getChapter('house-smart-retrofits')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        A reader's hall switch was a single-pole toggle for thirty years. They buy a Lutron Caséta dimmer to
        add a sunset schedule and a phone-app dim slider; they shut off the breaker, unscrew the toggle, and
        pull it out of the wall. Inside the box are exactly two wires — a black and a red — and a bare copper
        ground curled against the back. There is no white wire. The dimmer's installation card, in small grey
        type, says <em className="italic text-text">"neutral required for some loads, not required for others."</em> Which is this? Why
        was the old switch fine without a neutral and the new one is not?
      </p>
      <p className="mb-prose-3">
        This is the chapter on smart-switch retrofits. We will open one up and look at the four chips inside;
        survey the four wireless ecosystems competing for the wall box (Caséta, Z-Wave, Zigbee, and Matter
        over Thread); explain why the 2011 National Electrical Code added a clause requiring a neutral
        conductor in every switch box; walk through the bleeder-current trick that lets a no-neutral dimmer
        steal power through the very load it is supposed to control; and end with three-way pairs, the
        leading- vs trailing-edge phase-cut decision for LED loads, and what Matter actually changed about
        the multi-hub mess most smart houses still live in.
      </p>

      <h2 className="chapter-h2">Inside a smart switch</h2>

      <p className="mb-prose-3">
        Pry the faceplate off a modern smart dimmer and you find four functional blocks on a single PCB the
        size of a credit card. They are the same four blocks whether the switch costs forty dollars or two
        hundred.
      </p>
      <p className="mb-prose-3">
        The <strong className="text-text font-medium">radio</strong> is a small surface-mount module — usually a single chip with an integrated
        antenna trace etched into the board. Depending on the family, that chip speaks{' '}
        <Term def={<><strong className="text-text font-medium">Wi-Fi</strong> — IEEE 802.11 wireless networking in the 2.4 and 5 GHz unlicensed bands. Common in smart plugs and bulbs, less common in switches because of high standby current and router-dependence.</>}>Wi-Fi</Term>,{' '}
        <Term def={<><strong className="text-text font-medium">Zigbee</strong> — a low-power 2.4 GHz mesh networking protocol (IEEE 802.15.4) used by Philips Hue, Amazon Echo, and many smart switches. Faster than Z-Wave but in a more crowded band.</>}>Zigbee</Term>{' '}
        on 2.4 GHz,{' '}
        <Term def={<><strong className="text-text font-medium">Z-Wave</strong> — a low-power sub-GHz mesh networking protocol (~908 MHz in North America). Longer range than 2.4 GHz mesh and less band congestion, at the cost of lower bandwidth.</>}>Z-Wave</Term>{' '}
        on 908 MHz, Lutron's proprietary{' '}
        <Term def={<><strong className="text-text font-medium">Caséta</strong> — Lutron's proprietary residential smart-lighting ecosystem, using a 434 MHz radio (ClearConnect) for low congestion and long range. Closed protocol; pairs through a Lutron Smart Hub.</>}>Caséta</Term>{' '}
        protocol on 434 MHz, or{' '}
        <Term def={<><strong className="text-text font-medium">Matter</strong> — a cross-vendor smart-home application protocol (formerly Project CHIP, released 2022). Runs over Thread or Wi-Fi. Lets a single device pair with Apple HomeKit, Google Home, Amazon Alexa, and SmartThings simultaneously.</>}>Matter</Term>{' '}
        over{' '}
        <Term def={<><strong className="text-text font-medium">Thread</strong> — a 2.4 GHz IPv6 mesh radio standard (IEEE 802.15.4, same PHY as Zigbee). The transport layer underneath Matter for low-power devices. Self-healing; every mains-powered device is a router.</>}>Thread</Term>.
        Continuous radio idle draw is on the order of 10–100 mW depending on family and duty cycle<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The <strong className="text-text font-medium">microcontroller</strong> is a small ARM Cortex-M0 or Cortex-M4 running the radio stack,
        the app/cloud connection, and the dim-curve logic. Idle current with the radio receiver gated to its
        wake schedule is around 30 mW; under continuous transmit it briefly peaks at 200–500 mW. Smart
        switches without a neutral are designed against the idle number, not the peak — because the only
        way to run the radio is to keep the supply rail charged between transmit bursts.
      </p>
      <p className="mb-prose-3">
        The <strong className="text-text font-medium">switching element</strong> is what actually interrupts (or chops) the AC line current
        flowing to the load. Three options dominate. A{' '}
        <Term def={<><strong className="text-text font-medium">triac</strong> — a bidirectional thyristor; conducts in both half-cycles of AC once gated, then commutates off at the next zero-crossing. The standard switching element in leading-edge phase-cut dimmers.</>}>triac</Term>{' '}
        is the standard for dimming incandescent and most LED loads — it gates on partway through each AC
        half-cycle and self-commutates at the next zero-crossing. A{' '}
        <Term def={<><strong className="text-text font-medium">SSR</strong> — solid-state relay; a triac or MOSFET pair with optoisolated control. Silent, no contact bounce, no inrush wear. Used in non-dimming smart switches and high-cycle-count industrial controls.</>}>solid-state relay (SSR)</Term>{' '}
        is the standard for non-dimming switches — silent, no mechanical wear, but always has a small voltage
        drop that becomes thermal load. A{' '}
        <Term def={<><strong className="text-text font-medium">latching relay</strong> — an electromechanical relay with a bistable armature that only consumes power during the switching pulse, then holds position mechanically. Used in high-current smart switches (20 A appliance, EV-charger control).</>}>latching electromechanical relay</Term>{' '}
        appears in high-current applications (20 A general-use, water-heater contactors, EV-charger control)
        where the steady-state I²R loss of an SSR would be unacceptable. The latching relay also has a
        thrifty property: it only consumes power for the few milliseconds it takes to flip the armature,
        then sits in its new state with the radio off entirely.
      </p>
      <p className="mb-prose-3">
        Finally, the <strong className="text-text font-medium">power-conversion stage</strong> is the part that takes the 120 V AC line and
        produces the 3.3 V DC rail that the MCU and radio actually run on. In a switch with neutral, this is
        a tiny isolated flyback or a cheap buck off a half-wave rectifier — a few cents of magnetics and a
        switching controller chip<Cite id="horowitz-hill-2015" in={SOURCES} />. In a switch <em className="italic text-text">without</em>{' '}
        neutral, this stage has to siphon its energy through the load itself, and that is where the design
        becomes interesting.
      </p>

      <h2 className="chapter-h2">The four smart-switch ecosystems</h2>

      <p className="mb-prose-3">
        Strip away the apps and the marketing names and there are essentially four families competing for the
        space behind your wall plate, each defined by its radio.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Lutron Caséta</strong> uses a proprietary 434 MHz radio (Lutron call it ClearConnect). The
        434 MHz band in North America is unlicensed but uncrowded — nothing like the 2.4 GHz war zone — so
        Caséta has a reputation for being the smart-switch family that <em className="italic text-text">just works</em>. The penalty is
        that the protocol is closed: there is no homebrew Caséta firmware, no third-party Caséta dimmer, and
        no way to integrate Caséta with anything that does not go through a Lutron Smart Hub. Caséta uniquely
        supports a battery-powered <em className="italic text-text">Pico</em> remote that lives on a wall plate where a switch would
        otherwise be — handy for adding a "switch" location to a room without running wire. Caséta also has
        the most mature no-neutral product line<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Z-Wave</strong> uses a sub-GHz mesh on 908 MHz in North America (868 MHz in Europe). Mesh
        means every mains-powered Z-Wave device repeats packets for its neighbours, so coverage in a large
        house improves as you add devices. Sub-GHz also penetrates plaster and lath better than 2.4 GHz, and
        the band is far less crowded. Bandwidth is low — measured in tens of kilobits per second — but for
        on/off and dim-level commands that does not matter. Older Z-Wave devices speak S0 framing (security
        compromise); newer ones speak S2 (mandatory since 2017). Z-Wave requires a Z-Wave hub, but the hub
        can be any of a dozen brands (Hubitat, Aeotec, SmartThings, Home Assistant ZWave-JS).
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Zigbee</strong> also uses a mesh, but on 2.4 GHz (same PHY as Wi-Fi and Bluetooth). It has
        more bandwidth than Z-Wave and lower per-device cost, at the price of competing for airtime with
        every Wi-Fi access point and Bluetooth headset in the neighborhood. Zigbee is the protocol behind
        Philips Hue and many of the smart bulbs and switches sold by Amazon and IKEA. Like Z-Wave, it
        requires a hub, though many smart speakers (Echo, Nest Hub Max) include a Zigbee radio.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Matter over Thread</strong> is the new entrant. Thread is the mesh radio (2.4 GHz, IEEE
        802.15.4, same physical layer as Zigbee but with an{' '}
        <Term def={<><strong className="text-text font-medium">IPv6 mesh</strong> — a self-organising radio network in which every node has a routable IPv6 address. Thread is the canonical low-power example; Matter uses Thread as one of its transports.</>}>IPv6 mesh</Term>{' '}
        on top); Matter is the application protocol (released 2022). Matter's promise is that a device
        advertises a single QR-coded credential, and any of HomeKit, Google Home, Alexa, or SmartThings can
        pair to it natively — no per-app hub, no per-app account. Thread devices form a mesh in which every
        mains-powered device is a router; battery devices are sleepy end-devices. Whether Matter wins the
        ecosystem war is still being argued, but every major vendor has shipped at least a token Matter
        product line.
      </p>

      <p className="mb-prose-3">
        The trade-offs at a glance:
      </p>
      <ul>
        <li><strong className="text-text font-medium">Range / penetration:</strong> 434 MHz (Caséta) and 908 MHz (Z-Wave) win on going through walls; 2.4 GHz (Zigbee, Thread, Wi-Fi) loses to plaster, mirrors, and microwaves.</li>
        <li><strong className="text-text font-medium">Bandwidth:</strong> Wi-Fi {'>>'} Thread {'>'} Zigbee {'>'} Z-Wave {'>'} Caséta. For lighting it makes no difference; for cameras it does.</li>
        <li><strong className="text-text font-medium">Devices per network:</strong> Caséta caps at ~75 per hub; Z-Wave at 232; Zigbee at ~250; Thread is theoretically larger.</li>
        <li><strong className="text-text font-medium">Hub dependence:</strong> Caséta requires a Lutron hub. Z-Wave and Zigbee require <em className="italic text-text">some</em> hub. Matter over Thread requires only a Thread Border Router (often built into a speaker or Apple TV) and no per-vendor hub.</li>
      </ul>

      <h2 className="chapter-h2">NEC 404.2(C) — a neutral in every switch box</h2>

      <p className="mb-prose-3">
        Pre-2011 residential wiring had a common trick: when a switch controlled a single light at the end of
        a circuit, the electrician would run hot + neutral to the light fixture and then a single two-wire
        cable down to the switch — black going down as the unswitched hot, white coming back up as the
        switched-hot return. This is called a <em className="italic text-text">switch loop</em>. The white in the switch loop is
        reidentified with black tape to mark it as a hot conductor. The savings: one less wire, one less hole
        drilled through a stud.
      </p>
      <p className="mb-prose-3">
        The cost of that savings was invisible for fifty years and obvious in 2011. A switch-loop switch box
        has only two conductors in it: switched hot and unswitched hot. There is no continuous neutral. A
        traditional toggle switch did not care — it only needed to make and break the hot. But a smart
        switch needs <em className="italic text-text">continuous</em> power for its radio and MCU, even when the load is OFF, and the
        only honest way to get that continuous power is to connect across hot and neutral.
      </p>
      <p className="mb-prose-3">
        The 2011 National Electrical Code added <strong className="text-text font-medium">NEC 404.2(C)</strong>, which requires a neutral
        conductor to be present at every switch location in dwelling units<Cite id="nec-2023" in={SOURCES} />.
        The neutral does not have to be connected to anything — it can sit folded into the back of the box —
        but it must be available so that a smart switch installed later in the building's life has somewhere
        to attach. The 2014 and later code cycles tightened the exceptions; the 2023 cycle keeps the rule
        substantially as written. New construction and substantial remodels since 2011 therefore have a
        neutral in every box. Houses wired before 2011 frequently do not, and the retrofit reader on a
        switch loop will discover this the first time they open a box.
      </p>

      <Pullout>
        A smart switch with a neutral is a USB device. A smart switch without one is a Schroedinger
        transducer: it must power its radio by faintly conducting the very load it claims to have switched off.
      </Pullout>

      <h2 className="chapter-h2">The no-neutral dimmer (Lutron's bleeder trick)</h2>

      <p className="mb-prose-3">
        When a smart dimmer is installed in a pre-2011 switch loop with no neutral, the manufacturer's
        engineers face a hard problem. The MCU and radio need a few hundred milliwatts continuously. There is
        no neutral wire to pull current to. The only conductive path between the switch and the rest of the
        electrical system runs <em className="italic text-text">through the load</em>. So the dimmer steals current through the load —
        a small, continuous trickle called the{' '}
        <Term def={<><strong className="text-text font-medium">bleeder current</strong> — a small continuous current intentionally drawn through a load by a no-neutral smart switch, to keep its internal power supply alive when the load is nominally off. Becomes visible as a faint glow with low-wattage LED loads.</>}>bleeder current</Term>.
        Modern Lutron Caséta no-neutral dimmers bleed about 25–50 mA in their off state<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The power dissipated by that bleeder is simply line voltage times bleeder current:
      </p>

      <Formula>P_bleeder = V_line × I_bleeder</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P_bleeder</strong> is the steady-state power that the bleeder pulls from the line (in
        watts), <strong className="text-text font-medium">V_line</strong> is the RMS line voltage (120 V in North America, 230 V in most of
        Europe), and <strong className="text-text font-medium">I_bleeder</strong> is the RMS bleeder current the switch draws through the load
        (in amperes). At I_bleeder = 50 mA on a 120 V line, P_bleeder = 6 W — and that 6 W has to be
        dissipated somewhere. The dimmer itself only keeps a few tenths of a watt for its MCU; the rest is
        burned in the load.
      </p>
      <p className="mb-prose-3">
        For a 60 W incandescent bulb this is invisible. An incandescent filament needs roughly 90 V across
        it before any visible glow emerges from a cold tungsten coil, and 6 W in a bulb rated for 60 W is a
        10 % current bias — well below the visible-glow threshold. So no-neutral dimming worked perfectly for
        the entire incandescent era.
      </p>
      <p className="mb-prose-3">
        For a modern 9 W LED bulb it is a disaster. An LED bulb's internal driver is a small AC/DC converter
        followed by a constant-current LED string. Once the converter's input capacitor is charged above the
        LED's forward-voltage threshold (often only 30–50 V on the converter's internal DC rail), the LEDs
        start to glow. A continuous 50 mA × 120 V bleeder is enough to charge the converter and produce a
        faintly visible ghost glow — what Lutron's app notes call <em className="italic text-text">off-state glow</em><Cite id="lutron-dimmer-app-note" in={SOURCES} />. In a dark hallway it looks like the switch is broken.
      </p>
      <p className="mb-prose-3">
        The mitigations are real and ugly. The cleanest is a small <strong className="text-text font-medium">load capacitor</strong> wired in
        parallel with the LED bulb (Lutron sell one under the LUT-MLC name) — an X-rated film capacitor that
        absorbs the bleeder current as a 60 Hz displacement current rather than letting it charge the LED
        driver. The other path is to use LED bulbs whose drivers are designed to tolerate bleed (Philips
        Hue, several Lutron-certified Cree and Feit parts). The third is to fall back: leave the smart
        switch in always-on mode and put the on/off intelligence in the bulbs themselves. None of these are
        as good as just having a neutral in the box.
      </p>

      <TryIt
        tag="Try 38.1"
        question={<>A no-neutral dimmer leaks <strong className="text-text font-medium">60 mA</strong> continuously through the load to power its radio. The load is a single <strong className="text-text font-medium">8 W LED</strong> bulb. What's the steady-state power dissipated in the bulb when the switch is "off"? Will the bulb visibly glow?</>}
        hint="Use P = V × I with V_line = 120 V."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Direct substitution into the bleeder formula:</p>
            <Formula>P_bleeder = 120 V × 0.060 A = 7.2 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              That is <strong className="text-text font-medium">almost the bulb's full-on rating</strong> — 7.2 W of dissipation in an 8 W LED.
              The internal converter will charge well past the LED-string forward-voltage threshold and the
              bulb will glow visibly. A load capacitor or a bleed-tolerant bulb is required, or the dimmer
              must be installed with neutral.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Three-way smart switches and companion protocols</h2>

      <p className="mb-prose-3">
        A traditional 3-way pair (one bulb, two switches, either switch toggles the light) uses three wires
        between the two switch boxes: a pair of{' '}
        <Term def={<><strong className="text-text font-medium">traveller</strong> — one of two interchangeable wires that connect the swing terminals of a pair of 3-way switches. The combination of traveller states determines which path is hot.</>}>travellers</Term>{' '}
        and a common. The switches are SPDT (single-pole double-throw) and the wiring is wonderfully
        symmetric: flipping either switch reverses which traveller carries the hot, and the load sees on/off
        depending on whether both switches agree.
      </p>
      <p className="mb-prose-3">
        A smart 3-way pair cannot be wired this way, because the wiring is no longer symmetric. One switch is
        a <strong className="text-text font-medium">primary</strong> (it has the radio, the load relay, and the connection to the load); the
        other is a{' '}
        <Term def={<><strong className="text-text font-medium">companion switch</strong> — in a smart 3-way pair, the secondary switch that signals user input to the primary device. May communicate over a low-voltage wire (Lutron Caséta) or over the radio (Z-Wave, Zigbee).</>}>companion</Term>{' '}
        that signals user-input back to the primary. There are two physical conventions for how the
        companion talks to the primary.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Wired companion.</strong> Lutron Caséta and several Leviton smart 3-way kits use a dedicated
        low-voltage signal wire between primary and companion. The companion switch is not really a switch
        at all — it is a button that pulls a 24 V signal wire low to wake the primary. This is reliable and
        latency-free, but requires that one of the existing wires between the two boxes be repurposed as the
        signal wire. In a pre-2011 switch loop where the only wires are two travellers and possibly a
        neutral, the companion gets the leftover traveller for its signal line, and the primary's load
        terminal handles both halves of the switching<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Radio companion.</strong> Z-Wave, Zigbee, and Matter smart 3-way kits skip the signal wire
        entirely. The companion has its own radio and signals state changes wirelessly. The cost: both
        devices need <em className="italic text-text">continuous</em> power — both need a neutral (or both need to bleed). The benefit:
        the wiring in the secondary box does not have to carry any signal, and the primary and companion can
        be in different rooms entirely.
      </p>
      <p className="mb-prose-3">
        Opening a pre-2011 3-way box, the reader will find: two travellers (often red and black), a common
        (usually black, sometimes white reidentified), and frequently no neutral and no ground in the steel
        box. Their options at that point are (a) a Lutron Caséta wired-companion kit, repurposing one
        traveller as the signal wire; (b) a Caséta Pico battery remote and a single smart bulb, eliminating
        the need to wire a companion at all; or (c) opening the wall and pulling a new 14-3-with-ground
        cable. Most readers stop at (b).
      </p>

      <h2 className="chapter-h2">Leading vs trailing edge: choosing the phase-cut for LED loads</h2>

      <p className="mb-prose-3">
        Chapter 30 introduced the triac dimmer: a thyristor that gates on partway through each AC half-cycle
        and self-commutates at the next zero-crossing, so the load only sees the late portion of each
        half-cycle. This is called{' '}
        <Term def={<><strong className="text-text font-medium">leading-edge dimmer</strong> — a phase-cut dimmer (typically triac-based) that cuts the start of each AC half-cycle and lets the late portion through. Inexpensive; works with incandescent and magnetic-ballast loads; can mistreat LED drivers.</>}>leading-edge dimming</Term>{' '}
        because the early part of each half-cycle is removed. Triacs are cheap, robust, and have a small
        problem with reactive loads: the chopping creates a fast voltage step at the gate point, which a
        magnetic inductor wants to <em className="italic text-text">continue</em> through, producing audible 120 Hz buzz at low conduction
        angles.
      </p>
      <p className="mb-prose-3">
        The alternative is{' '}
        <Term def={<><strong className="text-text font-medium">trailing-edge dimmer</strong> — a phase-cut dimmer (typically MOSFET-based) that cuts the end of each AC half-cycle, letting the early portion through. Gentler on capacitive LED-driver inputs; required by most ELV (electronic low-voltage) transformers.</>}>trailing-edge dimming</Term>:
        the dimmer turns the load on at the zero-crossing and turns it off partway through. This uses a
        MOSFET pair rather than a triac, because a triac cannot be commanded off mid-cycle — once it
        conducts, it conducts until the next current zero. Trailing-edge dimming is gentler on capacitive
        loads (most modern LED drivers have a big rectifier-and-cap input stage) because it lets the cap
        charge in the early part of the half-cycle and removes power smoothly rather than slamming a
        voltage step at the gate point.
      </p>
      <p className="mb-prose-3">
        Loads sort themselves by what they want:
      </p>
      <ul>
        <li><strong className="text-text font-medium">Incandescent and halogen</strong> — both edge types fine; leading-edge is cheaper.</li>
        <li>
          <Term def={<><strong className="text-text font-medium">MLV / ELV</strong> — magnetic low-voltage and electronic low-voltage. MLV (magnetic-ballast transformers, traditional landscape lighting) wants leading-edge dimming. ELV (electronic-ballast supplies and most LED drivers) wants trailing-edge dimming.</>}>MLV (magnetic low-voltage) </Term>{' '}
          — landscape and decorative transformers — leading-edge only.
        </li>
        <li>ELV (electronic low-voltage) and most modern LED drivers — trailing-edge preferred.</li>
        <li>Older LED retrofit bulbs — mixed; consult the dimmer's compatibility list<Cite id="lutron-dimmer-app-note" in={SOURCES} />.</li>
      </ul>
      <p className="mb-prose-3">
        Get the wrong edge and the failure modes are predictable: visible 120 Hz flicker, a low-end
        <Term def={<><strong className="text-text font-medium">minimum-trim</strong> — the lowest conduction angle (highest cut fraction) at which a dimmer can drive a given load without flicker or shut-off. Many LED bulbs have minimum-trim well above zero, leaving a "dead zone" at the bottom of the dimmer slider.</>}> minimum-trim</Term>{' '}
        well above off (so the dimmer will not dim all the way down before snapping off), audible buzz at low
        conduction angles, and in the worst case rapid LED-driver failure as the cap stage chases voltage
        steps that its inductors were not designed for.
      </p>
      <p className="mb-prose-3">
        The RMS voltage produced by a phase-cut dimmer is straightforward to compute. For a leading-edge cut
        at conduction angle α (the portion of each half-cycle for which the triac is conducting, in radians,
        running from α = π for fully-on down to α = 0 for fully-off):
      </p>

      <Formula>V_rms = V_peak × √(α/π − sin(2α)/(2π))</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_rms</strong> is the RMS voltage delivered to the load (in volts), <strong className="text-text font-medium">V_peak</strong>{' '}
        is the line peak voltage (in volts; 170 V on a 120 V North American line, since V_peak = √2 × V_rms_line),
        and <strong className="text-text font-medium">α</strong> is the conduction angle in radians, measured from the gate-on point to the
        next zero-crossing. The half-power point, α = π/2, evaluates the bracket as 1/2 − sin(π)/(2π) = 1/2 − 0 = 0.5,
        giving V_rms = 170 × √0.5 ≈ 120 V × √0.5 ≈ 85 V. (For very deep dimming, α → 0 and V_rms → 0
        as √α; for fully-on, α = π and V_rms = V_peak/√2 = V_rms_line.) The fundamental physical constants
        in these expressions — π, √2 — carry no measurement uncertainty<Cite id="codata-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 38.2"
        question={<>A trailing-edge dimmer is driving an LED at <strong className="text-text font-medium">α = 3π/4</strong> conduction angle on a 120 V RMS line. Compute V_rms at the load. What fraction of full power does the LED see?</>}
        hint="V_peak = √2 × 120 V ≈ 170 V. Then plug into the bracket: α/π − sin(2α)/(2π)."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The bracket evaluates as 3/4 − sin(3π/2)/(2π) = 0.75 − (−1)/(2π) ≈ 0.75 + 0.159 = 0.909.</p>
            <Formula>V_rms = 170 V × √0.909 ≈ 162 V (peak basis) → 162 / √2 ≈ 114 V RMS at the load</Formula>
            <p className="mb-prose-1 last:mb-0">
              So the load sees about <strong className="text-text font-medium">114 V RMS</strong>, or 114/120 ≈ 95 % of full voltage. Power
              scales as the square of voltage at fixed resistance, so an Ohmic load would see ~90 % of full
              power. (An LED driver is not Ohmic, but for a first cut the answer is "almost-full power" —
              the LED is barely dimmed.)
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What Matter actually changed</h2>

      <p className="mb-prose-3">
        Two years ago, a household running both Apple HomeKit and Amazon Alexa with a few Lutron Caséta
        dimmers and a few Z-Wave smart plugs had the following stack: a Lutron Smart Hub talking to Caséta,
        a Hubitat or SmartThings hub talking to Z-Wave, an Echo for Alexa, an Apple TV for HomeKit, and
        third-party "bridge" software (often Homebridge or Home Assistant) translating between them so that
        a single "scene" — say <em className="italic text-text">good morning</em> — could touch every device. The translation layer was
        always slightly broken; turning off a Caséta dimmer through Alexa took 1–3 seconds while turning it
        off through the Lutron app was instant.
      </p>
      <p className="mb-prose-3">
        Matter consolidates the application layer. A Matter-over-Thread switch advertises one set of QR-coded
        credentials at pairing time. Any of HomeKit, Google Home, Alexa, or SmartThings can pair to it
        natively, sharing the device through a feature called <em className="italic text-text">multi-admin</em>. The device speaks the
        same protocol regardless of which app is talking to it. There is no per-vendor hub on the bridge
        path; there is only a Thread Border Router — a piece of hardware that bridges the Thread mesh to
        Wi-Fi/Ethernet — and most modern Apple TVs, HomePod minis, Nest Hubs, and Echo speakers contain
        one. Cross-vendor latency drops from seconds to tens of milliseconds.
      </p>
      <p className="mb-prose-3">
        The catch: existing Z-Wave and Caséta devices do not speak Matter, and there is no firmware update
        that will make them. Migration is therefore physical — a Matter device replaces an existing Z-Wave
        device one box at a time — or it is via a hub that bridges (Hubitat, Home Assistant, and SmartThings
        can all expose Z-Wave devices to Matter controllers as if they were native). The bridge path lets
        you keep working hardware; the physical-replacement path lets you eventually retire the legacy hub.
        The migration that wins for most readers is incremental: leave the Caséta hub in place, replace
        Z-Wave switches with Matter-over-Thread switches as they fail or get added, and wait for Lutron to
        ship a Caséta-to-Matter bridge in the hub firmware (announced; shipping in pieces).
      </p>

      <CaseStudies intro="Three real retrofits, each chosen because it forced a decision about wiring, ecosystem, or both.">
        <CaseStudy
          tag="Case 38.1"
          title="The pre-2011 bedroom switch retrofit"
          summary="Two wires in the box, an 11 W LED bulb, and a reader who wants Caséta."
          specs={[
            { label: 'Box wires', value: 'black + red, no neutral, ground present' },
            { label: 'Load', value: '11 W LED ceiling fixture' },
            { label: 'Bleeder current (Caséta no-neutral)', value: '~35 mA' },
            { label: 'P_bleeder', value: '120 V × 0.035 A = 4.2 W' },
            { label: 'LUT-MLC load capacitor', value: '~$15, mounts in fixture box' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The reader opens the box and finds exactly two wires: a black and a red, with a bare ground curled
            against the back. There is no neutral. The fixture is an 11 W flush-mount LED. They have three
            paths.
          </p>
          <p className="mb-prose-2 last:mb-0">
            <strong className="text-text font-medium">(a) Caséta no-neutral + load capacitor (LUT-MLC).</strong> The dimmer installs with the
            black on the line terminal and the red as the switched-hot to the fixture. Without the load
            capacitor, the 4.2 W bleeder will produce a faint ghost glow in the LED. Wire the LUT-MLC in
            parallel with the LED at the fixture box; it shunts the bleeder as 60 Hz displacement current
            and the glow disappears. Cost: ~$80 + $15. Reversible: yes.
          </p>
          <p className="mb-prose-2 last:mb-0">
            <strong className="text-text font-medium">(b) Caséta Pico battery remote + smart bulb.</strong> Leave the old toggle in place,
            switched to always-on. Install a Pico battery remote on the wall using a single-gang plate; the
            Pico contains no mains wiring at all. Replace the LED bulb with a Lutron-compatible smart LED.
            The Pico pairs to the bulb through the Lutron hub. Cost: ~$25 (Pico) + $20 (bulb). Reversible:
            yes. Limitation: if a guest flips the always-on toggle off, the smart bulb loses power.
          </p>
          <p className="mb-prose-2 last:mb-0">
            <strong className="text-text font-medium">(c) Open the wall, run 14-3-with-ground.</strong> The right long-term answer if multiple
            rooms have the same problem. Cost: $500–$2000 and a drywall repair. Reversible: no.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Most readers in this situation pick (b). The reader who is committed to a fleet-wide Caséta
            install picks (a). Almost nobody picks (c) for one bedroom<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 38.2"
          title="The Matter migration"
          summary="A house with Hubitat + Z-Wave + Caséta + HomeKit + Google, wanting to consolidate."
          specs={[
            { label: 'Existing Z-Wave switches', value: '14 (Inovelli, Zooz)' },
            { label: 'Existing Caséta dimmers', value: '6' },
            { label: 'Existing hubs', value: 'Hubitat (Z-Wave), Lutron Smart Hub (Caséta)' },
            { label: 'Thread Border Routers', value: 'Apple TV 4K (gen 3), HomePod mini × 2' },
            { label: 'Plan', value: 'incremental Z-Wave → Matter, keep Caséta hub in place' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The household has 14 Z-Wave switches on Hubitat, 6 Caséta dimmers on a Lutron hub, plus HomeKit
            and Google integrations layered on top via Homebridge. Everything works, but adding a device
            takes manual editing in three places.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The good news: with multiple Apple TVs and HomePod minis in the house, the household already has
            Thread Border Routers wired into the network — they just have not been doing anything because no
            device speaks Thread. Step one is to verify the Border Routers are forming a mesh (Home app →
            Home Settings → "Thread network"; should show one active network with multiple routers).
          </p>
          <p className="mb-prose-2 last:mb-0">
            Step two is incremental replacement. As Z-Wave switches age out or new locations need a switch,
            install Matter-over-Thread switches (Aqara, Eve, Leviton Decora Smart 4th gen, Lutron Diva
            Smart with Matter). Each new Matter device is paired by scanning its QR code into HomeKit,
            Google Home, or Alexa; the device appears in all three through multi-admin.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Step three is to keep the Caséta hub running. Lutron has announced a Matter bridge in the Smart
            Hub firmware that will expose existing Caséta dimmers as Matter devices, removing the need to
            replace working hardware. Until that ships, Caséta sits behind its hub and is bridged through
            HomeKit or Homebridge.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Step four is to retire Hubitat once the last Z-Wave switch has been replaced — likely 3–5 years
            from now. The hub is the bridge of last resort; once nothing depends on it, it powers off.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 38.3"
          title="The 3-way smart-switch failure"
          summary="A Z-Wave 3-way primary works in software; the companion is unreliable."
          specs={[
            { label: 'Primary', value: 'Z-Wave dimmer at fixture end' },
            { label: 'Companion', value: 'Z-Wave wireless companion (no signal wire)' },
            { label: 'Symptom', value: 'app + primary OK; companion misses ~30 % of taps' },
            { label: 'RSSI at companion box', value: '−85 dBm (poor)' },
            { label: 'Fix', value: 'add a mains-powered Z-Wave repeater 2 m from companion' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Z-Wave wireless companions communicate over the mesh, not over a signal wire. When a companion
            misses commands, the problem is almost always radio: the companion's box is in plaster-and-lath,
            behind a steel stud, near a microwave or a 2.4 GHz Wi-Fi router that desenses the front end, or
            far enough from the primary that the mesh has to route through several hops.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Diagnostic path: the Hubitat or SmartThings hub will show the route the mesh chose for each device
            and the RSSI of the last few transmissions. An RSSI worse than about −80 dBm at the companion's
            radio is enough to cause dropouts. The cheap fix is to add a mains-powered Z-Wave device
            (smart plug, switch, repeater) somewhere on the path — every mains-powered Z-Wave device is a
            mesh router, so a new device improves coverage for everything around it.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The expensive fix is to abandon the wireless companion and pull a low-voltage signal wire to
            convert the pair into a Lutron Caséta wired-companion setup. The intermediate fix is to leave
            the companion as a "scene controller" — its taps are interpreted as scene changes rather than
            direct switch commands, and the hub re-issues the corresponding command to the primary over
            its preferred route.
          </p>
        </CaseStudy>
      </CaseStudies>

      <TryIt
        tag="Try 38.3"
        question={<>A Z-Wave smart switch consumes <strong className="text-text font-medium">30 mW</strong> continuously (radio idle + MCU). Over a 10-year service life, how many kWh does it consume? At $0.15/kWh, what's the energy cost over that life?</>}
        hint="One year is about 8760 hours."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Energy is power times time:</p>
            <Formula>E = P × t = 0.030 W × (10 × 8760 h) = 0.030 × 87 600 = 2628 Wh ≈ 2.6 kWh</Formula>
            <p className="mb-prose-1 last:mb-0">
              Cost over 10 years: 2.6 kWh × $0.15/kWh ≈ <strong className="text-text font-medium">$0.39</strong>. About forty cents over a
              decade — negligible compared to the device cost. Multiply by twenty switches in a typical
              house and it is still under $10/decade. Standby radios are essentially free relative to the
              rest of the household electric load.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 38.4"
        question={<>A pre-2011 switch box has only a black and a red wire (a 3-way traveller pair) — no neutral, no second hot. The reader wants a Caséta dimmer for an 11 W LED. Will the no-neutral mode work? Why or why not?</>}
        hint="What does the no-neutral dimmer need to see between its two terminals when the switch is off?"
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The no-neutral dimmer expects to see <strong className="text-text font-medium">hot on one terminal and the load (returning to
              neutral through the bulb) on the other</strong>. The bleeder current then flows from hot →
              through the dimmer's power supply → through the load → to neutral, keeping the radio alive.
            </p>
            <p className="mb-prose-1 last:mb-0">
              In a 3-way switch loop, both wires in this box are <em className="italic text-text">travellers</em> — neither is a
              continuous hot to the source, and neither is on the load side of the bulb. Until the reader
              identifies which wire is acting as the source feed and reconfigures the wiring so the dimmer
              sees a source-hot + load pair, the no-neutral mode <strong className="text-text font-medium">cannot work</strong>.
            </p>
            <p className="mb-prose-1 last:mb-0">
              The practical answer: convert the 3-way into a single-pole circuit by removing the other
              switch from the loop entirely, then install the Caséta no-neutral plus a load capacitor. Or:
              install a Caséta Pico battery remote at this location and a wired Caséta dimmer at the
              fixture end, where the source-hot and load are both available.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 38.5"
        question={<>A Lutron Caséta wired-companion pair: primary at the fixture end, companion at the room entrance. The 24 V signal wire between them breaks somewhere in the wall. What's the failure mode? Can the main switch still work?</>}
        hint="The companion is not a switch in the traditional sense — it is a button that signals over a wire."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The companion stops working entirely (no taps reach the primary). The primary continues to
              work normally — both from its own physical buttons and from the Lutron hub / phone app — because
              the primary contains the radio, the load relay, and its own power supply, none of which
              depend on the signal wire.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Diagnostic: confirm the primary still responds locally and via app. If yes, the break is in
              the signal wire (or its terminations at the companion). A continuity test from the companion's
              signal-in terminal to the primary's signal-out terminal with the breaker off confirms it. The
              fix is either to repair the wire or to replace the wired companion with a Pico battery
              remote, which signals the primary over the Caséta radio and needs no wiring.
            </p>
          </>
        }
      />

      <FAQ>
        <FAQItem q="Why does my Caséta dimmer require a neutral with LED bulbs but not with incandescent?">
          The no-neutral Caséta works by bleeding a small continuous current through the load to power its
          radio. An incandescent filament cannot visibly glow on that small a bias, so the bleeder is
          invisible. A modern LED bulb's driver, by contrast, will charge its input cap on the bleeder
          alone and pass enough current to the LED string to produce a faint ghost glow when the switch is
          "off"<Cite id="lutron-dimmer-app-note" in={SOURCES} />. With neutral, no bleeder is needed; the
          dimmer's power supply runs straight off line-to-neutral.
        </FAQItem>

        <FAQItem q="Can I use a smart switch in a 3-way wiring scheme where there's no neutral in the secondary box?">
          With Lutron Caséta, yes — a wired-companion kit needs only the existing traveller wire repurposed
          as the 24 V signal line, and the primary at the other end provides the radio and load relay. With
          Z-Wave or Zigbee wireless 3-way pairs, no — both devices need continuous power, which means both
          boxes need neutral access. The third option, valid for any ecosystem, is to replace one wall
          control with a Pico (Caséta) or comparable battery-powered remote, which uses no wiring at all.
        </FAQItem>

        <FAQItem q="What's the difference between a smart switch and a smart bulb?">
          A smart switch lives in the wall box; its radio controls a wall-mounted relay or triac that
          interrupts the line current to a "dumb" bulb. A smart bulb has the radio inside the bulb itself
          and is wired permanently to mains; its switching is internal. Smart bulbs give per-bulb color and
          colour-temperature control; smart switches give a control point that any human reaches for instead
          of a phone, and they keep working with any bulb you put in the fixture. Most working smart-home
          installations use both.
        </FAQItem>

        <FAQItem q="Why is Wi-Fi popular for smart plugs but not for smart switches?">
          Wi-Fi radios have a high idle current — 100–300 mW in associated-and-listening mode — and the
          mesh-routing benefit of Z-Wave / Zigbee / Thread is lost. A Wi-Fi plug can hide its draw in a
          large device's standby budget; a Wi-Fi switch behind the wall has to dissipate that heat inside
          a sealed box behind a faceplate. Wi-Fi switches do exist, but they almost universally require a
          neutral and run hot enough to be a noticeable factor in box derating<Cite id="ul-498" in={SOURCES} />.
        </FAQItem>

        <FAQItem q="What is Matter and why is everyone talking about it?">
          Matter is a cross-vendor application protocol for smart-home devices, released by the Connectivity
          Standards Alliance in 2022. A Matter device pairs once and is visible to Apple HomeKit, Google
          Home, Amazon Alexa, and Samsung SmartThings simultaneously, without per-vendor hubs. It runs over
          Thread (for low-power devices) or Wi-Fi (for high-bandwidth devices). The reason people talk about
          it is that for the first time the smart-home space has a credible cross-vendor standard backed by
          the four ecosystems that matter — and consequently, the bridge-software ecosystem that grew up to
          translate between them gets simpler.
        </FAQItem>

        <FAQItem q="Can I have a smart switch AND smart bulbs on the same circuit?">
          You can, but the smart switch must be configured to stay always-on (cutting power to a smart bulb
          severs its radio, then any voice command to "turn the lights on" fails until power is restored).
          The cleanest pattern: smart switch in "scene controller" or "always-on" mode, smart bulbs in the
          fixtures, and the switch's button presses re-issued through the hub as bulb commands. Caséta's
          Pico remotes are designed exactly for this — they never interrupt mains power.
        </FAQItem>

        <FAQItem q="What happens to my smart switches if my internet goes down?">
          For Caséta, Z-Wave, Zigbee, and Matter-over-Thread, local control continues to work — the radios
          and the hub are on your local network and do not need internet. Phone app control over the local
          network also works. What breaks is voice control (Alexa, Google) and any remote / outside-the-house
          phone app access, both of which round-trip through the vendor's cloud. Devices that talk directly
          to a vendor cloud over Wi-Fi with no local fallback (some older smart plugs) are dead until
          internet returns.
        </FAQItem>

        <FAQItem q="Why does my Z-Wave switch sometimes take 3-5 seconds to respond?">
          Almost always a mesh-route problem. The hub picked a multi-hop route through devices that are
          slow to wake (battery-powered Z-Wave devices sleep) or that have poor RSSI. Forcing a route
          repair (most hubs expose this under device settings) often fixes it; adding a mains-powered
          Z-Wave repeater closer to the path is the durable fix. Z-Wave's chosen radio band (908 MHz) is
          forgiving compared to 2.4 GHz, but a path that ends up routing through a sleepy battery node is
          slow on any protocol.
        </FAQItem>

        <FAQItem q="Is a smart switch more or less energy-efficient than a regular switch?">
          A smart switch draws 30–100 mW of standby power that a mechanical switch does not. Over a year
          that is 0.3–0.9 kWh, or 5–15 cents on a typical utility rate. The energy <em className="italic text-text">saved</em> depends on
          how the switch is used: a schedule that turns off lights an extra hour a day saves several
          kWh/year per fixture, easily an order of magnitude more than the switch's own standby. Net, smart
          switches almost always pay back if they are actually used to schedule loads.
        </FAQItem>

        <FAQItem q="Why does my smart dimmer hum when I dim halogen bulbs?">
          A leading-edge dimmer chops the AC waveform abruptly at the gate-on point. That sharp voltage
          step drives a 120 Hz current step through any inductance in the load path — including a halogen
          bulb's spiral filament. The filament physically vibrates at 120 Hz, producing audible buzz. The
          mitigation is a trailing-edge dimmer (gentler turn-on), a different bulb (LED retrofit drivers
          have no mechanical resonator), or a dimmer with a built-in choke that smooths the step. Lutron
          publish compatibility tables that flag known buzz-prone combinations<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
        </FAQItem>

        <FAQItem q="What happens if I install a smart switch in a metal box?">
          Two things to watch. First, 2.4 GHz radios (Zigbee, Thread, Wi-Fi) lose 6–15 dB of signal through
          a steel box face plate — sub-GHz radios (Caséta, Z-Wave) lose less. Second, the box-fill rules of
          NEC 314.16 still apply: a smart switch's body is bulkier than a toggle, and the device counts as
          a double-conductor for fill<Cite id="nec-2023" in={SOURCES} />. If the box is already at fill, the
          smart switch will not pass inspection without either deepening the box or moving to a no-neutral
          model with a smaller body.
        </FAQItem>

        <FAQItem q="Can a smart switch survive a power surge better than a regular switch?">
          A mechanical toggle has no electronics to damage — it is essentially indestructible against
          electrical surge (mechanical wear is a different story). A smart switch contains a low-voltage
          DC rail driven by a small switch-mode supply behind a thin MOV; a high surge can puncture the
          MOV and burn out the supply chip. The mitigation is the same as for any sensitive electronics:
          a panel-level (Type 2) surge protector, plus a point-of-use Type 3 if the circuit serves
          particularly expensive devices<Cite id="nec-2023" in={SOURCES} />. The smart switch itself will
          generally fail open (load stays off) rather than fail short, which is the safer failure mode.
        </FAQItem>

        <FAQItem q="Do I need a permit to install smart switches?">
          In most US jurisdictions, like-for-like replacement of an existing switch with a smart switch is
          a "repair" and does not require a permit, on the principle that you are not modifying the
          permanent wiring of the building. Pulling a new neutral conductor to retrofit smart switches into
          a pre-2011 switch-loop house <em className="italic text-text">is</em> wiring modification and frequently does require a permit.
          The deciding question is whether you are changing the conductors in the wall; check your local
          AHJ before opening drywall<Cite id="nec-2023" in={SOURCES} />.
        </FAQItem>

        <FAQItem q="Are smart switches UL-listed the same as regular switches?">
          Yes — they go through the same UL 498 listing for the switch / receptacle device portion,
          including temperature rise, dielectric withstand, and endurance testing, plus additional listings
          (UL 916 for energy-management, UL 2017 for the radio) for the electronic content<Cite id="ul-498" in={SOURCES} />.
          A switch that does not bear the listing mark for the use case (snap-action, dimmer, etc.) cannot
          be legally installed in a permanent residential wiring system regardless of how clever its radio
          is.
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
