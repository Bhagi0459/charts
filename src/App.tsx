import { useState, useMemo } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import './App.css';
import Background from './components/Background';
import Chart from './components/Chart';
import Papa from 'papaparse';

// --- Types ---
interface RawDataset {
  name: string;
  headers: string[];
  data: (string | number)[][]; // Matrix of data
}

interface ChartConfig {
  title: string;
  chartType: string;
  xAxisColumn: string;
  yAxisColumns: string[];
  animate: boolean;
}

// --- Dummy Data ---
const TRAFFIC_DATA: RawDataset = {
  name: 'Traffic Data',
  headers: ['Month', 'Organic Search', 'Direct Traffic', 'Referral', 'Social'],
  data: [
    ['Jan', 30, 20, 10, 5],
    ['Feb', 40, 25, 12, 8],
    ['Mar', 35, 30, 15, 12],
    ['Apr', 50, 35, 20, 15],
    ['May', 49, 40, 25, 20],
    ['Jun', 60, 45, 30, 25],
    ['Jul', 70, 50, 35, 28],
    ['Aug', 91, 55, 40, 35],
    ['Sep', 125, 65, 45, 40],
    ['Oct', 110, 75, 50, 45],
    ['Nov', 134, 85, 60, 50],
    ['Dec', 150, 95, 70, 55]
  ]
};

const SALES_DATA: RawDataset = {
  name: 'Quarterly Sales',
  headers: ['Quarter', 'Product A', 'Product B', 'Product C', 'Services'],
  data: [
    ['Q1 2024', 1200, 800, 400, 300],
    ['Q2 2024', 1500, 950, 450, 400],
    ['Q3 2024', 1100, 1050, 500, 450],
    ['Q4 2024', 2000, 1300, 600, 550]
  ]
};

const USER_DATA: RawDataset = {
  name: 'User Growth',
  headers: ['Day', 'New Users', 'Active Users', 'Churned'],
  data: [
    ['Mon', 50, 500, 5],
    ['Tue', 120, 550, 8],
    ['Wed', 140, 600, 4],
    ['Thu', 130, 580, 6],
    ['Fri', 200, 650, 10],
    ['Sat', 250, 700, 12],
    ['Sun', 300, 800, 15]
  ]
};

// --- Helper ---
const getDefaultConfig = (dataset: RawDataset): ChartConfig => {
  const headers = dataset.headers;
  const xAxis = headers[0];
  const yAxis = headers.slice(1);

  return {
    title: `${dataset.name} Analysis`,
    chartType: 'spline',
    xAxisColumn: xAxis,
    yAxisColumns: yAxis,
    animate: true
  };
};

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [dataset, setDataset] = useState<RawDataset>(TRAFFIC_DATA);
  const [config, setConfig] = useState<ChartConfig>(getDefaultConfig(TRAFFIC_DATA));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // --- Data Loading & Parsing ---
  const loadDataset = (newDataset: RawDataset) => {
    setDataset(newDataset);
    setConfig(getDefaultConfig(newDataset));
    setErrorMsg(null);
  };

  const processFile = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const rows = results.data as any[][];
          if (rows.length < 2) throw new Error("File is too short");

          const headers = rows[0].map(h => String(h));
          // Filter empty rows
          const dataRows = rows.slice(1).filter(r => r.length === headers.length || r.length > 0);

          const parsedData = dataRows.map(row => {
            return row.map(cell => {
              const num = parseFloat(cell);
              return isNaN(num) ? cell : num;
            });
          });

          const newDataset: RawDataset = {
            name: file.name.replace('.csv', ''),
            headers,
            data: parsedData
          };

          loadDataset(newDataset);
        } catch (err) {
          console.error(err);
          setErrorMsg("Failed to parse CSV. Make sure it has headers.");
        }
      },
      header: false
    });
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      processFile(file);
    } else {
      setErrorMsg("Please drop a valid .csv file.");
    }
  };

  // --- Data Editing Handlers ---
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...dataset.data];
    const numValue = parseFloat(value);
    newData[rowIndex][colIndex] = isNaN(numValue) ? value : numValue;
    setDataset({ ...dataset, data: newData });
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const newHeaders = [...dataset.headers];
    newHeaders[colIndex] = value;
    setDataset({ ...dataset, headers: newHeaders });
  };

  const addRow = () => {
    const newRow = new Array(dataset.headers.length).fill(0);
    setDataset({ ...dataset, data: [...dataset.data, newRow] });
  };

  const addColumn = () => {
    const newHeaders = [...dataset.headers, `Col ${dataset.headers.length + 1}`];
    const newData = dataset.data.map(row => [...row, 0]);
    setDataset({ headers: newHeaders, data: newData, name: dataset.name });
  };

  const deleteRow = (index: number) => {
    const newData = dataset.data.filter((_, i) => i !== index);
    setDataset({ ...dataset, data: newData });
  };

  // --- Prepare Chart Data ---
  const chartData = useMemo(() => {
    const xIndex = dataset.headers.indexOf(config.xAxisColumn);
    if (xIndex === -1) return { categories: [], series: [] };

    const categories = dataset.data.map(row => String(row[xIndex]));

    const series = config.yAxisColumns.map(colName => {
      const colIndex = dataset.headers.indexOf(colName);
      if (colIndex === -1) return null;

      const data = dataset.data.map((row, i) => {
        const val = row[colIndex];
        const numVal = typeof val === 'number' ? val : parseFloat(String(val)) || 0;

        if (config.chartType === 'pie') {
          return {
            name: categories[i],
            y: numVal
          };
        }
        return numVal;
      });

      return {
        name: colName,
        data,
        type: config.chartType,
        colorByPoint: config.chartType === 'pie'
      };
    }).filter(Boolean);

    return { categories, series: series as any[] };
  }, [dataset, config]);

  // --- UI Handlers ---
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setConfig(prev => ({ ...prev, chartType: e.target.value }));
  };

  const handleXAxisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setConfig(prev => ({ ...prev, xAxisColumn: e.target.value }));
  };

  const handleYAxisToggle = (col: string) => {
    setConfig(prev => {
      const exists = prev.yAxisColumns.includes(col);
      const newCols = exists
        ? prev.yAxisColumns.filter(c => c !== col)
        : [...prev.yAxisColumns, col];
      return { ...prev, yAxisColumns: newCols };
    });
  };

  return (
    <>
      <Background />

      {!showDashboard ? (
        <div className="hero-container">
          <h1 className="hero-title">
            Data<br />
            Visualization
          </h1>
          <p className="hero-subtitle">
            Experience your metrics like never before. Interactive, real-time, and beautifully designed.
          </p>
          <button
            className="cta-button"
            onClick={() => setShowDashboard(true)}
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="dashboard-container">
          <div className="header">
            <h2 className='text-gradient'>Analytics Overview</h2>
            <button
              className="back-button"
              onClick={() => setShowDashboard(false)}
            >
              ← Back to Home
            </button>
          </div>

          {/* Dataset Control Bar */}
          <div className="controls card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Datasets:</span>
            <button className={`control-btn ${dataset.name === 'Traffic Data' ? 'active' : ''}`} onClick={() => loadDataset(TRAFFIC_DATA)}>Traffic</button>
            <button className={`control-btn ${dataset.name === 'Quarterly Sales' ? 'active' : ''}`} onClick={() => loadDataset(SALES_DATA)}>Sales</button>
            <button className={`control-btn ${dataset.name === 'User Growth' ? 'active' : ''}`} onClick={() => loadDataset(USER_DATA)}>Users</button>
            <button className="control-btn" onClick={() => loadDataset({ name: 'New Dataset', headers: ['Category', 'Series 1'], data: [['A', 10], ['B', 20]] })}>+ New Empty</button>
          </div>

          {errorMsg && (
            <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
              {errorMsg}
            </div>
          )}

          {/* View Tabs */}
          <div className="view-tabs">
            <button
              className={`view-tab ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveTab('chart')}
            >
              📊 Chart View
            </button>
            <button
              className={`view-tab ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              📝 Data Editor
            </button>
          </div>

          <div className="main-layout">

            {activeTab === 'chart' && (
              <div style={{ display: 'grid', gridTemplateColumns: isConfigOpen ? '300px 1fr' : '1fr', gap: '2rem', alignItems: 'start', transition: 'all 0.3s ease' }}>
                {/* Config Panel */}
                {isConfigOpen && (
                  <div className="card config-panel" style={{ animation: 'fadeIn 0.3s' }}>
                    <h3 style={{ marginTop: 0 }}>Configuration</h3>
                    <div className="form-group">
                      <label>Chart Title</label>
                      <input type="text" value={config.title} onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>Chart Type</label>
                      <select value={config.chartType} onChange={handleTypeChange} className="input-field">
                        <option value="spline">Spline (Curved)</option>
                        <option value="line">Line</option>
                        <option value="column">Column / Bar</option>
                        <option value="area">Area</option>
                        <option value="scatter">Scatter</option>
                        <option value="areaspline">Area Spline</option>
                        <option value="pie">Pie (First Series)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>X-Axis</label>
                      <select value={config.xAxisColumn} onChange={handleXAxisChange} className="input-field">
                        {dataset.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Y-Axis Series</label>
                      <div className="checkbox-list">
                        {dataset.headers.map(h => (
                          h !== config.xAxisColumn && (
                            <label key={h} className="checkbox-item">
                              <input type="checkbox" checked={config.yAxisColumns.includes(h)} onChange={() => handleYAxisToggle(h)} />
                              <span>{h}</span>
                            </label>
                          )
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-item">
                        <input type="checkbox" checked={config.animate} onChange={(e) => setConfig(prev => ({ ...prev, animate: e.target.checked }))} />
                        <span>Enable Animation</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="chart-area" style={{ flex: 1 }}>
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                      <button className="control-btn" onClick={() => setIsConfigOpen(!isConfigOpen)}>
                        {isConfigOpen ? 'Hide Config' : '⚙️ Configure'}
                      </button>
                    </div>
                    <Chart
                      title={config.title}
                      categories={chartData.categories}
                      series={chartData.series}
                      chartType={config.chartType}
                      enableAnimation={config.animate}
                    />
                  </div>

                  {/* Drag & Drop Upload Zone (Smaller version for quick access) */}
                  <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ marginTop: '2rem', padding: '1rem' }}
                  >
                    <div className="drop-zone-text">Drop a CSV file here to update chart</div>
                    <div className="upload-wrapper">
                      <label htmlFor="file-upload-chart" className="control-btn upload-btn" style={{ display: 'inline-block' }}>
                        Or Click to Upload
                      </label>
                      <input id="file-upload-chart" type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Data Editor: {dataset.name}</h3>
                  <div className="table-controls" style={{ margin: 0 }}>
                    <button className="control-btn" onClick={addRow}>+ Add Row</button>
                    <button className="control-btn" onClick={addColumn}>+ Add Column</button>
                  </div>
                </div>

                <div className="editable-table-container">
                  <table className="editable-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Action</th>
                        {dataset.headers.map((h, i) => (
                          <th key={i}>
                            <input
                              className="cell-input header-input"
                              value={h}
                              onChange={(e) => handleHeaderChange(i, e.target.value)}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td style={{ textAlign: 'center' }}>
                            <button className="icon-btn delete" onClick={() => deleteRow(rowIndex)} title="Delete Row">×</button>
                          </td>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex}>
                              <input
                                className="cell-input"
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}

export default App
