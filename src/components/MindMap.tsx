import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { Button } from './ui/Button';
import { ZoomIn, ZoomOut, LayoutGrid, Download, Plus, Edit2, Trash2, Check, GitBranch } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'done';
  children?: Node[];
  dueDate?: Date;
  priority?: string;
  category?: string;
  _children?: Node[]; // Collapsed nodes
  parent?: Node;
  depth: number;
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
}

type LayoutType = 'radial' | 'tree' | 'force';

export function MindMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [layout, setLayout] = useState<LayoutType>('radial');
  const [zoom, setZoom] = useState(1);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  // Debugging: Log tasks data
  useEffect(() => {
    console.log('Tasks:', tasks);
  }, [tasks]);

  // Convert tasks to hierarchical structure
  useEffect(() => {
    const rootTasks = tasks.filter((task) => !task.parentTaskId);

    const buildNode = (task: Task, depth: number = 0): Node => {
      const childTasks = tasks.filter((t) => t.parentTaskId === task.id);
      const children = childTasks.map((t) => buildNode(t, depth + 1));

      return {
        id: task.id,
        name: task.title,
        status: task.completed ? 'done' : task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        children: children.length > 0 ? children : undefined,
        depth,
      };
    };

    const nodes = rootTasks.map((task) => buildNode(task));
    setNodes(nodes);

    // Create links
    const links: Link[] = [];
    const addLinks = (node: Node) => {
      if (node.children) {
        node.children.forEach((child) => {
          links.push({ source: node, target: child });
          addLinks(child);
        });
      }
    };
    nodes.forEach(addLinks);
    setLinks(links);
  }, [tasks]);

  // Debugging: Log nodes and links
  useEffect(() => {
    console.log('Nodes:', nodes);
    console.log('Links:', links);
  }, [nodes, links]);

  // Debugging: Log SVG rendering
  useEffect(() => {
    console.log('Rendering SVG...');
    if (!containerRef.current || nodes.length === 0) {
      console.log('No container or nodes to render');
      return;
    }
  }, [nodes]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('svg').remove();

    const width = containerRef.current.clientWidth;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create SVG
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bg-white dark:bg-gray-800 rounded-lg')
      .call(d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          setZoom(event.transform.k);
        }));

    svgRef.current = svg.node();

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Define arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-10 -10 20 20')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M-6,-6 L 0,0 L -6,6')
      .attr('class', 'text-gray-400 dark:text-gray-600');

    // Create layout
    let layoutFunction: any;
    switch (layout) {
      case 'radial':
        layoutFunction = d3.cluster()
          .size([360, Math.min(width, height) / 3]);
        break;
      case 'tree':
        layoutFunction = d3.tree()
          .size([height - 100, width - 200]);
        break;
      case 'force':
        layoutFunction = d3.forceSimulation(nodes)
          .force('charge', d3.forceManyBody().strength(-500))
          .force('center', d3.forceCenter(0, 0))
          .force('link', d3.forceLink(links).distance(100));
        break;
    }

    // Draw links
    const link = g.selectAll('.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('stroke', '#9CA3AF')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = g.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', function (event) {
          dragstarted(event);
        })
        .on('drag', function (event) {
          dragged(event);
        })
        .on('end', function (event) {
          dragended(event);
        }));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 30)
      .attr('fill', (d) => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add text to nodes
    node.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .call(wrap, 50);

    // Add status indicators
    node.append('circle')
      .attr('r', 6)
      .attr('cx', 25)
      .attr('cy', 25)
      .attr('fill', (d) => getStatusColor(d.status));

    // Update positions based on layout
    if (layout === 'force') {
      layoutFunction
        .on('tick', () => {
          link
            .attr('d', (d: any) => `
              M${d.source.x},${d.source.y}
              Q${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2}
              ${d.target.x},${d.target.y}
            `);

          node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });
    } else {
      // Position nodes and links for tree/radial layouts
      layoutFunction(d3.hierarchy(nodes[0]));
      
      link.attr('d', (d: any) => {
        const sourceX = layout === 'radial'
          ? centerX + d.source.y * Math.cos((d.source.x * Math.PI) / 180)
          : d.source.y;
        const sourceY = layout === 'radial'
          ? centerY + d.source.y * Math.sin((d.source.x * Math.PI) / 180)
          : d.source.x;
        const targetX = layout === 'radial'
          ? centerX + d.target.y * Math.cos((d.target.x * Math.PI) / 180)
          : d.target.y;
        const targetY = layout === 'radial'
          ? centerY + d.target.y * Math.sin((d.target.x * Math.PI) / 180)
          : d.target.x;

        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      });

      node.attr('transform', (d: any) => {
        const x = layout === 'radial'
          ? centerX + d.y * Math.cos((d.x * Math.PI) / 180)
          : d.y;
        const y = layout === 'radial'
          ? centerY + d.y * Math.sin((d.x * Math.PI) / 180)
          : d.x;
        return `translate(${x},${y})`;
      });
    }

    // Node interactions
    node.on('click', (event, d) => {
      setSelectedNode(d);
      event.stopPropagation();
    });

    svg.on('click', () => setSelectedNode(null));

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active && layout === 'force') layoutFunction.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active && layout === 'force') layoutFunction.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      if (layout === 'force') layoutFunction.stop();
    };
  }, [nodes, links, layout]);

  const getNodeColor = (node: Node) => {
    switch (node.priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleExport = async () => {
    if (!svgRef.current) return;

    try {
      // Export as PNG
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = svgRef.current.clientWidth * 2;
      canvas.height = svgRef.current.clientHeight * 2;

      img.onload = () => {
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.download = 'mind-map.png';
        link.href = dataUrl;
        link.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast.success('Mind map exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export mind map');
    }
  };

  // Helper function to wrap text
  function wrap(text: d3.Selection<SVGTextElement, Node, SVGGElement, unknown>, width: number) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line: string[] = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy'));
      let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node()!.getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GitBranch className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Mind Map</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(4, zoom + 0.1))}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLayout(layout === 'radial' ? 'tree' : layout === 'tree' ? 'force' : 'radial')}
              className="text-white hover:bg-white/20"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      />

      {selectedNode && (
        <div className="absolute p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{selectedNode.name}</h3>
          {selectedNode.dueDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Due: {selectedNode.dueDate.toLocaleDateString()}
            </p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            <Button variant="outline" size="sm" title="Edit">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" title="Add Child">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" title="Mark Complete">
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-red-500" title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}