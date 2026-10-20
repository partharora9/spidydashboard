import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Globe, Server, ShieldCheck, Cpu, Database, Eye } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'root' | 'subdomain' | 'ip' | 'port' | 'tech';
  x: number;
  y: number;
  details: string;
  source: string;
}

interface GraphLink {
  from: string;
  to: string;
}

const NODES: GraphNode[] = [
  { id: 'root', label: 'target.com', type: 'root', x: 260, y: 160, details: 'Primary Root Domain', source: 'User Target' },
  { id: 'sub1', label: 'api.target.com', type: 'subdomain', x: 120, y: 70, details: 'REST API Gateway', source: 'sfp_sublist3r' },
  { id: 'sub2', label: 'auth.target.com', type: 'subdomain', x: 400, y: 70, details: 'OAuth/SSO Portal', source: 'sfp_crt' },
  { id: 'sub3', label: 'vpn.target.com', type: 'subdomain', x: 260, y: 40, details: 'Edge VPN Gateway', source: 'sfp_dnsresolve' },
  { id: 'ip1', label: '104.21.55.19', type: 'ip', x: 60, y: 220, details: 'Cloudflare Anycast IPv4', source: 'sfp_dnsresolve' },
  { id: 'ip2', label: '198.51.100.44', type: 'ip', x: 440, y: 220, details: 'Origin Dedicated Server', source: 'sfp_shodan' },
  { id: 'port1', label: 'Port 443 (HTTPS)', type: 'port', x: 40, y: 310, details: 'TLS 1.3 / Valid Cert (34d left)', source: 'sfp_sslcert' },
  { id: 'port2', label: 'Port 8443 (Admin)', type: 'port', x: 160, y: 310, details: 'Exposed Management UI', source: 'sfp_portscan' },
  { id: 'tech1', label: 'Nginx 1.24', type: 'tech', x: 380, y: 310, details: 'Reverse Proxy Software', source: 'sfp_whatweb' },
  { id: 'tech2', label: 'AWS us-east-1', type: 'tech', x: 480, y: 310, details: 'Cloud Hosting ASN 16509', source: 'sfp_bgp' },
];

const LINKS: GraphLink[] = [
  { from: 'root', to: 'sub1' },
  { from: 'root', to: 'sub2' },
  { from: 'root', to: 'sub3' },
  { from: 'sub1', to: 'ip1' },
  { from: 'sub2', to: 'ip2' },
  { from: 'ip1', to: 'port1' },
  { from: 'ip1', to: 'port2' },
  { from: 'ip2', to: 'tech1' },
  { from: 'ip2', to: 'tech2' },
];

export const AttackSurfaceGraph = () => {
  const prefersReduced = useReducedMotion();
  const [activeNode, setActiveNode] = useState<GraphNode>(NODES[0]);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'root':
        return '#0B0B14';
      case 'subdomain':
        return '#4F8FF7';
      case 'ip':
        return '#10B981';
      case 'port':
        return '#F59E0B';
      case 'tech':
        return '#8B5CF6';
    }
  };

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'root':
        return <Globe className="w-3.5 h-3.5 text-white" />;
      case 'subdomain':
        return <Server className="w-3.5 h-3.5 text-white" />;
      case 'ip':
        return <Cpu className="w-3.5 h-3.5 text-white" />;
      case 'port':
        return <ShieldCheck className="w-3.5 h-3.5 text-white" />;
      case 'tech':
        return <Database className="w-3.5 h-3.5 text-white" />;
    }
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-10">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            LIVE RECON TOPOLOGY
          </span>
        </div>
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] text-[#0B0B14] tracking-[-0.03em] leading-tight">
          Dynamic Asset Relationship Graph
        </h2>
        <p className="mt-3 font-sans text-[16px] text-[#555555]">
          Hover any discovered node to inspect correlated metadata, discovering module, and network relationships.
        </p>
      </div>

      {/* Main Interactive Graph Box */}
      <div className="w-full bg-[#0B0F19] rounded-[24px] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-8 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (SVG Visualization Canvas) */}
        <div className="lg:col-span-8 w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#07090E] rounded-2xl p-4 border border-white/[0.05]">
          {/* Subtle grid in SVG background */}
          <svg
            viewBox="0 0 520 360"
            className="w-full max-w-[520px] h-auto overflow-visible"
          >
            {/* Draw Links */}
            {LINKS.map((link) => {
              const fromNode = NODES.find((n) => n.id === link.from)!;
              const toNode = NODES.find((n) => n.id === link.to)!;
              const isConnected =
                activeNode.id === fromNode.id || activeNode.id === toNode.id;

              return (
                <motion.line
                  key={`${link.from}-${link.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isConnected ? '#4F8FF7' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isConnected ? 2.5 : 1}
                  strokeDasharray={isConnected ? 'none' : '3,3'}
                  initial={{ pathLength: prefersReduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              );
            })}

            {/* Draw Nodes */}
            {NODES.map((node) => {
              const isSelected = activeNode.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setActiveNode(node)}
                  className="cursor-pointer"
                >
                  {/* Ping animation on selected */}
                  {isSelected && !prefersReduced && (
                    <motion.circle
                      r="22"
                      fill={color}
                      initial={{ opacity: 0.6, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    r={node.type === 'root' ? 18 : 14}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200"
                  />

                  {/* Node Label Text */}
                  <text
                    y={node.type === 'root' ? 30 : 26}
                    textAnchor="middle"
                    fill={isSelected ? '#4F8FF7' : '#94A3B8'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B0B14] border border-white" />
              Target Root
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F8FF7]" />
              Subdomain
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              IP Address
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              Port / Service
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              Technology
            </span>
          </div>
        </div>

        {/* Right Column: Node Inspector Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full bg-[#141824] p-6 rounded-2xl border border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                Asset Inspector
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4F8FF7]">
                <Eye className="w-3 h-3" /> Selected
              </span>
            </div>

            {/* Active Node Details */}
            <div className="mt-5 space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                  Entity Identifier
                </span>
                <span className="font-mono text-[18px] font-semibold text-white mt-1 block">
                  {activeNode.label}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                  Classification
                </span>
                <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[12px] font-mono uppercase font-medium">
                  {getNodeIcon(activeNode.type)}
                  <span style={{ color: getNodeColor(activeNode.type) }}>
                    {activeNode.type}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                  Discovered Metadata
                </span>
                <p className="font-sans text-[14px] text-gray-300 mt-1 leading-relaxed">
                  {activeNode.details}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                  Originating Module
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#4F8FF7]/15 text-[#4F8FF7] font-mono text-[12px]">
                  {activeNode.source}.py
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.08] text-[12px] text-gray-400 font-sans">
            Auto-correlated into asset inventory with risk scoring and historical timeline.
          </div>
        </div>
      </div>
    </section>
  );
};
