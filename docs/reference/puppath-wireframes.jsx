import React, { useState } from 'react';

// Wireframe components for PupPath MVP
// Branded for Northern Beaches Groodles
// Screens: Dog Profile, Breeding Plan, Litter Timeline, Buyer Portal

// Brand Colors
const brand = {
  primary: '#E8D4C4', // Peachy pink
  secondary: '#E89B3C', // Orange sun
  accent: '#5D3A4D', // Plum/maroon text
  cream: '#F5EDE6',
  dark: '#3D2A35',
};

const WireframeBox = ({ children, className = "" }) => (
  <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const BrandedBox = ({ children, className = "" }) => (
  <div className={`rounded-xl p-5 bg-white shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status, color = "gray" }) => {
  const colors = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    gray: "bg-gray-100 text-gray-800 border-gray-300",
    brand: "bg-orange-100 text-orange-800 border-orange-300",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[color]}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ progress, label }) => (
  <div className="w-full">
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-orange-400 h-2 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// NBG Logo Component
const NBGLogo = ({ size = "normal" }) => {
  const dimensions = size === "small" ? "w-10 h-10" : size === "large" ? "w-24 h-24" : "w-16 h-16";
  return (
    <div className={`${dimensions} rounded-full flex items-center justify-center relative overflow-hidden`} style={{ backgroundColor: brand.primary }}>
      <div className="absolute" style={{ top: '15%', left: '20%' }}>
        <svg viewBox="0 0 40 40" className={size === "small" ? "w-6 h-6" : size === "large" ? "w-14 h-14" : "w-10 h-10"}>
          {/* Sun */}
          <circle cx="25" cy="15" r="10" fill={brand.secondary} />
          {/* Palm trees */}
          <path d="M12 35 L14 20 M14 20 C10 18 8 14 10 12 M14 20 C12 16 14 12 18 12 M14 20 C16 17 20 16 22 18"
                stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
          <path d="M20 35 L21 24 M21 24 C18 23 17 20 18 18 M21 24 C20 21 22 18 25 19"
                stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  );
};

// Screen 1: Dog Profile
const DogProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold" style={{ color: brand.dark }}>Maple</h2>
            <StatusBadge status="Active Breeder" color="green" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div><span className="font-medium">Breed:</span> Groodle (F1B)</div>
            <div><span className="font-medium">DOB:</span> 15 Mar 2022</div>
            <div><span className="font-medium">Sex:</span> Female</div>
            <div><span className="font-medium">Microchip:</span> 956000012345678</div>
            <div><span className="font-medium">Colour:</span> Apricot</div>
            <div><span className="font-medium">Location:</span> With Guardian (Sarah M.)</div>
          </div>
        </div>
        <div className="text-right">
          <button className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: brand.secondary }}>
            Edit Dog
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['overview', 'health', 'breeding', 'lineage', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-orange-600 border-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Breeding Readiness */}
          <BrandedBox className="col-span-2">
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Breeding Readiness</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm">DNA Testing</span>
                <StatusBadge status="✓ Complete" color="green" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm">Hips & Elbows</span>
                <StatusBadge status="✓ Passed (2/2)" color="green" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm">Vaccinations</span>
                <StatusBadge status="✓ Up to date" color="green" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm">Disease Traits</span>
                <StatusBadge status="Carrier: PRA" color="yellow" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm">Semen Analysis</span>
                <span className="text-xs text-gray-400">N/A (Female)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Fit for Flight</span>
                <StatusBadge status="Not required" color="gray" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <ProgressBar progress={85} label="Breeding Readiness" />
            </div>
          </BrandedBox>

          {/* Current Cycle Status */}
          <BrandedBox>
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Cycle Status</h3>
            <div className="text-center py-4">
              <div className="text-3xl font-bold" style={{ color: brand.secondary }}>Day 142</div>
              <div className="text-sm text-gray-500 mt-1">Since last heat</div>
            </div>
            <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: '#FEF3E2', borderColor: '#FBBF24' }}>
              <div className="text-sm font-medium" style={{ color: brand.accent }}>Next heat expected</div>
              <div className="text-lg font-semibold" style={{ color: brand.dark }}>~15-25 Feb 2026</div>
            </div>
            <button className="w-full mt-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors" style={{ color: brand.secondary, borderColor: brand.secondary }}>
              Log Cycle Update
            </button>
          </BrandedBox>

          {/* Breeding History */}
          <BrandedBox className="col-span-3">
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Breeding History</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Litter</th>
                  <th className="pb-2">Sire</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Puppies</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium">Maple x Teddy 2025</td>
                  <td className="py-3">Teddy</td>
                  <td className="py-3">Aug 2025</td>
                  <td className="py-3">7 (4F, 3M)</td>
                  <td className="py-3"><StatusBadge status="Complete" color="green" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium">Maple x Bear 2024</td>
                  <td className="py-3">Bear</td>
                  <td className="py-3">Mar 2024</td>
                  <td className="py-3">6 (3F, 3M)</td>
                  <td className="py-3"><StatusBadge status="Complete" color="green" /></td>
                </tr>
              </tbody>
            </table>
          </BrandedBox>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="grid grid-cols-2 gap-6">
          <BrandedBox>
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>DNA Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>PRA (Progressive Retinal Atrophy)</span>
                <StatusBadge status="Carrier" color="yellow" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>vWD (Von Willebrand Disease)</span>
                <StatusBadge status="Clear" color="green" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>DM (Degenerative Myelopathy)</span>
                <StatusBadge status="Clear" color="green" />
              </div>
              <div className="flex justify-between py-2">
                <span>IC (Improper Coat)</span>
                <StatusBadge status="Clear" color="green" />
              </div>
            </div>
          </BrandedBox>
          <BrandedBox>
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Colour & Coat Genetics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Base Colour</span>
                <span className="font-medium">ee (Red/Cream)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Brown</span>
                <span className="font-medium">Bb (Carries brown)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Furnishings</span>
                <span className="font-medium">FF (Furnished)</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Coat Curl</span>
                <span className="font-medium">CC (Curly)</span>
              </div>
            </div>
          </BrandedBox>
          <BrandedBox>
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Vaccination Record</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>C5 Vaccination</span>
                <span className="text-gray-600">Due: 15 May 2026</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Heartworm</span>
                <span className="text-gray-600">Monthly (current)</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Kennel Cough</span>
                <span className="text-gray-600">Due: 20 Aug 2026</span>
              </div>
            </div>
          </BrandedBox>
          <BrandedBox>
            <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Hip & Elbow Scores</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Hips (PennHIP)</span>
                  <span className="font-medium text-green-600">0.32 / 0.35</span>
                </div>
                <div className="text-xs text-gray-500">Excellent - top 30% of breed</div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Elbows</span>
                  <span className="font-medium text-green-600">0 / 0</span>
                </div>
                <div className="text-xs text-gray-500">Clear - no signs of dysplasia</div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">Assessed: 12 Jan 2024 by Dr. Smith</div>
              </div>
            </div>
          </BrandedBox>
        </div>
      )}

      {activeTab === 'lineage' && (
        <BrandedBox>
          <h3 className="font-semibold mb-6" style={{ color: brand.dark }}>Family Tree</h3>
          <div className="flex justify-center">
            {/* Simplified family tree visualization */}
            <div className="flex flex-col items-center">
              {/* Grandparents */}
              <div className="flex gap-16 mb-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-xs border-2 border-blue-200">
                    <span className="font-medium">Max</span>
                    <span className="text-gray-500">G-Sire</span>
                  </div>
                  <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center text-xs border-2" style={{ backgroundColor: '#FCE7D6', borderColor: brand.primary }}>
                    <span className="font-medium">Bella</span>
                    <span className="text-gray-500">G-Dam</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-xs border-2 border-blue-200">
                    <span className="font-medium">Charlie</span>
                    <span className="text-gray-500">G-Sire</span>
                  </div>
                  <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center text-xs border-2" style={{ backgroundColor: '#FCE7D6', borderColor: brand.primary }}>
                    <span className="font-medium">Luna</span>
                    <span className="text-gray-500">G-Dam</span>
                  </div>
                </div>
              </div>
              {/* Connecting lines */}
              <div className="flex gap-32 mb-4">
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="w-px h-8 bg-gray-300"></div>
              </div>
              {/* Parents */}
              <div className="flex gap-24 mb-4">
                <div className="w-24 h-24 bg-blue-200 rounded-lg flex flex-col items-center justify-center text-sm border-2 border-blue-300">
                  <span className="font-semibold">Cooper</span>
                  <span className="text-gray-600 text-xs">Sire</span>
                  <StatusBadge status="Clear" color="green" />
                </div>
                <div className="w-24 h-24 rounded-lg flex flex-col items-center justify-center text-sm border-2" style={{ backgroundColor: '#F5DCC8', borderColor: brand.secondary }}>
                  <span className="font-semibold">Rosie</span>
                  <span className="text-gray-600 text-xs">Dam</span>
                  <StatusBadge status="Clear" color="green" />
                </div>
              </div>
              {/* Connecting line */}
              <div className="w-px h-8 bg-gray-300 mb-4"></div>
              {/* Current dog */}
              <div className="w-32 h-32 rounded-xl flex flex-col items-center justify-center border-4 shadow-lg" style={{ backgroundColor: brand.primary, borderColor: brand.secondary }}>
                <span className="font-bold text-lg" style={{ color: brand.dark }}>Maple</span>
                <span className="text-sm" style={{ color: brand.accent }}>Current Dog</span>
                <div className="mt-1">
                  <StatusBadge status="PRA Carrier" color="yellow" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-sm rounded-lg hover:opacity-90 transition-opacity" style={{ color: brand.secondary, border: `1px solid ${brand.secondary}` }}>
              View Full Pedigree (5 Generations)
            </button>
          </div>
        </BrandedBox>
      )}

      {activeTab === 'breeding' && (
        <div className="text-center py-12 text-gray-500">
          Breeding plans and compatibility will be shown here
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="text-center py-12 text-gray-500">
          Contracts, certificates, and documents will be shown here
        </div>
      )}
    </div>
  );
};

// Screen 2: Breeding Plan
const BreedingPlan = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: brand.dark }}>Breeding Plans</h2>
        <button className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: brand.secondary }}>
          + New Breeding Plan
        </button>
      </div>

      {/* Active Breeding Plan */}
      <BrandedBox>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: brand.dark }}>Planned: Maple × Teddy (Feb 2026)</h3>
          <StatusBadge status="Awaiting Heat" color="brand" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Dam */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-xl flex items-center justify-center text-gray-400 mb-2 border-2" style={{ backgroundColor: '#FCE7D6', borderColor: brand.primary }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-semibold" style={{ color: brand.dark }}>Maple</div>
            <div className="text-sm text-gray-500">Dam (F1B Groodle)</div>
            <div className="mt-2">
              <StatusBadge status="Ready" color="green" />
            </div>
          </div>

          {/* Compatibility */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl mb-2" style={{ color: brand.accent }}>×</div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 w-full">
              <div className="text-center">
                <div className="text-2xl mb-1">✓</div>
                <div className="font-semibold text-green-800">Compatible</div>
                <div className="text-xs text-green-600 mt-1">No genetic conflicts</div>
              </div>
            </div>
          </div>

          {/* Sire */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-xl flex items-center justify-center text-gray-400 mb-2 border-2 border-blue-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-semibold" style={{ color: brand.dark }}>Teddy</div>
            <div className="text-sm text-gray-500">Sire (Poodle)</div>
            <div className="mt-2">
              <StatusBadge status="Ready" color="green" />
            </div>
          </div>
        </div>

        {/* Genetic Compatibility Details */}
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: brand.cream }}>
          <h4 className="font-medium mb-3" style={{ color: brand.dark }}>Genetic Compatibility Check</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>PRA</span>
              <span className="text-green-600">✓ Carrier × Clear = Safe</span>
            </div>
            <div className="flex justify-between">
              <span>vWD</span>
              <span className="text-green-600">✓ Clear × Clear = Safe</span>
            </div>
            <div className="flex justify-between">
              <span>DM</span>
              <span className="text-green-600">✓ Clear × Clear = Safe</span>
            </div>
            <div className="flex justify-between">
              <span>Coat</span>
              <span className="text-green-600">✓ Compatible</span>
            </div>
          </div>
        </div>

        {/* Predicted Outcomes */}
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#FEF3E2' }}>
          <h4 className="font-medium mb-3" style={{ color: brand.dark }}>Predicted Litter Outcomes</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Coat Type</div>
              <div className="font-medium">100% Furnished</div>
            </div>
            <div>
              <div className="text-gray-500">Colours</div>
              <div className="font-medium">Apricot, Cream, Red</div>
            </div>
            <div>
              <div className="text-gray-500">PRA Status</div>
              <div className="font-medium">50% Clear, 50% Carrier</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <h4 className="font-medium mb-3" style={{ color: brand.dark }}>Breeding Timeline</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: brand.secondary }}>1</div>
              <div className="flex-1 h-1 bg-gray-200"></div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-medium">2</div>
              <div className="flex-1 h-1 bg-gray-200"></div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-medium">3</div>
              <div className="flex-1 h-1 bg-gray-200"></div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-medium">4</div>
              <div className="flex-1 h-1 bg-gray-200"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-medium">5</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span className="font-medium" style={{ color: brand.secondary }}>Heat Detection</span>
            <span>Progesterone</span>
            <span>Mating</span>
            <span>Pregnancy</span>
            <span>Birth</span>
          </div>
        </div>
      </BrandedBox>

      {/* Incompatible Pairing Example */}
      <BrandedBox className="border-red-200 bg-red-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">⚠️ Flagged: Maple × Bruno</h3>
          <StatusBadge status="Not Recommended" color="red" />
        </div>
        <div className="p-4 bg-white rounded-xl border border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <span className="text-2xl">❌</span>
            <div>
              <div className="font-medium">Genetic Conflict Detected</div>
              <div className="text-sm">Both dogs are PRA Carriers — 25% of puppies would be affected</div>
            </div>
          </div>
        </div>
      </BrandedBox>
    </div>
  );
};

// Screen 3: Litter Timeline
const LitterTimeline = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: brand.dark }}>Litter: Maple × Teddy 2026</h2>
        <StatusBadge status="Week 5 - Eyes Opening" color="brand" />
      </div>

      {/* Progress Timeline */}
      <BrandedBox>
        <div className="flex items-center justify-between mb-6">
          {['Mating', 'Confirmed', 'Week 3', 'Week 5', 'Week 7', 'Matching', 'Handover'].map((stage, i) => (
            <div key={stage} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                i < 4 ? 'text-white' :
                i === 4 ? 'text-white' :
                'bg-gray-200 text-gray-500'
              }`} style={i < 4 ? { backgroundColor: '#22C55E' } : i === 4 ? { backgroundColor: brand.secondary } : {}}>
                {i < 4 ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-500 mt-2">{stage}</span>
            </div>
          ))}
        </div>
        <ProgressBar progress={65} label="Litter Progress" />
      </BrandedBox>

      <div className="grid grid-cols-3 gap-6">
        {/* Litter Details */}
        <BrandedBox className="col-span-2">
          <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Puppies (7)</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Pink', sex: 'F', colour: 'Apricot', status: 'Reserved', buyer: 'Sarah T.' },
              { name: 'Blue', sex: 'M', colour: 'Cream', status: 'Reserved', buyer: 'Mike R.' },
              { name: 'Green', sex: 'F', colour: 'Apricot', status: 'Reserved', buyer: 'Jenny L.' },
              { name: 'Red', sex: 'M', colour: 'Red', status: 'Available', buyer: null },
              { name: 'Yellow', sex: 'F', colour: 'Cream', status: 'Reserved', buyer: 'David K.' },
              { name: 'Purple', sex: 'M', colour: 'Apricot', status: 'Holding', buyer: null },
              { name: 'Orange', sex: 'F', colour: 'Apricot', status: 'Guardian', buyer: 'TBD' },
            ].map((pup) => (
              <div key={pup.name} className="p-3 rounded-xl border border-gray-200 text-center" style={{ backgroundColor: brand.cream }}>
                <div className="w-12 h-12 mx-auto rounded-full mb-2 flex items-center justify-center text-xs font-medium" style={{ backgroundColor: brand.primary, color: brand.dark }}>
                  {pup.name}
                </div>
                <div className="text-sm font-medium">{pup.colour}</div>
                <div className="text-xs text-gray-500">{pup.sex === 'F' ? 'Female' : 'Male'}</div>
                <div className="mt-2">
                  <StatusBadge
                    status={pup.status}
                    color={pup.status === 'Reserved' ? 'green' : pup.status === 'Available' ? 'brand' : 'yellow'}
                  />
                </div>
                {pup.buyer && <div className="text-xs text-gray-500 mt-1">{pup.buyer}</div>}
              </div>
            ))}
          </div>
        </BrandedBox>

        {/* Waitlist for this litter */}
        <BrandedBox>
          <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Linked Waitlist</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah T.', pref: 'Female, any colour', status: 'Matched' },
              { name: 'Mike R.', pref: 'Male, light colour', status: 'Matched' },
              { name: 'Jenny L.', pref: 'Female preferred', status: 'Matched' },
              { name: 'David K.', pref: 'Any', status: 'Matched' },
              { name: 'Lisa M.', pref: 'Female, apricot', status: 'Waiting' },
            ].map((person) => (
              <div key={person.name} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium">{person.name}</div>
                  <div className="text-xs text-gray-500">{person.pref}</div>
                </div>
                <StatusBadge
                  status={person.status}
                  color={person.status === 'Matched' ? 'green' : 'yellow'}
                />
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm border rounded-lg hover:opacity-90 transition-opacity" style={{ color: brand.secondary, borderColor: brand.secondary }}>
            Manage Matching
          </button>
        </BrandedBox>
      </div>

      {/* Updates & Photos */}
      <BrandedBox>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold" style={{ color: brand.dark }}>Litter Updates</h3>
          <button className="px-3 py-1 text-sm text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: brand.secondary }}>
            + Add Update
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: brand.cream }}>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Week 5 Update</span>
              <span>Today</span>
            </div>
            <p className="text-sm mb-3">Eyes are starting to open! All puppies are healthy and gaining weight well. Individual personalities are starting to emerge.</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-green-600">✓ Published to buyer portal</div>
          </div>
        </div>
      </BrandedBox>

      {/* Key Dates */}
      <BrandedBox>
        <h3 className="font-semibold mb-4" style={{ color: brand.dark }}>Key Dates</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="text-gray-500">Mating Date</div>
            <div className="font-semibold">28 Dec 2025</div>
            <div className="text-xs text-green-600">✓ Complete</div>
          </div>
          <div className="p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="text-gray-500">Birth Date</div>
            <div className="font-semibold">1 Mar 2026</div>
            <div className="text-xs text-green-600">✓ Complete</div>
          </div>
          <div className="p-3 rounded-xl border" style={{ backgroundColor: '#FEF3E2', borderColor: brand.secondary }}>
            <div className="text-gray-500">Matching</div>
            <div className="font-semibold">~22 Mar 2026</div>
            <div className="text-xs" style={{ color: brand.secondary }}>Week 3</div>
          </div>
          <div className="p-3 rounded-xl border border-gray-200" style={{ backgroundColor: brand.cream }}>
            <div className="text-gray-500">Pickup</div>
            <div className="font-semibold">~26 Apr 2026</div>
            <div className="text-xs text-gray-500">Week 8</div>
          </div>
        </div>
      </BrandedBox>
    </div>
  );
};

// Screen 4: Buyer Portal (Fully Branded)
const BuyerPortal = () => {
  return (
    <div className="min-h-screen -m-6 p-6" style={{ background: `linear-gradient(180deg, ${brand.primary} 0%, ${brand.cream} 30%, white 100%)` }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <NBGLogo size="normal" />
          <div>
            <div className="text-sm font-semibold" style={{ color: brand.accent }}>Northern Beaches Groodles</div>
            <h1 className="text-2xl font-bold" style={{ color: brand.dark }}>Welcome, Sarah! 🐾</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: brand.accent }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: brand.secondary, color: 'white' }}>
            ST
          </div>
        </div>
      </div>

      {/* Status Card */}
      <BrandedBox className="mb-6 border-2" style={{ borderColor: brand.secondary }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Your Status</div>
            <div className="text-xl font-bold" style={{ color: '#22C55E' }}>Matched to Puppy!</div>
          </div>
          <StatusBadge status="Pink Collar - Female" color="brand" />
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
          <div className="text-sm" style={{ color: '#166534' }}>
            🎉 Congratulations! You've been matched with <strong>Pink collar</strong> from the Maple × Teddy litter.
            Pickup is scheduled for <strong>26 April 2026</strong>.
          </div>
        </div>
      </BrandedBox>

      {/* My Puppy Section */}
      <BrandedBox className="mb-6">
        <h2 className="font-semibold mb-4" style={{ color: brand.dark }}>Your Puppy</h2>
        <div className="flex gap-6">
          <div className="w-48 h-48 rounded-xl flex items-center justify-center text-gray-400" style={{ backgroundColor: brand.primary }}>
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Identifier</div>
                <div className="font-medium" style={{ color: brand.dark }}>Pink Collar</div>
              </div>
              <div>
                <div className="text-gray-500">Sex</div>
                <div className="font-medium" style={{ color: brand.dark }}>Female</div>
              </div>
              <div>
                <div className="text-gray-500">Colour</div>
                <div className="font-medium" style={{ color: brand.dark }}>Apricot</div>
              </div>
              <div>
                <div className="text-gray-500">Born</div>
                <div className="font-medium" style={{ color: brand.dark }}>1 March 2026</div>
              </div>
              <div>
                <div className="text-gray-500">Current Age</div>
                <div className="font-medium" style={{ color: brand.dark }}>5 weeks old</div>
              </div>
              <div>
                <div className="text-gray-500">Go-Home Date</div>
                <div className="font-medium" style={{ color: brand.dark }}>26 April 2026</div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: brand.secondary }}>
              View All Photos
            </button>
          </div>
        </div>
      </BrandedBox>

      {/* Journey Timeline */}
      <BrandedBox className="mb-6">
        <h2 className="font-semibold mb-4" style={{ color: brand.dark }}>Your Journey</h2>
        <div className="space-y-4">
          {[
            { date: '15 Oct 2025', title: 'Application Approved', desc: 'Welcome to the NBG family!', done: true },
            { date: '20 Oct 2025', title: 'Deposit Paid', desc: '$500 deposit confirmed', done: true },
            { date: '28 Dec 2025', title: 'Litter Confirmed', desc: 'Maple × Teddy mating successful', done: true },
            { date: '1 Mar 2026', title: 'Puppies Born!', desc: '7 healthy puppies arrived', done: true },
            { date: '22 Mar 2026', title: 'Puppy Matched', desc: "You've been matched with Pink collar", done: true },
            { date: '5 Apr 2026', title: 'Microchip & Vaccinations', desc: 'Health checks complete', done: false, current: true },
            { date: '26 Apr 2026', title: 'Pickup Day!', desc: 'Your puppy comes home', done: false },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full`} style={{
                  backgroundColor: item.done ? '#22C55E' : item.current ? brand.secondary : '#D1D5DB'
                }}></div>
                {i < 6 && <div className="w-0.5 h-8 bg-gray-200"></div>}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between">
                  <div className="font-medium text-sm" style={{ color: brand.dark }}>{item.title}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </BrandedBox>

      {/* Latest Updates */}
      <BrandedBox className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold" style={{ color: brand.dark }}>Latest Updates</h2>
          <span className="text-sm font-medium cursor-pointer hover:opacity-70" style={{ color: brand.secondary }}>View All</span>
        </div>
        <div className="p-4 rounded-xl border" style={{ backgroundColor: '#FEF7ED', borderColor: brand.secondary }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium" style={{ color: brand.accent }}>Week 5 Update</span>
            <span className="text-gray-500">Today</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Eyes are starting to open! Pink collar is doing wonderfully — she's one of the more adventurous pups in the litter.
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-24 rounded-lg flex items-center justify-center text-gray-400" style={{ backgroundColor: brand.primary }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </BrandedBox>

      {/* Checklist */}
      <BrandedBox>
        <h2 className="font-semibold mb-4" style={{ color: brand.dark }}>Pickup Checklist</h2>
        <div className="space-y-3">
          {[
            { task: 'Sign puppy contract', done: true },
            { task: 'Pay remaining balance ($4,500)', done: false },
            { task: 'Confirm pickup date & time', done: false },
            { task: 'Prepare puppy supplies', done: false },
            { task: 'Book first vet appointment', done: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.done ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                {item.done && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : ''}`} style={{ color: item.done ? undefined : brand.dark }}>
                {item.task}
              </span>
            </label>
          ))}
        </div>
      </BrandedBox>

      {/* Footer */}
      <div className="mt-8 text-center">
        <NBGLogo size="small" />
        <div className="text-xs mt-2" style={{ color: brand.accent }}>Northern Beaches Groodles</div>
        <div className="text-xs text-gray-400 mt-1">Ethically bred with love on Sydney's Northern Beaches</div>
      </div>
    </div>
  );
};

// Main App with Navigation
export default function DogCRMWireframes() {
  const [currentScreen, setCurrentScreen] = useState('dog-profile');

  const screens = {
    'dog-profile': { label: 'Dog Profile', component: DogProfile },
    'breeding-plan': { label: 'Breeding Plan', component: BreedingPlan },
    'litter-timeline': { label: 'Litter Timeline', component: LitterTimeline },
    'buyer-portal': { label: 'Buyer Portal', component: BuyerPortal },
  };

  const CurrentComponent = screens[currentScreen].component;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <NBGLogo size="small" />
              <div>
                <div className="font-bold text-lg" style={{ color: brand.dark }}>PupPath</div>
                <div className="text-xs" style={{ color: brand.accent }}>Northern Beaches Groodles</div>
              </div>
            </div>
            <div className="flex gap-2">
              {Object.entries(screens).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setCurrentScreen(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentScreen === key
                      ? 'text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={currentScreen === key ? { backgroundColor: brand.secondary } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        <CurrentComponent />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm" style={{ color: brand.accent }}>
          PupPath MVP Wireframes — Draft for Northern Beaches Groodles
        </div>
      </footer>
    </div>
  );
}
