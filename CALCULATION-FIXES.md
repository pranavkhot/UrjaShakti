# Calculation fixes

All report figures now come from one tested function:
`src/utils/solarCalculations.ts`. The tests are in `solarCalculations.test.ts` and run with
`npm test`. Only calculation code and the labels that describe the figures were changed.

## Reviewed example (₹5,500/month, ₹6.10/kWh, 183.32 m² roof, Monocrystalline)

| Figure | Before | After |
|---|---|---|
| System size shown | 6.03 kW ("Required") | Roof potential 26.40 kW · Target 6.03 kW · **Selected 6.50 kW (13 × 500 W)** |
| Generation basis | 6.50 kW (not labelled) | 6.50 kW, labelled: 11,660.45 kWh/yr, 840.77 kWh surplus |
| Annual savings | ₹66,000.05 | ₹66,000.00 (bill before − bill after) |
| Payback | 3.23 years | 3.23 years, shown with the ₹78,000 subsidy |
| 25-year savings | ₹16,50,000 (year 1 × 25) | ₹16,35,119 (year by year, 0.5%/yr panel ageing) |
| CO₂ bar | "9.95 tons · 100%" | "9.95 tonnes CO₂/year avoided", with a 0 t–10 t scale and a caption |

## What changed

1. **Capacity.** The report shows roof potential, target and selected system separately.
   The selected system (whole 500 W panels) is the one priced, and all generation, savings,
   subsidy and payback figures use it. It is now also capped at what fits on the usable roof.
2. **Consumption.** The bill page takes optional *units on your bill* and *fixed charges*.
   With units, consumption is exact. Without them, it is (bill − fixed charges) ÷ state
   tariff. The value is saved unrounded, which removes the ₹0.05 drift.
3. **Savings.** Annual savings = bill before solar − bill after solar. The bill after solar is
   fixed charges plus any units solar does not cover. Net metering is assumed: generation offsets
   usage over the year. Surplus units are not counted as savings (`EXPORT_CREDIT_RATE = 0`).
4. **Payback.** Uses the revised savings, accumulated year by year. The subsidy is shown next to
   it everywhere.
5. **25-year savings.** Added up year by year. Assumptions: 0.5%/yr panel degradation,
   today's tariffs (`TARIFF_ESCALATION_PER_YEAR = 0`), maintenance not deducted.
6. **CO₂.** Shown in tonnes on a labelled scale. The ambiguous percentage is removed.

## Other calculation errors found and fixed

- **Subsidy was worked out on the target (6.03 kW), not the installed system.** PM Surya Ghar pays
  on installed capacity. This was hidden in the example because both sizes are above the 3 kW
  cap. For small systems it under-stated the subsidy (e.g. a 1.7 kW target on a 2.0 kW system:
  ₹51,000 shown, ₹60,000 correct).
- **Panel efficiency was counted twice.** Lower-efficiency panels were given both a larger
  area *and* about 20% less energy per kW. A 500 W panel yields the same kWh whatever its
  efficiency. Efficiency only changes the roof area it needs. Monocrystalline at 20% was
  unaffected. Polycrystalline, thin-film and the 21% panel were mis-sized.
- **"Optimal orientation" came from the sun's position when the roof was traced**, so it
  could say North, East or West depending on the time of day. It now gives the equator-facing
  direction: South in India.
- **Roof screen: NASA irradiance averaged 13 values.** The NASA POWER response includes an
  annual mean (`ANN`) next to the 12 months, and the code treated it as a 13th month. The
  annual value is now used directly.
- **Roof screen: daily energy left out system losses** the report applies (0.8946). Both
  screens now use the same factor. "System Capacity" on that screen is relabelled
  "Roof Potential (max)".
- **Stale figures (BUGS-FOUND #4).** Figures are now derived with `useMemo`, so they always
  match the current data.

## Inputs worth reviewing (not changed)

- `GST_RATE = 0.12`. GST on solar PV modules and systems was cut to 5% in September 2025.
  Change it in `solarCalculations.ts` if 5% applies to your quotes.
- `CO2_KG_PER_KWH = 0.92`. The CEA's recent grid emission factor is about 0.71–0.73 kg/kWh.
