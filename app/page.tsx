"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";
import { formatDate } from "@/lib/utils";
import { OnPageSEOChecker } from "@/components/OnPageSEOChecker";
import { SEODomainDashboard } from "@/components/SEODomainDashboard";
import { AIReadinessDashboard } from "@/components/AIReadinessDashboard";

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

// These interfaces are used by imported components

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
  
  // Client Detail View State
  const [viewingClientDetail, setViewingClientDetail] = useState<Client | null>(null);
  const [viewingAIReadiness, setViewingAIReadiness] = useState<Client | null>(null);
  
  // Add New Client Modal State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    website: "",
    industry: "",
    serviceTier: "Starter" as Client["serviceTier"],
    status: "active" as Client["status"]
  });

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

  // Add New Client Handlers
  const handleAddClient = () => {
    if (!newClientForm.name || !newClientForm.website || !newClientForm.industry) {
      alert("Please fill in all required fields");
      return;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientForm.name,
      website: newClientForm.website.startsWith('http') ? newClientForm.website : `https://${newClientForm.website}`,
      industry: newClientForm.industry,
      serviceTier: newClientForm.serviceTier,
      status: newClientForm.status,
      lastAuditScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      monthlyKeywords: Math.floor(Math.random() * 500) + 100, // Random keywords 100-600
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    setClients(prev => [newClient, ...prev]);
    setShowAddClientModal(false);
    setNewClientForm({
      name: "",
      website: "",
      industry: "",
      serviceTier: "Starter",
      status: "active"
    });
  };

  const handleCloseModal = () => {
    setShowAddClientModal(false);
    setNewClientForm({
      name: "",
      website: "",
      industry: "",
      serviceTier: "Starter",
      status: "active"
    });
  };

  const handleTriggerAudit = (clientId: string) => {
    alert(`Triggering audit for client: ${clientId}`);
  };

  const handleViewClientDetails = (client: Client) => {
    setViewingClientDetail(client);
  };

  const handleViewAIReadiness = (client: Client) => {
    setViewingAIReadiness(client);
  };

  const handleBackToDashboard = () => {
    setViewingClientDetail(null);
    setViewingAIReadiness(null);
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

  // If viewing AI readiness, show the AI readiness dashboard
  if (viewingAIReadiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Gear SEO Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                AI Readiness Analysis Tool
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
        <main className="p-6">
          <AIReadinessDashboard 
            client={viewingAIReadiness}
            onBack={handleBackToDashboard}
          />
        </main>
      </div>
    );
  }

  // If viewing client details, show the domain dashboard
  if (viewingClientDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
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
        <main className="p-6">
          <SEODomainDashboard 
            client={viewingClientDetail}
            onBack={handleBackToDashboard}
          />
        </main>
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
                  <div className="text-2xl font-bold mb-1">{analytics.totalClients}</div>
                  <p className="text-xs text-gray-500">Active clients in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
                  <span className="text-2xl">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{analytics.activeAudits}</div>
                  <p className="text-xs text-gray-500">Audits in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <span className="text-2xl">⚠️</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{analytics.pendingTasks}</div>
                  <p className="text-xs text-gray-500">Tasks awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                  <span className="text-2xl">✅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{analytics.completedTasksThisMonth}</div>
                  <p className="text-xs text-gray-500">Tasks completed in December</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Audit Score</CardTitle>
                  <span className="text-2xl">📈</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{analytics.averageAuditScore}/100</div>
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
                            <h3 
                              className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                              onClick={() => handleViewClientDetails(client)}
                            >
                              {client.name}
                            </h3>
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
                <Button size="sm" onClick={() => setShowAddClientModal(true)}>Add New Client</Button>
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
                  <CardContent className="px-4 py-6">
                    <div className={`text-2xl font-bold ${item.textColor} mb-1`}>{item.count}</div>
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
                      <CardTitle 
                        className="text-lg text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                        onClick={() => handleViewClientDetails(client)}
                      >
                        {client.name}
                      </CardTitle>
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
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleViewClientDetails(client)}
                            >
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                            onClick={() => handleViewAIReadiness(client)}
                          >
                            🤖 AI Readiness Check
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Client Modal */}
            {showAddClientModal && (
              <div className="fixed inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 flex items-center justify-center z-50">
                <Card className="w-full max-w-md bg-white">
                  <CardHeader>
                    <CardTitle>Add New Client</CardTitle>
                    <CardDescription>Enter the details for the new client</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={newClientForm.name}
                        onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter client name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL *
                      </label>
                      <input
                        type="url"
                        value={newClientForm.website}
                        onChange={(e) => setNewClientForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry *
                      </label>
                      <input
                        type="text"
                        value={newClientForm.industry}
                        onChange={(e) => setNewClientForm(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., Technology, Healthcare, Finance"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Tier
                      </label>
                      <select
                        value={newClientForm.serviceTier}
                        onChange={(e) => setNewClientForm(prev => ({ ...prev, serviceTier: e.target.value as Client["serviceTier"] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Business">Business</option>
                        <option value="Pro">Pro</option>
                        <option value="Legacy">Legacy</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={newClientForm.status}
                        onChange={(e) => setNewClientForm(prev => ({ ...prev, status: e.target.value as Client["status"] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleAddClient}
                        className="flex-1"
                      >
                        Add Client
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCloseModal}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "audits" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">SEO Audits</h2>
                <p className="text-sm text-gray-500">Comprehensive SEO audits for all clients</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Schedule Audit</Button>
                <Button size="sm">Run New Audit</Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{analytics?.activeAudits || 0}</div>
                  <div className="text-sm text-gray-600">Active Audits</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {leadGearClients.filter(c => (c.lastAuditScore || 0) >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">High Performers (80+)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {leadGearClients.filter(c => (c.lastAuditScore || 0) >= 60 && (c.lastAuditScore || 0) < 80).length}
                  </div>
                  <div className="text-sm text-gray-600">Needs Improvement</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {analytics?.averageAuditScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>Latest SEO audit results across all clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadGearClients
                    .filter(c => c.lastAuditDate)
                    .sort((a, b) => (b.lastAuditDate?.getTime() || 0) - (a.lastAuditDate?.getTime() || 0))
                    .slice(0, 10)
                    .map((client) => (
                      <div key={client.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{client.name}</h3>
                              <Badge variant={getTierBadgeVariant(client.serviceTier)} className="text-xs">
                                {client.serviceTier}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{client.website}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold mb-1 ${
                              (client.lastAuditScore || 0) >= 80 ? 'text-green-600' :
                              (client.lastAuditScore || 0) >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {client.lastAuditScore || 0}/100
                            </div>
                            <p className="text-xs text-gray-500">
                              {client.lastAuditDate ? formatDate(client.lastAuditDate) : 'No audit'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Overall Health</span>
                            <span className="text-xs font-medium text-gray-900">
                              {client.lastAuditScore || 0}%
                            </span>
                          </div>
                          <Progress value={client.lastAuditScore || 0} className="h-2" />
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${
                              (client.lastAuditScore || 0) >= 85 ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {Math.floor((client.lastAuditScore || 0) * 0.9)}
                            </div>
                            <div className="text-xs text-gray-600">Technical</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${
                              (client.lastAuditScore || 0) >= 75 ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {Math.floor((client.lastAuditScore || 0) * 0.85)}
                            </div>
                            <div className="text-xs text-gray-600">Content</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${
                              (client.lastAuditScore || 0) >= 70 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {Math.floor((client.lastAuditScore || 0) * 0.8)}
                            </div>
                            <div className="text-xs text-gray-600">Backlinks</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${
                              (client.lastAuditScore || 0) >= 80 ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {Math.floor((client.lastAuditScore || 0) * 0.95)}
                            </div>
                            <div className="text-xs text-gray-600">UX</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewClientDetails(client)}
                            >
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Download Report
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Next: {client.nextAuditDate ? formatDate(client.nextAuditDate) : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
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
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {leadGearClients.reduce((sum, client) => sum + (client.monthlyKeywords || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Keywords</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">89</div>
                  <div className="text-sm text-gray-600">Top 10 Rankings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">234</div>
                  <div className="text-sm text-gray-600">Page 1 Rankings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
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
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{tasks.filter(t => t.status === "pending").length}</div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{tasks.filter(t => t.status === "in-progress").length}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">{tasks.filter(t => t.status === "completed").length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-4 py-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{tasks.filter(t => t.aiGenerated).length}</div>
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
          <OnPageSEOChecker 
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
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
