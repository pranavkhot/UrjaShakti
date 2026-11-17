import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Zap,
  Lightbulb,
  DollarSign,
  Box,
  Sun,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import "./ConsumptionCalculator.css";

// Presentation only: motion wrappers
import { Reveal, Stagger, StaggerItem, SplitHeading } from "../../motion/kit";

// Firebase Imports
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import {
  indianTariffRates,
  IndianTariffRate,
} from "../../data/indianTariffRates";
import {
  getNearestIndianState,
  isUserInIndia,
  isCoordInIndia,
  Coordinates,
} from "../../utils/locationUtils";

// Define the schema using Zod
const formSchema = z.object({
  monthlyBill: z
    .string()
    .min(1, "Monthly bill is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Monthly bill must be a valid number"),
  occupants: z
    .string()
    .min(1, "Number of occupants is required")
    .regex(/^\d+$/, "Number of occupants must be a number"),
});

type FormData = z.infer<typeof formSchema>;

interface ConsumptionData {
  monthlyBill: number;
  occupants: number;
  area: number; // in square meters
  consumptionFromBill: number; // in kWh/month
  tariffRate: number; // always store in INR per kWh
  timestamp: any;
}

const ConsumptionCalculator: React.FC = () => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState<number | null>(null);
  const [tariffRate, setTariffRate] = useState<number | null>(null);
  const [tariffLoading, setTariffLoading] = useState<boolean>(false);
  const [tariffError, setTariffError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [userRegion, setUserRegion] = useState<IndianTariffRate | null>(null);
  const [isIndia, setIsIndia] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [user, userLoadingAuth, userErrorAuth] = useAuthState(auth);
  const userId = user ? user.uid : null;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyBill: "",
      occupants: "",
    },
  });

  const PER_PERSON_CONSUMPTION = 150; // kWh/month per person

  const fetchArea = useCallback(async () => {
    if (userId) {
      try {
        const calculationsRef = collection(db, "users", userId, "calculations");
        const q = query(calculationsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestCalculation = querySnapshot.docs[0].data();
          if (latestCalculation.area) {
            setArea(Number(latestCalculation.area));
          } else {
            setArea(0);
          }
        } else {
          console.warn("No calculations found for the user.");
          setArea(0);
        }
      } catch (error) {
        console.error("Error fetching area:", error);
        setArea(0);
      }
    }
  }, [userId]);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      try {
        const geocodeResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse`,
          {
            params: {
              format: "jsonv2",
              lat: latitude,
              lon: longitude,
            },
            headers: {
              "Accept-Language": "en",
              "User-Agent": "YourAppName/1.0",
            },
          }
        );

        const address = geocodeResponse.data.address;
        const countryCode = address?.country_code?.toUpperCase();

        if (!countryCode) {
          throw new Error("Unable to determine country code from coordinates.");
        }

        return countryCode;
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return null;
      }
    },
    []
  );

  const fetchElectricityTariff = useCallback(
    async (countryCode: string | null, coords: Coordinates | null) => {
      setTariffLoading(true);
      setTariffError(null);
      try {
        // Determine whether the user is in India primarily from the
        // coordinates (robust, no external dependency), falling back to the
        // reverse-geocoded country code when available.
        const inIndia =
          (coords && isCoordInIndia(coords)) ||
          isUserInIndia(countryCode || "");

        if (inIndia && coords) {
          // User is in India — tariff is already in INR, no exchange rate needed.
          const nearestState = getNearestIndianState(coords);
          if (!nearestState) {
            throw new Error("Unable to determine the nearest Indian state.");
          }
          setUserRegion(nearestState);
          setIsIndia(true);
          setTariffRate(Number(nearestState.averageTariffRate));
          return;
        }

        // User is outside India, fetch in USD and convert to INR
        setIsIndia(false);

        // Exchange rate is only required for the non-India (USD -> INR) path.
        if (exchangeRate === null) {
          throw new Error("Exchange rate not available yet.");
        }

        const nrelApiKey = process.env.REACT_APP_NREL_API_KEY || '';
        if (!nrelApiKey) {
          throw new Error("NREL API key is not set.");
        }

        const tariffResponse = await axios.get(
          `https://developer.nrel.gov/api/utility_rates/v3.json`,
          {
            params: {
              api_key: nrelApiKey,
              lat: coords?.latitude,
              lon: coords?.longitude,
              format: "json",
            },
          }
        );

        console.log("NREL Electricity Tariff Data:", tariffResponse.data);

        const outputs = tariffResponse.data.outputs;
        if (!outputs) {
          throw new Error("No outputs found in the tariff API response.");
        }

        const residentialRate = outputs.residential;
        if (residentialRate === undefined || residentialRate === null) {
          throw new Error(
            "Residential tariff rate is missing in the API response."
          );
        }

        // residentialRate is in USD/kWh, convert to INR/kWh
        // exchangeRate = rates.USD means: 1 INR = exchangeRate USD
        // To get INR from USD: INR = USD / rates.USD
        const tariffRateInINR = Number(residentialRate) / (exchangeRate || 1);
        setTariffRate(tariffRateInINR);
      } catch (error: any) {
        console.error("Error fetching electricity tariff rate:", error);
        setTariffError(error.message || "Failed to fetch electricity tariff rate.");
        setTariffRate(null);
      } finally {
        setTariffLoading(false);
      }
    },
    [exchangeRate]
  );

  const fetchLatestLocation = useCallback(async () => {
    if (userId) {
      try {
        const locationsRef = collection(db, "users", userId, "locations");
        const q = query(locationsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestLocation = querySnapshot.docs[0].data();
          const latitude = latestLocation.latitude;
          const longitude = latestLocation.longitude;
          if (latitude && longitude) {
            const coords: Coordinates = { latitude, longitude };
            setUserCoords(coords);

            // Reverse Geocode to get country code (best-effort). If this fails
            // (e.g. the geocoding service is rate-limited), we still proceed —
            // fetchElectricityTariff falls back to coordinate-based detection.
            const countryCode = await reverseGeocode(latitude, longitude);

            // Fetch tariff rate based on country code and coordinates
            await fetchElectricityTariff(countryCode, coords);

            return coords;
          } else {
            console.warn("Latitude or Longitude is missing in the latest location.");
            return null;
          }
        } else {
          console.warn("No locations found for the user.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        return null;
      }
    }
    return null;
  }, [userId, reverseGeocode, fetchElectricityTariff]);

  const fetchExchangeRate = useCallback(async () => {
    try {
      // Base is INR, so rates.USD tells how many USD equals 1 INR
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/INR`
      );
      setExchangeRate(response.data.rates.USD);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  }, []);

  const watchedMonthlyBill = watch("monthlyBill");
  const watchedOccupants = watch("occupants");

  // consumptionFromBill = monthlyBill (in INR) / tariffRate (in INR/kWh)
  const consumptionFromBill = useMemo(() => {
    if (tariffRate === null) return 0;
    const bill = Number(watchedMonthlyBill);
    if (isNaN(bill) || bill <= 0) return 0;
    return parseFloat((bill / tariffRate).toFixed(2));
  }, [watchedMonthlyBill, tariffRate]);

  useEffect(() => {
    // First fetch exchange rate
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    // Load area and location as soon as the user is known. The India tariff
    // path does not need the exchange rate; the effect re-runs when the
    // exchange rate arrives so the non-India (USD->INR) path resolves too.
    if (userId) {
      fetchArea();
      fetchLatestLocation();
    }
  }, [fetchArea, fetchLatestLocation, userId, exchangeRate]);

  const onSubmit = async (data: FormData) => {
    if (area === null || tariffRate === null) {
      setSubmissionError("Area or electricity tariff rate is not available.");
      return;
    }

    if (!userId) {
      setSubmissionError("User is not authenticated.");
      console.error("Error: User is not authenticated.");
      return;
    }

    setLoading(true);
    setSubmissionError(null);
    setSuccess(false);
    try {
      const consumptionData: ConsumptionData = {
        monthlyBill: Number(data.monthlyBill),
        occupants: Number(data.occupants),
        area: area,
        consumptionFromBill: consumptionFromBill,
        tariffRate: tariffRate, // already in INR/kWh
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "users", userId, "consumptionData"), consumptionData);

      setSuccess(true);
      reset();

      // Navigate to the report page after successful submission
      navigate("/report");

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error saving consumption data:", error);
      setSubmissionError("Failed to save data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoadingAuth) {
    return (
      <div className="est us-page" role="status" aria-live="polite">
        <div className="us-container est-state">
          <span className="us-skeleton est-state-title" />
          <span className="us-skeleton est-state-panel" />
          <p className="us-small">Loading...</p>
        </div>
      </div>
    );
  }

  if (userErrorAuth) {
    return (
      <div className="est us-page">
        <div className="us-container est-state" role="alert">
          <p className="us-error">Error: {userErrorAuth.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consumption-calculator est us-page">
      <div className="us-container est-grid">
        <div className="est-main">
          <header className="est-header">
            <Reveal as="ol" className="us-steps" kind="fade" inView={false} duration={0.4} aria-label="Progress">
              <li><span className="us-nums">01</span> Roof</li>
              <li aria-current="step"><span className="us-nums">02</span> Bill</li>
              <li><span className="us-nums">03</span> Report</li>
            </Reveal>
            <div className="est-heading">
              <span className="est-heading-icon" aria-hidden="true">
                <Sun className="icon" />
              </span>
              <SplitHeading
                as="h1"
                className="us-h1 est-title"
                text="Enter your bill."
                mark={['bill.']}
                inView={false}
                delay={0.05}
              />
            </div>
            <Reveal as="p" className="us-lead est-lead" inView={false} delay={0.2}>
              Estimate your electricity consumption. Your monthly bill is
              divided by the average domestic tariff for your state to give
              the units you use.
            </Reveal>
          </header>

          <Reveal className="est-form-wrap" inView={false} delay={0.3}>
            <form onSubmit={handleSubmit(onSubmit)} className="est-form">
              <div className="est-fields">
                {/* Monthly Bill */}
                <div className="us-field est-field">
                  <label htmlFor="monthlyBill">
                    Monthly Electricity Bill (₹)
                  </label>
                  <input
                    id="monthlyBill"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter your monthly bill in INR"
                    {...register("monthlyBill")}
                    className={`us-input ${errors.monthlyBill ? "est-input-error" : ""}`}
                    aria-invalid={errors.monthlyBill ? true : undefined}
                    aria-describedby={errors.monthlyBill ? "monthlyBill-error" : "monthlyBill-help"}
                  />
                  {errors.monthlyBill ? (
                    <p id="monthlyBill-error" className="us-error" role="alert">
                      {errors.monthlyBill.message}
                    </p>
                  ) : (
                    <p id="monthlyBill-help" className="us-help">
                      The amount on a typical month&rsquo;s bill, in rupees.
                    </p>
                  )}
                </div>

                {/* Number of Occupants */}
                <div className="us-field est-field">
                  <label htmlFor="occupants">Number of People</label>
                  <input
                    id="occupants"
                    type="number"
                    min="1"
                    placeholder="Enter number of occupants"
                    {...register("occupants")}
                    className={`us-input ${errors.occupants ? "est-input-error" : ""}`}
                    aria-invalid={errors.occupants ? true : undefined}
                    aria-describedby={errors.occupants ? "occupants-error" : "occupants-help"}
                  />
                  {errors.occupants ? (
                    <p id="occupants-error" className="us-error" role="alert">
                      {errors.occupants.message}
                    </p>
                  ) : (
                    <p id="occupants-help" className="us-help">
                      How many people live in the house. Saved with your estimate.
                    </p>
                  )}
                </div>
              </div>

              {/* Tariff Loading/Error */}
              {tariffLoading && (
                <p className="est-status" role="status">
                  <span className="est-status-dot" aria-hidden="true" />
                  Loading electricity tariff rate...
                </p>
              )}
              {tariffError && <p className="us-error" role="alert">{tariffError}</p>}

              {/* Submission Error */}
              {submissionError && (
                <p className="us-error est-submit-error" role="alert">{submissionError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`us-btn us-btn--primary us-btn--lg est-submit ${success ? "est-submit--success" : ""}`}
                disabled={loading || tariffLoading || area === null}
              >
                {loading ? (
                  <>
                    <span className="est-spinner" aria-hidden="true" /> Saving...
                  </>
                ) : success ? (
                  "Saved!"
                ) : (
                  <>
                    <Zap className="est-button-icon" size={18} aria-hidden="true" /> Save Consumption Data
                  </>
                )}
              </button>
              <p className="us-help est-next-note">
                Saving takes you to the report, built from this bill and the
                roof you traced.
              </p>
            </form>
          </Reveal>
        </div>

        {/* Info Cards: live readouts from the values the page already holds */}
        <aside className="est-readouts" aria-label="Live readouts">
          <p className="est-readouts-label">Worked out so far</p>
          <Stagger className="est-readouts-list" inView={false} delay={0.35} gap={0.08}>
            {/* Electricity Tariff Rate */}
            <StaggerItem>
              <InfoCard
                title="Electricity Tariff Rate"
                value={
                  tariffRate !== null
                    ? `₹${tariffRate.toFixed(2)}/kWh`
                    : tariffLoading
                    ? "Fetching..."
                    : tariffError
                    ? "Error"
                    : "Not Available"
                }
                description="Current electricity tariff rate (in INR)"
                IconComponent={DollarSign}
              />
            </StaggerItem>

            {/* Consumption from Bill */}
            <StaggerItem>
              <InfoCard
                title="Consumption from Bill"
                value={`${consumptionFromBill} kWh/month`}
                description="Derived from your monthly bill"
                IconComponent={Lightbulb}
              />
            </StaggerItem>

            {/* Area */}
            <StaggerItem>
              <InfoCard
                title="Area"
                value={
                  area !== null
                    ? `${area.toFixed(2)} m²`
                    : "Fetching area..."
                }
                description="Available area for solar panels"
                IconComponent={Box}
              />
            </StaggerItem>
          </Stagger>
        </aside>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
  description: string;
  IconComponent: React.ElementType;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  description,
  IconComponent,
}) => {
  return (
    <div className="est-info">
      <div className="est-info-header">
        <h3 className="est-info-title">{title}</h3>
        <IconComponent className="est-info-icon" aria-hidden="true" />
      </div>
      <div className="est-info-content">
        {/* Keyed on the value, so the entrance replays when the real value changes. */}
        <div key={value} className="est-info-value us-nums">{value}</div>
        <p className="est-info-description">{description}</p>
      </div>
    </div>
  );
};

export default ConsumptionCalculator;
