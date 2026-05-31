'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, Copy, Check } from 'lucide-react';

interface ExportProps {
  politicians: any[];
  campaigns: any[];
}

export default function Export({ politicians, campaigns }: ExportProps) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');

  const exportData = async () => {
    setExporting(true);
    try {
      const data = {
        politicians,
        campaigns,
        exportedAt: new Date().toISOString(),
        totalPoliticians: politicians.length,
        totalCampaigns: campaigns.length,
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          filename = `zaiim-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
        
        case 'csv':
          // Convert politicians to CSV
          const politicianHeaders = ['Name', 'Position', 'Party', 'Location', 'Approval Rating', 'Status', 'Ideology', 'Years in Office'];
          const politicianRows = politicians.map(p => [
            `"${p.name}"`,
            `"${p.position}"`,
            `"${p.party}"`,
            `"${p.location}"`,
            p.approvalRating,
            p.status,
            p.ideology,
            p.yearsInOffice
          ].join(','));
          
          // Convert campaigns to CSV
          const campaignHeaders = ['Name', 'Description', 'Type', 'Region', 'Public Support', 'Target Support', 'Status'];
          const campaignRows = campaigns.map(c => [
            `"${c.name}"`,
            `"${c.description}"`,
            c.campaignType,
            `"${c.region}"`,
            c.publicSupport,
            c.targetSupport,
            c.status
          ].join(','));
          
          content = [
            'POLITICIANS',
            politicianHeaders.join(','),
            ...politicianRows,
            '',
            'CAMPAIGNS',
            campaignHeaders.join(','),
            ...campaignRows
          ].join('\n');
          
          mimeType = 'text/csv';
          filename = `zaiim-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        
        case 'txt':
          content = `Zaiim Political Leadership Export - ${new Date().toLocaleString()}\n\n`;
          content += `Total Politicians: ${politicians.length}\n`;
          content += `Total Campaigns: ${campaigns.length}\n\n`;
          
          content += 'POLITICIANS:\n';
          content += '='.repeat(50) + '\n';
          politicians.forEach((p, i) => {
            content += `${i + 1}. ${p.name} (${p.position})\n`;
            content += `   Party: ${p.party}, Location: ${p.location}\n`;
            content += `   Approval: ${p.approvalRating}%, Status: ${p.status}, Ideology: ${p.ideology}\n`;
            content += `   Years in Office: ${p.yearsInOffice}\n`;
            if (p.keyPolicies && p.keyPolicies.length > 0) {
              content += `   Key Policies: ${p.keyPolicies.join(', ')}\n`;
            }
            content += '\n';
          });
          
          content += 'CAMPAIGNS:\n';
          content += '='.repeat(50) + '\n';
          campaigns.forEach((c, i) => {
            content += `${i + 1}. ${c.name}\n`;
            content += `   Type: ${c.campaignType.replace('_', ' ')}, Region: ${c.region}\n`;
            content += `   Support: ${c.publicSupport}% (Target: ${c.targetSupport}%), Status: ${c.status}\n`;
            content += `   Description: ${c.description}\n`;
            if (c.keyIssues && c.keyIssues.length > 0) {
              content += `   Key Issues: ${c.keyIssues.join(', ')}\n`;
            }
            content += '\n';
          });
          
          mimeType = 'text/plain';
          filename = `zaiim-export-${new Date().toISOString().split('T')[0]}.txt`;
          break;
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const data = {
        politicians,
        campaigns,
        exportedAt: new Date().toISOString(),
        totalPoliticians: politicians.length,
        totalCampaigns: campaigns.length,
      };
      
      const content = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const getSummaryStats = () => {
    return {
      totalPoliticians: politicians.length,
      activePoliticians: politicians.filter(p => p.status === 'active').length,
      avgApprovalRating: politicians.length > 0 
        ? Math.round(politicians.reduce((sum, p) => sum + p.approvalRating, 0) / politicians.length)
        : 0,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      avgSupport: campaigns.length > 0
        ? Math.round(campaigns.reduce((sum, c) => sum + c.publicSupport, 0) / campaigns.length)
        : 0,
    };
  };

  const stats = getSummaryStats();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
          <p className="text-gray-600 mt-1">Export your political data in various formats</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            disabled={exporting}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Politicians</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPoliticians}</p>
          <p className="text-xs text-blue-600">{stats.activePoliticians} active</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Avg Approval</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgApprovalRating}%</p>
          <p className="text-xs text-green-600">across all politicians</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
          <p className="text-xs text-purple-600">{stats.activeCampaigns} active</p>
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setExportFormat('json')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 ${
              exportFormat === 'json'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileJson className={`h-8 w-8 ${exportFormat === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${exportFormat === 'json' ? 'text-blue-700' : 'text-gray-700'}`}>
              JSON
            </span>
            <span className="text-xs text-gray-500">Structured data</span>
          </button>

          <button
            onClick={() => setExportFormat('csv')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 ${
              exportFormat === 'csv'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className={`h-8 w-8 ${exportFormat === 'csv' ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${exportFormat === 'csv' ? 'text-green-700' : 'text-gray-700'}`}>
              CSV
            </span>
            <span className="text-xs text-gray-500">Spreadsheet format</span>
          </button>

          <button
            onClick={() => setExportFormat('txt')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 ${
              exportFormat === 'txt'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className={`h-8 w-8 ${exportFormat === 'txt' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${exportFormat === 'txt' ? 'text-purple-700' : 'text-gray-700'}`}>
              Text
            </span>
            <span className="text-xs text-gray-500">Readable format</span>
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Full Data Export</h4>
            <p className="text-sm text-gray-600">Export all politicians and campaigns</p>
          </div>
          <button
            onClick={exportData}
            disabled={exporting || (politicians.length === 0 && campaigns.length === 0)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              exporting || (politicians.length === 0 && campaigns.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export {exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Politicians Only</h4>
            <p className="text-sm text-gray-600">Export only politician data</p>
          </div>
          <button
            onClick={() => {
              const data = { politicians, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `zaiim-politicians-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }}
            disabled={politicians.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              politicians.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export Politicians</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Campaigns Only</h4>
            <p className="text-sm text-gray-600">Export only campaign data</p>
          </div>
          <button
            onClick={() => {
              const data = { campaigns, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `zaiim-campaigns-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }}
            disabled={campaigns.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              campaigns.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export Campaigns</span>
          </button>
        </div>
      </div>

      {/* Export Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Export Information</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• JSON format includes complete structured data with metadata</li>
          <li>• CSV format is optimized for spreadsheet applications</li>
          <li>• Text format provides human-readable summaries</li>
          <li>• All exports include timestamp and data statistics</li>
          <li>• Data is exported in UTC timezone</li>
        </ul>
      </div>
    </div>
  );
}