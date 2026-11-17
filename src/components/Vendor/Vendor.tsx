"use client";

import React, { useEffect, useState } from "react";
import { Phone, FileText, ArrowUpRight } from "lucide-react"; // Removed MapPin import
// Presentation only: motion wrappers
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem, SplitHeading, EASE } from "../../motion/kit";
import { ReactComponent as CustomMapPin } from "./map-pin.svg"; // Ensure correct path
import { ReactComponent as WhatsAppIcon } from "./whatsapp.svg"; // Import WhatsApp SVG
import "./Vendor.css";

// Define Product Interface
interface Product {
  name: string;
  price: string;
  description: string;
}

// Define Vendor Interface
interface Vendor {
  name: string;
  representative: string;
  location: string;
  phone: string;
  gstNo: string;
  products: Product[];
}

// PanelType Interface (for internal mapping)
interface PanelType {
  name: string;
  efficiency: number;
  areaPer500W: number;
  costPer500WUnit: number;
  vendor: string;
}

// Panel Options for Victor Solar
const panelOptionsVictor: PanelType[] = [
  {
    name: "Monocrystalline",
    efficiency: 20,
    areaPer500W: 2.5,
    costPer500WUnit: 20000,
    vendor: "Victor Solar",
  },
  {
    name: "Polycrystalline",
    efficiency: 16,
    areaPer500W: 3.1,
    costPer500WUnit: 17500,
    vendor: "Victor Solar",
  },
  {
    name: "Thin-Film",
    efficiency: 14,
    areaPer500W: 3.8,
    costPer500WUnit: 15000,
    vendor: "Victor Solar",
  },
];

// Panel Options for PR Solar
const panelOptionsPR: PanelType[] = [
  {
    name: "Monocrystalline",
    efficiency: 21,
    areaPer500W: 2.4,
    costPer500WUnit: 22000,
    vendor: "PR Solar",
  },
  {
    name: "Polycrystalline",
    efficiency: 17,
    areaPer500W: 3.0,
    costPer500WUnit: 19000,
    vendor: "PR Solar",
  },
  {
    name: "Thin-Film",
    efficiency: 15,
    areaPer500W: 3.7,
    costPer500WUnit: 16500,
    vendor: "PR Solar",
  },
];

// Panel Options for Morning Solar (Dummy Data)
const panelOptionsMorning: PanelType[] = [
  {
    name: "Monocrystalline Pro",
    efficiency: 22,
    areaPer500W: 2.3,
    costPer500WUnit: 23000,
    vendor: "Morning Solar",
  },
  {
    name: "Polycrystalline Plus",
    efficiency: 18,
    areaPer500W: 2.9,
    costPer500WUnit: 19500,
    vendor: "Morning Solar",
  },
  {
    name: "Thin-Film Advanced",
    efficiency: 16,
    areaPer500W: 3.6,
    costPer500WUnit: 17000,
    vendor: "Morning Solar",
  },
];

// Utility function to map PanelType to Product
const mapPanelToProduct = (panel: PanelType): Product => {
  return {
    name: panel.name,
    price: `₹${panel.costPer500WUnit.toLocaleString()}`,
    description: `Efficiency: ${panel.efficiency}%, Area per 500W: ${panel.areaPer500W} m²`,
  };
};

// Sample Vendors Data with Updated Products
const vendors: Vendor[] = [
  {
    name: "Victor Solar",
    representative: "Donald Vaz",
    location: "Shop No. 09/11B, Unique Corner Building, Vasai-Virar, MH 401202",
    phone: "9860560575",
    gstNo: "27AFMPV4394P1Z8",
    products: panelOptionsVictor.map(mapPanelToProduct),
  },
  {
    name: "PR Solar",
    representative: "Roshan Gonsalves",
    location: "Chitramwadi, Remedy church, Vasai West, MH 401201",
    phone: "9923047897",
    gstNo: "27AMEPP2040H1Z9",
    products: panelOptionsPR.map(mapPanelToProduct),
  },
  {
    name: "Morning Solar",
    representative: "Orvile A. D'Souza",
    location: "Panditwadi road, Wakiwadi, Vasai west, MH 401201",
    phone: "9834558662",
    gstNo: "27AMIPD3051A1ZQ",
    products: panelOptionsMorning.map(mapPanelToProduct),
  },
];

const VendorsPage: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Escape closes the products modal, the same as its close button.
  useEffect(() => {
    if (!selectedVendor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedVendor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedVendor]);

  return (
    <div className="vendors-page vend us-page">
      <div className="us-container vend-container">
        <header className="vend-header">
          <Reveal as="p" className="us-eyebrow" kind="fade" inView={false} duration={0.4}>
            After your report
          </Reveal>
          <SplitHeading
            as="h1"
            className="us-h1 vend-title"
            text="Our Solar Partners"
            mark={['partners']}
            inView={false}
            delay={0.05}
          />
          <Reveal as="p" className="us-lead vend-lead" inView={false} delay={0.25}>
            Solar vendors in the Vasai-Virar area of Maharashtra, with the
            panels they stock priced by the 500 W unit. Call, message or look
            through what each one sells.
          </Reveal>
        </header>

        <Stagger className="vend-grid" inView={false} delay={0.3} gap={0.1}>
          {vendors.map((vendor, index) => (
            <StaggerItem as="article" key={vendor.name} className="vend-card">
              <div className="vend-card-header">
                <span className="vend-card-num us-nums">{`0${index + 1}`}</span>
                <div className="vend-card-info">
                  <h2 className="vend-name">{vendor.name}</h2>
                  <p className="vend-rep">Representative: {vendor.representative}</p>
                </div>
              </div>
              <div className="vend-card-body">
                <ul className="vend-details">
                  <li className="vend-detail">
                    {/* Custom MapPin SVG */}
                    <CustomMapPin className="vend-detail-icon" aria-hidden="true" />
                    <span className="vend-detail-text">{vendor.location}</span>
                  </li>
                  <li className="vend-detail">
                    <Phone className="vend-detail-icon" aria-hidden="true" />
                    <a href={`tel:${vendor.phone}`} className="us-link vend-detail-link us-nums">
                      {vendor.phone}
                    </a>
                  </li>
                  <li className="vend-detail">
                    <FileText className="vend-detail-icon" aria-hidden="true" />
                    <span className="vend-detail-text us-nums">GST No: {vendor.gstNo}</span>
                  </li>
                </ul>
                <div className="vend-actions">
                  <button
                    className="us-btn vend-btn-whatsapp"
                    onClick={() =>
                      window.open(
                        `https://api.whatsapp.com/send?phone=91${vendor.phone}`,
                        "_blank"
                      )
                    }
                    aria-label={`Send a WhatsApp message to ${vendor.name}`}
                  >
                    {/* WhatsApp SVG Icon */}
                    <WhatsAppIcon className="vend-whatsapp-icon" aria-hidden="true" />
                    WhatsApp
                  </button>
                  <button
                    className="us-btn us-btn--secondary vend-btn-products"
                    onClick={() => setSelectedVendor(vendor)}
                  >
                    View Products
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* "Explore Other Vendors" Button */}
        <Reveal className="vend-explore">
          <p className="us-small">
            Not near Vasai-Virar? Search Google Maps for solar vendors close to you.
          </p>
          <button
            className="us-btn us-btn--ink vend-btn-explore"
            onClick={() =>
              window.open(
                "https://www.google.com/maps/search/?api=1&query=solar+vendors",
                "_blank"
              )
            }
            aria-label="Explore other solar vendors on Google Maps"
          >
            Explore Other Vendors
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
        </Reveal>

        <AnimatePresence>
          {selectedVendor && (
            <motion.div
              className="vend-modal-overlay"
              onClick={() => setSelectedVendor(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <motion.div
                className="vend-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="vend-modal-title"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <div className="vend-modal-header">
                  <h2 id="vend-modal-title" className="vend-modal-title">{selectedVendor.name} Products</h2>
                  <button
                    className="vend-modal-close"
                    onClick={() => setSelectedVendor(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="vend-modal-body">
                  {selectedVendor.products.map((product, index) => (
                    <motion.div
                      key={index}
                      className="vend-product"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.08 + index * 0.06, ease: EASE }}
                    >
                      <div className="vend-product-info">
                        <h3 className="vend-product-name">{product.name}</h3>
                        <p className="vend-product-description">{product.description}</p>
                        <p className="vend-product-price us-nums">{product.price}</p>
                      </div>
                    </motion.div>
                  ))}
                  <p className="us-help vend-modal-note">Price per 500 W unit.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorsPage;
