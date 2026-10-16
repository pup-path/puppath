import React, { useState } from 'react';

// Data Model & Architecture Diagrams for PupPath MVP
// Northern Beaches Groodles

const brand = {
  primary: '#E8D4C4',
  secondary: '#E89B3C',
  accent: '#5D3A4D',
  cream: '#F5EDE6',
  dark: '#3D2A35',
};

// Entity Card Component
const EntityCard = ({ name, type, fields, color = "blue", isCore = false }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', header: 'bg-blue-500' },
    green: { bg: 'bg-green-50', border: 'border-green-300', header: 'bg-green-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', header: 'bg-purple-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', header: 'bg-orange-500' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', header: 'bg-pink-500' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', header: 'bg-yellow-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-300', header: 'bg-gray-500' },
  };
  const c = colors[color];

  return (
    <div className={`rounded-lg border-2 ${c.border} ${c.bg} overflow-hidden shadow-sm ${isCore ? 'ring-2 ring-offset-2 ring-orange-400' : ''}`}>
      <div className={`${c.header} text-white px-3 py-2 font-semibold text-sm`}>
        {name}
        {type && <span className="text-xs font-normal opacity-80 ml-2">({type})</span>}
      </div>
      <div className="p-3 text-xs space-y-1">
        {fields.map((field, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className={field.pk ? 'font-bold' : field.fk ? 'italic text-gray-600' : ''}>
              {field.pk && '🔑 '}{field.fk && '🔗 '}{field.name}
            </span>
            <span className="text-gray-500">{field.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Architecture Component Box
const ArchBox = ({ title, items, color, icon }) => (
  <div className={`rounded-xl p-4 ${color} border-2 border-white shadow-lg`}>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-white">{title}</span>
    </div>
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="text-sm text-white/90 bg-white/20 rounded px-2 py-1">
          {item}
        </div>
      ))}
    </div>
  </div>
);

// Data Model Diagram
const DataModel = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: brand.dark }}>Data Model (ERD)</h2>
        <p className="text-gray-600 text-sm mb-6">Core entities and relationships for PupPath MVP. Orange ring = core entities.</p>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs bg-gray-100 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span>🔑</span> Primary Key
        </div>
        <div className="flex items-center gap-2">
          <span>🔗</span> Foreign Key
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-orange-400 ring-offset-1 rounded"></div>
          Core Entity
        </div>
      </div>

      {/* Tier 1: Core Entities */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          Core Entities (Breeder Program)
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <EntityCard
            name="Breeder"
            type="Tenant"
            color="blue"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'business_name', type: 'string' },
              { name: 'contact_email', type: 'string' },
              { name: 'contact_phone', type: 'string' },
              { name: 'logo_url', type: 'string' },
              { name: 'brand_colors', type: 'json' },
              { name: 'subscription_tier', type: 'enum' },
              { name: 'created_at', type: 'timestamp' },
            ]}
          />
          <EntityCard
            name="Dog"
            type="Breeding Animal"
            color="blue"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'name', type: 'string' },
              { name: 'registered_name', type: 'string' },
              { name: 'microchip', type: 'string' },
              { name: 'sex', type: 'enum' },
              { name: 'dob', type: 'date' },
              { name: 'colour', type: 'string' },
              { name: 'breed_type', type: 'string' },
              { name: 'sire_id', type: 'uuid', fk: true },
              { name: 'dam_id', type: 'uuid', fk: true },
              { name: 'status', type: 'enum' },
              { name: 'location_type', type: 'enum' },
              { name: 'guardian_id', type: 'uuid', fk: true },
            ]}
          />
          <EntityCard
            name="HealthRecord"
            type="Medical/Genetic"
            color="green"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'dog_id', type: 'uuid', fk: true },
              { name: 'record_type', type: 'enum' },
              { name: 'test_name', type: 'string' },
              { name: 'result', type: 'string' },
              { name: 'result_data', type: 'json' },
              { name: 'status', type: 'enum' },
              { name: 'test_date', type: 'date' },
              { name: 'expiry_date', type: 'date' },
              { name: 'vet_name', type: 'string' },
              { name: 'document_url', type: 'string' },
            ]}
          />
          <EntityCard
            name="CycleLog"
            type="Heat Tracking"
            color="green"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'dog_id', type: 'uuid', fk: true },
              { name: 'cycle_start', type: 'date' },
              { name: 'cycle_end', type: 'date' },
              { name: 'notes', type: 'text' },
              { name: 'progesterone_tests', type: 'json' },
              { name: 'outcome', type: 'enum' },
            ]}
          />
        </div>
      </div>

      {/* Tier 2: Breeding & Litters */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
          Breeding & Litters
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <EntityCard
            name="BreedingPlan"
            type="Planned Pairing"
            color="purple"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'dam_id', type: 'uuid', fk: true },
              { name: 'sire_id', type: 'uuid', fk: true },
              { name: 'planned_date', type: 'date' },
              { name: 'status', type: 'enum' },
              { name: 'compatibility_check', type: 'json' },
              { name: 'predicted_outcomes', type: 'json' },
              { name: 'notes', type: 'text' },
            ]}
          />
          <EntityCard
            name="Litter"
            type="Born Litter"
            color="purple"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'breeding_plan_id', type: 'uuid', fk: true },
              { name: 'dam_id', type: 'uuid', fk: true },
              { name: 'sire_id', type: 'uuid', fk: true },
              { name: 'mating_date', type: 'date' },
              { name: 'birth_date', type: 'date' },
              { name: 'puppy_count', type: 'int' },
              { name: 'status', type: 'enum' },
              { name: 'expected_pickup', type: 'date' },
            ]}
          />
          <EntityCard
            name="Puppy"
            type="Individual Pup"
            color="purple"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'litter_id', type: 'uuid', fk: true },
              { name: 'collar_color', type: 'string' },
              { name: 'sex', type: 'enum' },
              { name: 'colour', type: 'string' },
              { name: 'microchip', type: 'string' },
              { name: 'status', type: 'enum' },
              { name: 'buyer_id', type: 'uuid', fk: true },
              { name: 'temperament_notes', type: 'text' },
              { name: 'health_notes', type: 'text' },
            ]}
          />
          <EntityCard
            name="LitterUpdate"
            type="Progress Posts"
            color="purple"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'litter_id', type: 'uuid', fk: true },
              { name: 'week_number', type: 'int' },
              { name: 'title', type: 'string' },
              { name: 'content', type: 'text' },
              { name: 'photos', type: 'json' },
              { name: 'published_to_portal', type: 'bool' },
              { name: 'created_at', type: 'timestamp' },
            ]}
          />
        </div>
      </div>

      {/* Tier 3: People & Relationships */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          People & Relationships
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <EntityCard
            name="Person"
            type="Contact/User"
            color="orange"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'email', type: 'string' },
              { name: 'first_name', type: 'string' },
              { name: 'last_name', type: 'string' },
              { name: 'phone', type: 'string' },
              { name: 'address', type: 'json' },
              { name: 'person_type', type: 'enum[]' },
              { name: 'portal_access', type: 'bool' },
              { name: 'auth_user_id', type: 'uuid', fk: true },
            ]}
          />
          <EntityCard
            name="Application"
            type="Buyer App"
            color="orange"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'person_id', type: 'uuid', fk: true },
              { name: 'status', type: 'enum' },
              { name: 'submitted_at', type: 'timestamp' },
              { name: 'responses', type: 'json' },
              { name: 'screening_notes', type: 'text' },
              { name: 'approved_at', type: 'timestamp' },
              { name: 'rejected_reason', type: 'text' },
            ]}
          />
          <EntityCard
            name="Waitlist"
            type="Deposit Holder"
            color="orange"
            isCore
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'person_id', type: 'uuid', fk: true },
              { name: 'application_id', type: 'uuid', fk: true },
              { name: 'deposit_amount', type: 'decimal' },
              { name: 'deposit_date', type: 'date' },
              { name: 'preferences', type: 'json' },
              { name: 'litter_id', type: 'uuid', fk: true },
              { name: 'status', type: 'enum' },
              { name: 'position', type: 'int' },
            ]}
          />
          <EntityCard
            name="Guardian"
            type="Guardian Contract"
            color="orange"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'person_id', type: 'uuid', fk: true },
              { name: 'dog_id', type: 'uuid', fk: true },
              { name: 'contract_start', type: 'date' },
              { name: 'contract_end', type: 'date' },
              { name: 'terms', type: 'json' },
              { name: 'status', type: 'enum' },
              { name: 'breeding_count', type: 'int' },
              { name: 'max_breedings', type: 'int' },
            ]}
          />
        </div>
      </div>

      {/* Tier 4: Documents & System */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
          Documents & System
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <EntityCard
            name="Document"
            type="File/Contract"
            color="gray"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'doc_type', type: 'enum' },
              { name: 'related_type', type: 'string' },
              { name: 'related_id', type: 'uuid' },
              { name: 'file_url', type: 'string' },
              { name: 'file_name', type: 'string' },
              { name: 'signed_at', type: 'timestamp' },
              { name: 'created_at', type: 'timestamp' },
            ]}
          />
          <EntityCard
            name="Communication"
            type="Message Log"
            color="gray"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'person_id', type: 'uuid', fk: true },
              { name: 'channel', type: 'enum' },
              { name: 'direction', type: 'enum' },
              { name: 'subject', type: 'string' },
              { name: 'content', type: 'text' },
              { name: 'sent_at', type: 'timestamp' },
            ]}
          />
          <EntityCard
            name="AuditLog"
            type="Change History"
            color="gray"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'user_id', type: 'uuid', fk: true },
              { name: 'entity_type', type: 'string' },
              { name: 'entity_id', type: 'uuid' },
              { name: 'action', type: 'enum' },
              { name: 'changes', type: 'json' },
              { name: 'created_at', type: 'timestamp' },
            ]}
          />
          <EntityCard
            name="Notification"
            type="System Alerts"
            color="gray"
            fields={[
              { name: 'id', type: 'uuid', pk: true },
              { name: 'breeder_id', type: 'uuid', fk: true },
              { name: 'person_id', type: 'uuid', fk: true },
              { name: 'type', type: 'enum' },
              { name: 'title', type: 'string' },
              { name: 'message', type: 'text' },
              { name: 'read_at', type: 'timestamp' },
              { name: 'created_at', type: 'timestamp' },
            ]}
          />
        </div>
      </div>

      {/* Relationships Diagram */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-700 mb-4">Key Relationships</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Lineage (Self-referential)</div>
            <div className="text-gray-600 pl-4 border-l-2 border-blue-300">
              Dog → sire_id → Dog<br />
              Dog → dam_id → Dog<br />
              <span className="text-xs text-gray-500">Enables full family tree traversal</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Breeding Flow</div>
            <div className="text-gray-600 pl-4 border-l-2 border-purple-300">
              BreedingPlan → Litter → Puppy<br />
              Puppy → Waitlist (via buyer_id)<br />
              <span className="text-xs text-gray-500">Tracks planned → actual → placed</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Buyer Journey</div>
            <div className="text-gray-600 pl-4 border-l-2 border-orange-300">
              Person → Application → Waitlist → Puppy<br />
              <span className="text-xs text-gray-500">Enquiry → Approved → Deposit → Matched</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Guardian Model</div>
            <div className="text-gray-600 pl-4 border-l-2 border-orange-300">
              Guardian links Person ↔ Dog<br />
              Dog.location_type = 'guardian'<br />
              <span className="text-xs text-gray-500">Tracks contract terms & breeding count</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Multi-tenancy</div>
            <div className="text-gray-600 pl-4 border-l-2 border-blue-300">
              Every entity has breeder_id<br />
              Row-level security in Supabase<br />
              <span className="text-xs text-gray-500">Complete data isolation per breeder</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-800">Portal Access</div>
            <div className="text-gray-600 pl-4 border-l-2 border-green-300">
              Person.portal_access = true<br />
              Person.auth_user_id → Supabase Auth<br />
              <span className="text-xs text-gray-500">Buyers/guardians get portal login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enum Values Reference */}
      <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
        <h3 className="font-semibold text-gray-700 mb-4">Key Enum Values</h3>
        <div className="grid grid-cols-3 gap-6 text-xs">
          <div>
            <div className="font-medium mb-2">Dog.status</div>
            <div className="text-gray-600">incomplete, cleared, active, retired, deceased</div>
          </div>
          <div>
            <div className="font-medium mb-2">Dog.location_type</div>
            <div className="text-gray-600">breeder, guardian, sold, external_stud</div>
          </div>
          <div>
            <div className="font-medium mb-2">HealthRecord.record_type</div>
            <div className="text-gray-600">dna, hips, elbows, vaccination, semen_analysis, fit_for_flight</div>
          </div>
          <div>
            <div className="font-medium mb-2">Application.status</div>
            <div className="text-gray-600">submitted, reviewing, approved, rejected, withdrawn</div>
          </div>
          <div>
            <div className="font-medium mb-2">Waitlist.status</div>
            <div className="text-gray-600">active, linked_to_litter, matched, completed, refunded</div>
          </div>
          <div>
            <div className="font-medium mb-2">Puppy.status</div>
            <div className="text-gray-600">available, reserved, matched, sold, guardian, holding</div>
          </div>
          <div>
            <div className="font-medium mb-2">Litter.status</div>
            <div className="text-gray-600">planned, confirmed, born, weaning, ready, completed</div>
          </div>
          <div>
            <div className="font-medium mb-2">Person.person_type</div>
            <div className="text-gray-600">enquiry, applicant, waitlist, buyer, owner, guardian, guardian_prospect</div>
          </div>
          <div>
            <div className="font-medium mb-2">Document.doc_type</div>
            <div className="text-gray-600">purchase_contract, guardian_contract, health_cert, registration, other</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Architecture Diagram
const Architecture = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: brand.dark }}>System Architecture</h2>
        <p className="text-gray-600 text-sm mb-6">MVP architecture using Next.js + Supabase stack</p>
      </div>

      {/* High-level Architecture */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-3 gap-6">

          {/* Frontend Layer */}
          <div className="space-y-4">
            <div className="text-center text-sm font-medium text-slate-400 mb-4">FRONTEND</div>
            <ArchBox
              title="Next.js App"
              icon="⚛️"
              color="bg-blue-600"
              items={[
                'Breeder Admin UI',
                'Buyer Portal',
                'Guardian Portal',
                'Server Components',
                'API Routes',
              ]}
            />
            <ArchBox
              title="Hosting"
              icon="▲"
              color="bg-black"
              items={[
                'Vercel',
                'Edge Functions',
                'Auto-scaling',
                'CDN',
              ]}
            />
          </div>

          {/* Backend Layer */}
          <div className="space-y-4">
            <div className="text-center text-sm font-medium text-slate-400 mb-4">BACKEND (Supabase)</div>
            <ArchBox
              title="PostgreSQL"
              icon="🐘"
              color="bg-green-600"
              items={[
                'Core Data Store',
                'Row-Level Security',
                'Multi-tenant isolation',
                'JSON columns for flex',
              ]}
            />
            <ArchBox
              title="Auth"
              icon="🔐"
              color="bg-purple-600"
              items={[
                'Email/Password',
                'Magic Links',
                'Role-based access',
                'Portal user auth',
              ]}
            />
            <ArchBox
              title="Storage"
              icon="📁"
              color="bg-yellow-600"
              items={[
                'Photos (puppies/litters)',
                'Documents (contracts)',
                'Health certificates',
                'Signed URLs',
              ]}
            />
          </div>

          {/* Services Layer */}
          <div className="space-y-4">
            <div className="text-center text-sm font-medium text-slate-400 mb-4">SERVICES</div>
            <ArchBox
              title="Edge Functions"
              icon="⚡"
              color="bg-orange-600"
              items={[
                'Email notifications',
                'Webhook handlers',
                'Scheduled jobs',
                'PDF generation',
              ]}
            />
            <ArchBox
              title="Integrations"
              icon="🔌"
              color="bg-pink-600"
              items={[
                'SendGrid (email)',
                'Stripe (payments)*',
                'Xero (accounting)*',
                '* = post-MVP',
              ]}
            />
            <ArchBox
              title="Realtime"
              icon="📡"
              color="bg-teal-600"
              items={[
                'Portal updates',
                'Notifications',
                'Supabase Realtime',
              ]}
            />
          </div>
        </div>

        {/* Arrows / Flow */}
        <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 text-2xl text-slate-500">→</div>
        <div className="absolute top-1/2 left-2/3 transform -translate-y-1/2 text-2xl text-slate-500">→</div>
      </div>

      {/* User Flows */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span>👩‍💼</span> Breeder Admin Flow
          </h3>
          <div className="space-y-2 text-sm text-blue-900">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs">1</span>
              Login via Supabase Auth
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs">2</span>
              RLS filters data to their breeder_id
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs">3</span>
              Full CRUD on dogs, litters, applications
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs">4</span>
              Publish updates → triggers portal notification
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <span>🐕</span> Buyer Portal Flow
          </h3>
          <div className="space-y-2 text-sm text-orange-900">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">1</span>
              Login via Magic Link (email)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">2</span>
              RLS restricts to their person record
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">3</span>
              View their puppy, updates, documents
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">4</span>
              Realtime subscription for new updates
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="bg-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Tech Stack Summary</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-800 mb-2">Frontend</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Next.js 14 (App Router)</li>
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• React Query</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-2">Backend</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Supabase (hosted)</li>
              <li>• PostgreSQL 15</li>
              <li>• Row-Level Security</li>
              <li>• Edge Functions</li>
              <li>• Realtime subscriptions</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-2">Infrastructure</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Vercel (frontend)</li>
              <li>• Supabase Cloud (backend)</li>
              <li>• GitHub (source)</li>
              <li>• GitHub Actions (CI/CD)</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-2">Integrations (MVP)</div>
            <ul className="text-gray-600 space-y-1">
              <li>• SendGrid / Postmark</li>
              <li>• Supabase Storage</li>
              <li className="text-gray-400">• Stripe (post-MVP)</li>
              <li className="text-gray-400">• Xero (post-MVP)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Model */}
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
          <span>🔒</span> Security Model
        </h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium text-red-900 mb-2">Multi-tenancy</div>
            <ul className="text-red-800 space-y-1">
              <li>• Every table has breeder_id</li>
              <li>• RLS policies enforce isolation</li>
              <li>• No cross-breeder data leakage</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-red-900 mb-2">Portal Access</div>
            <ul className="text-red-800 space-y-1">
              <li>• Separate auth roles</li>
              <li>• Read-only for buyers</li>
              <li>• Scoped to their records only</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-red-900 mb-2">Data Protection</div>
            <ul className="text-red-800 space-y-1">
              <li>• Encrypted at rest (Supabase)</li>
              <li>• HTTPS everywhere</li>
              <li>• Audit logging for changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function DataModelArchitecture() {
  const [view, setView] = useState('data-model');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="font-bold text-lg" style={{ color: brand.dark }}>
              🐕 PupPath — Technical Docs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('data-model')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'data-model'
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={view === 'data-model' ? { backgroundColor: brand.secondary } : {}}
              >
                Data Model
              </button>
              <button
                onClick={() => setView('architecture')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'architecture'
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={view === 'architecture' ? { backgroundColor: brand.secondary } : {}}
              >
                Architecture
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {view === 'data-model' ? <DataModel /> : <Architecture />}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm" style={{ color: brand.accent }}>
          PupPath Technical Documentation — MVP Specification
        </div>
      </footer>
    </div>
  );
}
