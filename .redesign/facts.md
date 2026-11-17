# What UrjaShakti actually is and does

Every line below is traceable to the code. Nothing here is invented. These are the only facts the
redesigned pages may state.

## The product

- A rooftop solar sizing and savings calculator for homes in India. Figures are in rupees and kWh.
  (src/data/indianTariffRates.ts, src/components/Report/Report.tsx)
- Name: UrjaShakti. (src/components/Header/Header.tsx)
- You sign up and log in with an email address and password; the account holds first name, last
  name and email. (src/components/Signup/Signup.tsx, src/components/Dashboard/Dashboard.tsx)
- The calculator, energy estimate, report and vendor pages are behind the login.
  (src/App.tsx, ProtectedRoute)

## What a user can actually do

1. **Draw their roof on a satellite map.** Search an address, then trace the roof outline on a
   Google satellite map. The app measures the area of the shape in square metres.
   (src/components/Calculator/Calculator.tsx)
2. **Get the roof's solar numbers.** From the drawn area and the location it computes: roof area,
   solar irradiance, system capacity in kW, daily energy, the optimal tilt angle, and the sun's
   azimuth and elevation at that spot. (Calculator.tsx; SunCalc; NREL API key in .env)
3. **Estimate consumption.** Enter the monthly electricity bill in rupees and the number of people
   in the house; the app works out monthly and yearly consumption in kWh using the tariff rate for
   the state. (src/components/ConsumptionCalculator/ConsumptionCalculator.tsx)
4. **Read a full report.** Roof space, usable roof space, monthly and yearly usage, required system
   size, annual production, irradiance, area needed, optimal tilt and orientation, number of 500 W
   units, panel cost, GST, subsidy, cost after subsidy, payback period, annual and 25-year savings,
   loan amount, EMI, total interest, current and post-solar monthly bill, net monthly saving, and a
   production-versus-consumption chart. (src/components/Report/Report.tsx)
5. **Contact installers.** A list of solar partners with representative, location, phone, GST
   number and their product list; a WhatsApp button opens a chat with the vendor.
   (src/components/Vendor/Vendor.tsx)

## Real numbers used by the calculations

| Figure | Value | Source |
|---|---|---|
| Panel efficiency assumed in sizing | 18% | Calculator.tsx:206 |
| Roof coverage ratio (usable roof) | 80% | Calculator.tsx:207, Report.tsx COVERAGE_RATIO |
| Standard irradiance | 1000 W/m² | Calculator.tsx:212 |
| System lifetime used for savings | 25 years | Report.tsx LIFETIME_YEARS |
| CO2 per kWh of grid electricity | 0.92 kg | Report.tsx CO2_EMISSIONS_PER_KWH |
| GST on the system | 12% | Report.tsx GST_RATE |
| Subsidy, up to 2 kW | ₹30,000 per kW | Report.tsx subsidy calculation |
| Subsidy, 2 to 3 kW | ₹60,000 + ₹18,000 per kW above 2 | Report.tsx |
| Subsidy cap | ₹78,000 at 3 kW and above | Report.tsx |
| Default loan down payment | 20% of cost after subsidy | Report.tsx DEFAULT_DOWN_PAYMENT_PERCENT |
| Default loan interest rate | 8.5% per year | Report.tsx DEFAULT_INTEREST_RATE |
| Default loan tenure | 10 years | Report.tsx DEFAULT_LOAN_TENURE_YEARS |
| Panel unit size priced | 500 W | Report.tsx, Vendor.tsx |

Panel types priced in the app: monocrystalline 20% efficiency, polycrystalline 16%, thin-film 14%.
Unit prices run from ₹15,000 to ₹22,000 per 500 W unit depending on type and vendor.
(Report.tsx panelOptionsVictor / panelOptionsPR, Vendor.tsx)

## Coverage

- State electricity tariff rates are stored for Indian states, in ₹ per kWh; examples in the data:
  Maharashtra 7.76, Tamil Nadu 6.50, West Bengal 6.89, Andhra Pradesh 5.97, Delhi 5.80.
  (src/data/indianTariffRates.ts)
- Net-metering policy summaries are stored per state and union territory, each with the system size
  limit, settlement period and charge exemptions. (src/data/solarPolicySummaries.ts)
- The map opens on New Delhi by default. (Calculator.tsx mapCenter)

## What the app does not have

No pricing plans, no customer quotes, no case studies, no published install counts, no team page,
no press. Nothing on the redesigned pages may imply otherwise.

## Photographs

The project ships four photographs in public/images: cal_hero.jpg, house.jpg, solar.jpg,
solar-panel-hero.jpg. Any photograph the design needs beyond these becomes a placeholder slot.
