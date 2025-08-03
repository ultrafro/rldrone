import { useState, useEffect } from 'react';

export default function SimpleChart({whichData, data, plotType = 'line', initialChartMode = 'raw'}: {whichData: string, data: {x?: number, y: Record<string, number>}[], plotType?: 'line' | 'scatter', initialChartMode?: 'raw' | 'average' | 'tail'}){
    const [chartMode, setChartMode] = useState<'raw' | 'average' | 'tail'>(initialChartMode);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Determine average and tail based on current mode
    const average = chartMode === 'average';
    const tail = chartMode === 'tail';

    if (!data.length) return (
        <div className={`w-full h-full bg-gray-100 rounded-lg flex items-center justify-center ${
            !isMobile ? 'min-h-[200px]' : ''
        }`}>
            <span className="text-gray-400">No data available</span>
        </div>
    );

    const MAX_POINTS = 100;

    // Sample data to maximum of 100 points
    let sampledData = data;
    if (data.length > MAX_POINTS) {
        if (tail) {
            // If tail=true, just take the last MAX_POINTS directly
            sampledData = data.slice(-MAX_POINTS);
        } else {
            sampledData = [];
            const step = (data.length - 1) / (MAX_POINTS - 1);
            
            for (let i = 0; i < MAX_POINTS; i++) {
                if (average) {
                    // Calculate the range of indices to average
                    const centerIdx = i * step;
                    const startIdx = Math.max(0, Math.floor(centerIdx - step / 2));
                    const endIdx = Math.min(data.length - 1, Math.floor(centerIdx + step / 2));
                    
                    // Get the range of data points to average
                    const rangeData = data.slice(startIdx, endIdx + 1);
                    
                    // Average the y values in this range
                    const avgY: Record<string, number> = {};
                    const firstYKeys = Object.keys(rangeData[0].y);

                    for(const key of firstYKeys){
                        avgY[key] = 0;
                        let count = 0;
                        for(const point of rangeData){
                            const val = point.y[key];
                            if(val !== undefined){
                                avgY[key] += val;
                                count++;
                            }
                        }
                        avgY[key] /= count;
                    }
                    
                    // firstYKeys.forEach(key => {
                    //     avgY[key] = rangeData.reduce((sum, point) => sum + point.y[key], 0) / rangeData.length;
                    // });
                    
                    // Use the x value from the center point (or index if no x)
                    const centerPoint = data[Math.round(centerIdx)];
                    sampledData.push({
                        x: centerPoint.x ?? Math.round(centerIdx),
                        y: avgY
                    });
                } else {
                    const index = Math.round(i * step);
                    sampledData.push(data[index]);
                }
            }
        }
    }

    // Calculate ranges for plotting (from sampled data) and labels (from original data)
    const sampledXValues = sampledData.map((point, idx) => point.x ?? idx);
    const originalXValues = data.map((point, idx) => point.x ?? idx);
    
    // Use sampled data for plotting range (so points use full width)
    const plotMinX = Math.min(...sampledXValues);
    const plotMaxX = Math.max(...sampledXValues);
    const plotXRange = Math.max(0.001, plotMaxX - plotMinX);
    
    // Use original data for label range (so labels show true scale)
    const labelMinX = Math.min(...originalXValues);
    const labelMaxX = Math.max(...originalXValues);
    
    // Calculate y-axis range from sampled data for proper scaling
    const yValues = sampledData.map(point => point.y[whichData]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const yRange = Math.max(0.001, maxY - minY);

    return (
        <div className={`w-full h-full relative ${!isMobile ? 'min-h-[200px]' : ''}`}>
            {/* Chart container with aspect ratio */}
            <div className="absolute inset-0 bg-gray-100 rounded-lg">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 p-1">
                    <span>{maxY.toFixed(1)}</span>
                    <span>{((maxY + minY) / 2).toFixed(1)}</span>
                    <span>{minY.toFixed(1)}</span>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 h-6 flex justify-between text-xs text-gray-500 px-2">
                    <span>{labelMinX.toFixed(1)}</span>
                    <span>{((labelMaxX + labelMinX) / 2).toFixed(1)}</span>
                    <span>{labelMaxX.toFixed(1)}</span>
                </div>

                {/* Chart area with padding for axes */}
                <div className={`absolute left-12 right-2 top-2 overflow-hidden ${
                    isMobile ? 'bottom-8' : 'bottom-12'
                }`}>
                    <svg 
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {plotType === 'line' ? (
                            <path
                                d={sampledData.map((point, index) => {
                                    const x = (((point.x ?? index) - plotMinX) / plotXRange) * 100;
                                    const y = ((maxY - point.y[whichData]) / yRange) * 100;
                                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="rgb(59, 130, 246)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        ) : (
                            sampledData.map((point, index) => {
                                const x = (((point.x ?? index) - plotMinX) / plotXRange) * 100;
                                const y = ((maxY - point.y[whichData]) / yRange) * 100;
                                return (
                                    <circle
                                        key={index}
                                        cx={x}
                                        cy={y}
                                        r="0.5"
                                        fill="rgb(59, 130, 246)"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })
                        )}
                    </svg>
                </div>
                
                {/* Control buttons */}
                <div className={`absolute left-12 right-2 bottom-0 flex justify-center items-center ${
                    isMobile ? 'h-6 gap-1' : 'h-8 gap-2'
                }`}>
                    <button
                        onClick={() => setChartMode('raw')}
                        className={`${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} text-xs rounded transition-colors ${
                            chartMode === 'raw' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Raw
                    </button>
                    <button
                        onClick={() => setChartMode('average')}
                        className={`${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} text-xs rounded transition-colors ${
                            chartMode === 'average' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {isMobile ? 'Avg' : 'Average'}
                    </button>
                    <button
                        onClick={() => setChartMode('tail')}
                        className={`${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} text-xs rounded transition-colors ${
                            chartMode === 'tail' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Tail
                    </button>
                </div>
            </div>
        </div>
    );
}
