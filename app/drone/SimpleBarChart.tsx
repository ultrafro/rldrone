import { useState, useEffect } from 'react';

export default function SimpleBarChart({data, maxValue, title}: {data: Record<string, number>, maxValue?: number, title?: string}){
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Find the maximum value for scaling
    if(!maxValue){
        maxValue = Math.max(...Object.values(data));
    }
    
    // Ensure maxValue is at least 1 for proper scaling
    if(maxValue <= 0) {
        maxValue = 1;
    }
    
    return (
        <div className="bar-chart-container">
            {title && <div className="bar-chart-title">{title}</div>}
            <div className="bar-chart-scroll">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="bar-container">
                        <div 
                            className="bar" 
                            style={{
                                height: maxValue > 0 ? `${Math.max(2, (value / maxValue) * (isMobile ? 60 : 150))}px` : '2px'
                            }}
                        />
                        <div className="bar-label">{key}</div>
                        <div className="bar-value">{value.toFixed(2)}</div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .bar-chart-container {
                    position: relative;
                    height: 100%;
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                }

                .bar-chart-scroll {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: ${isMobile ? '6px' : '12px'};
                    flex: 1;
                    overflow-x: auto;
                    padding: ${isMobile ? '8px' : '15px'};
                    min-height: ${isMobile ? '100px' : '200px'};
                    position: relative;
                }

                .bar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    min-width: ${isMobile ? '32px' : '50px'};
                    flex: 0 0 auto;
                    position: relative;
                    height: ${isMobile ? '80px' : '180px'};
                }

                .bar {
                    width: ${isMobile ? '18px' : '30px'};
                    background-color: #3498db;
                    transition: height 0.3s ease;
                    border-radius: ${isMobile ? '3px 3px 0 0' : '4px 4px 0 0'};
                    border: 1px solid #2980b9;
                    box-shadow: 0 ${isMobile ? '1px 3px' : '2px 4px'} rgba(0,0,0,0.1);
                    order: 1;
                }

                .bar-label {
                    font-size: ${isMobile ? '9px' : '12px'};
                    color: #666;
                    text-align: center;
                    word-break: break-word;
                    max-width: ${isMobile ? '32px' : '50px'};
                    line-height: 1.1;
                    order: 2;
                    margin-top: ${isMobile ? '3px' : '6px'};
                }

                .bar-value {
                    font-size: ${isMobile ? '8px' : '11px'};
                    color: #999;
                    text-align: center;
                    order: 3;
                    margin-top: ${isMobile ? '2px' : '4px'};
                }

                /* Custom scrollbar styling */
                .bar-chart-scroll::-webkit-scrollbar {
                    height: 6px;
                }

                .bar-chart-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .bar-chart-scroll::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }

                .bar-chart-scroll::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                .bar-chart-title {
                    font-size: ${isMobile ? '12px' : '16px'};
                    font-weight: 600;
                    color: #333;
                    margin-bottom: ${isMobile ? '8px' : '15px'};
                    text-align: center;
                }
            `}</style>
        </div>
    );
}


