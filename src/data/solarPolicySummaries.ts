interface SolarPolicySummary {
    region: string;
    latitude: number;
    longitude: number;
    netMeteringPolicy: string;
    fact: string;
  }
  
  export const solarPolicySummaries: SolarPolicySummary[] = [
    {
      region: "Goa",
      latitude: 15.2993,
      longitude: 74.1240,
      netMeteringPolicy: "Net metering up to 500 kWp; system size can be up to 100% of sanctioned load; half-yearly settlement; no wheeling, banking, or cross-subsidy charges.",
      fact: "Goa, despite being a top tourist destination known for its beaches and vibrant heritage, remains significantly underutilized in terms of solar energy. With an installed capacity of merely 0.05 MW by FY 2016/17, the state struggles to find suitable land for large solar plants and aims to leverage creative solutions like canal-top panels to meet its ambitious 150 MW target by 2022."
    },
    {
      region: "Dadra & Nagar Haveli",
      latitude: 20.1809,
      longitude: 73.0169,
      netMeteringPolicy: "Net metering up to 500 kWp; system size can match sanctioned load; half-yearly settlement; exempted from wheeling, banking, and cross-subsidy charges.",
      fact: "Dadra & Nagar Haveli, a small Union Territory nestled between Gujarat and Maharashtra, exhibits one of the highest per capita power consumptions in India, driven predominantly by industrial usage. While currently lagging in solar capacity, the region’s inclusion in the Power for All Program and planned procurement of over 94 MW of solar power indicate a strategic move towards cleaner, uninterrupted energy supply."
    },
    {
      region: "Jammu & Kashmir",
      latitude: 34.0837,
      longitude: 74.7973,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; max 50% of sanctioned load; annual settlement; 20% DT capacity limit.",
      fact: "Jammu & Kashmir, renowned for its breathtaking landscapes and tourism, possesses the second highest solar potential in India (over 111 GW), yet has commissioned only a single megawatt of solar power. The lack of rapid advancement is attributed to complex administrative hurdles, indicating a need for streamlined policy measures and infrastructure development to harness the immense solar resource found in areas like Ladakh, celebrated as India’s ‘Solar Capital’."
    },
    {
      region: "Kerala",
      latitude: 10.8505,
      longitude: 76.2711,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; up to 30% DT capacity at LT and 80% at HT; annual settlement; no banking or cross-subsidy charges.",
      fact: "Kerala, admired for its scenic backwaters and progressive social indicators, shows modest growth in solar capacity with just over 15 MW commissioned by FY 2016/17. While slow on large-scale adoption, the state’s innovative projects, like the solar-powered boat 'Aditya' and ANERT’s 2 MW solar plant, exemplify a forward-thinking approach that integrates renewable energy into daily life and transport."
    },
    {
      region: "Assam",
      latitude: 26.2006,
      longitude: 92.9376,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 80% of sanctioned load; annual settlement at APPC; 20% DT capacity limit.",
      fact: "Assam, famed for its lush tea gardens and rich biodiversity, made a remarkable leap from zero to 11.18 MW of solar capacity within a year. With relatively low per capita electricity demand in the Northeast, solar energy is poised to become a primary and reliable resource, supported by higher subsidies and policies that encourage households and institutions to feed surplus solar energy back to the grid."
    },
    {
      region: "Uttarakhand",
      latitude: 30.0668,
      longitude: 79.0193,
      netMeteringPolicy: "Net metering up to 500 kWp (without battery) or 100 kWp (with battery); annual settlement; exemptions from wheeling and cross-subsidy.",
      fact: "Uttarakhand, a Himalayan state renowned for its pilgrimage sites and serene mountain vistas, is actively fostering a solar ecosystem that supports local farmers and rural communities. By offering fixed tariffs for farmers who generate and sell solar power, the state not only aims to increase its renewable energy share but also empowers agricultural stakeholders, enhancing their economic resilience and environmental stewardship."
    },
    {
      region: "Maharashtra",
      latitude: 19.7515,
      longitude: 75.7139,
      netMeteringPolicy: "Net metering up to 1 MWp; system size up to 100% of sanctioned load; annual settlement; DT capacity limit at 40%.",
      fact: "Maharashtra, India’s financial powerhouse, leads in solar adoption with over 430 MW commissioned. The state’s policies facilitate rooftop installations across residential, commercial, and public sectors, while landmark projects like the 125 MW Sakri Solar Plant and innovative incentives for government buildings, societies, and historical places (like the Shirdi shrine) underline its commitment to mainstreaming solar energy."
    },
    {
      region: "Sikkim",
      latitude: 27.5330,
      longitude: 88.5122,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 80% of sanctioned load; annual settlement; no banking or cross-subsidy.",
      fact: "Sikkim, India’s least populous and ecologically rich state, has barely scratched the surface of its 4,940 MW solar potential, having installed just 0.01 MW so far. Despite the slow start, ongoing efforts—backed by high subsidies, small demonstration projects, and a recognition of solar’s role in remote mountainous areas—aim to integrate solar solutions into the state’s sustainable development strategy."
    },
    {
      region: "Manipur",
      latitude: 24.6637,
      longitude: 93.9063,
      netMeteringPolicy: "Net metering from 1 kWp to 1000 kWp; system size up to 100% of sanctioned load; annual settlement; 40% DT capacity limit.",
      fact: "Manipur, nestled in the lush hills of Northeast India, currently operates at a mere 0.01 MW of solar capacity but has ambitious plans aligned with the national solar mission. Faced with challenging terrains and distributed settlements, the state’s strategy includes leveraging high subsidies, net metering, and a proactive solar policy to ensure that even remote communities can harness clean, reliable energy."
    },
    {
      region: "Mizoram",
      latitude: 23.1645,
      longitude: 92.9376,
      netMeteringPolicy: "Net metering from 1 kWp to 1000 kWp; system size up to 100% of sanctioned load; annual settlement; 40% DT capacity limit.",
      fact: "Mizoram, characterized by its hilly terrain and culturally vibrant communities, stands at a modest 0.10 MW solar capacity. Determined to transform this scenario, the state’s solar policy mandates installations in government buildings and provides supportive frameworks, aiming to exploit its 9 GW potential and adapt solar solutions to local topography, thereby strengthening rural electrification and energy independence."
    },
    {
      region: "Gujarat",
      latitude: 22.2587,
      longitude: 71.1924,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 100% of sanctioned load; annual settlement; 30% DT capacity limit.",
      fact: "Gujarat, often hailed as a solar pioneer, boasts over 2.6 GW of solar capacity and stands at the forefront of India’s renewable revolution. Its visionary approach—exemplified by the renowned Charanka Solar Park, strong policy frameworks, successful awareness campaigns, and proactive industrial participation—has turned the state into a global model for scalable, economically viable solar installations."
    },
    {
      region: "Tripura",
      latitude: 23.9408,
      longitude: 91.9882,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 100% of sanctioned load; annual settlement; 40% DT capacity limit.",
      fact: "Tripura’s terrain, with dense forests and challenging monsoons, once limited conventional grid expansion, pushing the state to see solar as a transformative resource. With around 5 MW already commissioned, Tripura’s strategy involves powering remote villages, markets, and public places with solar solutions, aiming to build a resilient, off-grid capable infrastructure that empowers communities and bolsters local economies."
    },
    {
      region: "Karnataka",
      latitude: 15.3173,
      longitude: 75.7139,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 150% of sanctioned load; annual settlement.",
      fact: "Karnataka, home to the vibrant tech hub of Bengaluru, has rapidly ascended as a solar heavyweight with over 341 MW commissioned by early 2017. The state’s ambitious 6000 MW target by 2021, farmer-friendly ‘Surya Raitha’ program, and extensive solar parks highlight its balanced approach—where policy incentives, resource availability, and entrepreneurial innovation coalesce to steer a clean energy renaissance."
    },
    {
      region: "Haryana",
      latitude: 29.0588,
      longitude: 76.0856,
      netMeteringPolicy: "Net metering up to 2 MW; system size up to 100% of sanctioned load; annual settlement; 50% DT capacity limit.",
      fact: "Haryana, an agriculturally prosperous and industrially dynamic state, has embraced solar power to reduce dependency on conventional energy and address environmental concerns. Mandates for rooftop installations on large residential buildings, substantial subsidies for solar pumps, and exemption of multiple charges underscore the government’s multifaceted strategy to integrate solar power seamlessly into its urban and rural ecosystems."
    },
    {
      region: "Andhra Pradesh",
      latitude: 15.9129,
      longitude: 79.7400,
      netMeteringPolicy: "Net metering up to 1 MWp; system size up to 100% of sanctioned load; half-yearly settlement; 60% DT limit at LT and 100% at HT.",
      fact: "Andhra Pradesh, with its robust infrastructure and investment-friendly climate, harnesses nearly 980 MW of solar energy and aspires to scale up dramatically. Its planned 4,000 MW solar parks, strategic geographical location, abundant land availability, and streamlined regulatory processes propel the state towards becoming a major national hub for sustainable power generation, benefiting both urban centers and rural communities."
    },
    {
      region: "Puducherry",
      latitude: 11.9416,
      longitude: 79.8083,
      netMeteringPolicy: "Net metering up to 500 kWp; system size up to 100% of sanctioned load; half-yearly settlement; 30% DT capacity limit.",
      fact: "Puducherry, a Union Territory known for its French colonial heritage and picturesque beaches, envisions transitioning into a solar-centric region by 2025. Though currently standing at a modest 0.03 MW capacity, its solar policy aims at widespread adoption of net-metered rooftop systems, forging PPAs with outside plants, and encouraging commercial establishments to install solar water heaters to gradually reshape its energy mix."
    },
    {
      region: "Chandigarh",
      latitude: 30.7333,
      longitude: 76.7794,
      netMeteringPolicy: "Net metering up to 500 kWp; system size up to 100% of sanctioned load; annual settlement; 75% DT capacity limit.",
      fact: "Chandigarh, renowned as one of India’s best-planned cities, seamlessly integrates solar power into its urban fabric. Declared a model solar city, it has installed over 16 MW, including a pioneering floating solar installation. With a 30% subsidy on rooftop systems and active community engagement, the city showcases how targeted incentives and careful urban planning can drive sustained solar growth."
    },
    {
      region: "Jharkhand",
      latitude: 23.6102,
      longitude: 85.2799,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 100% of sanctioned load; annual settlement; 15% DT capacity limit.",
      fact: "Jharkhand, born of Bihar in 2000, harbors vast mineral wealth and industrial promise. Yet, its solar trajectory remains modest at around 17.51 MW. The state’s ambitious 2650 MW target by 2020, though challenging, may spur policy reforms, improved PPA dynamics, and infrastructural enhancements, ultimately unlocking solar energy as a catalyst for balanced regional development and long-term sustainability."
    },
    {
      region: "Meghalaya",
      latitude: 25.4670,
      longitude: 91.3662,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; annual settlement; 15% DT capacity; no payment if generation exceeds 90% consumption.",
      fact: "Meghalaya, graced with verdant forests and high rainfall, faces natural constraints to solar expansion, reflected in its meager 0.01 MW capacity. Nonetheless, institutions like Loyala College, which achieved 100% solar power, demonstrate the state’s potential to overcome climatic and infrastructural hurdles. With strategic partnerships and careful planning, Meghalaya could leverage solar to supplement hydropower and enhance its energy security."
    },
    {
      region: "Odisha",
      latitude: 20.9517,
      longitude: 85.0985,
      netMeteringPolicy: "Net metering from 1 kWp upwards; system size up to 100% of sanctioned load; annual settlement; 75% DT capacity limit.",
      fact: "Odisha, known for its long coastline and cultural richness, envisions solar power as a linchpin in achieving round-the-clock electricity access. With targets exceeding 2,000 MW and a multifaceted approach spanning utility-scale projects, rooftop systems, and solar over water bodies, the state is mobilizing significant investments to ensure that even its most remote communities gain reliable, affordable, and clean energy."
    },
    {
      region: "West Bengal",
      latitude: 22.9868,
      longitude: 87.8550,
      netMeteringPolicy: "Mandatory rooftop for housing complexes >500 kW load; subsidy as per SECI guidelines (detailed net-metering not fully specified).",
      fact: "West Bengal, a historically significant commercial and cultural hub, currently hovers around 23 MW of solar installations. While land constraints and infrastructural challenges persist, the state’s focus on rooftops and government institutions underscores its commitment to scaling solar. With strategic policies, increased investment, and land-use innovations, West Bengal could substantially elevate its renewable energy portfolio in the coming years."
    },
    {
      region: "Punjab",
      latitude: 31.1471,
      longitude: 75.3412,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 80% of sanctioned load; annual (Oct-Sep) settlement; 30% DT capacity limit.",
      fact: "Punjab, famed for its agricultural prosperity, has proactively tapped into solar, commissioning over 592 MW. Its record-breaking single rooftop plant (11.5 MW), supportive tariffs, and rural electrification initiatives demonstrate that a policy-driven ecosystem—where farmers, large institutions, and private players align—can hasten solar integration, reduce carbon footprints, and reinforce energy security across sectors."
    },
    {
      region: "Himachal Pradesh",
      latitude: 31.1048,
      longitude: 77.1734,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 80% of sanctioned load; annual settlement; 20% DT capacity.",
      fact: "Himachal Pradesh, celebrated for its pristine landscapes and tourism, has only begun its solar journey. Offering one of India’s highest net metering feed-in tariffs, the state seeks to inspire local entrepreneurs, farmers, and youths to invest in decentralized solar projects. Over time, this approach could complement its established hydropower base, contributing to a balanced and robust clean energy mix."
    },
    {
      region: "Bihar",
      latitude: 25.0961,
      longitude: 85.3131,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 100% of sanctioned load; annual settlement; 15% DT capacity limit.",
      fact: "Bihar, one of India’s most populous and historically rich states, has demonstrated solar’s transformative potential through the success of Dharnai—the nation’s first fully solar-powered village. As Bihar’s economy grows and infrastructure improves, solar energy stands as a beacon of hope, especially for rural communities that seek reliable, low-cost electricity to advance education, healthcare, and livelihood opportunities."
    },
    {
      region: "Chhattisgarh",
      latitude: 21.2787,
      longitude: 81.8661,
      netMeteringPolicy: "Net metering from 50 kWp to 1 MWp; system size up to 100% of sanctioned load; annual settlement; 40% DT capacity limit.",
      fact: "Chhattisgarh, a relatively young state endowed with minerals and agricultural productivity, has installed over 135 MW of solar power. Its proactive policies foster off-grid and decentralized systems, fueling innovations like solar irrigation pumps that strengthen rural economies. By developing Raipur and Bilaspur as model solar cities, Chhattisgarh aligns itself with a forward-looking energy agenda that embraces sustainability and inclusivity."
    },
    {
      region: "Madhya Pradesh",
      latitude: 22.9734,
      longitude: 78.6569,
      netMeteringPolicy: "Net metering up to 1000 kWp; system size as per sanctioned load; annual settlement; 30% DT capacity limit.",
      fact: "Madhya Pradesh, historically known as the ‘Heart of India’, has embraced solar with large-scale projects like the Welspun Solar MP Plant (151 MW) and the upcoming 750 MW Rewa plant, poised to become a global benchmark. By streamlining regulations, offering duty exemptions, and improving investor confidence, the state sets an exemplary precedent for leveraging renewables as a driver of economic growth and environmental stewardship."
    },
    {
      region: "Rajasthan",
      latitude: 27.0238,
      longitude: 74.2179,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size up to 80% of sanctioned load; annual settlement; 30% DT capacity limit.",
      fact: "Rajasthan, India’s largest state by area, leverages its abundant sunshine to lead in solar power with over 1,318 MW commissioned. Its sprawling solar parks and efficient approval processes have attracted global attention, turning the Thar Desert into a flourishing renewable energy hub that not only meets local demand but also helps stabilize the country’s overall grid with reliable, clean electricity."
    },
    {
      region: "Tamil Nadu",
      latitude: 11.1271,
      longitude: 78.6569,
      netMeteringPolicy: "Net metering from 1 kWp upwards; system size up to 100% of sanctioned load; annual settlement; 90% DT capacity limit.",
      fact: "Tamil Nadu, a southern powerhouse, boasts the world’s largest solar plant (648 MW by Adani) and leads in solar capacity with nearly 1,591 MW. By complementing robust industrial growth with progressive renewable policies, the state ensures energy security, mitigates pollution in its bustling metros like Chennai, and sets the stage for a green economic model that other regions can emulate."
    },
    {
      region: "Telangana",
      latitude: 17.9689,
      longitude: 79.5941,
      netMeteringPolicy: "Net metering up to 1 MWp; system size up to 100% of sanctioned load; half-yearly settlement; 50% DT capacity limit.",
      fact: "Telangana, a relatively new state, has quickly accelerated its solar capacity through both net and gross metering policies. By tapping into its favorable solar irradiance and simplifying regulations for consumers, the state encourages widespread rooftop adoption. This progressive energy landscape fosters innovation, stimulates local enterprises, and propels Telangana toward a resilient, low-carbon future."
    },
    {
      region: "Uttar Pradesh",
      latitude: 26.8467,
      longitude: 80.9462,
      netMeteringPolicy: "Net metering from 1 kWp to 2 MWp; system size up to 100% of sanctioned load; annual settlement; 75% DT capacity limit.",
      fact: "Uttar Pradesh, India’s most populous state, grapples with immense electricity demand and distribution challenges. By promoting rooftop solar and enforcing policies that push government institutions to install solar, UP endeavors to close the energy gap. Continued policy support, subsidies, and infrastructural improvements have the potential to transform its vast energy-deficit scenario into a robust framework powered significantly by the sun."
    },
    {
      region: "Delhi",
      latitude: 28.7041,
      longitude: 77.1025,
      netMeteringPolicy: "Net metering from 1 kWp to 1 MWp; system size as per sanctioned load; annual settlement; 15% DT capacity limit; GBI of Rs. 2/unit.",
      fact: "Delhi, the national capital facing acute pollution and high energy consumption, aspires to become a ‘Solar City’ with a 1,000 MW target by 2020. Offering generation-based incentives, relaxed building norms, and streamlined permissions, the city encourages rooftop PV installations across homes, offices, and public spaces. By harnessing solar power, Delhi moves closer to cleaner air, a sustainable grid, and a more livable urban environment."
    }
  ];
  