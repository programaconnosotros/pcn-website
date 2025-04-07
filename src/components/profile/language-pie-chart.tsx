'use client';

import React, { useEffect, useRef } from 'react';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface LanguagePieChartProps {
  data: ChartDataItem[];
}

export const LanguagePieChart: React.FC<LanguagePieChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Calculate total for percentages
    const total = 100;

    // Draw pie slices
    let startAngle = 0;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Si solo hay un elemento, dibuja un círculo completo
    if (data.length === 1) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', centerX.toString());
      circle.setAttribute('cy', centerY.toString());
      circle.setAttribute('r', radius.toString());
      circle.setAttribute('fill', data[0].color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '1');

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${data[0].name}: 100%`;
      circle.appendChild(title);

      group.appendChild(circle);
    } else {
      // Dibuja múltiples segmentos
      data.forEach((item) => {
        const percentage = item.value / total;
        const endAngle = startAngle + percentage * 2 * Math.PI;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const largeArcFlag = percentage > 0.5 ? 1 : 0;

        const d = [
          `M ${centerX},${centerY}`,
          `L ${x1},${y1}`,
          `A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}`,
          'Z',
        ].join(' ');

        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '1');

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${item.name}: ${item.value}%`;
        path.appendChild(title);

        group.appendChild(path);
        startAngle = endAngle;
      });
    }

    svg.appendChild(group);

    // Add legend
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legend.setAttribute('transform', `translate(${width - 100}, 20)`);

    data.forEach((item, index) => {
      const itemGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      itemGroup.setAttribute('transform', `translate(0, ${index * 20})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '12');
      rect.setAttribute('height', '12');
      rect.setAttribute('fill', item.color);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '20');
      text.setAttribute('y', '10');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#fff');
      text.textContent = item.name;

      itemGroup.appendChild(rect);
      itemGroup.appendChild(text);
      legend.appendChild(itemGroup);
    });

    svg.appendChild(legend);
  }, [data]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {data.length > 0 ? (
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 300"></svg>
      ) : (
        <div className="text-gray-500">No hay datos para mostrar</div>
      )}
    </div>
  );
};
