"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";
import { formatDate } from "@/lib/utils";

// Client data types with service tiers
interface Client {
  id: string;
  name: string;
  website: string;
  industry: string;
  status: "active" | "inactive";
  serviceTier: "Pro" | "Business" | "Starter" | "Legacy";
  lastAuditScore?: number;
  monthlyKeywords?: number;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
}

// On-Page SEO Types
interface OnPageIdea {
  id: string;
  category: "Strategy" | "SERP Features" | "Backlinks" | "Semantic" | "Content" | "User Experience" | "Technical SEO";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  page: string;
  keywords: string[];
  volume: number;
  status: "pending" | "in-progress" | "completed";
  difficulty: "easy" | "medium" | "hard";
}

interface OnPageAnalysis {
  url: string;
  keyword: string;
  volume: number;
  position: number;
  benchmarks: {
    contentLength: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
    referringDomains: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
    videoUsage: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    keywordUsage: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    orderedList: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    markups: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    readability: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
  };
}

interface OnPageOverview {
  totalIdeas: number;
  categoryBreakdown: Record<string, number>;
  trafficPotential: {
    current: number;
    potential: number;
    improvement: string;
  };
  topPages: Array<{
    url: string;
    priority: "high" | "medium" | "low";
    volume: number;
    ideas: number;
  }>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed";
  aiGenerated: boolean;
  estimatedHours?: number;
}

interface DashboardAnalytics {
  totalClients: number;
  activeAudits: number;
  pendingTasks: number;
  completedTasksThisMonth: number;
  averageAuditScore: number;
}

// Real Lead Gear client data
const leadGearClients: Client[] = [
  // Pro Tier Clients (Premium service level)
  {
    id: "pro-1",
    name: "Oilgear",
    website: "https://www.oilgear.com/",
    industry: "Industrial Equipment",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 85,
    monthlyKeywords: 150,
    lastAuditDate: new Date("2024-12-15"),
    nextAuditDate: new Date("2025-01-15"),
  },
  {
    id: "pro-2", 
    name: "AMPCO Minerals, Inc.",
    website: "https://www.ampcominerals.com/",
    industry: "Mining & Minerals",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 79,
    monthlyKeywords: 120,
    lastAuditDate: new Date("2024-12-10"),
    nextAuditDate: new Date("2025-01-10"),
  },
  {
    id: "pro-3",
    name: "Flashco",
    website: "https://www.flashco.com/",
    industry: "Industrial Services",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 82,
    monthlyKeywords: 140,
    lastAuditDate: new Date("2024-12-12"),
    nextAuditDate: new Date("2025-01-12"),
  },
  {
    id: "pro-4",
    name: "Longhorn Solar",
    website: "https://longhornsolar.com/",
    industry: "Solar Energy",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 88,
    monthlyKeywords: 180,
    lastAuditDate: new Date("2024-12-20"),
    nextAuditDate: new Date("2025-01-20"),
  },
  {
    id: "pro-5",
    name: "Bohden Contracting Group",
    website: "https://www.bohdengroup.com/",
    industry: "Construction",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 81,
    monthlyKeywords: 125,
    lastAuditDate: new Date("2024-12-08"),
    nextAuditDate: new Date("2025-01-08"),
  },
  {
    id: "pro-6",
    name: "Winsystems",
    website: "https://winsystems.com/",
    industry: "Technology",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 84,
    monthlyKeywords: 160,
    lastAuditDate: new Date("2024-12-18"),
    nextAuditDate: new Date("2025-01-18"),
  },
  {
    id: "pro-7",
    name: "Caddo Offices",
    website: "https://caddooffices.com/",
    industry: "Office Equipment",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 77,
    monthlyKeywords: 110,
    lastAuditDate: new Date("2024-12-05"),
    nextAuditDate: new Date("2025-01-05"),
  },
  {
    id: "pro-8",
    name: "Magna Fab",
    website: "https://www.magnafab.com/",
    industry: "Manufacturing",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 86,
    monthlyKeywords: 135,
    lastAuditDate: new Date("2024-12-22"),
    nextAuditDate: new Date("2025-01-22"),
  },
  {
    id: "pro-9",
    name: "KWS Manufacturing Company",
    website: "https://www.kwsmfg.com/",
    industry: "Manufacturing",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 83,
    monthlyKeywords: 145,
    lastAuditDate: new Date("2024-12-14"),
    nextAuditDate: new Date("2025-01-14"),
  },
  {
    id: "pro-10",
    name: "Triple/S Dynamics, Inc.",
    website: "https://www.sssdynamics.com/",
    industry: "Industrial Equipment",
    serviceTier: "Pro",
    status: "active",
    lastAuditScore: 80,
    monthlyKeywords: 130,
    lastAuditDate: new Date("2024-12-16"),
    nextAuditDate: new Date("2025-01-16"),
  },

  // Business Tier Clients (Mid-level service)
  {
    id: "biz-1",
    name: "Tymco, Inc.",
    website: "https://www.tymco.com/",
    industry: "Industrial Equipment",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 74,
    monthlyKeywords: 80,
    lastAuditDate: new Date("2024-12-10"),
    nextAuditDate: new Date("2025-02-10"),
  },
  {
    id: "biz-2",
    name: "Magna Mechanical",
    website: "https://www.magnamechanical.net/",
    industry: "Mechanical Services",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 76,
    monthlyKeywords: 75,
    lastAuditDate: new Date("2024-12-05"),
    nextAuditDate: new Date("2025-02-05"),
  },
  {
    id: "biz-3",
    name: "Genesis Chemical Blending",
    website: "https://genesisccb.com/",
    industry: "Chemical Manufacturing",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 72,
    monthlyKeywords: 85,
    lastAuditDate: new Date("2024-12-12"),
    nextAuditDate: new Date("2025-02-12"),
  },
  {
    id: "biz-4",
    name: "Pencco Inc",
    website: "https://www.pencco.com/",
    industry: "Industrial Services",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 78,
    monthlyKeywords: 70,
    lastAuditDate: new Date("2024-12-08"),
    nextAuditDate: new Date("2025-02-08"),
  },
  {
    id: "biz-5",
    name: "High Tech Reman",
    website: "https://www.hightechreman.com/",
    industry: "Remanufacturing",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 75,
    monthlyKeywords: 65,
    lastAuditDate: new Date("2024-12-15"),
    nextAuditDate: new Date("2025-02-15"),
  },
  {
    id: "biz-6",
    name: "Shoppa's",
    website: "https://www.shoppas.com/",
    industry: "Retail",
    serviceTier: "Business",
    status: "active",
    lastAuditScore: 73,
    monthlyKeywords: 60,
    lastAuditDate: new Date("2024-12-03"),
    nextAuditDate: new Date("2025-02-03"),
  },

  // Starter Tier Clients (Base service level)
  {
    id: "start-1",
    name: "DWS Energy",
    website: "https://www.dwsenergy.com/",
    industry: "Energy Services",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 68,
    monthlyKeywords: 40,
    lastAuditDate: new Date("2024-11-20"),
    nextAuditDate: new Date("2025-02-20"),
  },
  {
    id: "start-2",
    name: "Professional CPR",
    website: "https://procprclasses.com/",
    industry: "Training & Education",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 71,
    monthlyKeywords: 35,
    lastAuditDate: new Date("2024-11-25"),
    nextAuditDate: new Date("2025-02-25"),
  },
  {
    id: "start-3",
    name: "All Bay Solar",
    website: "https://allbaysolar.com/",
    industry: "Solar Energy",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 69,
    monthlyKeywords: 45,
    lastAuditDate: new Date("2024-11-15"),
    nextAuditDate: new Date("2025-02-15"),
  },
  {
    id: "start-4",
    name: "Padilla Tile",
    website: "https://padillatileinc.com/",
    industry: "Construction",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 66,
    monthlyKeywords: 30,
    lastAuditDate: new Date("2024-11-10"),
    nextAuditDate: new Date("2025-02-10"),
  },
  {
    id: "start-5",
    name: "Lamb's Machine Works",
    website: "https://lambsmachineworks.com/",
    industry: "Manufacturing",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 70,
    monthlyKeywords: 38,
    lastAuditDate: new Date("2024-11-30"),
    nextAuditDate: new Date("2025-02-28"),
  },
  {
    id: "start-6",
    name: "Advanced Industries, Inc.",
    website: "https://www.advancedindustriesinc.com/",
    industry: "Industrial Services",
    serviceTier: "Starter",
    status: "active",
    lastAuditScore: 67,
    monthlyKeywords: 42,
    lastAuditDate: new Date("2024-11-18"),
    nextAuditDate: new Date("2025-02-18"),
  },

  // Legacy Clients (Basic maintenance, need upgrades) - ALL 26 CLIENTS
  {
    id: "legacy-1",
    name: "Whitmore Mfg - Jetlube",
    website: "https://www.jetlube.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 61,
    monthlyKeywords: 20,
    lastAuditDate: new Date("2024-10-15"),
    nextAuditDate: new Date("2025-04-15"),
  },
  {
    id: "legacy-2",
    name: "Whitmore Mfg - Oilsafe",
    website: "https://www.oilsafe.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 59,
    monthlyKeywords: 18,
    lastAuditDate: new Date("2024-10-10"),
    nextAuditDate: new Date("2025-04-10"),
  },
  {
    id: "legacy-3",
    name: "Whitmore Mfg - Whitmore",
    website: "https://www.whitmores.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 57,
    monthlyKeywords: 16,
    lastAuditDate: new Date("2024-10-08"),
    nextAuditDate: new Date("2025-04-08"),
  },
  {
    id: "legacy-4",
    name: "Aaxion, Inc.",
    website: "https://www.aaxioninc.com/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 58,
    monthlyKeywords: 15,
    lastAuditDate: new Date("2024-09-20"),
    nextAuditDate: new Date("2025-03-20"),
  },
  {
    id: "legacy-5",
    name: "Advanced Interlogistics",
    website: "https://www.advancedintralogistics.com/",
    industry: "Logistics",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 62,
    monthlyKeywords: 19,
    lastAuditDate: new Date("2024-09-25"),
    nextAuditDate: new Date("2025-03-25"),
  },
  {
    id: "legacy-6",
    name: "Agua Trucks",
    website: "https://www.aguatrucks.com/",
    industry: "Transportation",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 55,
    monthlyKeywords: 12,
    lastAuditDate: new Date("2024-09-15"),
    nextAuditDate: new Date("2025-03-15"),
  },
  {
    id: "legacy-7",
    name: "American Skylights",
    website: "https://www.americanskylights.com/",
    industry: "Construction",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 63,
    monthlyKeywords: 22,
    lastAuditDate: new Date("2024-09-30"),
    nextAuditDate: new Date("2025-03-30"),
  },
  {
    id: "legacy-8",
    name: "Athens Steel Building",
    website: "https://www.athenssteelbuilding.com/",
    industry: "Construction",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 56,
    monthlyKeywords: 14,
    lastAuditDate: new Date("2024-09-10"),
    nextAuditDate: new Date("2025-03-10"),
  },
  {
    id: "legacy-9",
    name: "Commercial Power Sweep",
    website: "https://www.commercialpowersweep.com/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 64,
    monthlyKeywords: 23,
    lastAuditDate: new Date("2024-10-01"),
    nextAuditDate: new Date("2025-04-01"),
  },
  {
    id: "legacy-10",
    name: "Eclipse Innovative",
    website: "https://www.eclipseinnovative.com/",
    industry: "Technology",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 59,
    monthlyKeywords: 17,
    lastAuditDate: new Date("2024-09-18"),
    nextAuditDate: new Date("2025-03-18"),
  },
  {
    id: "legacy-11",
    name: "Glemco",
    website: "https://www.glemco.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 61,
    monthlyKeywords: 20,
    lastAuditDate: new Date("2024-09-22"),
    nextAuditDate: new Date("2025-03-22"),
  },
  {
    id: "legacy-12",
    name: "Holloway Co., Inc.",
    website: "https://www.hollowaycompanyinc.com/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 58,
    monthlyKeywords: 16,
    lastAuditDate: new Date("2024-09-28"),
    nextAuditDate: new Date("2025-03-28"),
  },
  {
    id: "legacy-13",
    name: "Hose-Fast Inc.",
    website: "https://www.hosefast.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 60,
    monthlyKeywords: 18,
    lastAuditDate: new Date("2024-10-03"),
    nextAuditDate: new Date("2025-04-03"),
  },
  {
    id: "legacy-14",
    name: "Katsam Enterprises",
    website: "https://www.katsam.com/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 57,
    monthlyKeywords: 15,
    lastAuditDate: new Date("2024-09-12"),
    nextAuditDate: new Date("2025-03-12"),
  },
  {
    id: "legacy-15",
    name: "Mighty Lift",
    website: "https://mightylift.com/",
    industry: "Industrial Equipment",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 62,
    monthlyKeywords: 21,
    lastAuditDate: new Date("2024-10-07"),
    nextAuditDate: new Date("2025-04-07"),
  },
  {
    id: "legacy-16",
    name: "North American Power Sweeping",
    website: "https://www.powersweeping.org/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 59,
    monthlyKeywords: 17,
    lastAuditDate: new Date("2024-09-26"),
    nextAuditDate: new Date("2025-03-26"),
  },
  {
    id: "legacy-17",
    name: "Spotwelding Consultants",
    website: "https://www.spotweldingconsultants.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 56,
    monthlyKeywords: 14,
    lastAuditDate: new Date("2024-09-14"),
    nextAuditDate: new Date("2025-03-14"),
  },
  {
    id: "legacy-18",
    name: "Viking Power",
    website: "https://www.vikingpwr.com/",
    industry: "Industrial Equipment",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 63,
    monthlyKeywords: 22,
    lastAuditDate: new Date("2024-10-12"),
    nextAuditDate: new Date("2025-04-12"),
  },
  {
    id: "legacy-19",
    name: "Delta Controls, Inc.",
    website: "https://deltacontrols.com/",
    industry: "Technology",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 58,
    monthlyKeywords: 16,
    lastAuditDate: new Date("2024-09-20"),
    nextAuditDate: new Date("2025-03-20"),
  },
  {
    id: "legacy-20",
    name: "JCM Industries",
    website: "https://www.jcmindustries.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 61,
    monthlyKeywords: 19,
    lastAuditDate: new Date("2024-10-09"),
    nextAuditDate: new Date("2025-04-09"),
  },
  {
    id: "legacy-21",
    name: "Kase Industries, Conveyors",
    website: "https://www.kaseconveyors.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 60,
    monthlyKeywords: 18,
    lastAuditDate: new Date("2024-09-24"),
    nextAuditDate: new Date("2025-03-24"),
  },
  {
    id: "legacy-22",
    name: "Midland Mfg. Co.",
    website: "https://www.midland-midco.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 57,
    monthlyKeywords: 15,
    lastAuditDate: new Date("2024-09-16"),
    nextAuditDate: new Date("2025-03-16"),
  },
  {
    id: "legacy-23",
    name: "Steelman Industries, Inc.",
    website: "https://www.steelman.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 60,
    monthlyKeywords: 25,
    lastAuditDate: new Date("2024-10-05"),
    nextAuditDate: new Date("2025-04-05"),
  },
  {
    id: "legacy-24",
    name: "Steelman Industries CC",
    website: "https://www.capacitorconverters.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 59,
    monthlyKeywords: 17,
    lastAuditDate: new Date("2024-10-06"),
    nextAuditDate: new Date("2025-04-06"),
  },
  {
    id: "legacy-25",
    name: "Surface Techniques",
    website: "https://www.surfacetechnique.com/",
    industry: "Manufacturing",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 58,
    monthlyKeywords: 16,
    lastAuditDate: new Date("2024-09-19"),
    nextAuditDate: new Date("2025-03-19"),
  },
  {
    id: "legacy-26",
    name: "Geonix",
    website: "https://www.geonixlp.com/",
    industry: "Technology",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 62,
    monthlyKeywords: 20,
    lastAuditDate: new Date("2024-10-02"),
    nextAuditDate: new Date("2025-04-02"),
  },
  {
    id: "legacy-27",
    name: "Mister Sweeper",
    website: "https://www.mistersweeper.com/",
    industry: "Industrial Services",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 56,
    monthlyKeywords: 13,
    lastAuditDate: new Date("2024-09-11"),
    nextAuditDate: new Date("2025-03-11"),
  },
  {
    id: "legacy-28",
    name: "WLS Lighting Inc",
    website: "https://wlslighting.com/",
    industry: "Electrical",
    serviceTier: "Legacy",
    status: "active",
    lastAuditScore: 61,
    monthlyKeywords: 19,
    lastAuditDate: new Date("2024-10-04"),
    nextAuditDate: new Date("2025-04-04"),
  },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement Schema Markup for Product Pages",
    description: "Add structured data markup to all product pages to improve rich snippets visibility.",
    priority: "critical",
    status: "pending",
    aiGenerated: true,
    estimatedHours: 8,
  },
  {
    id: "2",
    title: "Expand Content on Service Pages",
    description: "Research and write comprehensive content for all service pages.",
    priority: "high",
    status: "pending",
    aiGenerated: true,
    estimatedHours: 12,
  },
];

const leadGearAnalytics: DashboardAnalytics = {
  totalClients: 51, // All Lead Gear clients (10 Pro + 6 Business + 6 Starter + 29 Legacy)
  activeAudits: 15,
  pendingTasks: 12,
  completedTasksThisMonth: 78,
  averageAuditScore: 68, // Adjusted for larger Legacy client base
};

export default function SEODashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // On-Page SEO Tracker State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [onPageTab, setOnPageTab] = useState("overview");
  const [analysisKeyword, setAnalysisKeyword] = useState("");

  useEffect(() => {
    // Simulate loading with real Lead Gear data
    setTimeout(() => {
      setClients(leadGearClients);
      setTasks(mockTasks);
      setAnalytics(leadGearAnalytics);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Helper function to get tier styling
  const getTierBadgeVariant = (tier: Client["serviceTier"]) => {
    switch (tier) {
      case "Pro": return "default"; // Blue
      case "Business": return "success"; // Green
      case "Starter": return "warning"; // Yellow
      case "Legacy": return "secondary"; // Gray
    }
  };

  // Helper function to get tier priority
  const getTierPriority = (tier: Client["serviceTier"]) => {
    switch (tier) {
      case "Pro": return 1;
      case "Business": return 2;
      case "Starter": return 3;
      case "Legacy": return 4;
    }
  };

  // Sort clients by tier priority for dashboard display
  const sortedClients = [...clients].sort((a, b) => 
    getTierPriority(a.serviceTier) - getTierPriority(b.serviceTier)
  );

  // Task styling constants
  const priorityColors = {
    critical: "critical",
    high: "destructive", 
    medium: "warning",
    low: "secondary",
  } as const;

  const statusColors = {
    pending: "warning",
    approved: "success",
    "in-progress": "default",
    completed: "success",
    rejected: "destructive",
  } as const;

  const handleTriggerAudit = (clientId: string) => {
    alert(`Triggering audit for client: ${clientId}`);
  };

  const handleTaskAction = (taskId: string, action: "approve" | "reject") => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: action === "approve" ? "approved" as const : "rejected" as const }
          : task
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SEO Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Gear SEO Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              AI-Powered SEO Analysis and Task Management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              🔄 Refresh Data
            </Button>
            <Button variant="outline" size="sm">
              📊 Generate Report
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {["dashboard", "clients", "onpage-seo", "audits", "tasks", "keywords", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </nav>
      </div>

      <main className="p-6">
        {activeTab === "dashboard" && analytics && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <span className="text-2xl">👥</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalClients}</div>
                  <p className="text-xs text-gray-500">Active clients in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
                  <span className="text-2xl">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.activeAudits}</div>
                  <p className="text-xs text-gray-500">Audits in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <span className="text-2xl">⚠️</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.pendingTasks}</div>
                  <p className="text-xs text-gray-500">Tasks awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                  <span className="text-2xl">✅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.completedTasksThisMonth}</div>
                  <p className="text-xs text-gray-500">Tasks completed in December</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Audit Score</CardTitle>
                  <span className="text-2xl">📈</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageAuditScore}/100</div>
                  <p className="text-xs text-gray-500">Average across all clients</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Clients Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>🌐 Clients Overview</CardTitle>
                  <CardDescription>Manage and monitor your SEO clients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedClients.slice(0, 6).map((client) => (
                    <div key={client.id} className={`p-4 border rounded-lg ${client.serviceTier === 'Pro' ? 'border-blue-200 bg-blue-50' : client.serviceTier === 'Legacy' ? 'border-gray-300 bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            <Badge variant={getTierBadgeVariant(client.serviceTier)} className="text-xs">
                              {client.serviceTier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{client.website}</p>
                          <p className="text-xs text-gray-600">{client.industry}</p>
                        </div>
                        <Badge variant={client.status === "active" ? "success" : "secondary"}>
                          {client.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Audit Score</p>
                          <p className="text-sm font-medium">{client.lastAuditScore || "N/A"}/100</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Keywords</p>
                          <p className="text-sm font-medium">{client.monthlyKeywords || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Service Level</p>
                          <p className="text-sm font-medium">{client.serviceTier}</p>
                        </div>
                      </div>

                      {client.lastAuditScore && (
                        <div className="mb-4">
                          <Progress value={client.lastAuditScore} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          📅 Next audit: {client.nextAuditDate ? formatDate(client.nextAuditDate) : "TBD"}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTriggerAudit(client.id)}
                          className={client.serviceTier === 'Pro' ? 'border-blue-500 text-blue-700 hover:bg-blue-100' : ''}
                        >
                          ▶️ Run Audit
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("clients")}
                      className="w-full"
                    >
                      View All {clients.length} Clients →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>✅ AI-Generated Tasks</CardTitle>
                  <CardDescription>Review and approve AI recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.filter(task => task.status === "pending").map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        </div>
                        {task.aiGenerated && (
                          <Badge variant="outline">
                            🤖 AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              task.priority === "critical" ? "critical" : 
                              task.priority === "high" ? "destructive" : 
                              task.priority === "medium" ? "warning" : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="warning">{task.status}</Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          ⏱️ {task.estimatedHours}h
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskAction(task.id, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTaskAction(task.id, "approve")}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {tasks.filter(task => task.status === "pending").length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="text-sm">No tasks pending approval</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>🕐 Recent Activity</CardTitle>
                <CardDescription>Latest updates from your SEO campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="font-medium">TechCorp Solutions - SEO audit completed</p>
                      <p className="text-sm text-gray-500">Score: 78/100 • {formatDate(new Date())}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <p className="font-medium">AI generated 2 new optimization tasks</p>
                      <p className="text-sm text-gray-500">TechCorp Solutions • {formatDate(new Date())}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-2xl">📈</div>
                    <div>
                      <p className="font-medium">Keyword ranking improved</p>
                      <p className="text-sm text-gray-500">GreenThumb Landscaping • &ldquo;landscaping services&rdquo; #15 → #12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="space-y-6">
            {/* Clients Header with Filters */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Clients ({clients.length})</h2>
                <p className="text-sm text-gray-500">Manage your SEO client accounts and service tiers</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filter by Tier</Button>
                <Button variant="outline" size="sm">Export List</Button>
                <Button size="sm">Add New Client</Button>
              </div>
            </div>

            {/* Tier Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { tier: "Pro", count: leadGearClients.filter(c => c.serviceTier === "Pro").length, color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
                { tier: "Business", count: leadGearClients.filter(c => c.serviceTier === "Business").length, color: "bg-green-50 border-green-200", textColor: "text-green-700" },
                { tier: "Starter", count: leadGearClients.filter(c => c.serviceTier === "Starter").length, color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-700" },
                { tier: "Legacy", count: leadGearClients.filter(c => c.serviceTier === "Legacy").length, color: "bg-gray-50 border-gray-200", textColor: "text-gray-700" },
              ].map((item) => (
                <Card key={item.tier} className={item.color}>
                  <CardContent className="p-4">
                    <div className={`text-2xl font-bold ${item.textColor}`}>{item.count}</div>
                    <div className="text-sm text-gray-600">{item.tier} Clients</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Clients Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedClients.map((client) => (
                <Card key={client.id} className={`${client.serviceTier === 'Pro' ? 'border-blue-200' : client.serviceTier === 'Legacy' ? 'border-gray-300' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={getTierBadgeVariant(client.serviceTier)} className="text-xs">
                        {client.serviceTier}
                      </Badge>
                      <Badge variant={client.status === "active" ? "success" : "secondary"}>
                        {client.status}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription className="text-sm">{client.website}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Industry:</span>
                        <span className="font-medium">{client.industry}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Keywords:</span>
                        <span className="font-medium">{client.monthlyKeywords || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Audit:</span>
                        <span className="font-medium">{client.lastAuditScore || "N/A"}/100</span>
                      </div>
                      
                      {client.lastAuditScore && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>SEO Score</span>
                            <span>{client.lastAuditScore}/100</span>
                          </div>
                          <Progress value={client.lastAuditScore} className="h-2" />
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500 mb-2">
                          Next Audit: {client.nextAuditDate ? formatDate(client.nextAuditDate) : "TBD"}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleTriggerAudit(client.id)}
                          >
                            Run Audit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="space-y-6">
            {/* Keywords Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Keyword Tracking</h2>
                <p className="text-sm text-gray-500">Monitor keyword rankings across all clients</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Add Keywords</Button>
                <Button variant="outline" size="sm">Export Data</Button>
                <Button size="sm">Run Rank Check</Button>
              </div>
            </div>

            {/* Keyword Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {leadGearClients.reduce((sum, client) => sum + (client.monthlyKeywords || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Keywords</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-600">Top 10 Rankings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">234</div>
                  <div className="text-sm text-gray-600">Page 1 Rankings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <div className="text-sm text-gray-600">Improved This Month</div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Keywords Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Ranking Changes</CardTitle>
                <CardDescription>Keywords with significant movement in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { client: "Oilgear", keyword: "hydraulic pumps", current: 3, previous: 7, volume: 8900, trend: "up" },
                    { client: "Longhorn Solar", keyword: "solar installation texas", current: 5, previous: 9, volume: 5400, trend: "up" },
                    { client: "KWS Manufacturing", keyword: "material handling equipment", current: 11, previous: 8, volume: 3200, trend: "down" },
                    { client: "Magna Fab", keyword: "custom fabrication", current: 2, previous: 4, volume: 2100, trend: "up" },
                    { client: "Tymco", keyword: "street sweeper", current: 1, previous: 1, volume: 1800, trend: "stable" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.keyword}</div>
                        <div className="text-sm text-gray-500">{item.client} • {item.volume.toLocaleString()} monthly searches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Rank</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">#{item.current}</span>
                          <span className={`text-xs ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                            {item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'} {item.previous}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            {/* Tasks Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
                <p className="text-sm text-gray-500">AI-generated and manual SEO tasks</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filter Tasks</Button>
                <Button variant="outline" size="sm">Assign Team</Button>
                <Button size="sm">Create Task</Button>
              </div>
            </div>

            {/* Task Status Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === "pending").length}</div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === "in-progress").length}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === "completed").length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{tasks.filter(t => t.aiGenerated).length}</div>
                  <div className="text-sm text-gray-600">AI Generated</div>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>Manage SEO tasks across all clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            {task.aiGenerated && (
                              <Badge variant="outline" className="text-xs">
                                🤖 AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        </div>
                        <Badge variant={statusColors[task.status]}>
                          {task.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            ⏱️ {task.estimatedHours}h estimated
                          </span>
                        </div>
                        
                        {task.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskAction(task.id, "reject")}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTaskAction(task.id, "approve")}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "onpage-seo" && (
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">On-Page SEO Checker</h2>
                <p className="text-sm text-gray-500">Comprehensive on-page SEO analysis and optimization recommendations</p>
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={selectedClient?.id || ""}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    setSelectedClient(client || null);
                  }}
                >
                  <option value="">Select a client...</option>
                  {clients.filter(c => c.serviceTier !== 'Legacy').map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.serviceTier})
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">Re-run campaign</Button>
                <Button size="sm">Import keywords and pages</Button>
              </div>
            </div>

            {selectedClient ? (
              <div className="space-y-6">
                {/* Client Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-600">{selectedClient.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>📍 Dallas, Texas, United States - English</span>
                          <span>🌐 {selectedClient.website}</span>
                          <span>📅 Last update: {formatDate(selectedClient.lastAuditDate || new Date())}</span>
                        </div>
                      </div>
                      <Badge variant={getTierBadgeVariant(selectedClient.serviceTier)}>
                        {selectedClient.serviceTier}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* On-Page SEO Tabs */}
                <div className="bg-white border-b border-gray-200">
                  <nav className="flex space-x-8">
                    {["overview", "optimization-ideas", "top-10-benchmarking", "idea-tasks"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setOnPageTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                          onPageTab === tab
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tab.replace("-", " ")}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Overview Tab */}
                {onPageTab === "overview" && (
                  <div className="space-y-6">
                    {/* Total Ideas and Traffic Potential */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Ideas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center relative">
                            {/* Simulated Donut Chart */}
                            <div className="relative w-48 h-48">
                              <div className="absolute inset-0 rounded-full" style={{
                                background: `conic-gradient(
                                  #3B82F6 0deg 10deg,
                                  #EF4444 10deg 30deg,
                                  #84CC16 30deg 100deg,
                                  #06B6D4 100deg 160deg,
                                  #10B981 160deg 220deg,
                                  #8B5CF6 220deg 260deg,
                                  #F59E0B 260deg 360deg
                                )`
                              }}></div>
                              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-blue-600">29</div>
                                  <div className="text-sm text-gray-500">for 7 pages</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 space-y-3">
                            {[
                              { label: "Strategy Ideas", count: 1, color: "bg-blue-500" },
                              { label: "SERP Features Ideas", count: 2, color: "bg-red-500" },
                              { label: "Backlinks Ideas", count: 7, color: "bg-green-500" },
                              { label: "Semantic Ideas", count: 7, color: "bg-cyan-500" },
                              { label: "User Experience Ideas", count: 0, color: "bg-purple-500" },
                              { label: "Technical SEO Ideas", count: 0, color: "bg-orange-500" },
                              { label: "Content Ideas", count: 12, color: "bg-emerald-500" }
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                  <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                                <span className="font-medium">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Traffic Potential</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Our ideas may help you increase your organic traffic</p>
                              <div className="text-3xl font-bold text-green-600 mb-4">over 1000%</div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Current</span>
                                <span className="font-medium">259</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gray-400 h-2 rounded-full" style={{ width: "5%" }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Potential</span>
                                <span className="font-medium">50.7k</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Pages to Optimize */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top pages to optimize</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { url: selectedClient.website, priority: "high", volume: "9.9k", ideas: 7 },
                            { url: `${selectedClient.website}/events/icsc-here-we-go-2021/`, priority: "medium", volume: "5.4k", ideas: 5 },
                            { url: `${selectedClient.website}/commercial-lighting-retrofit/`, priority: "medium", volume: "11.4k", ideas: 4 },
                            { url: `${selectedClient.website}/circadian-rhythm-lighting-and-human-health/`, priority: "low", volume: "5.4k", ideas: 4 }
                          ].map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-8 rounded ${
                                  page.priority === 'high' ? 'bg-red-500' : 
                                  page.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                                <div>
                                  <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                                    {page.url}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Total Volume</div>
                                  <div className="font-medium">{page.volume}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Ideas</div>
                                  <div className="font-medium">
                                    <Badge variant="default">{page.ideas} ideas</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Optimization Ideas Tab */}
                {onPageTab === "optimization-ideas" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Optimization Ideas</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">📥 Import from Google Search Console</Button>
                            <Button variant="outline" size="sm">🗑️ Delete landing pages</Button>
                            <Button size="sm">➕ Add landing page</Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Search Keyword or URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            {
                              page: selectedClient.website,
                              keywords: ["wls"],
                              volume: "9.9k",
                              ideas: 7,
                              priority: "high",
                              updated: "Nov 22, 2021"
                            },
                            {
                              page: `${selectedClient.website}/events/icsc-here-we-go-2021/`,
                              keywords: ["icsc"],
                              volume: "5.4k",
                              ideas: 5,
                              priority: "medium",
                              updated: "Nov 22, 2021"
                            },
                            {
                              page: `${selectedClient.website}/commercial-lighting-retrofit/`,
                              keywords: ["commercial lighting", "2 more"],
                              volume: "11.4k",
                              ideas: 4,
                              priority: "medium",
                              updated: "Nov 22, 2021"
                            }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-8 rounded ${
                                  item.priority === 'high' ? 'bg-red-500' : 
                                  item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="font-medium text-blue-600 hover:underline cursor-pointer mb-1">
                                    {item.page}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.keywords.join(", ")}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Total Volume</div>
                                  <div className="font-medium">{item.volume}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">All ideas</div>
                                  <Badge variant="default">{item.ideas} ideas</Badge>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Last Update</div>
                                  <div className="text-sm">{item.updated}</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">🔄</Button>
                                  <Button size="sm" variant="outline">⚙️</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Top 10 Benchmarking Tab */}
                {onPageTab === "top-10-benchmarking" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>SERP Analysis for Your Target Keywords</CardTitle>
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Filter by keyword"
                            value={analysisKeyword}
                            onChange={(e) => setAnalysisKeyword(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {[
                            {
                              keyword: "commercial lighting",
                              volume: "5.4k",
                              position: 75,
                              metrics: {
                                contentLength: { topAvg: 572, yourPage: 653, status: "good" as const },
                                referringDomains: { topAvg: 62, yourPage: 5, status: "error" as const },
                                videoUsage: { topAvg: "no", yourPage: "no", status: "good" as const },
                                keywordUsage: { topAvg: "Title, Meta, H1, Body", yourPage: "Title, H1, Body", status: "warning" as const },
                                orderedList: { topAvg: "yes", yourPage: "yes", status: "good" as const },
                                markups: { topAvg: "WebPage", yourPage: "no", status: "error" as const },
                                readability: { topAvg: 47, yourPage: 52, status: "good" as const }
                              }
                            },
                            {
                              keyword: "icsc",
                              volume: "5.4k",
                              position: 68,
                              metrics: {
                                contentLength: { topAvg: 603, yourPage: 284, status: "error" as const },
                                referringDomains: { topAvg: 100, yourPage: 0, status: "error" as const },
                                videoUsage: { topAvg: "no", yourPage: "no", status: "good" as const },
                                keywordUsage: { topAvg: "Title, H1, Body", yourPage: "Title, H1, Body", status: "good" as const },
                                orderedList: { topAvg: "yes", yourPage: "yes", status: "good" as const },
                                markups: { topAvg: "no", yourPage: "no", status: "good" as const },
                                readability: { topAvg: 28, yourPage: 57, status: "warning" as const }
                              }
                            }
                          ].map((analysis, index) => (
                            <div key={index} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{analysis.keyword}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Volume {analysis.volume}</span>
                                    <span>Position {analysis.position}</span>
                                  </div>
                                </div>
                                <Button size="sm">View full analysis</Button>
                              </div>
                              
                              <div className="grid gap-4 md:grid-cols-4">
                                {Object.entries(analysis.metrics).map(([key, data]) => {
                                  const statusColors: Record<string, string> = {
                                    good: "text-green-600 bg-green-50 border-green-200",
                                    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
                                    error: "text-red-600 bg-red-50 border-red-200"
                                  };
                                  const statusColor = statusColors[data.status] || statusColors.good;
                                  
                                  return (
                                    <div key={key} className={`p-3 border rounded-lg ${statusColor}`}>
                                      <div className="font-medium text-sm capitalize mb-2">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                      <div className="text-xs space-y-1">
                                        <div>Top 10 avg: {data.topAvg}</div>
                                        <div className="font-medium">
                                          Your page: {data.yourPage}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {index < 1 && <hr className="my-6" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Idea Tasks Tab */}
                {onPageTab === "idea-tasks" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Idea Tasks</CardTitle>
                          <Button variant="outline" size="sm">📄 Export to PDF</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📋</div>
                          <p className="text-gray-600 mb-4">Just one more step before you can view the chart.</p>
                          <p className="text-sm text-gray-500 mb-6">Simply collect new ideas and you will see your results.</p>
                          <Button>🔍 Check for new ideas</Button>
                          
                          <div className="mt-8 flex items-center justify-center gap-8">
                            <div className="text-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                              <div className="text-xs text-gray-600">Implement some ideas</div>
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                              <div className="text-xs text-gray-600">Check for new ideas</div>
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto mb-1"></div>
                              <div className="text-xs text-gray-600">Wait just one day and...</div>
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                              <div className="text-xs text-gray-600">See your chart</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Sample Ideas Implementation Table */}
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">All</span>
                              <Badge variant="outline">29</Badge>
                              <span className="text-sm text-gray-600">To do</span>
                              <Badge variant="outline">28</Badge>
                              <span className="text-sm text-gray-600">Done</span>
                              <Badge variant="outline">0</Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {[
                              {
                                category: "Semantic",
                                title: "Enrich your page content",
                                page: `${selectedClient.website}/commercial-lighting-retrofit/`,
                                keywords: ["commercial lighting"],
                                status: "To do",
                                discovered: "Nov 22, 2021"
                              },
                              {
                                category: "Content",
                                title: "Make your text content more readable.",
                                page: `${selectedClient.website}/commercial-lighting-retrofit/`,
                                keywords: ["commercial lighting"],
                                status: "To do",
                                discovered: "Nov 22, 2021"
                              },
                              {
                                category: "Content",
                                title: "Provide a more relevant meta description.",
                                page: `${selectedClient.website}/commercial-lighting-retrofit/`,
                                keywords: ["commercial lighting"],
                                status: "To do",
                                discovered: "Nov 22, 2021"
                              },
                              {
                                category: "Backlinks",
                                title: "Earn links from top-ranking pages",
                                page: `${selectedClient.website}/commercial-lighting-retrofit/`,
                                keywords: ["commercial lighting"],
                                status: "To do",
                                discovered: "Nov 22, 2021"
                              }
                            ].map((idea, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-4">
                                  <Badge 
                                    variant={
                                      idea.category === "Semantic" ? "default" :
                                      idea.category === "Content" ? "success" :
                                      idea.category === "Backlinks" ? "warning" : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {idea.category}
                                  </Badge>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{idea.title}</div>
                                    <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                                      {idea.page}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-500">Keyword</div>
                                    <div className="text-sm">{idea.keywords.join(", ")}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <Badge variant="warning" className="text-xs">
                                      {idea.status} • New
                                    </Badge>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-gray-500">Discovered</div>
                                    <div className="text-sm">{idea.discovered}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h3>
                  <p className="text-gray-600 mb-6">Choose a client from the dropdown above to view their on-page SEO analysis</p>
                  <p className="text-sm text-gray-500">Note: Legacy tier clients have limited on-page SEO features</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!["dashboard", "clients", "keywords", "tasks", "onpage-seo"].includes(activeTab) && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h2>
              <p className="text-gray-500 mb-4">This section is coming soon</p>
              <Button onClick={() => setActiveTab("dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
