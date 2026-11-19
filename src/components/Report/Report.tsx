import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Download,
  Zap,
  Sun,
  Home,
  PiggyBank,
  Landmark,
  ReceiptIndianRupee,
  Layers,
  IndianRupee,
  Building2,
  HandCoins,
  Clock,
  FileText,
  Lightbulb,
  Wallet,
  ChartCandlestick,
  BadgeIndianRupee,
  Compass,
  Battery,
  Sunrise,
  Ruler,
  Leaf,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate, Link } from "react-router-dom";
import "./Report.css";
// Presentation only: motion wrappers
import { Reveal, Stagger, StaggerItem } from "../../motion/kit";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Policy & fact related imports
import axios from "axios";
import { solarPolicySummaries } from "../../data/solarPolicySummaries";
import {
  calculateReport,
  ReportResult,
  LIFETIME_YEARS,
  PANEL_UNIT_WATTS,
  GST_RATE,
  CO2_KG_PER_KWH,
  PANEL_DEGRADATION_PER_YEAR,
  TARIFF_ESCALATION_PER_YEAR,
  EXPORT_CREDIT_RATE,
  DEFAULT_DOWN_PAYMENT_PERCENT,
  DEFAULT_INTEREST_RATE,
  DEFAULT_LOAN_TENURE_YEARS,
} from "../../utils/solarCalculations";

// Firebase imports
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

interface TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

interface SolarPolicySummary {
  region: string;
  latitude: number;
  longitude: number;
  netMeteringPolicy: string;
  fact: string;
}

const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ state?: string; country?: string }> => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        format: "jsonv2",
        lat: latitude,
        lon: longitude,
      },
      headers: {
        "Accept-Language": "en",
        "User-Agent": "YourAppName/1.0",
      },
    });

    const address = response.data.address;
    const state = address?.state;
    const country = address?.country;

    return { state, country };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {};
  }
};

function findClosestPolicyRegion(
  latitude: number,
  longitude: number
): SolarPolicySummary | null {
  let closestRegion: SolarPolicySummary | null = null;
  let minDistance = Infinity;

  solarPolicySummaries.forEach((policy) => {
    const dist = Math.sqrt(
      Math.pow(policy.latitude - latitude, 2) +
        Math.pow(policy.longitude - longitude, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestRegion = policy;
    }
  });

  return closestRegion;
}

function findRegionByStateName(stateName: string): SolarPolicySummary | null {
  if (!stateName) return null;

  const normalizedState = stateName.toLowerCase();

  for (const policy of solarPolicySummaries) {
    const normalizedRegion = policy.region.toLowerCase();
    if (
      normalizedRegion.includes(normalizedState) ||
      normalizedState.includes(normalizedRegion)
    ) {
      return policy;
    }
  }

  return null;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="report-tooltip">
        <p className="report-tooltip-label">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="report-tooltip-item"
            style={{ color: entry.fill }}
          >
            {entry.name}: {entry.value} kWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* Display only: Indian digit grouping with the same two-decimal rounding
   toFixed(2) gave. The numbers themselves are untouched. */
const formatINR = (value: number): string =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* Fixed panels produce most over a year when they face the equator: south in
   the northern hemisphere, north in the southern. (The sun's position at the
   moment the roof was traced says nothing about this.) */
function getOptimalOrientation(latitude: number | null | undefined): string {
  if (latitude === null || latitude === undefined || isNaN(latitude)) {
    return "Facing the equator";
  }
  return latitude >= 0 ? "South" : "North";
}

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  dataDescription: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, metrics, dataDescription }) => {
  return (
    <div
      className="report-metric-card"
      data-description={dataDescription}
    >
      <div className="report-metric-card-header">
        <h3 className="report-metric-title">
          {icon}
          {title}
        </h3>
      </div>
      <div className="report-metric-content">
        {metrics.map((metric, index) => (
          <div key={index} className="report-metric-item">
            <span className="report-metric-label">{metric.label}</span>
            <span className="report-metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CarbonFootprintReductionProps {
  reduction: number; // tonnes CO₂ avoided per year
  usageCoveredShare: number; // 0..1, share of the household's usage covered by solar
  co2KgPerKwh: number;
}

const CarbonFootprintReduction: React.FC<CarbonFootprintReductionProps> = ({
  reduction,
  usageCoveredShare,
  co2KgPerKwh,
}) => {
  // Never let it go negative
  const safeReduction = Math.max(reduction, 0);

  // Bar scale: 0 to the next whole 5 tonnes above the value (min 5). The
  // scale is printed under the bar, so the fill reads as tonnes, not as a
  // percentage of anything.
  const maxReduction = Math.max(5, Math.ceil(safeReduction / 5) * 5);
  const fill = Math.min((safeReduction / maxReduction) * 100, 100);
  const coveredPercent = Math.min(Math.max(usageCoveredShare, 0), 1) * 100;

  return (
    <div className="report-carbon-reduction">
      <div className="report-carbon-header">
        <span className="report-carbon-text">
          {safeReduction.toFixed(2)} tonnes CO₂/year
        </span>
        <span className="report-carbon-percentage">avoided</span>
      </div>
      <div
        className="report-carbon-progress"
        role="img"
        aria-label={`${safeReduction.toFixed(2)} of ${maxReduction} tonnes on the scale`}
      >
        <div
          className="report-carbon-progress-bar"
          style={{ width: `${fill}%` }}
        ></div>
      </div>
      <div className="report-carbon-scale" aria-hidden="true">
        <span>0 t</span>
        <span>{maxReduction} t</span>
      </div>
      <p className="report-carbon-note">
        From the {coveredPercent.toFixed(0)}% of your estimated electricity use
        that solar covers, at {co2KgPerKwh} kg CO₂ per grid unit.
      </p>
    </div>
  );
};


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = "report-button base-button";
  const variantClasses =
    variant === "outline" ? "report-button-outline" : "report-button-default";
  const sizeClasses =
    size === "sm"
      ? "report-button-sm"
      : size === "lg"
      ? "report-button-lg"
      : "report-button-md";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`report-card ${className}`} {...props}>
      {children}
    </div>
  );
};

interface ConsumptionData {
  monthlyBill: number;
  occupants: number;
  area: number;
  consumptionFromBill: number; // kWh/month
  tariffRate: number;
  fixedCharges?: number; // ₹/month, absent on older records
  billUnits?: number | null; // kWh/month from the bill, absent on older records
  consumptionSource?: "bill-units" | "estimated-from-bill";
  timestamp: any;
}

interface SolarData {
  area: number; 
  irradiance: number; 
  capacity: number; 
  dailyEnergy: number; 
  tiltAngle: number; 
  sunPosition: {
    azimuth: number;
    elevation: number;
  };
  timestamp: any;
}

interface PanelType {
  name: string;
  efficiency: number; // %
  areaPer500W: number; 
  costPer500WUnit: number;
  vendor: string;
  rating: number; // out of 5
}

const Report: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const userId = user ? user.uid : null;

  const [consumptionData, setConsumptionData] =
    useState<ConsumptionData | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);

  // Figures are no longer kept in separate state: they are derived in one
  // pass below (useMemo), so the page can never show stale numbers.
  // First Vendor (Victor Solar)
  const panelOptionsVictor: PanelType[] = [
    {
      name: "Monocrystalline",
      efficiency: 20,
      areaPer500W: 2.5,
      costPer500WUnit: 20000,
      vendor: "Victor Solar",
      rating: 4
    },
    {
      name: "Polycrystalline",
      efficiency: 16,
      areaPer500W: 3.1,
      costPer500WUnit: 17500,
      vendor: "Victor Solar",
      rating: 5
    },
    {
      name: "Thin-Film",
      efficiency: 14,
      areaPer500W: 3.8,
      costPer500WUnit: 15000,
      vendor: "Victor Solar",
      rating: 3
    },
  ];

  // Second Vendor (PR Solar) - slightly different efficiencies/costs
  const panelOptionsPR: PanelType[] = [
    {
      name: "Monocrystalline",
      efficiency: 21,
      areaPer500W: 2.4,
      costPer500WUnit: 22000,
      vendor: "PR Solar",
      rating: 5
    },
    {
      name: "Polycrystalline",
      efficiency: 17,
      areaPer500W: 3.0,
      costPer500WUnit: 19000,
      vendor: "PR Solar",
      rating: 4
    },
    {
      name: "Thin-Film",
      efficiency: 15,
      areaPer500W: 3.7,
      costPer500WUnit: 16500,
      vendor: "PR Solar",
      rating: 4
    },
  ];

  const [selectedPanel, setSelectedPanelType] = useState<PanelType | null>(
    panelOptionsVictor[0]
  );

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [closestRegion, setClosestRegion] = useState<SolarPolicySummary | null>(null);

  useEffect(() => {
    const fetchDBData = async () => {
      if (!userId) return;

      try {
        const consumptionRef = collection(db, "users", userId, "consumptionData");
        const cq = query(consumptionRef, orderBy("timestamp", "desc"), limit(1));
        const consumptionSnap = await getDocs(cq);
        if (!consumptionSnap.empty) {
          const latestConsumption = consumptionSnap.docs[0].data() as ConsumptionData;
          setConsumptionData(latestConsumption);
        }

        const calculationsRef = collection(db, "users", userId, "calculations");
        const sq = query(calculationsRef, orderBy("timestamp", "desc"), limit(1));
        const solarSnap = await getDocs(sq);
        if (!solarSnap.empty) {
          const docData = solarSnap.docs[0].data();
          if ("capacity" in docData && "dailyEnergy" in docData && "area" in docData) {
            setSolarData(docData as SolarData);
          }
        }

        const locationsRef = collection(db, "users", userId, "locations");
        const lq = query(locationsRef, orderBy("timestamp", "desc"), limit(1));
        const locationSnap = await getDocs(lq);
        if (!locationSnap.empty) {
          const latestLocation = locationSnap.docs[0].data();
          const { latitude, longitude } = latestLocation;
          if (latitude && longitude) {
            setUserLocation({ latitude, longitude });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDBData();
  }, [userId]);

  // Every figure on the report, derived in one pass from the saved roof,
  // the saved bill and the chosen panel (see utils/solarCalculations.ts).
  const report: ReportResult | null = useMemo(() => {
    if (!consumptionData || !solarData || !selectedPanel) return null;

    const monthlyBill = Number(consumptionData.monthlyBill) || 0;
    const fixedCharges = Number(consumptionData.fixedCharges) || 0;
    const monthlyUnits = Number(consumptionData.consumptionFromBill) || 0;
    // Rate the user pays per unit of energy: energy part of the bill divided
    // by the units it bought. Falls back to the saved tariff for old records.
    const energyRate =
      monthlyBill > fixedCharges && monthlyUnits > 0
        ? (monthlyBill - fixedCharges) / monthlyUnits
        : Number(consumptionData.tariffRate) || 0;

    return calculateReport({
      monthlyUnits,
      monthlyBill,
      fixedCharges,
      energyRate,
      irradiance: Number(solarData.irradiance) || 0,
      totalRoofArea: Number(solarData.area) || 0,
      roofPotentialKW: Number(solarData.capacity) || 0,
      panel: selectedPanel,
    });
  }, [consumptionData, solarData, selectedPanel]);

  // Display values (zero until a saved roof and bill are found)
  const yearlyUsage = report?.yearlyUsage ?? 0;
  const monthlyUsage = yearlyUsage / 12;
  const annualProductionValue = report?.annualProduction ?? 0;
  const surplusUnits = report?.surplusUnits ?? 0;
  const usableRoofSpace = report?.usableRoofSpace ?? 0;
  const roofPotentialKW = report?.roofPotentialKW ?? 0;
  const targetSystemKW = report?.targetSystemKW ?? 0;
  const selectedSystemKW = report?.selectedSystemKW ?? 0;
  const numberOfUnits500W = report?.numberOfUnits ?? 0;
  const limitedByRoof = report?.limitedByRoof ?? false;
  const roofAreaRequired = report?.roofAreaRequired ?? 0;
  const annualSavings = report?.annualSavings ?? 0;
  const totalSavings = report?.lifetimeSavings ?? 0;
  const annualExportCredit = report?.annualExportCredit ?? 0;
  const co2Reduction = report?.co2ReductionTons ?? 0;
  const usageCoveredShare = report?.usageCoveredShare ?? 0;
  const totalSystemCost = report?.baseCost ?? 0;
  const gstAmount = report?.gstAmount ?? 0;
  const totalCostWithGST = report?.costWithGST ?? 0;
  const subsidy = report?.subsidy ?? 0;
  const costAfterSubsidy = report?.costAfterSubsidy ?? 0;
  const paybackPeriod = report ? report.paybackYears : 0;
  const loanAmount = report?.loanAmount ?? 0;
  const monthlyEmi = report?.monthlyEmi ?? 0;
  const totalInterest = report?.totalInterest ?? 0;
  const postSolarBill = report?.monthlyBillAfter ?? 0;
  const monthlyCostWithoutSolar = report ? Number(consumptionData?.monthlyBill) || 0 : 0;
  const fixedChargesMonthly = Number(consumptionData?.fixedCharges) || 0;
  const monthlyCostWithSolarAndEmi = report?.monthlyCostWithSolarAndEmi ?? 0;
  const netMonthlySavingsWithLoan = report?.netMonthlySavingsWithLoan ?? 0;
  const consumptionFromUnits = consumptionData?.consumptionSource === "bill-units";

  const energyChartData = report
    ? [
        {
          name: "Annual",
          production: parseFloat(annualProductionValue.toFixed(2)),
          consumption: parseFloat(yearlyUsage.toFixed(2)),
        },
      ]
    : [];

  const formatPayback = (years: number): string => {
    if (!report) return "0.00 years";
    if (isFinite(years)) return `${years.toFixed(2)} years`;
    return annualSavings > 0 ? `More than ${LIFETIME_YEARS} years` : "N/A";
  };
  const formatKW = (kw: number) => `${kw.toFixed(2)} kW`;
  const selectedSystemLabel = `${formatKW(selectedSystemKW)} (${numberOfUnits500W} × ${PANEL_UNIT_WATTS} W)`;

  useEffect(() => {
    const fetchPolicyRegion = async () => {
      if (userLocation && solarData) {
        const { state } = await reverseGeocode(userLocation.latitude, userLocation.longitude);
        let region = state ? findRegionByStateName(state) : null;
        if (!region) {
          region = findClosestPolicyRegion(userLocation.latitude, userLocation.longitude);
        }
        if (region) {
          setClosestRegion(region);
        }
      }
    };
    fetchPolicyRegion();
  }, [userLocation, solarData]);

const downloadReport = () => {
  const input = reportRef.current;
  if (!input) return;

  // Make sure nothing inside the report is clipped
  const previousOverflow = input.style.overflow;
  input.style.overflow = "visible";

  html2canvas(input, {
    scale: 2,            // good quality
    scrollY: -window.scrollY, // capture from top
  })
    .then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL("image/png");

      // A4 portrait
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Canvas size (in px)
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // Scale so that BOTH width and height fit inside a single page
      const ratio = Math.min(
        pdfWidth / imgWidthPx,
        pdfHeight / imgHeightPx
      );

      const imgWidth = imgWidthPx * ratio;
      const imgHeight = imgHeightPx * ratio;

      // Center the image on the page
      const marginX = (pdfWidth - imgWidth) / 2;
      const marginY = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      pdf.save("report.pdf");
    })
    .catch((err: Error) => {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF.");
    })
    .finally(() => {
      // restore original overflow
      input.style.overflow = previousOverflow;
    });
};


  if (loadingAuth) {
    return (
      <div className="report-page us-page" role="status" aria-live="polite">
        <div className="us-container report-state">
          <span className="us-skeleton report-state-title" />
          <span className="us-skeleton report-state-panel" />
          <p className="us-small">Loading...</p>
        </div>
      </div>
    );
  }

  if (errorAuth) {
    return (
      <div className="report-page us-page">
        <div className="us-container report-state" role="alert">
          <p className="us-error">Error: {errorAuth.message}</p>
        </div>
      </div>
    );
  }

  const totalRoofSpace = solarData?.area || 0;
  const orientation = solarData
    ? getOptimalOrientation(userLocation?.latitude)
    : "Unknown";

  const renderPanelCards = (panelOptions: PanelType[]) => {
    return (
      <div
        className="report-panel-cards-grid"
        role="radiogroup"
        aria-label={`Solar panels from ${panelOptions[0]?.vendor}`}
      >
        {panelOptions.map((panel) => {
          const stars = "★".repeat(panel.rating) + "☆".repeat(5 - panel.rating);
          return (
            <div
              key={panel.name + panel.vendor}
              className={`report-recommended-panel-card ${
                selectedPanel?.name === panel.name && selectedPanel?.vendor === panel.vendor
                  ? "report-selected-panel"
                  : ""
              }`}
              onClick={() => setSelectedPanelType(panel)}
              // Keyboard access: the same selection, reachable with Tab and
              // chosen with Enter or Space.
              role="radio"
              aria-checked={
                selectedPanel?.name === panel.name && selectedPanel?.vendor === panel.vendor
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedPanelType(panel);
                }
              }}
              data-rating={stars} // Add data-rating attribute
            >
              {/* Removed the panel-rating div */}
              <div className="report-recommended-panel-header">
                <h3>{panel.name}</h3>
                <span className="report-panel-cost">
                  ₹{panel.costPer500WUnit.toLocaleString("en-IN")} per 500W unit
                </span>
              </div>
              <div className="report-recommended-panel-details">
                <p>Vendor: {panel.vendor}</p>
                <p>Wattage: 500W</p>
                <p>Efficiency: {panel.efficiency}%</p>
                <p>Price: ₹{panel.costPer500WUnit.toLocaleString("en-IN")}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="report-page us-page">
      {/* Browser-only chrome. It sits outside the captured area on purpose,
          so it never appears in the PDF. */}
      <div className="us-container report-chrome">
        <Reveal as="ol" className="us-steps" kind="fade" inView={false} duration={0.4} aria-label="Progress">
          <li><span className="us-nums">01</span> Roof</li>
          <li><span className="us-nums">02</span> Bill</li>
          <li aria-current="step"><span className="us-nums">03</span> Report</li>
        </Reveal>
        {(!consumptionData || !solarData) && (
          <Reveal as="p" className="report-hint" kind="fade" inView={false} delay={1.6} duration={0.5}>
            Figures stay at zero until a saved roof and bill are found for your
            account. <Link to="/calculator" className="us-link">Trace your roof</Link>, then{" "}
            <Link to="/energy-estimation" className="us-link">enter your bill</Link>.
          </Reveal>
        )}
      </div>

      {/* Everything inside this element is captured for the PDF. Motion in
          here plays once on mount and settles to plain inline styles: no
          scroll-triggered reveals, no CSS keyframes, no blur. */}
      <div className="report-container" ref={reportRef}>
        <Stagger className="report-content" inView={false} gap={0.07}>
          {/* Header */}
          <StaggerItem as="header" className="report-header">
            <div className="report-header-title">
              <Zap className="report-icon" aria-hidden="true" />
              <h1 className="report-title">Solar Energy Report</h1>
            </div>

            {/* Executive summary: the same state values the cards below print */}
            <dl className="report-summary us-nums">
              <div className="report-summary-item report-summary-item--lead">
                <dt>Cost After Subsidy</dt>
                <dd>{`₹${formatINR(costAfterSubsidy)}`}</dd>
              </div>
              <div className="report-summary-item">
                <dt>Payback (years)</dt>
                <dd>
                  {formatPayback(paybackPeriod)}
                  <span className="report-summary-note">
                    {`after ₹${formatINR(subsidy)} subsidy`}
                  </span>
                </dd>
              </div>
              <div className="report-summary-item">
                <dt>Estimated Annual Savings</dt>
                <dd>
                  {`₹${formatINR(annualSavings)}`}
                  <span className="report-summary-note">bill before solar minus bill after</span>
                </dd>
              </div>
              <div className="report-summary-item">
                <dt>Selected System</dt>
                <dd>
                  {formatKW(selectedSystemKW)}
                  <span className="report-summary-note">
                    {`${numberOfUnits500W} × ${PANEL_UNIT_WATTS} W · target ${formatKW(targetSystemKW)}`}
                  </span>
                </dd>
              </div>
            </dl>
          </StaggerItem>

          {/* Panel Selection */}
          <StaggerItem as="section" className="report-section">
            <Card className="report-panel-recommendations-card">
              {/* Victor Solar Panels */}
              <div className="report-card-header">
                <h3 className="report-card-title">Recommended Solar Panels</h3>
                <p className="report-card-note">
                  Choose a panel. Every figure below is recalculated for it.
                </p>
              </div>
              {renderPanelCards(panelOptionsVictor)}

              {renderPanelCards(panelOptionsPR)}
            </Card>
          </StaggerItem>

          {/* ---- Energy ---- */}
          <StaggerItem as="section" className="report-section">
            <h2 className="report-section-title"><span className="us-nums">01</span> Energy</h2>
            <div className="report-energy">
              {/* Energy Production vs. Consumption Chart */}
              <Card className="report-chart-card">
                <div className="report-card-header">
                  <h2 className="report-card-title">Energy Production vs. Consumption</h2>
                  <ul className="report-legend" aria-hidden="true">
                    <li><i className="report-legend-swatch report-legend-swatch--production" /> Production</li>
                    <li><i className="report-legend-swatch report-legend-swatch--consumption" /> Consumption</li>
                  </ul>
                </div>
                <div className="report-card-content chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={energyChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barGap={16}
                    >
                      <CartesianGrid vertical={false} stroke="#e2d8c4" />
                      <XAxis
                        dataKey="name"
                        axisLine={{ stroke: "#cbbea5" }}
                        tickLine={false}
                        tick={{ fill: "#5a5e66", fontSize: 13 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#5a5e66", fontSize: 13 }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(21, 23, 28, 0.04)" }} />
                      <Bar
                        dataKey="production"
                        fill="#f2a20c"
                        name="Production"
                        animationDuration={1500}
                        radius={[8, 8, 0, 0]}
                        maxBarSize={120}
                      />
                      <Bar
                        dataKey="consumption"
                        fill="#0f6b66"
                        name="Consumption"
                        animationDuration={1500}
                        radius={[8, 8, 0, 0]}
                        maxBarSize={120}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="report-metrics-grid report-metrics-grid--side">
                {/* Consumption */}
                <MetricCard
                  title="Consumption"
                  icon={<Battery className="report-metric-icon report-blue-icon" />}
                  metrics={[
                    {
                      label: consumptionFromUnits
                        ? "Monthly Usage (units on your bill)"
                        : "Monthly Usage (estimated from bill amount)",
                      value: `${monthlyUsage.toFixed(2)} kWh`,
                    },
                    {
                      label: "Yearly Usage",
                      value: `${yearlyUsage.toFixed(2)} kWh`,
                    },
                  ]}
                  dataDescription="Your average electricity consumption, monthly and yearly, based on your bills"
                />

                {/* Estimated Energy Output */}
                <MetricCard
                  title="Estimated Energy Output"
                  icon={<Sun className="report-metric-icon report-blue-icon" />}
                  metrics={[
                    {
                      label: `Annual Production (${formatKW(selectedSystemKW)} system, year 1)`,
                      value: `${annualProductionValue.toFixed(2)} kWh`,
                    },
                    {
                      label: "Surplus Over Your Usage",
                      value: `${surplusUnits.toFixed(2)} kWh`,
                    },
                  ]}
                  dataDescription="How much energy the selected system can generate in its first year"
                />

                {/* System Capacity */}
                <MetricCard
                  title="System Capacity"
                  icon={<Zap className="report-metric-icon report-blue-icon" />}
                  metrics={[
                    {
                      label: "Roof Potential (whole roof, max)",
                      value: formatKW(roofPotentialKW),
                    },
                    {
                      label: "Target (to match your usage)",
                      value: formatKW(targetSystemKW),
                    },
                    {
                      label: limitedByRoof
                        ? "Selected System (limited by roof space)"
                        : "Selected System (quoted and used for all figures)",
                      value: selectedSystemLabel,
                    },
                  ]}
                  dataDescription="Roof potential is the most your roof could hold. Target is the size that matches your usage. The selected system is the target rounded up to whole 500 W panels: it is what is priced, and every generation, savings and payback figure uses it."
                />

                {/* Irradiance */}
                <MetricCard
                  title="Irradiance"
                  icon={<Sunrise className="report-metric-icon report-blue-icon" />}
                  metrics={[
                    {
                      label: "Average Daily",
                      value: `${solarData?.irradiance?.toFixed(2) || 0} kWh/m²/day`,
                    },
                    {
                      label: "Average Yearly",
                      value: `${(
                        (solarData?.irradiance || 0) * 365
                      ).toFixed(2)} kWh/m²`,
                    },
                  ]}
                  dataDescription="The amount of solar energy available at your location, daily and yearly"
                />
              </div>
            </div>
          </StaggerItem>

          {/* ---- Roof and system ---- */}
          <StaggerItem as="section" className="report-section">
            <h2 className="report-section-title"><span className="us-nums">02</span> Roof and system</h2>
            <div className="report-metrics-grid">
              {/* Roof Area */}
              <MetricCard
                title="Roof Area"
                icon={<Home className="report-metric-icon report-blue-icon" />}
                metrics={[
                  {
                    label: "Total Roof Space",
                    value: `${totalRoofSpace.toFixed(2)} m²`,
                  },
                  {
                    label: "Usable Roof Space",
                    value: `${usableRoofSpace.toFixed(2)} m²`,
                  },
                ]}
                dataDescription="The total and usable roof space available for installing solar panels"
              />

              {/* Roof Area Required */}
              <MetricCard
                title="Roof Area Required"
                icon={<Ruler className="report-metric-icon report-blue-icon" />}
                metrics={[
                  {
                    label: "Area Needed",
                    value: `${roofAreaRequired.toFixed(2)} m²`,
                  },
                ]}
                dataDescription="How much roof space is needed to install the chosen solar system"
              />

              {/* Tilt and Orientation */}
              <MetricCard
                title="Tilt and Orientation"
                icon={<Compass className="report-metric-icon report-blue-icon" />}
                metrics={[
                  {
                    label: "Optimal Tilt",
                    value: `${solarData?.tiltAngle?.toFixed(2) || 0}°`,
                  },
                  { label: "Optimal Orientation", value: orientation },
                ]}
                dataDescription="The best angle and direction to mount your panels for maximum sunlight"
              />

              {/* Number of Panels */}
              <MetricCard
                title="Number of Panels"
                icon={<Layers className="report-metric-icon report-blue-icon" />}
                metrics={[
                  {
                    label: "500W Units Quoted",
                    value: `${numberOfUnits500W}`,
                  },
                  {
                    label: "Selected System",
                    value: selectedSystemLabel,
                  },
                ]}
                dataDescription="How many 500W solar panel units are quoted, and the system size they make"
              />
            </div>
          </StaggerItem>

          {/* ---- Cost ---- */}
          <StaggerItem as="section" className="report-section">
            <h2 className="report-section-title"><span className="us-nums">03</span> What it costs</h2>
            <div className="report-metrics-grid report-metrics-grid--cost">
              {/* Base Cost (no GST) */}
              <MetricCard
                title="Base Cost"
                icon={<ChartCandlestick className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: `Panel Cost (No GST) · ${numberOfUnits500W} × ₹${(selectedPanel?.costPer500WUnit ?? 0).toLocaleString("en-IN")}`,
                    value: `₹${formatINR(totalSystemCost)}`,
                  },
                ]}
                dataDescription="The total cost of the panels before GST is applied"
              />

              {/* GST */}
              <MetricCard
                title="GST"
                icon={<BadgeIndianRupee className="report-metric-icon report-green-icon" />}
                metrics={[
                  { label: `GST Amount (${Math.round(GST_RATE * 100)}%)`, value: `₹${formatINR(gstAmount)}` },
                ]}
                dataDescription="Goods and Services Tax applied on the solar panels"
              />

              {/* Total System Cost (with GST) */}
              <MetricCard
                title="Total System Cost"
                icon={<IndianRupee className="report-metric-icon report-green-icon" />}
                metrics={[
                  { label: "Cost (with GST)", value: `₹${formatINR(totalCostWithGST)}` },
                ]}
                dataDescription="The total cost of the system including GST, before subsidy"
              />

              {/* Subsidy */}
              <MetricCard
                title="Subsidy"
                icon={<Building2 className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: `Eligible Subsidy (PM Surya Ghar, on ${formatKW(selectedSystemKW)})`,
                    value: `₹${formatINR(subsidy)}`,
                  },
                ]}
                dataDescription="Central subsidy on the installed capacity: ₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000"
              />

              {/* Cost After Subsidy */}
              <MetricCard
                title="Cost After Subsidy"
                icon={<Wallet className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: "Cost After Subsidy",
                    value: `₹${formatINR(costAfterSubsidy)}`,
                  },
                ]}
                dataDescription="Your total system cost after applying the available subsidy"
              />
            </div>
          </StaggerItem>

          {/* ---- Returns ---- */}
          <StaggerItem as="section" className="report-section">
            <h2 className="report-section-title"><span className="us-nums">04</span> What comes back</h2>
            <div className="report-metrics-grid">
              {/* Payback Period */}
              <MetricCard
                title="Payback Period"
                icon={<Clock className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: "Payback (years)",
                    value: formatPayback(paybackPeriod),
                  },
                  {
                    label: "Cost Recovered",
                    value: `₹${formatINR(costAfterSubsidy)} (after ₹${formatINR(subsidy)} subsidy)`,
                  },
                ]}
                dataDescription="How long the yearly savings below take to repay the cost after subsidy"
              />

              {/* Savings */}
              <MetricCard
                title="Savings"
                icon={<PiggyBank className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: "Estimated Annual Savings (year 1)",
                    value: `₹${formatINR(annualSavings)}`,
                  },
                  {
                    label: `${LIFETIME_YEARS}-Year Savings (${(PANEL_DEGRADATION_PER_YEAR * 100).toFixed(1)}%/yr panel ageing, ${
                      TARIFF_ESCALATION_PER_YEAR > 0
                        ? `tariffs +${(TARIFF_ESCALATION_PER_YEAR * 100).toFixed(1)}%/yr`
                        : "today's tariffs"
                    })`,
                    value: `₹${formatINR(totalSavings)}`,
                  },
                ]}
                dataDescription="Annual savings are your bill before solar minus your estimated bill after solar. The 25-year figure is added up year by year as panel output declines."
              />

              {/* Carbon Footprint Reduction */}
              <Card className="report-carbon-card">
                <div className="report-carbon-card-header">
                  <Leaf className="report-carbon-icon report-carbon-green-icon" />
                  <h3 className="report-carbon-card-title">Carbon Footprint Reduction</h3>
                </div>
                <div className="report-carbon-card-content">
                  <CarbonFootprintReduction
                    reduction={co2Reduction}
                    usageCoveredShare={usageCoveredShare}
                    co2KgPerKwh={CO2_KG_PER_KWH}
                  />
                </div>
              </Card>
            </div>
          </StaggerItem>

          {/* ---- Loan ---- */}
          <StaggerItem as="section" className="report-section">
            <h2 className="report-section-title"><span className="us-nums">05</span> If you borrow</h2>
            <div className="report-metrics-grid">
              {/* Loan Details */}
              <MetricCard
                title="Loan Details"
                icon={<Landmark className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: `Loan Amount (after ${DEFAULT_DOWN_PAYMENT_PERCENT}% down)`,
                    value: `₹${formatINR(loanAmount)}`,
                  },
                  {
                    label: "Total Interest Payable",
                    value: `₹${formatINR(totalInterest)}`,
                  },
                ]}
                dataDescription="Breakdown of your financed amount and total interest over the loan tenure"
              />

              {/* Monthly Bills */}
              <MetricCard
                title="Monthly Bills"
                icon={<ReceiptIndianRupee className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: "Current Monthly Bill",
                    value: `₹${formatINR(monthlyCostWithoutSolar)}`,
                  },
                  {
                    label:
                      fixedChargesMonthly > 0
                        ? `Post-Solar Monthly Bill (incl. ₹${formatINR(fixedChargesMonthly)} fixed charges)`
                        : "Post-Solar Monthly Bill (approx.)",
                    value: `₹${formatINR(postSolarBill)}`,
                  },
                  ...(annualExportCredit > 0
                    ? [
                        {
                          label: "Export Credit (per month)",
                          value: `₹${formatINR(annualExportCredit / 12)}`,
                        },
                      ]
                    : []),
                ]}
                dataDescription="Your electricity bill before solar and the estimated bill after installing solar: fixed charges plus any units solar does not cover"
              />

              {/* EMI & Net Savings */}
              <MetricCard
                title="EMI & Net Savings"
                icon={<HandCoins className="report-metric-icon report-green-icon" />}
                metrics={[
                  {
                    label: `Monthly EMI (${DEFAULT_INTEREST_RATE}% · ${DEFAULT_LOAN_TENURE_YEARS} yrs)`,
                    value: `₹${formatINR(monthlyEmi)}`,
                  },
                  {
                    label: "Bill + EMI (per month)",
                    value: `₹${formatINR(monthlyCostWithSolarAndEmi)}`,
                  },
                  {
                    label: "Net Monthly Savings (with Loan)",
                    value: `₹${formatINR(netMonthlySavingsWithLoan)}`,
                  },
                ]}
                dataDescription="Your monthly EMI, combined bill plus EMI, and how much you save each month compared to not going solar"
              />
            </div>
          </StaggerItem>

          {/* Policy and Fact Cards */}
          {closestRegion && (
            <StaggerItem as="section" className="report-section report-policy">
              <h2 className="report-section-title"><span className="us-nums">06</span> Policy in your state</h2>
              <div className="report-policy-grid">
                <Card className="report-card report-policy-card">
                  <div className="report-metric-card-header">
                    <h3 className="report-metric-title">
                      <FileText className="report-metric-icon report-blue-icon" />
                      Net Metering Policy - {closestRegion.region}
                    </h3>
                  </div>
                  <div className="report-metric-content">
                    <div className="report-metric-item" style={{ justifyContent: "flex-start" }}>
                      <span
                        className="report-metric-value"
                        style={{ maxWidth: "100%", textAlign: "left" }}
                      >
                        {closestRegion.netMeteringPolicy}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="report-card report-policy-card">
                  <div className="report-metric-card-header">
                    <h3 className="report-metric-title">
                      <Lightbulb className="report-metric-icon report-blue-icon" />
                      Interesting Fact - {closestRegion.region}
                    </h3>
                  </div>
                  <div className="report-metric-content">
                    <div
                      className="report-metric-item"
                      style={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <span
                        className="report-metric-value"
                        style={{ maxWidth: "100%", textAlign: "left" }}
                      >
                        {closestRegion.fact}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </StaggerItem>
          )}

          <StaggerItem as="p" className="report-footnote">
            A planning estimate. Prices cover panels by the 500 W unit; shade,
            inverter, mounting and installation are not included. Subsidy and
            net metering eligibility are confirmed by your distribution company.
            Savings assume net metering: solar units offset the units you buy
            over the year,{" "}
            {fixedChargesMonthly > 0
              ? `the ₹${formatINR(fixedChargesMonthly)}/month fixed charges you entered stay payable`
              : "fixed charges are taken as ₹0 (enter them on the bill page if your bill has them)"}
            {EXPORT_CREDIT_RATE > 0
              ? `, and surplus units are credited at ₹${EXPORT_CREDIT_RATE.toFixed(2)}/unit.`
              : ", and surplus units are not counted as savings because export payment varies by distribution company."}{" "}
            The {LIFETIME_YEARS}-year figure is not adjusted for maintenance.
          </StaggerItem>

          {/* Action Buttons */}
          <StaggerItem className="report-action-buttons">
            <Button
              className="report-explore-button"
              size="lg"
              onClick={() => navigate("/vendor")}
            >
              Explore Vendors
              <ArrowRight className="report-button-icon" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="report-download-button"
              onClick={downloadReport}
            >
              Download Report
              <Download className="report-button-icon" />
            </Button>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
};

export default Report;
