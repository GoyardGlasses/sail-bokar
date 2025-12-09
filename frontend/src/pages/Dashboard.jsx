import React, { useEffect, useState, useRef } from "react";
import { Package, Zap, Truck, TrendingUp, ArrowRight, Activity, Layers, Database, BarChart3, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "../components/UI/MetricCard";
import Spinner from "../components/UI/Spinner";
import { getMetrics } from "../api/endpoints";
import { useMLPredictions } from "../context/MLPredictionsContext";
import { useImportedData } from "../hooks/useImportedData";
import InlineDataImport from "../features/dataImport/components/InlineDataImport";

/**
 * Landing Page - Immersive Scroll Storytelling with 3D Effects
 */
export default function Dashboard() {
  const { dataImported, getPrediction } = useMLPredictions();
  const [mlPredictions, setMlPredictions] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: importedData, isLoaded } = useImportedData();

  // Scroll refs
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const flowRef = useRef(null);
  const kpiRef = useRef(null);
  const ctaRef = useRef(null);

  // Visibility state - default to visible so page never renders blank
  const [heroVisible, setHeroVisible] = useState(true);
  const [storyVisible, setStoryVisible] = useState(true);
  const [flowVisible, setFlowVisible] = useState(true);
  const [kpiVisible, setKpiVisible] = useState(true);
  const [ctaVisible, setCtaVisible] = useState(true);

  // Mouse move for 3D tilt effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (dataImported) {
      const predictions = {
        cost: getPrediction("cost_prediction"),
        delay: getPrediction("delay_prediction"),
        demand: getPrediction("demand_forecasting"),
        risk: getPrediction("risk_assessment"),
      };
      setMlPredictions(predictions);
    }
  }, [dataImported, getPrediction]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        setMetrics(data?.data || {});
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setMetrics({
          uptime_seconds: 3600,
          optimizer: { success_rate: 95.2 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === heroRef.current) setHeroVisible(true);
            if (entry.target === storyRef.current) setStoryVisible(true);
            if (entry.target === flowRef.current) setFlowVisible(true);
            if (entry.target === kpiRef.current) setKpiVisible(true);
            if (entry.target === ctaRef.current) setCtaVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (storyRef.current) observer.observe(storyRef.current);
    if (flowRef.current) observer.observe(flowRef.current);
    if (kpiRef.current) observer.observe(kpiRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, []);

  // Hero 3D tilt effect
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const totalRakes = isLoaded && importedData?.rakes ? importedData.rakes.length : 12;
  const totalOrders = isLoaded && importedData?.orders ? importedData.orders.length : 24;
  const optimizerSuccess = metrics?.optimizer?.success_rate || 95.2;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner text="Initializing Command Center..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden pb-20">
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative min-h-[85vh] flex flex-col items-center justify-center p-8 perspective-1000 transition-opacity duration-1000 ${
          heroVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ perspective: "1000px" }}
      >
        <div
          className="max-w-5xl w-full bg-slate-900 rounded-3xl p-12 text-center shadow-2xl border border-slate-800 relative overflow-hidden group"
          style={{
            transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Abstract Background Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-800/50 to-transparent pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Logistics OS v2.0 Live
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              The Nervous System of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Yard Operations
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Forget spreadsheets. Orchestrate your entire rail and road network with
              AI-driven foresight. Predict delays, optimize rakes, and automate dispatch decisions in real-time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/data-import"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-cyan-500 px-8 font-medium text-white transition-all duration-300 hover:bg-cyan-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                <span className="mr-2">Get Started</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
              </Link>
              <Link
                to="/operations-hub"
                className="group inline-flex h-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 px-8 font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
              >
                Open Command Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <InlineDataImport templateId="operations" />
        </div>
      </section>

      {/* STORY SECTION - 3D FLOAT CARDS */}
      <section ref={storyRef} className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 delay-100 ${storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">From Chaos to Clarity</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Transform fragmented data into a unified operational picture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
            {[
              {
                icon: Database,
                title: "Unified Data Lake",
                desc: "Ingest orders, rakes, and stock levels into one source of truth.",
                color: "bg-blue-500",
                delay: "delay-200"
              },
              {
                icon: Brain,
                title: "17+ ML Models",
                desc: "Predict delays, costs, and demand with 92% accuracy.",
                color: "bg-purple-500",
                delay: "delay-300"
              },
              {
                icon: Zap,
                title: "Instant Action",
                desc: "Auto-generate dispatch plans and optimization strategies.",
                color: "bg-amber-500",
                delay: "delay-400"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 transform transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${storyVisible ? `opacity-100 translate-y-0 ${item.delay}` : "opacity-0 translate-y-12"}`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`${item.color.replace('bg-', 'text-')}`} size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW SECTION - CONNECTED STEPS */}
      <section ref={flowRef} className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),rgba(15,23,42,1))] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${flowVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className="text-3xl font-bold mb-4">The Optimization Engine</h2>
            <p className="text-slate-400">How raw data becomes profitable decisions.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block"></div>
            <div 
              className={`absolute top-1/2 left-0 h-1 bg-cyan-500 -translate-y-1/2 hidden md:block transition-all duration-[2000ms] ease-out`}
              style={{ width: flowVisible ? "100%" : "0%" }}
            ></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                { step: "01", title: "Ingest", desc: "Upload JSON/CSV snapshot" },
                { step: "02", title: "Analyze", desc: "Run ML prediction pipeline" },
                { step: "03", title: "Execute", desc: "Dispatch with confidence" }
              ].map((step, idx) => (
                <div 
                  key={idx} 
                  className={`relative flex flex-col items-center text-center transition-all duration-700 ${flowVisible ? `opacity-100 translate-y-0 delay-${(idx + 1) * 300}` : "opacity-0 translate-y-8"}`}
                >
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 z-10 flex items-center justify-center text-xl font-bold text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPI LIVE PREVIEW SECTION */}
      <section ref={kpiRef} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className={`transition-all duration-700 ${kpiVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
              <h2 className="text-3xl font-bold text-slate-900">Live Intelligence</h2>
              <p className="text-slate-600 mt-2">Real-time metrics powered by your data.</p>
            </div>
            <div className={`transition-all duration-700 ${kpiVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Rakes Active", value: totalRakes, unit: "", icon: Zap, color: "primary", delay: "delay-100" },
              { title: "Pending Orders", value: totalOrders, unit: "", icon: Package, color: "warning", delay: "delay-200" },
              { title: "Success Rate", value: optimizerSuccess.toFixed(1), unit: "%", icon: TrendingUp, color: "success", delay: "delay-300" },
              { title: "Network Load", value: "High", unit: "", icon: Activity, color: "danger", delay: "delay-400" }
            ].map((kpi, idx) => (
              <div 
                key={idx}
                className={`transform transition-all duration-700 ${kpiVisible ? `opacity-100 translate-y-0 ${kpi.delay}` : "opacity-0 translate-y-12"}`}
              >
                <MetricCard {...kpi} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - REVEAL */}
      <section ref={ctaRef} className="py-12 px-6">
        <div 
          className={`max-w-5xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden transform transition-all duration-1000 ease-out ${ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to optimize your logistics?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg">
              Join the future of yard operations. Import your data now and get actionable insights in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Layers size={20} />
                Enter Dashboard
              </Link>
              <Link
                to="/throughput"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-slate-600 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                <BarChart3 size={20} />
                View Analysis
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
