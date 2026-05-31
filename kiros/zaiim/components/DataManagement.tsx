'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Target } from 'lucide-react';

interface PoliticianData {
  _id: string;
  name: string;
  position: string;
  party: string;
  location: string;
  approvalRating: number;
  status: 'active' | 'retired' | 'investigation';
  ideology: 'progressive' | 'moderate' | 'conservative' | 'liberal' | 'nationalist';
  lastPublicAppearance: string | null;
  yearsInOffice: number;
  keyPolicies: string[];
}

interface CampaignData {
  _id: string;
  name: string;
  description: string;
  campaignType: 'election' | 'policy_initiative' | 'reform' | 'grassroots' | 'legislative';
  region: string;
  publicSupport: number;
  targetSupport: number;
  keyIssues: string[];
  status: 'planning' | 'active' | 'completed' | 'stalled';
}

export default function DataManagement() {
  const [politicians, setPoliticians] = useState<PoliticianData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'politicians' | 'campaigns'>('politicians');
  
  // Form states
  const [showPoliticianForm, setShowPoliticianForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingPolitician, setEditingPolitician] = useState<PoliticianData | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null);
  
  // Form data
  const [politicianForm, setPoliticianForm] = useState({
    name: '',
    position: '',
    party: '',
    location: '',
    approvalRating: 50,
    status: 'active' as 'active' | 'retired' | 'investigation',
    ideology: 'moderate' as 'progressive' | 'moderate' | 'conservative' | 'liberal' | 'nationalist',
    yearsInOffice: 0,
    keyPolicies: [''],
  });
  
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    campaignType: 'election' as 'election' | 'policy_initiative' | 'reform' | 'grassroots' | 'legislative',
    region: '',
    publicSupport: 0,
    targetSupport: 50,
    keyIssues: [''],
    status: 'planning' as 'planning' | 'active' | 'completed' | 'stalled',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [politiciansRes, campaignsRes] = await Promise.all([
        fetch('/api/politicians'),
        fetch('/api/campaigns')
      ]);

      const politiciansData = await politiciansRes.json();
      const campaignsData = await campaignsRes.json();

      if (politiciansData.success) setPoliticians(politiciansData.data);
      if (campaignsData.success) setCampaigns(campaignsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolitician = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/politicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...politicianForm,
          keyPolicies: politicianForm.keyPolicies.filter(policy => policy.trim() !== ''),
          lastPublicAppearance: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPoliticians([...politicians, data.data]);
        resetPoliticianForm();
        setShowPoliticianForm(false);
      }
    } catch (error) {
      console.error('Error adding politician:', error);
    }
  };

  const handleUpdatePolitician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolitician) return;

    try {
      const response = await fetch(`/api/politicians/${editingPolitician._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...politicianForm,
          keyPolicies: politicianForm.keyPolicies.filter(policy => policy.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPoliticians(politicians.map(p => 
          p._id === editingPolitician._id ? data.data : p
        ));
        resetPoliticianForm();
        setEditingPolitician(null);
        setShowPoliticianForm(false);
      }
    } catch (error) {
      console.error('Error updating politician:', error);
    }
  };

  const handleDeletePolitician = async (id: string) => {
    if (!confirm('Are you sure you want to delete this politician?')) return;

    try {
      const response = await fetch(`/api/politicians/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setPoliticians(politicians.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting politician:', error);
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          keyIssues: campaignForm.keyIssues.filter(issue => issue.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns([...campaigns, data.data]);
        resetCampaignForm();
        setShowCampaignForm(false);
      }
    } catch (error) {
      console.error('Error adding campaign:', error);
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      const response = await fetch(`/api/campaigns/${editingCampaign._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          keyIssues: campaignForm.keyIssues.filter(issue => issue.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns(campaigns.map(c => 
          c._id === editingCampaign._id ? data.data : c
        ));
        resetCampaignForm();
        setEditingCampaign(null);
        setShowCampaignForm(false);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns(campaigns.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const resetPoliticianForm = () => {
    setPoliticianForm({
      name: '',
      position: '',
      party: '',
      location: '',
      approvalRating: 50,
      status: 'active',
      ideology: 'moderate',
      yearsInOffice: 0,
      keyPolicies: [''],
    });
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      campaignType: 'election',
      region: '',
      publicSupport: 0,
      targetSupport: 50,
      keyIssues: [''],
      status: 'planning',
    });
  };

  const startEditPolitician = (politician: PoliticianData) => {
    setEditingPolitician(politician);
    setPoliticianForm({
      name: politician.name,
      position: politician.position,
      party: politician.party,
      location: politician.location,
      approvalRating: politician.approvalRating,
      status: politician.status,
      ideology: politician.ideology,
      yearsInOffice: politician.yearsInOffice,
      keyPolicies: politician.keyPolicies.length > 0 ? politician.keyPolicies : [''],
    });
    setShowPoliticianForm(true);
  };

  const startEditCampaign = (campaign: CampaignData) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description,
      campaignType: campaign.campaignType,
      region: campaign.region,
      publicSupport: campaign.publicSupport,
      targetSupport: campaign.targetSupport,
      keyIssues: campaign.keyIssues.length > 0 ? campaign.keyIssues : [''],
      status: campaign.status,
    });
    setShowCampaignForm(true);
  };

  const addPolicyField = () => {
    setPoliticianForm({
      ...politicianForm,
      keyPolicies: [...politicianForm.keyPolicies, ''],
    });
  };

  const removePolicyField = (index: number) => {
    setPoliticianForm({
      ...politicianForm,
      keyPolicies: politicianForm.keyPolicies.filter((_, i) => i !== index),
    });
  };

  const addIssueField = () => {
    setCampaignForm({
      ...campaignForm,
      keyIssues: [...campaignForm.keyIssues, ''],
    });
  };

  const removeIssueField = (index: number) => {
    setCampaignForm({
      ...campaignForm,
      keyIssues: campaignForm.keyIssues.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600">Add, edit, and delete political data</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('politicians')}
          className={`px-4 py-2 font-medium ${activeTab === 'politicians' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Politicians ({politicians.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium ${activeTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Campaigns ({campaigns.length})</span>
          </div>
        </button>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        {activeTab === 'politicians' ? (
          <button
            onClick={() => {
              resetPoliticianForm();
              setEditingPolitician(null);
              setShowPoliticianForm(!showPoliticianForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showPoliticianForm ? 'Cancel' : 'Add Politician'}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              resetCampaignForm();
              setEditingCampaign(null);
              setShowCampaignForm(!showCampaignForm);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showCampaignForm ? 'Cancel' : 'Add Campaign'}</span>
          </button>
        )}
      </div>

      {/* Forms */}
      {showPoliticianForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingPolitician ? 'Edit Politician' : 'Add New Politician'}
          </h2>
          <form onSubmit={editingPolitician ? handleUpdatePolitician : handleAddPolitician}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={politicianForm.name}
                  onChange={(e) => setPoliticianForm({...politicianForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={politicianForm.position}
                  onChange={(e) => setPoliticianForm({...politicianForm, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                <input
                  type="text"
                  value={politicianForm.party}
                  onChange={(e) => setPoliticianForm({...politicianForm, party: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={politicianForm.location}
                  onChange={(e) => setPoliticianForm({...politicianForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Rating (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={politicianForm.approvalRating}
                  onChange={(e) => setPoliticianForm({...politicianForm, approvalRating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Office</label>
                <input
                  type="number"
                  min="0"
                  value={politicianForm.yearsInOffice}
                  onChange={(e) => setPoliticianForm({...politicianForm, yearsInOffice: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={politicianForm.status}
                  onChange={(e) => setPoliticianForm({...politicianForm, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                  <option value="investigation">Under Investigation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ideology</label>
                <select
                  value={politicianForm.ideology}
                  onChange={(e) => setPoliticianForm({...politicianForm, ideology: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="progressive">Progressive</option>
                  <option value="moderate">Moderate</option>
                  <option value="conservative">Conservative</option>
                  <option value="liberal">Liberal</option>
                  <option value="nationalist">Nationalist</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Policies</label>
                {politicianForm.keyPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={policy}
                      onChange={(e) => {
                        const newPolicies = [...politicianForm.keyPolicies];
                        newPolicies[index] = e.target.value;
                        setPoliticianForm({...politicianForm, keyPolicies: newPolicies});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a policy"
                    />
                    <button
                      type="button"
                      onClick={() => removePolicyField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPolicyField}
                  className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Policy</span>
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPoliticianForm(false);
                  setEditingPolitician(null);
                  resetPoliticianForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingPolitician ? 'Update' : 'Save'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showCampaignForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
          </h2>
          <form onSubmit={editingCampaign ? handleUpdateCampaign : handleAddCampaign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={campaignForm.campaignType}
                  onChange={(e) => setCampaignForm({...campaignForm, campaignType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="election">Election</option>
                  <option value="policy_initiative">Policy Initiative</option>
                  <option value="reform">Reform</option>
                  <option value="grassroots">Grassroots</option>
                  <option value="legislative">Legislative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={campaignForm.region}
                  onChange={(e) => setCampaignForm({...campaignForm, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm({...campaignForm, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="stalled">Stalled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Support (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={campaignForm.publicSupport}
                  onChange={(e) => setCampaignForm({...campaignForm, publicSupport: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Support (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={campaignForm.targetSupport}
                  onChange={(e) => setCampaignForm({...campaignForm, targetSupport: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Issues</label>
                {campaignForm.keyIssues.map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => {
                        const newIssues = [...campaignForm.keyIssues];
                        newIssues[index] = e.target.value;
                        setCampaignForm({...campaignForm, keyIssues: newIssues});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter an issue"
                    />
                    <button
                      type="button"
                      onClick={() => removeIssueField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIssueField}
                  className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Issue</span>
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCampaignForm(false);
                  setEditingCampaign(null);
                  resetCampaignForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingCampaign ? 'Update' : 'Save'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Tables */}
      {activeTab === 'politicians' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Politicians</h2>
            <p className="text-gray-600 mt-1">Manage political figures</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {politicians.map(politician => (
                  <tr key={politician._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{politician.name}</div>
                      <div className="text-sm text-gray-500">{politician.location}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{politician.position}</td>
                    <td className="px-6 py-4 text-gray-700">{politician.party}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${politician.approvalRating}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{politician.approvalRating}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        politician.status === 'active' ? 'bg-green-100 text-green-800' :
                        politician.status === 'retired' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {politician.status.charAt(0).toUpperCase() + politician.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditPolitician(politician)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePolitician(politician._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
            <p className="text-gray-600 mt-1">Manage leadership campaigns</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map(campaign => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">
                        {campaign.campaignType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              campaign.publicSupport >= campaign.targetSupport ? 'bg-green-500' :
                              campaign.publicSupport >= campaign.targetSupport * 0.7 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${campaign.publicSupport}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{campaign.publicSupport}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{campaign.region}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditCampaign(campaign)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}