import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import exporting from 'highcharts/modules/exporting';
import exportData from 'highcharts/modules/export-data';

// Initialize exporting modules with robust check for ESM/CommonJS interop
if (typeof Highcharts === 'object') {
    const initModule = (module: any) => {
        if (typeof module === 'function') {
            module(Highcharts);
        } else if (module && typeof module.default === 'function') {
            module.default(Highcharts);
        }
    };

    initModule(exporting);
    initModule(exportData);
}

interface ChartProps {
    title: string;
    categories: string[];
    series: Highcharts.SeriesOptionsType[];
    chartType?: string;
    enableAnimation?: boolean;
}

const Chart = ({
    title,
    categories,
    series,
    chartType = 'spline',
    enableAnimation = true
}: ChartProps) => {
    const options: Highcharts.Options = {
        chart: {
            type: chartType,
            backgroundColor: 'transparent',
            animation: enableAnimation,
            style: {
                fontFamily: 'Inter, system-ui, sans-serif'
            }
        },
        title: {
            text: title,
            style: {
                color: '#ffffff',
                fontSize: '20px'
            }
        },
        xAxis: {
            categories: categories,
            lineColor: 'rgba(255, 255, 255, 0.2)',
            tickColor: 'rgba(255, 255, 255, 0.2)',
            labels: {
                style: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Values',
                style: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
            gridLineColor: 'rgba(255, 255, 255, 0.1)',
            labels: {
                style: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        },
        plotOptions: {
            series: {
                animation: {
                    duration: enableAnimation ? 1000 : 0
                },
                marker: {
                    enabled: true
                }
            }
        },
        legend: {
            itemStyle: {
                color: 'rgba(255, 255, 255, 0.8)'
            },
            itemHoverStyle: {
                color: '#ffffff'
            }
        },
        series: series,
        credits: {
            enabled: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
                color: '#fff'
            }
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    symbolStroke: '#fff',
                    theme: {
                        fill: 'rgba(255,255,255,0.1)'
                    }
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};

export default Chart;
