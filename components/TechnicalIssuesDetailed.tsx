"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui/simple-components";

interface TechnicalIssue {
  id: string;
  issueType: string;
  severity: "error" | "warning" | "notice";
  category: string;
  title: string;
  description: string;
  url: string;
  howToFix: string;
  status: "pending" | "in-progress" | "fixed" | "ignored";
}

interface TechnicalIssuesDetailedProps {
  auditId: string;
  clientName: string;
  onBack: () => void;
}

export function TechnicalIssuesDetailed({ auditId, clientName, onBack }: TechnicalIssuesDetailedProps) {
  const [issues, setIssues] = useState<TechnicalIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    async function loadIssues() {
      try {
        const response = await fetch(`/api/full-audit?auditId=${auditId}`);
        if (response.ok) {
          const data = await response.json();
          setIssues(data.technicalIssues || []);
        }
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadIssues();
  }, [auditId]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "error": return "text-red-600 bg-red-50 border-red-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "notice": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case "fixed": return "success";
      case "in-progress": return "warning";
      case "ignored": return "secondary";
      default: return "default";
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus as TechnicalIssue["status"] } : issue
    ));
  };

  const filteredIssues = issues.filter(issue => {
    const severityMatch = filterSeverity === "all" || issue.severity === filterSeverity;
    const statusMatch = filterStatus === "all" || issue.status === filterStatus;
    const searchMatch = searchQuery === "" || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return severityMatch && statusMatch && searchMatch;
  });

  const exportToCSV = () => {
    const headers = ["Severity", "Category", "Title", "URL", "How to Fix", "Status"];
    const rows = filteredIssues.map(issue => [
      issue.severity,
      issue.category,
      issue.title,
      issue.url,
      issue.howToFix.replace(/,/g, ";"),
      issue.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName}-technical-issues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const issueStats = {
    total: issues.length,
    errors: issues.filter(i => i.severity === "error").length,
    warnings: issues.filter(i => i.severity === "warning").length,
    notices: issues.filter(i => i.severity === "notice").length,
    pending: issues.filter(i => i.status === "pending").length,
    fixed: issues.filter(i => i.status === "fixed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
            ← Back to Audit Overview
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Technical SEO Issues</h2>
          <p className="text-sm text-gray-500">{clientName} - Detailed Issue Breakdown</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            📥 Export to CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            🖨️ Print Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{issueStats.total}</div>
            <div className="text-xs text-gray-600">Total Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-red-600 mb-1">{issueStats.errors}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{issueStats.warnings}</div>
            <div className="text-xs text-gray-600">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{issueStats.notices}</div>
            <div className="text-xs text-gray-600">Notices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">{issueStats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{issueStats.fixed}</div>
            <div className="text-xs text-gray-600">Fixed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter & Search</CardTitle>
            <div className="text-sm text-gray-500">{filteredIssues.length} issues shown</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="notice">Notices Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="fixed">Fixed</option>
                <option value="ignored">Ignored</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issues List</CardTitle>
          <CardDescription>Click on any issue to see full details and fix instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🎉 No issues found!</p>
                <p className="text-sm">All technical SEO issues have been resolved or no issues match your filters.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getStatusBadgeVariant(issue.status)} className="text-xs">
                          {issue.status}
                        </Badge>
                        <Badge className="text-xs">{issue.category}</Badge>
                        <span className="text-xs font-semibold uppercase">{issue.severity}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                      <p className="text-xs text-gray-500 break-all">
                        <strong>URL:</strong> {issue.url}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="text-2xl">{expandedIssue === issue.id ? "−" : "+"}</span>
                    </div>
                  </div>

                  {expandedIssue === issue.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">🔧 How to Fix:</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{issue.howToFix}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIssueStatus(issue.id, "in-progress");
                          }}
                        >
                          Mark In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIssueStatus(issue.id, "fixed");
                          }}
                        >
                          Mark Fixed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIssueStatus(issue.id, "ignored");
                          }}
                        >
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(issue.url, "_blank");
                          }}
                        >
                          View Page
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
