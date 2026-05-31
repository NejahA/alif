'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

interface PoliticianData {
  _id: string;
  name: string;
  position: string;
  party: string;
  location: string;
  approvalRating: number;
  status: 'active' | 'retired' | 'investigation';
  ideology: 'progressive' | 'moderate' | 'conservative' | 'liberal' | 'nationalist';
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

interface SearchProps {
  onPoliticiansFiltered?: (politicians: PoliticianData[]) => void;
  onCampaignsFiltered?: (campaigns: CampaignData[]) => void;
  showFilters?: boolean;
}

export default function Search({ 
  onPoliticiansFiltered, 
  onCampaignsFiltered,
  showFilters = true 
}: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [politicians, setPoliticians] = useState<PoliticianData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    politicianStatus: [] as string[],
    politicianIdeology: [] as string[],
    politicianParty: [] as string[],
    campaignType: [] as string[],
    campaignStatus: [] as string[],
    minApprovalRating: 0,
    maxApprovalRating: 100,
    minSupport: 0,
    maxSupport: 100,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f > 0)) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters]);

  const fetchAllData = async () => {
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

  const performSearch = () => {
    let filteredPoliticians = [...politicians];
    let filteredCampaigns = [...campaigns];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPoliticians = filteredPoliticians.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query) ||
        p.party.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.keyPolicies.some(policy => policy.toLowerCase().includes(query))
      );

      filteredCampaigns = filteredCampaigns.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query) ||
        c.keyIssues.some(issue => issue.toLowerCase().includes(query))
      );
    }

    // Politician filters
    if (filters.politicianStatus.length > 0) {
      filteredPoliticians = filteredPoliticians.filter(p =>
        filters.politicianStatus.includes(p.status)
      );
    }

    if (filters.politicianIdeology.length > 0) {
      filteredPoliticians = filteredPoliticians.filter(p =>
        filters.politicianIdeology.includes(p.ideology)
      );
    }

    if (filters.politicianParty.length > 0) {
      filteredPoliticians = filteredPoliticians.filter(p =>
        filters.politicianParty.includes(p.party)
      );
    }

    if (filters.minApprovalRating > 0 || filters.maxApprovalRating < 100) {
      filteredPoliticians = filteredPoliticians.filter(p =>
        p.approvalRating >= filters.minApprovalRating &&
        p.approvalRating <= filters.maxApprovalRating
      );
    }

    // Campaign filters
    if (filters.campaignType.length > 0) {
      filteredCampaigns = filteredCampaigns.filter(c =>
        filters.campaignType.includes(c.campaignType)
      );
    }

    if (filters.campaignStatus.length > 0) {
      filteredCampaigns = filteredCampaigns.filter(c =>
        filters.campaignStatus.includes(c.status)
      );
    }

    if (filters.minSupport > 0 || filters.maxSupport < 100) {
      filteredCampaigns = filteredCampaigns.filter(c =>
        c.publicSupport >= filters.minSupport &&
        c.publicSupport <= filters.maxSupport
      );
    }

    // Notify parent components
    if (onPoliticiansFiltered) {
      onPoliticiansFiltered(filteredPoliticians);
    }

    if (onCampaignsFiltered) {
      onCampaignsFiltered(filteredCampaigns);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      politicianStatus: [],
      politicianIdeology: [],
      politicianParty: [],
      campaignType: [],
      campaignStatus: [],
      minApprovalRating: 0,
      maxApprovalRating: 100,
      minSupport: 0,
      maxSupport: 100,
    });
  };

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (Array.isArray(filters[category])) {
      const currentFilters = filters[category] as string[];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(f => f !== value)
        : [...currentFilters, value];
      
      setFilters({
        ...filters,
        [category]: newFilters,
      });
    }
  };

  const getUniqueParties = () => {
    return Array.from(new Set(politicians.map(p => p.party)));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    count += filters.politicianStatus.length;
    count += filters.politicianIdeology.length;
    count += filters.politicianParty.length;
    count += filters.campaignType.length;
    count += filters.campaignStatus.length;
    if (filters.minApprovalRating > 0) count++;
    if (filters.maxApprovalRating < 100) count++;
    if (filters.minSupport > 0) count++;
    if (filters.maxSupport < 100) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search politicians, campaigns, policies..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="h-4 w-4" />
              <span>Advanced Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()} active
                </span>
              )}
            </button>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all filters
              </button>
            )}
          </div>

          {showAdvancedFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {/* Politician Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Politician Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['active', 'retired', 'investigation'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleFilter('politicianStatus', status)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.politicianStatus.includes(status)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ideology</h3>
                <div className="flex flex-wrap gap-2">
                  {['progressive', 'moderate', 'conservative', 'liberal', 'nationalist'].map(ideology => (
                    <button
                      key={ideology}
                      onClick={() => toggleFilter('politicianIdeology', ideology)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.politicianIdeology.includes(ideology)
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {ideology.charAt(0).toUpperCase() + ideology.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Party</h3>
                <div className="flex flex-wrap gap-2">
                  {getUniqueParties().map(party => (
                    <button
                      key={party}
                      onClick={() => toggleFilter('politicianParty', party)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.politicianParty.includes(party)
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {party}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Approval Rating Range</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min: {filters.minApprovalRating}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minApprovalRating}
                      onChange={(e) => setFilters({...filters, minApprovalRating: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max: {filters.maxApprovalRating}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.maxApprovalRating}
                      onChange={(e) => setFilters({...filters, maxApprovalRating: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Campaign Type</h3>
                <div className="flex flex-wrap gap-2">
                  {['election', 'policy_initiative', 'reform', 'grassroots', 'legislative'].map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('campaignType', type)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.campaignType.includes(type)
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Campaign Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['planning', 'active', 'completed', 'stalled'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleFilter('campaignStatus', status)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.campaignStatus.includes(status)
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Support Range</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min: {filters.minSupport}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minSupport}
                      onChange={(e) => setFilters({...filters, minSupport: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max: {filters.maxSupport}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.maxSupport}
                      onChange={(e) => setFilters({...filters, maxSupport: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching...</p>
        </div>
      )}
    </div>
  );
}