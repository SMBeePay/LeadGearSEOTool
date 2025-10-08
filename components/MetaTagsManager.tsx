"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";

interface MetaTag {
  id: string;
  pageUrl: string;
  currentTitle: string | null;
  currentDesc: string | null;
  recommendedTitle: string;
  recommendedDesc: string;
  missingTags: string;
  status: "pending" | "in-progress" | "fixed";
  titleLength: number;
  descLength: number;
}

interface MetaTagsManagerProps {
  auditId: string;
  clientName: string;
  onBack: () => void;
}

export function MetaTagsManager({ auditId, clientName, onBack }: MetaTagsManagerProps) {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIssue, setFilterIssue] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetaTags() {
      try {
        const response = await fetch(`/api/full-audit?auditId=${auditId}`);
        if (response.ok) {
          const data = await response.json();
          const tags = (data.metaTags || []).map((tag: MetaTag) => ({
            ...tag,
            titleLength: tag.currentTitle?.length || 0,
            descLength: tag.currentDesc?.length || 0
          }));
          setMetaTags(tags);
        }
      } catch (error) {
        console.error('Failed to load meta tags:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetaTags();
  }, [auditId]);

  const getIssueType = (tag: MetaTag): string[] => {
    const issues: string[] = [];
    if (!tag.currentTitle || tag.currentTitle.trim() === "") issues.push("missing-title");
    if (!tag.currentDesc || tag.currentDesc.trim() === "") issues.push("missing-description");
    if (tag.currentTitle && tag.titleLength < 30) issues.push("title-too-short");
    if (tag.currentTitle && tag.titleLength > 60) issues.push("title-too-long");
    if (tag.currentDesc && tag.descLength < 120) issues.push("description-too-short");
    if (tag.currentDesc && tag.descLength > 160) issues.push("description-too-long");
    if (tag.missingTags) issues.push(...tag.missingTags.split(","));
    return issues;
  };

  const getTitleStatus = (length: number, exists: boolean) => {
    if (!exists) return { color: "text-red-600", status: "Missing" };
    if (length < 30) return { color: "text-yellow-600", status: "Too Short" };
    if (length > 60) return { color: "text-yellow-600", status: "Too Long" };
    return { color: "text-green-600", status: "Good" };
  };

  const getDescStatus = (length: number, exists: boolean) => {
    if (!exists) return { color: "text-red-600", status: "Missing" };
    if (length < 120) return { color: "text-yellow-600", status: "Too Short" };
    if (length > 160) return { color: "text-yellow-600", status: "Too Long" };
    return { color: "text-green-600", status: "Good" };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case "fixed": return "success";
      case "in-progress": return "warning";
      default: return "default";
    }
  };

  const updateStatus = async (tagId: string, newStatus: string) => {
    setMetaTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, status: newStatus as MetaTag["status"] } : tag
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTags = metaTags.filter(tag => {
    const statusMatch = filterStatus === "all" || tag.status === filterStatus;
    const issueTypes = getIssueType(tag);
    const issueMatch = filterIssue === "all" || issueTypes.includes(filterIssue);
    const searchMatch = searchQuery === "" || 
      tag.pageUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag.currentTitle && tag.currentTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && issueMatch && searchMatch;
  });

  const exportToCSV = () => {
    const headers = ["Page URL", "Current Title", "Title Length", "Current Description", "Desc Length", "Issues", "Recommended Title", "Recommended Description", "Status"];
    const rows = filteredTags.map(tag => [
      tag.pageUrl,
      tag.currentTitle || "MISSING",
      tag.titleLength,
      tag.currentDesc || "MISSING",
      tag.descLength,
      getIssueType(tag).join("; "),
      tag.recommendedTitle,
      tag.recommendedDesc,
      tag.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName}-meta-tags-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const tagStats = {
    total: metaTags.length,
    missingTitle: metaTags.filter(t => !t.currentTitle).length,
    missingDesc: metaTags.filter(t => !t.currentDesc).length,
    titleIssues: metaTags.filter(t => t.titleLength < 30 || t.titleLength > 60).length,
    descIssues: metaTags.filter(t => t.descLength < 120 || t.descLength > 160).length,
    pending: metaTags.filter(t => t.status === "pending").length,
    fixed: metaTags.filter(t => t.status === "fixed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
            ← Back to Audit Overview
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Meta Tags Manager</h2>
          <p className="text-sm text-gray-500">{clientName} - Page-by-Page Meta Tag Analysis</p>
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

      <div className="grid gap-4 md:grid-cols-7">
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{tagStats.total}</div>
            <div className="text-xs text-gray-600">Total Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-red-600 mb-1">{tagStats.missingTitle}</div>
            <div className="text-xs text-gray-600">Missing Titles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-red-600 mb-1">{tagStats.missingDesc}</div>
            <div className="text-xs text-gray-600">Missing Descriptions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{tagStats.titleIssues}</div>
            <div className="text-xs text-gray-600">Title Length Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{tagStats.descIssues}</div>
            <div className="text-xs text-gray-600">Desc Length Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">{tagStats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{tagStats.fixed}</div>
            <div className="text-xs text-gray-600">Fixed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter & Search</CardTitle>
            <div className="text-sm text-gray-500">{filteredTags.length} pages shown</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                value={filterIssue}
                onChange={(e) => setFilterIssue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Issues</option>
                <option value="missing-title">Missing Title</option>
                <option value="missing-description">Missing Description</option>
                <option value="title-too-short">Title Too Short</option>
                <option value="title-too-long">Title Too Long</option>
                <option value="description-too-short">Description Too Short</option>
                <option value="description-too-long">Description Too Long</option>
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
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by URL..."
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
          <CardTitle>Pages List</CardTitle>
          <CardDescription>Click on any page to see current and recommended meta tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTags.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🎉 All meta tags are optimized!</p>
                <p className="text-sm">No pages match your filter criteria or all meta tags are properly configured.</p>
              </div>
            ) : (
              filteredTags.map((tag) => {
                const titleStatus = getTitleStatus(tag.titleLength, !!tag.currentTitle);
                const descStatus = getDescStatus(tag.descLength, !!tag.currentDesc);
                
                return (
                  <div
                    key={tag.id}
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer bg-white"
                    onClick={() => setExpandedTag(expandedTag === tag.id ? null : tag.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(tag.status)} className="text-xs">
                            {tag.status}
                          </Badge>
                          {getIssueType(tag).map(issue => (
                            <Badge key={issue} className="text-xs bg-red-100 text-red-700">
                              {issue.replace(/-/g, " ")}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 break-all mb-2">{tag.pageUrl}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">Title Tag:</span>
                              <span className={`text-xs font-semibold ${titleStatus.color}`}>
                                {titleStatus.status} ({tag.titleLength} chars)
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((tag.titleLength / 60) * 100, 100)} 
                              className="h-1.5"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">Meta Description:</span>
                              <span className={`text-xs font-semibold ${descStatus.color}`}>
                                {descStatus.status} ({tag.descLength} chars)
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((tag.descLength / 160) * 100, 100)} 
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="text-2xl">{expandedTag === tag.id ? "−" : "+"}</span>
                      </div>
                    </div>

                    {expandedTag === tag.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Current Title Tag:</h4>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                              {tag.currentTitle || <span className="text-red-600 italic">Missing</span>}
                            </p>
                            {tag.currentTitle && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(tag.currentTitle || "");
                                }}
                              >
                                📋 Copy
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">✨ Recommended Title Tag:</h4>
                          <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center justify-between">
                            <p className="text-sm text-gray-900 font-medium">{tag.recommendedTitle}</p>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(tag.recommendedTitle);
                              }}
                            >
                              📋 Copy
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Current Meta Description:</h4>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                              {tag.currentDesc || <span className="text-red-600 italic">Missing</span>}
                            </p>
                            {tag.currentDesc && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(tag.currentDesc || "");
                                }}
                              >
                                📋 Copy
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">✨ Recommended Meta Description:</h4>
                          <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center justify-between">
                            <p className="text-sm text-gray-900 font-medium">{tag.recommendedDesc}</p>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(tag.recommendedDesc);
                              }}
                            >
                              📋 Copy
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(tag.id, "in-progress");
                            }}
                          >
                            Mark In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(tag.id, "fixed");
                            }}
                          >
                            Mark Fixed
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(tag.pageUrl, "_blank");
                            }}
                          >
                            View Page
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
