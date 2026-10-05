import { http, HttpResponse } from "msw"

// Track call counts per runId to simulate running → completed transition
const statusCallCount = new Map<string, number>()

function getBaseUrl(): string {
  return (
    process.env.EXTRACTION_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000"
  )
}

export const extractionHandlers = [
  // POST /api/extract → echoes the documentId as runId (our internal UUID is the external runId)
  http.post(`${getBaseUrl()}/api/extract`, async ({ request }) => {
    const body = (await request.json()) as { documentId?: string }
    const runId = body.documentId ?? crypto.randomUUID()
    statusCallCount.set(runId, 0)
    return HttpResponse.json({ runId })
  }),

  // GET /api/extract/:runId/status → running on first call, completed thereafter
  http.get(`${getBaseUrl()}/api/extract/:runId/status`, ({ params }) => {
    const runId = params.runId as string
    const count = statusCallCount.get(runId) ?? 0
    statusCallCount.set(runId, count + 1)
    const status = count === 0 ? "running" : "completed"
    return HttpResponse.json({ runId, status })
  }),

  // GET /api/extract/:runId/results → seeded mock sections + entities + facts
  http.get(`${getBaseUrl()}/api/extract/:runId/results`, () => {
    return HttpResponse.json({
      sections: [
        {
          id: "ch1",
          title: "Chapter 1 — The Case for Fusion",
          paragraphs: [
            {
              id: "ch1.summary",
              content:
                "Chapter 1 summarizes the energy-policy motivation for fusion, near- and long-term energy scenarios, and the argument that fusion can become a dense, low-carbon energy source. It then explains fusion basics: power gain Q, D-T and other fusion reactions, fusion fuels, and the contrast between magnetic and inertial confinement. The chapter closes with socioeconomic issues such as safety, waste, cost, public acceptance, and spin-offs from fusion research.",
            },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2 — Physics of Confinement",
          paragraphs: [
            {
              id: "ch2.summary",
              content:
                "Chapter 2 covers the physics that controls energy and particle confinement in magnetized plasmas. It combines neoclassical transport, turbulent transport, microinstabilities, bootstrap current, energy confinement scaling, local transport models, confinement modes, transport barriers, and turbulence measurements. The chapter links confinement quality to transport mechanisms, scaling laws, and measured plasma fluctuations.",
            },
          ],
        },
        {
          id: "ch3",
          title:
            "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
          paragraphs: [
            {
              id: "ch3.summary",
              content:
                "Chapter 3 explains tokamak equilibrium, magnetic configuration, safety factor, flux surfaces, and the MHD stability framework. It treats kink modes, tearing modes, neoclassical tearing modes, edge localized modes, ideal pressure-limiting modes, wall effects, energetic particle modes, and disruptive instabilities. It also summarizes disruption causes, thermal and current quench phases, damage mechanisms, and mitigation methods.",
            },
          ],
        },
        {
          id: "ch4",
          title: "Chapter 4 — Plasma Diagnostics",
          paragraphs: [
            {
              id: "ch4.summary",
              content:
                "Chapter 4 organizes plasma diagnostics into passive and active methods and explains what quantities they measure. Passive diagnostics include magnetic measurements, probes, spectroscopy, bolometry, electron cyclotron emission, neutral particle analysis, X rays, neutron measurements, charged fusion products, and gamma rays. Active diagnostics include Thomson scattering, laser induced fluorescence, charge exchange recombination spectroscopy, motional Stark effect, heavy ion beam probes, interferometry, polarimetry, and reflectometry.",
            },
          ],
        },
        {
          id: "ch5",
          title:
            "Chapter 5 — Plasma Heating and Current Drive by Neutral Beam and Alpha Particles",
          paragraphs: [
            {
              id: "ch5.summary",
              content:
                "Chapter 5 focuses on neutral beam injection and alpha-particle self-heating. It explains neutral beam ionization, energy transfer to electrons and ions, energetic particle orbits, neutral beam current drive, fast-ion ripple losses, non-axisymmetric trajectories, alpha heating, D-T experiments in TFTR and JET, and engineering of positive- and negative-ion neutral beam systems for devices such as ITER.",
            },
          ],
        },
        {
          id: "ch6",
          title: "Chapter 6 — Radiofrequency Waves, Heating and Current Drive",
          paragraphs: [
            {
              id: "ch6.summary",
              content:
                "Chapter 6 treats radiofrequency wave propagation, absorption, heating, and current drive in magnetically confined plasmas. It covers electron cyclotron, lower hybrid, and ion cyclotron wave physics; quasi-linear absorption; toroidal wave propagation; current drive by LHCD and ECCD; ICRF experiments; RF launchers and antennas; and gyrotron technology for ECR heating and current drive.",
            },
          ],
        },
        {
          id: "ch7",
          title: "Chapter 7 — Plasma–Wall Interactions",
          paragraphs: [
            {
              id: "ch7.summary",
              content:
                "Chapter 7 summarizes physical processes at the plasma-material boundary: boundary layers, plasma sheath formation, scrape-off layer transport, recycling, atomic and molecular processes, physical and chemical sputtering, arcing, material erosion, redeposition, impurities, dust, hydrogen isotope retention, wall conditioning, divertor regimes, divertor geometry, power handling, transient ELM heat loads, and in-vessel tritium inventory control.",
            },
          ],
        },
        {
          id: "ch8",
          title: "Chapter 8 — Helical Confinement Concepts",
          paragraphs: [
            {
              id: "ch8.summary",
              content:
                "Chapter 8 covers stellarators and other helical confinement systems. It explains how three-dimensional toroidal flux surfaces and rotational transform are produced by external coils, then treats classical stellarators, torsatrons, heliotrons, heliacs, modular stellarators, electron and ion cyclotron heating in helical systems, three-dimensional equilibrium and stability, neoclassical and turbulent transport, helical scrape-off layers, island divertors, operational limits, and stellarator reactor optimization.",
            },
          ],
        },
        {
          id: "ch9",
          title:
            "Chapter 9 — The Broader Spectrum of Magnetic Configurations for Fusion",
          paragraphs: [
            {
              id: "ch9.summary",
              content:
                "Chapter 9 surveys magnetic confinement configurations beyond tokamaks and stellarators. It covers reversed field pinches, magnetic-field reversal, tearing-mode dynamics, magnetic stochasticity, improved confinement, compact torus concepts such as spheromaks and field-reversed configurations, open mirror confinement, tandem mirrors, gas-dynamic traps, levitated dipoles, cusps, pinches, magnetized target fusion, and other alternative ideas.",
            },
          ],
        },
        {
          id: "ch10",
          title: "Chapter 10 — Inertial Fusion Energy",
          paragraphs: [
            {
              id: "ch10.summary",
              content:
                "Chapter 10 explains inertial fusion energy from fuel-target implosion to power-plant concepts. It covers fusion gain requirements, compression, direct-drive implosion, ablation pressure, laser–plasma interactions, implosion non-uniformity, hydrodynamic instabilities, fast ignition, indirect drive with hohlraums, NIF/LMJ-style driver concepts, target fabrication and injection, reaction chambers, and IFE power-plant development.",
            },
          ],
        },
      ],
      entities: [
        {
          temp_id: "fuel_deuterium",
          text: "Deuterium (D, H-2)",
          attributes: [
            {
              attribute_name: "massNumber",
              value: "2",
            },
            {
              attribute_name: "atomicNumber",
              value: "1",
            },
            {
              attribute_name: "isRadioactive",
              value: "false",
            },
            {
              attribute_name: "naturalAbundance",
              value: "about 0.015% of natural hydrogen",
            },
          ],
        },
        {
          temp_id: "fuel_tritium",
          text: "Tritium (T, H-3)",
          attributes: [
            {
              attribute_name: "massNumber",
              value: "3",
            },
            {
              attribute_name: "atomicNumber",
              value: "1",
            },
            {
              attribute_name: "isRadioactive",
              value: "true",
            },
            {
              attribute_name: "naturalAbundance",
              value:
                "not naturally abundant; bred from lithium for reactor fuel cycles",
            },
          ],
        },
        {
          temp_id: "fuel_helium3",
          text: "Helium-3 (He-3)",
          attributes: [
            {
              attribute_name: "massNumber",
              value: "3",
            },
            {
              attribute_name: "atomicNumber",
              value: "2",
            },
            {
              attribute_name: "isRadioactive",
              value: "false",
            },
            {
              attribute_name: "naturalAbundance",
              value: "rare on Earth",
            },
          ],
        },
        {
          temp_id: "fuel_boron11",
          text: "Boron-11 (B-11)",
          attributes: [
            {
              attribute_name: "massNumber",
              value: "11",
            },
            {
              attribute_name: "atomicNumber",
              value: "5",
            },
            {
              attribute_name: "isRadioactive",
              value: "false",
            },
            {
              attribute_name: "naturalAbundance",
              value: "dominant stable isotope of boron",
            },
          ],
        },
        {
          temp_id: "fuel_proton",
          text: "Proton / protium (p, H-1)",
          attributes: [
            {
              attribute_name: "massNumber",
              value: "1",
            },
            {
              attribute_name: "atomicNumber",
              value: "1",
            },
            {
              attribute_name: "isRadioactive",
              value: "false",
            },
            {
              attribute_name: "naturalAbundance",
              value: "dominant hydrogen isotope",
            },
          ],
        },
        {
          temp_id: "rx_dt",
          text: "D-T reaction",
          attributes: [
            {
              attribute_name: "energyYield",
              value: "17.6",
            },
            {
              attribute_name: "isAneutronic",
              value: "false",
            },
            {
              attribute_name: "reactionProducts",
              value: "He-4 + neutron",
            },
          ],
        },
        {
          temp_id: "rx_dd_n",
          text: "D-D reaction branch producing He-3 and neutron",
          attributes: [
            {
              attribute_name: "energyYield",
              value: "3.27",
            },
            {
              attribute_name: "isAneutronic",
              value: "false",
            },
            {
              attribute_name: "reactionProducts",
              value: "He-3 + neutron",
            },
          ],
        },
        {
          temp_id: "rx_dd_p",
          text: "D-D reaction branch producing tritium and proton",
          attributes: [
            {
              attribute_name: "energyYield",
              value: "4.03",
            },
            {
              attribute_name: "isAneutronic",
              value: "false",
            },
            {
              attribute_name: "reactionProducts",
              value: "T + proton",
            },
          ],
        },
        {
          temp_id: "rx_dhe3",
          text: "D-He3 reaction",
          attributes: [
            {
              attribute_name: "energyYield",
              value: "18.3",
            },
            {
              attribute_name: "isAneutronic",
              value: "mostly true",
            },
            {
              attribute_name: "reactionProducts",
              value: "He-4 + proton",
            },
          ],
        },
        {
          temp_id: "rx_pb11",
          text: "p-B11 reaction",
          attributes: [
            {
              attribute_name: "energyYield",
              value: "8.7",
            },
            {
              attribute_name: "isAneutronic",
              value: "true",
            },
            {
              attribute_name: "reactionProducts",
              value: "three alpha particles",
            },
          ],
        },
        {
          temp_id: "ign_dt",
          text: "D-T ignition condition",
          attributes: [
            {
              attribute_name: "minTemperature",
              value: "about 5-10 keV",
            },
            {
              attribute_name: "minTripleProduct",
              value: "order 10^21 m^-3 keV s",
            },
          ],
        },
        {
          temp_id: "ign_icf",
          text: "ICF hot-spot ignition condition",
          attributes: [
            {
              attribute_name: "minTemperature",
              value: "keV range",
            },
            {
              attribute_name: "minTripleProduct",
              value:
                "expressed through compressed fuel areal density and confinement time",
            },
          ],
        },
        {
          temp_id: "approach_mcf",
          text: "Magnetic confinement fusion",
          attributes: [],
        },
        {
          temp_id: "approach_icf",
          text: "Inertial confinement fusion",
          attributes: [],
        },
        {
          temp_id: "tok_iter",
          text: "ITER tokamak",
          attributes: [
            {
              attribute_name: "plasmaCurrent_MA",
              value: "15",
            },
            {
              attribute_name: "toroidalField_T",
              value: "about 5.3",
            },
          ],
        },
        {
          temp_id: "tok_jet",
          text: "JET tokamak",
          attributes: [
            {
              attribute_name: "plasmaCurrent_MA",
              value: "multi-MA",
            },
            {
              attribute_name: "toroidalField_T",
              value: "several tesla",
            },
          ],
        },
        {
          temp_id: "tok_tftr",
          text: "TFTR tokamak",
          attributes: [
            {
              attribute_name: "plasmaCurrent_MA",
              value: "multi-MA",
            },
            {
              attribute_name: "toroidalField_T",
              value: "several tesla",
            },
          ],
        },
        {
          temp_id: "tok_jt60",
          text: "JT-60 / JT-60SA tokamak programme",
          attributes: [
            {
              attribute_name: "plasmaCurrent_MA",
              value: "multi-MA",
            },
            {
              attribute_name: "toroidalField_T",
              value: "tokamak toroidal field",
            },
          ],
        },
        {
          temp_id: "dev_iter",
          text: "ITER as a fusion device with Q target",
          attributes: [
            {
              attribute_name: "operationalStatus",
              value:
                "under construction / experimental reactor project in the book context",
            },
            {
              attribute_name: "majorRadius_m",
              value: "about 6.2",
            },
            {
              attribute_name: "minorRadius_m",
              value: "about 2.0",
            },
            {
              attribute_name: "powerGainQ",
              value: "10 design target",
            },
          ],
        },
        {
          temp_id: "stel_w7x",
          text: "Wendelstein 7-X stellarator",
          attributes: [
            {
              attribute_name: "coilType",
              value: "modular non-planar coils",
            },
            {
              attribute_name: "isInherentlySteadyState",
              value: "true",
            },
          ],
        },
        {
          temp_id: "stel_lhd",
          text: "Large Helical Device (LHD)",
          attributes: [
            {
              attribute_name: "coilType",
              value: "heliotron/helical winding",
            },
            {
              attribute_name: "isInherentlySteadyState",
              value: "true",
            },
          ],
        },
        {
          temp_id: "rfp_rfx",
          text: "RFX-mod reversed field pinch",
          attributes: [
            {
              attribute_name: "pinchParameter",
              value: "negative edge toroidal-field reversal",
            },
          ],
        },
        {
          temp_id: "alt_frc",
          text: "Field-reversed configuration",
          attributes: [
            {
              attribute_name: "configurationSubtype",
              value: "field-reversed configuration",
            },
          ],
        },
        {
          temp_id: "alt_spheromak",
          text: "Spheromak compact torus",
          attributes: [
            {
              attribute_name: "configurationSubtype",
              value: "compact torus / spheromak",
            },
          ],
        },
        {
          temp_id: "alt_mirror",
          text: "Mirror confinement system",
          attributes: [
            {
              attribute_name: "configurationSubtype",
              value: "open mirror machine",
            },
          ],
        },
        {
          temp_id: "mfc_tokamak",
          text: "Axisymmetric tokamak magnetic configuration",
          attributes: [
            {
              attribute_name: "toroidalFieldSource",
              value: "toroidal field coils",
            },
            {
              attribute_name: "poloidalFieldSource",
              value: "plasma current and poloidal field coils",
            },
            {
              attribute_name: "fieldTopology",
              value: "axisymmetric toroidal",
            },
            {
              attribute_name: "rotationalTransform",
              value: "1/q",
            },
          ],
        },
        {
          temp_id: "mfc_stellarator",
          text: "Three-dimensional stellarator magnetic configuration",
          attributes: [
            {
              attribute_name: "toroidalFieldSource",
              value: "external helical or modular coils",
            },
            {
              attribute_name: "poloidalFieldSource",
              value: "external coil shaping",
            },
            {
              attribute_name: "fieldTopology",
              value: "non-axisymmetric helical",
            },
            {
              attribute_name: "rotationalTransform",
              value: "coil-produced",
            },
          ],
        },
        {
          temp_id: "mfc_rfp",
          text: "Reversed-field-pinch magnetic configuration",
          attributes: [
            {
              attribute_name: "toroidalFieldSource",
              value: "plasma current and external fields",
            },
            {
              attribute_name: "poloidalFieldSource",
              value: "large plasma current",
            },
            {
              attribute_name: "fieldTopology",
              value: "toroidal with edge toroidal-field reversal",
            },
          ],
        },
        {
          temp_id: "flux_nested",
          text: "Nested toroidal magnetic flux surface",
          attributes: [
            {
              attribute_name: "minorRadius",
              value: "generic normalized minor-radius coordinate",
            },
          ],
        },
        {
          temp_id: "flux_q1",
          text: "q = 1 magnetic flux surface",
          attributes: [
            {
              attribute_name: "minorRadius",
              value: "inner rational surface",
            },
          ],
        },
        {
          temp_id: "flux_q2",
          text: "q = 2 magnetic flux surface",
          attributes: [
            {
              attribute_name: "minorRadius",
              value: "outer rational surface",
            },
          ],
        },
        {
          temp_id: "q1",
          text: "Safety factor q = 1",
          attributes: [
            {
              attribute_name: "value",
              value: "1",
            },
            {
              attribute_name: "shear",
              value: "profile-dependent",
            },
          ],
        },
        {
          temp_id: "q2",
          text: "Safety factor q = 2",
          attributes: [
            {
              attribute_name: "value",
              value: "2",
            },
            {
              attribute_name: "shear",
              value: "profile-dependent",
            },
          ],
        },
        {
          temp_id: "q_profile",
          text: "Safety factor profile q(r)",
          attributes: [
            {
              attribute_name: "value",
              value: "radially varying",
            },
            {
              attribute_name: "shear",
              value: "s = (r/q)(dq/dr)",
            },
          ],
        },
        {
          temp_id: "tau_e_iter",
          text: "ITER projected energy confinement time",
          attributes: [
            {
              attribute_name: "value",
              value: "seconds scale",
            },
            {
              attribute_name: "scalingRegime",
              value: "H-mode",
            },
          ],
        },
        {
          temp_id: "tau_e_lmode",
          text: "L-mode energy confinement time",
          attributes: [
            {
              attribute_name: "value",
              value: "lower than H-mode",
            },
            {
              attribute_name: "scalingRegime",
              value: "L-mode",
            },
          ],
        },
        {
          temp_id: "scaling_ipb98",
          text: "IPB98(y,2) H-mode scaling law",
          attributes: [
            {
              attribute_name: "scalingFormula",
              value: "tau_E scaling with I, B, n, P, M, R, epsilon and kappa",
            },
            {
              attribute_name: "applicableMode",
              value: "H-mode",
            },
          ],
        },
        {
          temp_id: "scaling_iter89",
          text: "ITER89-P L-mode scaling law",
          attributes: [
            {
              attribute_name: "scalingFormula",
              value: "empirical L-mode confinement scaling",
            },
            {
              attribute_name: "applicableMode",
              value: "L-mode",
            },
          ],
        },
        {
          temp_id: "mode_l",
          text: "L-mode low confinement regime",
          attributes: [
            {
              attribute_name: "modeLabel",
              value: "L-mode",
            },
          ],
        },
        {
          temp_id: "mode_h",
          text: "H-mode high confinement regime",
          attributes: [
            {
              attribute_name: "modeLabel",
              value: "H-mode",
            },
          ],
        },
        {
          temp_id: "barrier_etb",
          text: "Edge transport barrier / pedestal",
          attributes: [
            {
              attribute_name: "barrierType",
              value: "edge",
            },
            {
              attribute_name: "radialLocation",
              value: "plasma edge / pedestal",
            },
          ],
        },
        {
          temp_id: "barrier_itb",
          text: "Internal transport barrier",
          attributes: [
            {
              attribute_name: "barrierType",
              value: "internal",
            },
            {
              attribute_name: "radialLocation",
              value: "plasma core or mid-radius",
            },
          ],
        },
        {
          temp_id: "transport_neoclassical",
          text: "Neoclassical transport",
          attributes: [
            {
              attribute_name: "dominantOrbitRegime",
              value:
                "banana, plateau, Pfirsch-Schlüter depending on collisionality",
            },
          ],
        },
        {
          temp_id: "transport_turbulent",
          text: "Turbulent transport",
          attributes: [
            {
              attribute_name: "anomalyFactor",
              value: "above neoclassical level",
            },
          ],
        },
        {
          temp_id: "transport_plasma",
          text: "Cross-field plasma transport",
          attributes: [
            {
              attribute_name: "transportType",
              value: "neoclassical and turbulent",
            },
          ],
        },
        {
          temp_id: "micro_itg",
          text: "Ion temperature gradient mode",
          attributes: [
            {
              attribute_name: "driveGradient",
              value: "ion temperature gradient",
            },
            {
              attribute_name: "instabilityType",
              value: "ITG",
            },
          ],
        },
        {
          temp_id: "micro_tem",
          text: "Trapped electron mode",
          attributes: [
            {
              attribute_name: "driveGradient",
              value:
                "electron density/temperature gradients with trapped particles",
            },
            {
              attribute_name: "instabilityType",
              value: "TEM",
            },
          ],
        },
        {
          temp_id: "micro_etg",
          text: "Electron temperature gradient mode",
          attributes: [
            {
              attribute_name: "driveGradient",
              value: "electron temperature gradient",
            },
            {
              attribute_name: "instabilityType",
              value: "ETG",
            },
          ],
        },
        {
          temp_id: "mhd_kink",
          text: "Internal kink mode",
          attributes: [
            {
              attribute_name: "onsetCondition",
              value: "q < 1 near the plasma axis",
            },
            {
              attribute_name: "instabilityType",
              value: "kink",
            },
          ],
        },
        {
          temp_id: "mhd_tearing",
          text: "Tearing mode",
          attributes: [
            {
              attribute_name: "onsetCondition",
              value: "rational q surface and resistive magnetic reconnection",
            },
            {
              attribute_name: "instabilityType",
              value: "tearing",
            },
          ],
        },
        {
          temp_id: "mhd_ntm",
          text: "Neoclassical tearing mode",
          attributes: [
            {
              attribute_name: "onsetCondition",
              value: "bootstrap-current perturbation at rational surface",
            },
            {
              attribute_name: "instabilityType",
              value: "neoclassical tearing mode",
            },
          ],
        },
        {
          temp_id: "elm_type_i",
          text: "Type-I edge localized mode",
          attributes: [
            {
              attribute_name: "elmType",
              value: "Type I",
            },
          ],
        },
        {
          temp_id: "epm_tae",
          text: "Toroidal Alfvén eigenmode",
          attributes: [
            {
              attribute_name: "modeType",
              value: "TAE",
            },
          ],
        },
        {
          temp_id: "disruption_major",
          text: "Major tokamak plasma disruption",
          attributes: [
            {
              attribute_name: "disruptionCause",
              value:
                "density limit, beta limit, low-q limit, locked mode, or severe MHD growth",
            },
          ],
        },
        {
          temp_id: "mit_mgi",
          text: "Massive gas injection",
          attributes: [
            {
              attribute_name: "methodType",
              value: "massive gas injection (MGI)",
            },
          ],
        },
        {
          temp_id: "mit_spi",
          text: "Shattered pellet injection",
          attributes: [
            {
              attribute_name: "methodType",
              value: "shattered pellet injection (SPI)",
            },
          ],
        },
        {
          temp_id: "heat_ohmic",
          text: "Ohmic heating",
          attributes: [
            {
              attribute_name: "effectiveTempLimit_keV",
              value: "few keV",
            },
          ],
        },
        {
          temp_id: "heat_nbi",
          text: "Neutral beam injection",
          attributes: [
            {
              attribute_name: "beamEnergy_keV",
              value: "60-1000 depending on device size",
            },
            {
              attribute_name: "injectionGeometry",
              value: "tangential injection can drive current",
            },
          ],
        },
        {
          temp_id: "heat_alpha",
          text: "Alpha particle self-heating",
          attributes: [
            {
              attribute_name: "alphaEnergy_MeV",
              value: "3.52",
            },
            {
              attribute_name: "selfHeatingFraction",
              value: "increases toward 1 at ignition",
            },
          ],
        },
        {
          temp_id: "heat_ech",
          text: "Electron cyclotron heating and current drive",
          attributes: [
            {
              attribute_name: "frequency_GHz",
              value: "70-170 typical",
            },
            {
              attribute_name: "depositionRadius",
              value: "steerable resonance layer",
            },
          ],
        },
        {
          temp_id: "heat_icrh",
          text: "Ion cyclotron resonance heating",
          attributes: [
            {
              attribute_name: "frequency_MHz",
              value: "25-100 typical",
            },
            {
              attribute_name: "resonanceSpecies",
              value: "minority or harmonic ion species",
            },
          ],
        },
        {
          temp_id: "heat_lhcd",
          text: "Lower hybrid current drive",
          attributes: [
            {
              attribute_name: "frequency_GHz",
              value: "1-8 typical",
            },
          ],
        },
        {
          temp_id: "current_nbi",
          text: "NBI current drive",
          attributes: [
            {
              attribute_name: "driveType",
              value: "NBI-CD",
            },
            {
              attribute_name: "currentFraction",
              value: "device-scenario dependent",
            },
          ],
        },
        {
          temp_id: "current_lhcd",
          text: "Lower hybrid current drive mechanism",
          attributes: [
            {
              attribute_name: "driveType",
              value: "LHCD",
            },
            {
              attribute_name: "currentFraction",
              value: "scenario dependent",
            },
          ],
        },
        {
          temp_id: "current_eccd",
          text: "Electron cyclotron current drive mechanism",
          attributes: [
            {
              attribute_name: "driveType",
              value: "ECCD",
            },
            {
              attribute_name: "currentFraction",
              value: "localized current-drive fraction",
            },
          ],
        },
        {
          temp_id: "current_bootstrap",
          text: "Bootstrap current",
          attributes: [
            {
              attribute_name: "driveType",
              value: "bootstrap",
            },
            {
              attribute_name: "currentFraction",
              value: "pressure-profile dependent",
            },
          ],
        },
        {
          temp_id: "diag_thomson",
          text: "Thomson scattering diagnostic",
          attributes: [
            {
              attribute_name: "probeType",
              value: "laser",
            },
          ],
        },
        {
          temp_id: "diag_cxrs",
          text: "Charge exchange recombination spectroscopy",
          attributes: [
            {
              attribute_name: "probeType",
              value: "neutral beam",
            },
          ],
        },
        {
          temp_id: "diag_reflectometry",
          text: "Microwave reflectometry",
          attributes: [
            {
              attribute_name: "probeType",
              value: "microwave",
            },
          ],
        },
        {
          temp_id: "diag_mse",
          text: "Motional Stark effect diagnostic",
          attributes: [
            {
              attribute_name: "probeType",
              value: "neutral beam",
            },
          ],
        },
        {
          temp_id: "diag_bolometer",
          text: "Bolometer diagnostic",
          attributes: [
            {
              attribute_name: "emissionType",
              value: "radiated power",
            },
          ],
        },
        {
          temp_id: "diag_neutron",
          text: "Neutron detector",
          attributes: [
            {
              attribute_name: "emissionType",
              value: "neutrons",
            },
          ],
        },
        {
          temp_id: "diag_magnetic",
          text: "Magnetic measurement diagnostic",
          attributes: [
            {
              attribute_name: "emissionType",
              value: "magnetic flux",
            },
          ],
        },
        {
          temp_id: "diag_ece",
          text: "Electron cyclotron emission diagnostic",
          attributes: [
            {
              attribute_name: "emissionType",
              value: "electron cyclotron emission",
            },
          ],
        },
        {
          temp_id: "q_electron_temperature",
          text: "Electron temperature",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "electron temperature",
            },
            {
              attribute_name: "physicalUnit",
              value: "keV",
            },
            {
              attribute_name: "typicalRange",
              value: "1-30 keV",
            },
          ],
        },
        {
          temp_id: "q_ion_temperature",
          text: "Ion temperature",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "ion temperature",
            },
            {
              attribute_name: "physicalUnit",
              value: "keV",
            },
            {
              attribute_name: "typicalRange",
              value: "1-30 keV",
            },
          ],
        },
        {
          temp_id: "q_electron_density",
          text: "Electron density",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "electron density",
            },
            {
              attribute_name: "physicalUnit",
              value: "m^-3",
            },
            {
              attribute_name: "typicalRange",
              value: "10^19-10^20 m^-3",
            },
          ],
        },
        {
          temp_id: "q_current",
          text: "Plasma current",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "plasma current",
            },
            {
              attribute_name: "physicalUnit",
              value: "MA",
            },
            {
              attribute_name: "typicalRange",
              value: "MA scale in large tokamaks",
            },
          ],
        },
        {
          temp_id: "q_safety_profile",
          text: "Safety factor profile",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "safety factor profile",
            },
            {
              attribute_name: "physicalUnit",
              value: "dimensionless",
            },
            {
              attribute_name: "typicalRange",
              value: "q(r) profile",
            },
          ],
        },
        {
          temp_id: "q_radiated_power",
          text: "Radiated power",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "radiated power",
            },
            {
              attribute_name: "physicalUnit",
              value: "W",
            },
            {
              attribute_name: "typicalRange",
              value: "device dependent",
            },
          ],
        },
        {
          temp_id: "q_neutron_rate",
          text: "Neutron emission rate",
          attributes: [
            {
              attribute_name: "quantityName",
              value: "neutron emission rate",
            },
            {
              attribute_name: "physicalUnit",
              value: "s^-1",
            },
            {
              attribute_name: "typicalRange",
              value: "fusion performance dependent",
            },
          ],
        },
        {
          temp_id: "pwi_sheath",
          text: "Plasma sheath",
          attributes: [
            {
              attribute_name: "ionAccelerationFactor",
              value: "about 1 at Bohm criterion",
            },
            {
              attribute_name: "sheathPotential_V",
              value: "a few times electron temperature in eV",
            },
          ],
        },
        {
          temp_id: "pwi_recycling",
          text: "Particle recycling at plasma-facing surfaces",
          attributes: [
            {
              attribute_name: "interactionType",
              value: "particle recycling",
            },
          ],
        },
        {
          temp_id: "pwi_impurity",
          text: "Impurity generation by wall interaction",
          attributes: [
            {
              attribute_name: "interactionType",
              value: "impurity generation",
            },
          ],
        },
        {
          temp_id: "sol_iter",
          text: "ITER scrape-off layer",
          attributes: [
            {
              attribute_name: "connectionLength_m",
              value: "long divertor connection length",
            },
            {
              attribute_name: "parallelHeatFlux_MWpm2",
              value: "high parallel heat flux before spreading",
            },
          ],
        },
        {
          temp_id: "div_iter",
          text: "ITER divertor",
          attributes: [
            {
              attribute_name: "heatRemovalCapacity_MW",
              value: "large exhaust power",
            },
            {
              attribute_name: "geometryType",
              value: "single-null divertor",
            },
          ],
        },
        {
          temp_id: "pfc_firstwall",
          text: "First wall",
          attributes: [
            {
              attribute_name: "componentType",
              value: "first wall",
            },
            {
              attribute_name: "peakHeatFlux_MWpm2",
              value: "lower than divertor target",
            },
            {
              attribute_name: "neutronLoad_MWpm2",
              value: "about 0.5-1 for reactor-scale first wall",
            },
          ],
        },
        {
          temp_id: "pfc_divtarget",
          text: "Divertor target plate",
          attributes: [
            {
              attribute_name: "componentType",
              value: "divertor target",
            },
            {
              attribute_name: "peakHeatFlux_MWpm2",
              value: "10-20",
            },
            {
              attribute_name: "neutronLoad_MWpm2",
              value: "not primary design load",
            },
          ],
        },
        {
          temp_id: "pfc_limiter",
          text: "Limiter",
          attributes: [
            {
              attribute_name: "componentType",
              value: "limiter",
            },
            {
              attribute_name: "peakHeatFlux_MWpm2",
              value: "localized boundary heat load",
            },
          ],
        },
        {
          temp_id: "mat_tungsten",
          text: "Tungsten plasma-facing material",
          attributes: [
            {
              attribute_name: "materialName",
              value: "tungsten",
            },
            {
              attribute_name: "atomicNumber",
              value: "74",
            },
            {
              attribute_name: "thermalConductivity_Wpmk",
              value: "high",
            },
            {
              attribute_name: "tritiumRetentionTendency",
              value: "very low",
            },
          ],
        },
        {
          temp_id: "mat_beryllium",
          text: "Beryllium plasma-facing material",
          attributes: [
            {
              attribute_name: "materialName",
              value: "beryllium",
            },
            {
              attribute_name: "atomicNumber",
              value: "4",
            },
            {
              attribute_name: "thermalConductivity_Wpmk",
              value: "moderate",
            },
            {
              attribute_name: "tritiumRetentionTendency",
              value: "low",
            },
          ],
        },
        {
          temp_id: "mat_carbon",
          text: "Carbon/CFC plasma-facing material",
          attributes: [
            {
              attribute_name: "materialName",
              value: "carbon/CFC",
            },
            {
              attribute_name: "atomicNumber",
              value: "6",
            },
            {
              attribute_name: "thermalConductivity_Wpmk",
              value: "high for CFC",
            },
            {
              attribute_name: "tritiumRetentionTendency",
              value: "high due to co-deposition",
            },
          ],
        },
        {
          temp_id: "sput_physical",
          text: "Physical sputtering",
          attributes: [
            {
              attribute_name: "sputteringType",
              value: "physical",
            },
            {
              attribute_name: "sputteringYield",
              value: "material and ion-energy dependent",
            },
          ],
        },
        {
          temp_id: "sput_chemical",
          text: "Chemical sputtering",
          attributes: [
            {
              attribute_name: "sputteringType",
              value: "chemical",
            },
            {
              attribute_name: "sputteringYield",
              value: "important for carbon in hydrogen plasmas",
            },
          ],
        },
        {
          temp_id: "driver_nif",
          text: "NIF laser driver",
          attributes: [
            {
              attribute_name: "driverType",
              value: "laser",
            },
            {
              attribute_name: "peakPower",
              value: "petawatt-class pulse power",
            },
          ],
        },
        {
          temp_id: "driver_lmj",
          text: "Laser Mégajoule driver",
          attributes: [
            {
              attribute_name: "driverType",
              value: "laser",
            },
            {
              attribute_name: "peakPower",
              value: "high-power multi-beam laser",
            },
          ],
        },
        {
          temp_id: "target_dt_layered",
          text: "D-T cryogenic layered ICF target",
          attributes: [
            {
              attribute_name: "fuelComposition",
              value: "D-T",
            },
            {
              attribute_name: "targetDiameter",
              value: "about millimetre scale",
            },
          ],
        },
        {
          temp_id: "target_hohlraum",
          text: "Indirect-drive hohlraum target",
          attributes: [
            {
              attribute_name: "fuelComposition",
              value: "D-T capsule in hohlraum",
            },
            {
              attribute_name: "targetDiameter",
              value: "millimetre scale capsule",
            },
          ],
        },
        {
          temp_id: "comp_central_solenoid",
          text: "Central solenoid",
          attributes: [
            {
              attribute_name: "componentName",
              value: "central solenoid",
            },
            {
              attribute_name: "componentFunction",
              value: "inductive plasma current drive and flux swing",
            },
          ],
        },
        {
          temp_id: "comp_tf_coil",
          text: "Toroidal field coil",
          attributes: [
            {
              attribute_name: "componentName",
              value: "toroidal field coil",
            },
            {
              attribute_name: "componentFunction",
              value: "generates toroidal magnetic field",
            },
          ],
        },
        {
          temp_id: "comp_pf_coil",
          text: "Poloidal field coil",
          attributes: [
            {
              attribute_name: "componentName",
              value: "poloidal field coil",
            },
            {
              attribute_name: "componentFunction",
              value: "plasma shaping and position control",
            },
          ],
        },
        {
          temp_id: "comp_vessel",
          text: "Vacuum vessel",
          attributes: [
            {
              attribute_name: "componentName",
              value: "vacuum vessel",
            },
            {
              attribute_name: "componentFunction",
              value: "vacuum boundary and structural support",
            },
          ],
        },
        {
          temp_id: "comp_blanket",
          text: "Breeding blanket / first-wall system",
          attributes: [
            {
              attribute_name: "componentName",
              value: "blanket",
            },
            {
              attribute_name: "componentFunction",
              value:
                "neutron energy capture and tritium breeding in reactor concepts",
            },
          ],
        },
        {
          temp_id: "current_icrf",
          text: "Fast-wave ICRF current drive mechanism",
          attributes: [
            {
              attribute_name: "driveType",
              value: "ICRF-CD",
            },
            {
              attribute_name: "currentFraction",
              value: "limited and scenario dependent",
            },
          ],
        },
        {
          temp_id: "ign_dhe3",
          text: "D-He3 ignition condition",
          attributes: [
            {
              attribute_name: "minTemperature",
              value: "higher than D-T",
            },
            {
              attribute_name: "minTripleProduct",
              value: "higher than D-T",
            },
          ],
        },
        {
          temp_id: "ign_pb11",
          text: "p-B11 ignition condition",
          attributes: [
            {
              attribute_name: "minTemperature",
              value: "much higher than D-T",
            },
            {
              attribute_name: "minTripleProduct",
              value: "much higher than D-T",
            },
          ],
        },
        {
          temp_id: "mode_itb_advanced",
          text: "Advanced confinement regime with internal transport barrier",
          attributes: [
            {
              attribute_name: "modeLabel",
              value: "ITB / advanced confinement",
            },
          ],
        },
      ],
      facts: [
        {
          subject_temp_id: "rx_dt",
          relation_text: "usesFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion reactions",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dd_n",
          relation_text: "usesFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion reactions",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dd_p",
          relation_text: "usesFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion reactions",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dt",
          relation_text: "usesFuel",
          object_temp_id: "fuel_tritium",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.95,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dhe3",
          relation_text: "usesFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion reactions",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dhe3",
          relation_text: "usesFuel",
          object_temp_id: "fuel_helium3",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_pb11",
          relation_text: "usesFuel",
          object_temp_id: "fuel_proton",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "advanced fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_pb11",
          relation_text: "usesFuel",
          object_temp_id: "fuel_boron11",
          subjectClassName: "FusionReaction",
          objectClassName: "FusionFuel",
          relationName: "usesFuel",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "advanced fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_dt",
          relation_text: "hasIgnitionCondition",
          object_temp_id: "ign_dt",
          subjectClassName: "FusionReaction",
          objectClassName: "IgnitionCondition",
          relationName: "hasIgnitionCondition",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "Fusion basics",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "dev_iter",
          relation_text: "operatesIn",
          object_temp_id: "mode_h",
          subjectClassName: "FusionDevice",
          objectClassName: "ConfinementMode",
          relationName: "operatesIn",
          confidence: 0.78,
          isCrossChapter: true,
          evidence: {
            quote: "ITER",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "transport_turbulent",
          relation_text: "drivenBy",
          object_temp_id: "micro_itg",
          subjectClassName: "TurbulentTransport",
          objectClassName: "Microinstability",
          relationName: "drivenBy",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Ion temperature gradient instabilities",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "transport_turbulent",
          relation_text: "drivenBy",
          object_temp_id: "micro_tem",
          subjectClassName: "TurbulentTransport",
          objectClassName: "Microinstability",
          relationName: "drivenBy",
          confidence: 0.88,
          isCrossChapter: false,
          evidence: {
            quote: "Trapped particle instabilities",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "transport_turbulent",
          relation_text: "drivenBy",
          object_temp_id: "micro_etg",
          subjectClassName: "TurbulentTransport",
          objectClassName: "Microinstability",
          relationName: "drivenBy",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "Electron temperature gradient instability",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "tau_e_iter",
          relation_text: "governedByScalingLaw",
          object_temp_id: "scaling_ipb98",
          subjectClassName: "EnergyConfinementTime",
          objectClassName: "ConfinementScalingLaw",
          relationName: "governedByScalingLaw",
          confidence: 0.88,
          isCrossChapter: false,
          evidence: {
            quote: "H-mode confinement trends and scalings",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "tau_e_lmode",
          relation_text: "governedByScalingLaw",
          object_temp_id: "scaling_iter89",
          subjectClassName: "EnergyConfinementTime",
          objectClassName: "ConfinementScalingLaw",
          relationName: "governedByScalingLaw",
          confidence: 0.82,
          isCrossChapter: false,
          evidence: {
            quote: "Ohmic and L-mode plasma confinement trends",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "mode_h",
          relation_text: "hasTransportBarrier",
          object_temp_id: "barrier_etb",
          subjectClassName: "ConfinementMode",
          objectClassName: "TransportBarrier",
          relationName: "hasTransportBarrier",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "edge transport barrier",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "operatesIn",
          object_temp_id: "mode_h",
          subjectClassName: "Tokamak",
          objectClassName: "ConfinementMode",
          relationName: "operatesIn",
          confidence: 0.75,
          isCrossChapter: true,
          evidence: {
            quote: "H-mode confinement trends and scalings",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "tok_jet",
          relation_text: "operatesIn",
          object_temp_id: "mode_h",
          subjectClassName: "Tokamak",
          objectClassName: "ConfinementMode",
          relationName: "operatesIn",
          confidence: 0.72,
          isCrossChapter: true,
          evidence: {
            quote: "H-mode confinement trends and scalings",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "mfc_tokamak",
          relation_text: "containsFluxSurface",
          object_temp_id: "flux_nested",
          subjectClassName: "MagneticFieldConfiguration",
          objectClassName: "MagneticFluxSurface",
          relationName: "containsFluxSurface",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "Tokamak equilibrium",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "mfc_tokamak",
          relation_text: "containsFluxSurface",
          object_temp_id: "flux_q1",
          subjectClassName: "MagneticFieldConfiguration",
          objectClassName: "MagneticFluxSurface",
          relationName: "containsFluxSurface",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "safety factor",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "mfc_tokamak",
          relation_text: "containsFluxSurface",
          object_temp_id: "flux_q2",
          subjectClassName: "MagneticFieldConfiguration",
          objectClassName: "MagneticFluxSurface",
          relationName: "containsFluxSurface",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "rational q surfaces",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "flux_q1",
          relation_text: "hasSafetyFactor",
          object_temp_id: "q1",
          subjectClassName: "MagneticFluxSurface",
          objectClassName: "SafetyFactor",
          relationName: "hasSafetyFactor",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "q < 1",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "flux_q2",
          relation_text: "hasSafetyFactor",
          object_temp_id: "q2",
          subjectClassName: "MagneticFluxSurface",
          objectClassName: "SafetyFactor",
          relationName: "hasSafetyFactor",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "q=2",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "flux_nested",
          relation_text: "hasSafetyFactor",
          object_temp_id: "q_profile",
          subjectClassName: "MagneticFluxSurface",
          objectClassName: "SafetyFactor",
          relationName: "hasSafetyFactor",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "safety factor",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "mhd_kink",
          relation_text: "causesDisruption",
          object_temp_id: "disruption_major",
          subjectClassName: "MHDInstability",
          objectClassName: "PlasmaDisruption",
          relationName: "causesDisruption",
          confidence: 0.84,
          isCrossChapter: false,
          evidence: {
            quote: "Disruptive instabilities",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "mhd_tearing",
          relation_text: "causesDisruption",
          object_temp_id: "disruption_major",
          subjectClassName: "MHDInstability",
          objectClassName: "PlasmaDisruption",
          relationName: "causesDisruption",
          confidence: 0.82,
          isCrossChapter: false,
          evidence: {
            quote: "Classical tearing modes",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "mhd_ntm",
          relation_text: "causesDisruption",
          object_temp_id: "disruption_major",
          subjectClassName: "MHDInstability",
          objectClassName: "PlasmaDisruption",
          relationName: "causesDisruption",
          confidence: 0.82,
          isCrossChapter: false,
          evidence: {
            quote: "Neoclassical tearing modes",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "disruption_major",
          relation_text: "mitigatedBy",
          object_temp_id: "mit_mgi",
          subjectClassName: "PlasmaDisruption",
          objectClassName: "DisruptionMitigationMethod",
          relationName: "mitigatedBy",
          confidence: 0.85,
          isCrossChapter: false,
          evidence: {
            quote: "Mitigation methods",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "disruption_major",
          relation_text: "mitigatedBy",
          object_temp_id: "mit_spi",
          subjectClassName: "PlasmaDisruption",
          objectClassName: "DisruptionMitigationMethod",
          relationName: "mitigatedBy",
          confidence: 0.85,
          isCrossChapter: false,
          evidence: {
            quote: "Mitigation methods",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "elm_type_i",
          relation_text: "collapsesBarrier",
          object_temp_id: "barrier_etb",
          subjectClassName: "EdgeLocalizedMode",
          objectClassName: "TransportBarrier",
          relationName: "collapsesBarrier",
          confidence: 0.9,
          isCrossChapter: true,
          evidence: {
            quote: "Edge localized modes",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "diag_thomson",
          relation_text: "measures",
          object_temp_id: "q_electron_temperature",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.95,
          isCrossChapter: false,
          evidence: {
            quote: "Thomson scattering",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_thomson",
          relation_text: "measures",
          object_temp_id: "q_electron_density",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Thomson scattering",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_cxrs",
          relation_text: "measures",
          object_temp_id: "q_ion_temperature",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "charge exchange recombination spectroscopy",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_reflectometry",
          relation_text: "measures",
          object_temp_id: "q_electron_density",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "reflectometry",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_mse",
          relation_text: "measures",
          object_temp_id: "q_safety_profile",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "Motional Stark effect",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_bolometer",
          relation_text: "measures",
          object_temp_id: "q_radiated_power",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.94,
          isCrossChapter: false,
          evidence: {
            quote: "Bolometry",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_neutron",
          relation_text: "measures",
          object_temp_id: "q_neutron_rate",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.94,
          isCrossChapter: false,
          evidence: {
            quote: "Neutrons",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_magnetic",
          relation_text: "measures",
          object_temp_id: "q_current",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "Magnetic measurements",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_ece",
          relation_text: "measures",
          object_temp_id: "q_electron_temperature",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "MeasuredPlasmaQuantity",
          relationName: "measures",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "electron cyclotron emission",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_thomson",
          relation_text: "installedOn",
          object_temp_id: "tok_jet",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "Tokamak",
          relationName: "installedOn",
          confidence: 0.68,
          isCrossChapter: true,
          evidence: {
            quote: "Plasma diagnostics",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "diag_neutron",
          relation_text: "installedOn",
          object_temp_id: "tok_jet",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "Tokamak",
          relationName: "installedOn",
          confidence: 0.66,
          isCrossChapter: true,
          evidence: {
            quote: "Experimental nuclear physics methods",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
        {
          subject_temp_id: "heat_nbi",
          relation_text: "providesCurrentDrive",
          object_temp_id: "current_nbi",
          subjectClassName: "NeutralBeamInjection",
          objectClassName: "CurrentDriveMechanism",
          relationName: "providesCurrentDrive",
          confidence: 0.92,
          isCrossChapter: false,
          evidence: {
            quote: "neutral beam current drive",
            sectionTitle:
              "Chapter 5 — Plasma Heating and Current Drive by Neutral Beam and Alpha Particles",
            paragraphId: "ch5.summary",
            pageFrom: 559,
            pageTo: 632,
          },
        },
        {
          subject_temp_id: "heat_alpha",
          relation_text: "sourceReaction",
          object_temp_id: "rx_dt",
          subjectClassName: "AlphaParticleHeating",
          objectClassName: "FusionReaction",
          relationName: "sourceReaction",
          confidence: 0.94,
          isCrossChapter: true,
          evidence: {
            quote: "Alpha heating",
            sectionTitle:
              "Chapter 5 — Plasma Heating and Current Drive by Neutral Beam and Alpha Particles",
            paragraphId: "ch5.summary",
            pageFrom: 559,
            pageTo: 632,
          },
        },
        {
          subject_temp_id: "tok_tftr",
          relation_text: "operatesIn",
          object_temp_id: "mode_h",
          subjectClassName: "Tokamak",
          objectClassName: "ConfinementMode",
          relationName: "operatesIn",
          confidence: 0.6,
          isCrossChapter: true,
          evidence: {
            quote: "D-T experiments in large tokamaks",
            sectionTitle:
              "Chapter 5 — Plasma Heating and Current Drive by Neutral Beam and Alpha Particles",
            paragraphId: "ch5.summary",
            pageFrom: 559,
            pageTo: 632,
          },
        },
        {
          subject_temp_id: "heat_lhcd",
          relation_text: "providesCurrentDrive",
          object_temp_id: "current_lhcd",
          subjectClassName: "LowerHybridCurrentDrive",
          objectClassName: "CurrentDriveMechanism",
          relationName: "providesCurrentDrive",
          confidence: 0.95,
          isCrossChapter: false,
          evidence: {
            quote: "Lower hybrid current drive",
            sectionTitle:
              "Chapter 6 — Radiofrequency Waves, Heating and Current Drive",
            paragraphId: "ch6.summary",
            pageFrom: 633,
            pageTo: 779,
          },
        },
        {
          subject_temp_id: "heat_ech",
          relation_text: "providesCurrentDrive",
          object_temp_id: "current_eccd",
          subjectClassName: "ElectronCyclotronHeating",
          objectClassName: "CurrentDriveMechanism",
          relationName: "providesCurrentDrive",
          confidence: 0.95,
          isCrossChapter: false,
          evidence: {
            quote: "Electron cyclotron current drive",
            sectionTitle:
              "Chapter 6 — Radiofrequency Waves, Heating and Current Drive",
            paragraphId: "ch6.summary",
            pageFrom: 633,
            pageTo: 779,
          },
        },
        {
          subject_temp_id: "sput_physical",
          relation_text: "erodes",
          object_temp_id: "mat_tungsten",
          subjectClassName: "Sputtering",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "erodes",
          confidence: 0.84,
          isCrossChapter: false,
          evidence: {
            quote: "Physical sputtering",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "sput_physical",
          relation_text: "erodes",
          object_temp_id: "mat_beryllium",
          subjectClassName: "Sputtering",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "erodes",
          confidence: 0.84,
          isCrossChapter: false,
          evidence: {
            quote: "Physical sputtering",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "sput_chemical",
          relation_text: "erodes",
          object_temp_id: "mat_carbon",
          subjectClassName: "Sputtering",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "erodes",
          confidence: 0.9,
          isCrossChapter: false,
          evidence: {
            quote: "Chemical sputtering",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "pfc_divtarget",
          relation_text: "madeOf",
          object_temp_id: "mat_tungsten",
          subjectClassName: "PlasmaFacingComponent",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "madeOf",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "High-Z materials",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "pfc_firstwall",
          relation_text: "madeOf",
          object_temp_id: "mat_beryllium",
          subjectClassName: "PlasmaFacingComponent",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "madeOf",
          confidence: 0.82,
          isCrossChapter: false,
          evidence: {
            quote: "Beryllium",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "pfc_limiter",
          relation_text: "madeOf",
          object_temp_id: "mat_carbon",
          subjectClassName: "PlasmaFacingComponent",
          objectClassName: "PlasmaFacingMaterial",
          relationName: "madeOf",
          confidence: 0.78,
          isCrossChapter: false,
          evidence: {
            quote: "Carbon containing materials",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "pfc_divtarget",
          relation_text: "partOf",
          object_temp_id: "tok_iter",
          subjectClassName: "PlasmaFacingComponent",
          objectClassName: "Tokamak",
          relationName: "partOf",
          confidence: 0.78,
          isCrossChapter: true,
          evidence: {
            quote: "Divertors",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "pfc_firstwall",
          relation_text: "partOf",
          object_temp_id: "tok_iter",
          subjectClassName: "PlasmaFacingComponent",
          objectClassName: "Tokamak",
          relationName: "partOf",
          confidence: 0.75,
          isCrossChapter: true,
          evidence: {
            quote: "first wall",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "div_iter",
          relation_text: "receivesScrapeOffLayer",
          object_temp_id: "sol_iter",
          subjectClassName: "Divertor",
          objectClassName: "ScrapeOffLayer",
          relationName: "receivesScrapeOffLayer",
          confidence: 0.92,
          isCrossChapter: false,
          evidence: {
            quote: "scrape-off layer",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "elm_type_i",
          relation_text: "depositsHeatLoad",
          object_temp_id: "pfc_divtarget",
          subjectClassName: "EdgeLocalizedMode",
          objectClassName: "PlasmaFacingComponent",
          relationName: "depositsHeatLoad",
          confidence: 0.88,
          isCrossChapter: true,
          evidence: {
            quote: "Transient energy deposition during ELMs",
            sectionTitle: "Chapter 7 — Plasma–Wall Interactions",
            paragraphId: "ch7.summary",
            pageFrom: 780,
            pageTo: 870,
          },
        },
        {
          subject_temp_id: "mfc_stellarator",
          relation_text: "containsFluxSurface",
          object_temp_id: "flux_nested",
          subjectClassName: "MagneticFieldConfiguration",
          objectClassName: "MagneticFluxSurface",
          relationName: "containsFluxSurface",
          confidence: 0.88,
          isCrossChapter: false,
          evidence: {
            quote: "3-D toroidal flux surfaces",
            sectionTitle: "Chapter 8 — Helical Confinement Concepts",
            paragraphId: "ch8.summary",
            pageFrom: 871,
            pageTo: 981,
          },
        },
        {
          subject_temp_id: "diag_ece",
          relation_text: "installedOn",
          object_temp_id: "stel_w7x",
          subjectClassName: "PassiveDiagnosticMethod",
          objectClassName: "Stellarator",
          relationName: "installedOn",
          confidence: 0.5,
          isCrossChapter: true,
          evidence: {
            quote: "Electron cyclotron heating and current drive",
            sectionTitle: "Chapter 8 — Helical Confinement Concepts",
            paragraphId: "ch8.summary",
            pageFrom: 871,
            pageTo: 981,
          },
        },
        {
          subject_temp_id: "mfc_rfp",
          relation_text: "containsFluxSurface",
          object_temp_id: "flux_nested",
          subjectClassName: "MagneticFieldConfiguration",
          objectClassName: "MagneticFluxSurface",
          relationName: "containsFluxSurface",
          confidence: 0.75,
          isCrossChapter: false,
          evidence: {
            quote: "Reversed field pinch",
            sectionTitle:
              "Chapter 9 — The Broader Spectrum of Magnetic Configurations for Fusion",
            paragraphId: "ch9.summary",
            pageFrom: 982,
            pageTo: 1066,
          },
        },
        {
          subject_temp_id: "approach_icf",
          relation_text: "usesDriver",
          object_temp_id: "driver_nif",
          subjectClassName: "InertialConfinementFusion",
          objectClassName: "ICFDriver",
          relationName: "usesDriver",
          confidence: 0.93,
          isCrossChapter: false,
          evidence: {
            quote: "NIF",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "approach_icf",
          relation_text: "usesDriver",
          object_temp_id: "driver_lmj",
          subjectClassName: "InertialConfinementFusion",
          objectClassName: "ICFDriver",
          relationName: "usesDriver",
          confidence: 0.87,
          isCrossChapter: false,
          evidence: {
            quote: "Laser Mega Joule",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "approach_icf",
          relation_text: "usesTarget",
          object_temp_id: "target_dt_layered",
          subjectClassName: "InertialConfinementFusion",
          objectClassName: "ICFTarget",
          relationName: "usesTarget",
          confidence: 0.94,
          isCrossChapter: false,
          evidence: {
            quote: "fuel target",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "approach_icf",
          relation_text: "usesTarget",
          object_temp_id: "target_hohlraum",
          subjectClassName: "InertialConfinementFusion",
          objectClassName: "ICFTarget",
          relationName: "usesTarget",
          confidence: 0.83,
          isCrossChapter: false,
          evidence: {
            quote: "indirect drive implosion",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "target_dt_layered",
          relation_text: "containsFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "ICFTarget",
          objectClassName: "FusionFuel",
          relationName: "containsFuel",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "D-T",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "target_dt_layered",
          relation_text: "containsFuel",
          object_temp_id: "fuel_tritium",
          subjectClassName: "ICFTarget",
          objectClassName: "FusionFuel",
          relationName: "containsFuel",
          confidence: 0.91,
          isCrossChapter: false,
          evidence: {
            quote: "D-T",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "target_hohlraum",
          relation_text: "containsFuel",
          object_temp_id: "fuel_deuterium",
          subjectClassName: "ICFTarget",
          objectClassName: "FusionFuel",
          relationName: "containsFuel",
          confidence: 0.83,
          isCrossChapter: false,
          evidence: {
            quote: "D-T capsule",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "target_hohlraum",
          relation_text: "containsFuel",
          object_temp_id: "fuel_tritium",
          subjectClassName: "ICFTarget",
          objectClassName: "FusionFuel",
          relationName: "containsFuel",
          confidence: 0.83,
          isCrossChapter: false,
          evidence: {
            quote: "D-T capsule",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "rx_dt",
          relation_text: "hasIgnitionCondition",
          object_temp_id: "ign_icf",
          subjectClassName: "FusionReaction",
          objectClassName: "IgnitionCondition",
          relationName: "hasIgnitionCondition",
          confidence: 0.78,
          isCrossChapter: true,
          evidence: {
            quote: "Ignition conditions",
            sectionTitle: "Chapter 10 — Inertial Fusion Energy",
            paragraphId: "ch10.summary",
            pageFrom: 1067,
            pageTo: 1142,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "hasComponent",
          object_temp_id: "comp_central_solenoid",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.86,
          isCrossChapter: false,
          evidence: {
            quote: "central solenoid",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "hasComponent",
          object_temp_id: "comp_tf_coil",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.88,
          isCrossChapter: false,
          evidence: {
            quote: "toroidal field",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "hasComponent",
          object_temp_id: "comp_pf_coil",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.82,
          isCrossChapter: false,
          evidence: {
            quote: "poloidal field system",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "hasComponent",
          object_temp_id: "comp_vessel",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.8,
          isCrossChapter: false,
          evidence: {
            quote: "tokamak configuration",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "tok_iter",
          relation_text: "hasComponent",
          object_temp_id: "comp_blanket",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.66,
          isCrossChapter: true,
          evidence: {
            quote: "fusion technology",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "tok_jet",
          relation_text: "hasComponent",
          object_temp_id: "comp_tf_coil",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.75,
          isCrossChapter: false,
          evidence: {
            quote: "Basic tokamak configuration",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "tok_jet",
          relation_text: "hasComponent",
          object_temp_id: "comp_vessel",
          subjectClassName: "Tokamak",
          objectClassName: "TokamakComponent",
          relationName: "hasComponent",
          confidence: 0.7,
          isCrossChapter: false,
          evidence: {
            quote: "Basic tokamak configuration",
            sectionTitle:
              "Chapter 3 — Equilibrium and Macroscopic Stability of Tokamaks",
            paragraphId: "ch3.summary",
            pageFrom: 248,
            pageTo: 382,
          },
        },
        {
          subject_temp_id: "heat_icrh",
          relation_text: "providesCurrentDrive",
          object_temp_id: "current_icrf",
          subjectClassName: "IonCyclotronResonanceHeating",
          objectClassName: "CurrentDriveMechanism",
          relationName: "providesCurrentDrive",
          confidence: 0.72,
          isCrossChapter: false,
          evidence: {
            quote: "current drive by the fast ICRF waves",
            sectionTitle:
              "Chapter 6 — Radiofrequency Waves, Heating and Current Drive",
            paragraphId: "ch6.summary",
            pageFrom: 633,
            pageTo: 779,
          },
        },
        {
          subject_temp_id: "rx_dhe3",
          relation_text: "hasIgnitionCondition",
          object_temp_id: "ign_dhe3",
          subjectClassName: "FusionReaction",
          objectClassName: "IgnitionCondition",
          relationName: "hasIgnitionCondition",
          confidence: 0.72,
          isCrossChapter: false,
          evidence: {
            quote: "advanced fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "rx_pb11",
          relation_text: "hasIgnitionCondition",
          object_temp_id: "ign_pb11",
          subjectClassName: "FusionReaction",
          objectClassName: "IgnitionCondition",
          relationName: "hasIgnitionCondition",
          confidence: 0.7,
          isCrossChapter: false,
          evidence: {
            quote: "advanced fuels",
            sectionTitle: "Chapter 1 — The Case for Fusion",
            paragraphId: "ch1.summary",
            pageFrom: 24,
            pageTo: 81,
          },
        },
        {
          subject_temp_id: "mode_itb_advanced",
          relation_text: "hasTransportBarrier",
          object_temp_id: "barrier_itb",
          subjectClassName: "ConfinementMode",
          objectClassName: "TransportBarrier",
          relationName: "hasTransportBarrier",
          confidence: 0.8,
          isCrossChapter: false,
          evidence: {
            quote: "Transport barriers",
            sectionTitle: "Chapter 2 — Physics of Confinement",
            paragraphId: "ch2.summary",
            pageFrom: 82,
            pageTo: 247,
          },
        },
        {
          subject_temp_id: "diag_reflectometry",
          relation_text: "installedOn",
          object_temp_id: "tok_iter",
          subjectClassName: "ActiveDiagnosticMethod",
          objectClassName: "Tokamak",
          relationName: "installedOn",
          confidence: 0.62,
          isCrossChapter: true,
          evidence: {
            quote: "reflectometry",
            sectionTitle: "Chapter 4 — Plasma Diagnostics",
            paragraphId: "ch4.summary",
            pageFrom: 383,
            pageTo: 558,
          },
        },
      ],
    })
  }),
]
