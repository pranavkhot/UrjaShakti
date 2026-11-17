import React, { useRef, useState, useEffect } from "react";
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

function getOrientationFromAzimuth(azimuth: number): string {
  if ((azimuth >= 315 && azimuth <= 360) || (azimuth >= 0 && azimuth < 45)) {
    return "North";
  } else if (azimuth >= 45 && azimuth < 135) {
    return "East";
  } else if (azimuth >= 135 && azimuth < 225) {
    return "South";
  } else if (azimuth >= 225 && azimuth < 315) {
    return "West";
  }
  return "Unknown";
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
  reduction: number; // in tons
}

const CarbonFootprintReduction: React.FC<CarbonFootprintReductionProps> = ({
  reduction,
}) => {
  // Never let it go negative
  const safeReduction = Math.max(reduction, 0);

  // Make the max a bit bigger than the current value,
  // rounded up to the next 5 tons (min 5)
  const maxReduction = Math.max(5, Math.ceil(safeReduction / 5) * 5);

  const percentage = (safeReduction / maxReduction) * 100;

  return (
    <div className="report-carbon-reduction">
      <div className="report-carbon-header">
        <span className="report-carbon-text">
          {safeReduction.toFixed(2)} tons CO₂/year
        </span>
        <span className="report-carbon-percentage">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="report-carbon-progress">
        <div
          className="report-carbon-progress-bar"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
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
  consumptionFromBill: number; 
  tariffRate: number; 
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

  const [usableRoofSpace, setUsableRoofSpace] = useState<number>(0);
  const [yearlyUsage, setYearlyUsage] = useState<number>(0);
  const [annualProductionValue, setAnnualProductionValue] = useState<number>(0);
  const [requiredSystemSize, setRequiredSystemSize] = useState<number>(0);
  const [annualSavings, setAnnualSavings] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [roofAreaRequired, setRoofAreaRequired] = useState<number>(0);
  const [co2Reduction, setCo2Reduction] = useState<number>(0);
  const [energyChartData, setEnergyChartData] = useState<any[]>([]);
  const [numberOfUnits500W, setNumberOfUnits500W] = useState<number>(0);

  // Cost variables
  const [totalSystemCost, setTotalSystemCost] = useState<number>(0);  // Base panel cost (no GST)
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalCostWithGST, setTotalCostWithGST] = useState<number>(0);
  const [subsidy, setSubsidy] = useState<number>(0);
  const [costAfterSubsidy, setCostAfterSubsidy] = useState<number>(0);
  const [paybackPeriod, setPaybackPeriod] = useState<number>(0);

  // Loan / EMI variables (derived from Firebase-backed values)
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [monthlyEmi, setMonthlyEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [postSolarBill, setPostSolarBill] = useState<number>(0);
  const [monthlyCostWithoutSolar, setMonthlyCostWithoutSolar] = useState<number>(0);
  const [monthlyCostWithSolarAndEmi, setMonthlyCostWithSolarAndEmi] = useState<number>(0);
  const [netMonthlySavingsWithLoan, setNetMonthlySavingsWithLoan] = useState<number>(0);

  const LIFETIME_YEARS = 25;
  const COVERAGE_RATIO = 0.8;
  const CO2_EMISSIONS_PER_KWH = 0.92;
  const GST_RATE = 0.12; // 12% GST

  // Default loan assumptions (used for EMI calculation)
  const DEFAULT_DOWN_PAYMENT_PERCENT = 20; // % of cost-after-subsidy
  const DEFAULT_INTEREST_RATE = 8.5; // % per year
  const DEFAULT_LOAN_TENURE_YEARS = 10; // years

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

  // Helper: calculate loan + EMI + post-solar bill using Firebase-backed values
  const calculateLoanAndBill = (
    finalCost: number,
    annualSavingsCalc: number,
    monthlyBillAmount: number
  ) => {
    if (!consumptionData) {
      return;
    }

    setMonthlyCostWithoutSolar(monthlyBillAmount);

    if (finalCost <= 0) {
      // No system cost -> nothing financed
      setLoanAmount(0);
      setMonthlyEmi(0);
      setTotalInterest(0);
      setTotalPayment(0);
      setPostSolarBill(monthlyBillAmount);
      setMonthlyCostWithSolarAndEmi(monthlyBillAmount);
      setNetMonthlySavingsWithLoan(0);
      return;
    }

    // Down payment and principal
    const downPaymentAmount =
      (DEFAULT_DOWN_PAYMENT_PERCENT / 100) * finalCost;
    const principal = Math.max(finalCost - downPaymentAmount, 0);

    const r = DEFAULT_INTEREST_RATE / 12 / 100; // monthly rate
    const n = DEFAULT_LOAN_TENURE_YEARS * 12; // number of EMIs

    let emiValue = 0;
    let totalPay = 0;
    let totalInt = 0;

    if (principal > 0 && r > 0 && n > 0) {
      const pow = Math.pow(1 + r, n);
      emiValue = (principal * r * pow) / (pow - 1);
      totalPay = emiValue * n;
      totalInt = totalPay - principal;
    }

    // Post-solar electricity bill (approx) using yearly savings
    const monthlySavingsFromSolar = annualSavingsCalc / 12;
    const newBill = Math.max(monthlyBillAmount - monthlySavingsFromSolar, 0);

    const monthlyCostWithLoan = newBill + emiValue;
    const netSavings = monthlyBillAmount - monthlyCostWithLoan;

    setLoanAmount(principal);
    setMonthlyEmi(emiValue);
    setTotalPayment(totalPay);
    setTotalInterest(totalInt);
    setPostSolarBill(newBill);
    setMonthlyCostWithSolarAndEmi(monthlyCostWithLoan);
    setNetMonthlySavingsWithLoan(netSavings);
  };

  useEffect(() => {
    if (consumptionData && solarData) {
      const monthlyUsage = consumptionData.consumptionFromBill;
      const yearlyUsageCalc = monthlyUsage * 12;
      setYearlyUsage(yearlyUsageCalc);

      const totalRoofSpace = solarData.area;
      const usableRoof = totalRoofSpace * COVERAGE_RATIO;
      setUsableRoofSpace(usableRoof);

      calculateAllMetrics(yearlyUsageCalc);
    }
  }, [consumptionData, solarData, selectedPanel]);

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

  const calculateAllMetrics = (yearlyConsumption: number) => {
    if (!solarData || !selectedPanel || !consumptionData) return;
    const tariffRate = consumptionData.tariffRate;
    const I = solarData.irradiance;

    // Calculation Factors
    const baseFactorForMono = 0.8946;
    const efficiencyRatio = selectedPanel.efficiency / 20;
    const panelFactor = baseFactorForMono * efficiencyRatio;

    // Required system size (kW)
    const requiredSystemSizeCalc = yearlyConsumption / (I * 365 * panelFactor);
    setRequiredSystemSize(requiredSystemSizeCalc);

    // Number of 500W units needed
    const unitsNeeded = Math.ceil((requiredSystemSizeCalc * 1000) / 500);
    setNumberOfUnits500W(unitsNeeded);

    // Actual system size (kW)
    const actualSystemSize = (unitsNeeded * 500) / 1000; 
    // Annual production (kWh/year)
    const annualProduction = actualSystemSize * I * 365 * panelFactor;
    setAnnualProductionValue(annualProduction);

    // Offset consumption by production
    const offset = Math.min(annualProduction, yearlyConsumption);

    // Annual and total savings
    const annualSavingsCalc = offset * tariffRate;
    setAnnualSavings(annualSavingsCalc);
    const totalSavingsCalc = annualSavingsCalc * LIFETIME_YEARS;
    setTotalSavings(totalSavingsCalc);

    // CO2 Reduction (tons per year)
    const annualCO2Reduction = (offset * CO2_EMISSIONS_PER_KWH) / 1000;
    setCo2Reduction(annualCO2Reduction);

    // Roof area required
    const totalAreaNeeded = unitsNeeded * selectedPanel.areaPer500W;
    setRoofAreaRequired(totalAreaNeeded);

    // Base cost (no GST)
    const baseCost = unitsNeeded * selectedPanel.costPer500WUnit;
    setTotalSystemCost(baseCost);

    // GST amount
    const gst = baseCost * GST_RATE;
    setGstAmount(gst);

    // Total cost with GST
    const costWithGST = baseCost + gst;
    setTotalCostWithGST(costWithGST);

    // Subsidy calculation
    let S = requiredSystemSizeCalc;
    let computedSubsidy = 0;
    if (S <= 2) {
      computedSubsidy = S * 30000;
    } else if (S <= 3) {
      computedSubsidy = 60000 + (S - 2) * 18000;
    } else {
      computedSubsidy = 78000; // capped at 3kW
    }
    setSubsidy(computedSubsidy);

    // Cost after subsidy
    const finalCost = Math.max(costWithGST - computedSubsidy, 0);
    setCostAfterSubsidy(finalCost);

    // Payback period
    const payback = annualSavingsCalc > 0 ? finalCost / annualSavingsCalc : Infinity;
    setPaybackPeriod(payback);

    // Energy chart data
    setEnergyChartData([
      {
        name: "Annual",
        production: parseFloat(annualProduction.toFixed(2)),
        consumption: parseFloat(yearlyConsumption.toFixed(2)),
      },
    ]);

    // Monthly bill from Firebase (if present) or fallback from usage * tariff
    const monthlyBillAmount =
      typeof consumptionData.monthlyBill === "number"
        ? consumptionData.monthlyBill
        : (yearlyConsumption / 12) * tariffRate;

    // Loan + EMI + post-solar bill breakdown (uses Firebase-backed values)
    calculateLoanAndBill(finalCost, annualSavingsCalc, monthlyBillAmount);
  };

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
  const orientation = solarData?.sunPosition
    ? getOrientationFromAzimuth(solarData.sunPosition.azimuth)
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
                  {isFinite(paybackPeriod)
                    ? `${paybackPeriod.toFixed(2)} years`
                    : "N/A"}
                </dd>
              </div>
              <div className="report-summary-item">
                <dt>Annual Savings</dt>
                <dd>{`₹${formatINR(annualSavings)}`}</dd>
              </div>
              <div className="report-summary-item">
                <dt>Required System Size</dt>
                <dd>{`${requiredSystemSize.toFixed(2)} kW`}</dd>
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
                      label: "Monthly Usage",
                      value: `${
                        consumptionData ? consumptionData.consumptionFromBill.toFixed(2) : 0
                      } kWh`,
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
                      label: "Annual Production",
                      value: `${annualProductionValue.toFixed(2)} kWh`,
                    },
                  ]}
                  dataDescription="How much solar energy your system can generate in one year"
                />

                {/* System Capacity */}
                <MetricCard
                  title="System Capacity"
                  icon={<Zap className="report-metric-icon report-blue-icon" />}
                  metrics={[
                    {
                      label: "Required System Size",
                      value: `${requiredSystemSize.toFixed(2)} kW`,
                    },
                  ]}
                  dataDescription="The size of the solar system needed to meet your energy demands"
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
                    label: "500W Units Required",
                    value: `${numberOfUnits500W}`,
                  },
                ]}
                dataDescription="How many 500W solar panel units are needed for your system"
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
                  { label: "Panel Cost (No GST)", value: `₹${formatINR(totalSystemCost)}` },
                ]}
                dataDescription="The total cost of the panels before GST is applied"
              />

              {/* GST */}
              <MetricCard
                title="GST"
                icon={<BadgeIndianRupee className="report-metric-icon report-green-icon" />}
                metrics={[
                  { label: "GST Amount (12%)", value: `₹${formatINR(gstAmount)}` },
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
                  { label: "Eligible Subsidy", value: `₹${formatINR(subsidy)}` },
                ]}
                dataDescription="The government incentive that reduces your upfront solar installation cost"
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
                    value: isFinite(paybackPeriod)
                      ? `${paybackPeriod.toFixed(2)} years`
                      : "N/A",
                  },
                ]}
                dataDescription="How long it takes for your solar savings to cover the cost of the system"
              />

              {/* Savings */}
              <MetricCard
                title="Savings"
                icon={<PiggyBank className="report-metric-icon report-green-icon" />}
                metrics={[
                  { label: "Annual Savings", value: `₹${formatINR(annualSavings)}` },
                  {
                    label: `${LIFETIME_YEARS}-Year Savings`,
                    value: `₹${formatINR(totalSavings)}`,
                  },
                ]}
                dataDescription="How much money you can save each year and over 25 years by using solar energy"
              />

              {/* Carbon Footprint Reduction */}
              <Card className="report-carbon-card">
                <div className="report-carbon-card-header">
                  <Leaf className="report-carbon-icon report-carbon-green-icon" />
                  <h3 className="report-carbon-card-title">Carbon Footprint Reduction</h3>
                </div>
                <div className="report-carbon-card-content">
                  <CarbonFootprintReduction reduction={co2Reduction} />
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
                    label: "Post-Solar Monthly Bill (approx.)",
                    value: `₹${formatINR(postSolarBill)}`,
                  },
                ]}
                dataDescription="Your electricity bill before solar and the estimated bill after installing solar"
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
