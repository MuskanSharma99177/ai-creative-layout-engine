import Papa from 'papaparse';
import { DatasetProfile, CreativeInput } from '../types/layout';

export interface ParseAndProfileResult {
  profile: DatasetProfile;
  rawRows: Record<string, any>[];
  errors: string[];
}

/**
 * Strips whitespace, avoids empty headers, and deduplicates column names.
 */
export function sanitizeHeaders(headers: string[]): string[] {
  const seen: Record<string, number> = {};
  return headers.map((rawHeader, idx) => {
    let clean = (rawHeader || '').trim().replace(/^["']|["']$/g, '');
    if (!clean) {
      clean = `Column_${idx + 1}`;
    }
    if (seen[clean] !== undefined) {
      seen[clean] += 1;
      return `${clean}_${seen[clean]}`;
    }
    seen[clean] = 1;
    return clean;
  });
}

/**
 * Checks if a value can be parsed as a numeric quantity (handles currency signs, commas, percent)
 */
export function parseNumericValue(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).trim();
  if (str === '') return null;

  // Remove currency symbols, commas, and percentage signs ($, ₹, €, £, ¥, %)
  const cleaned = str.replace(/[$₹€£¥,%\s]/g, '');
  if (cleaned === '' || isNaN(Number(cleaned))) return null;
  return Number(cleaned);
}

/**
 * Checks if a string represents a valid date
 */
export function isValidDateString(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  const str = val.trim();
  // Must look like date (e.g. YYYY-MM-DD, MM/DD/YYYY, or ISO)
  if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str) && !/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    return false;
  }
  const timestamp = Date.parse(str);
  return !isNaN(timestamp);
}

/**
 * Automatically inspects dataset structure, infers types, and computes statistics
 */
export function profileDataset(rows: Record<string, any>[], columnNames: string[]): DatasetProfile {
  const rowCount = rows.length;
  const colCount = columnNames.length;

  const numericColumns: string[] = [];
  const dateColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const textColumns: string[] = [];

  const missingValueCounts: Record<string, number> = {};
  const uniqueValueCounts: Record<string, number> = {};
  const summaryStats: Record<string, { min?: number; max?: number; avg?: number }> = {};

  for (const col of columnNames) {
    let missingCount = 0;
    let numericCount = 0;
    let dateCount = 0;
    const uniqueValues = new Set<string>();

    let numMin = Infinity;
    let numMax = -Infinity;
    let numSum = 0;
    let validNumCount = 0;

    for (let i = 0; i < rowCount; i++) {
      const val = rows[i][col];
      if (val === null || val === undefined || String(val).trim() === '') {
        missingCount++;
        continue;
      }

      const strVal = String(val).trim();
      uniqueValues.add(strVal);

      // Check numeric
      const numVal = parseNumericValue(val);
      if (numVal !== null) {
        numericCount++;
        validNumCount++;
        numSum += numVal;
        if (numVal < numMin) numMin = numVal;
        if (numVal > numMax) numMax = numVal;
      }

      // Check date
      if (isValidDateString(val)) {
        dateCount++;
      }
    }

    missingValueCounts[col] = missingCount;
    uniqueValueCounts[col] = uniqueValues.size;

    const nonMissingCount = rowCount - missingCount;
    if (nonMissingCount === 0) {
      textColumns.push(col);
      continue;
    }

    // Type classification rules
    if (numericCount / nonMissingCount >= 0.75) {
      numericColumns.push(col);
      if (validNumCount > 0) {
        summaryStats[col] = {
          min: Math.round(numMin * 100) / 100,
          max: Math.round(numMax * 100) / 100,
          avg: Math.round((numSum / validNumCount) * 100) / 100,
        };
      }
    } else if (dateCount / nonMissingCount >= 0.75) {
      dateColumns.push(col);
    } else if (uniqueValues.size <= Math.min(25, Math.ceil(nonMissingCount * 0.4))) {
      categoricalColumns.push(col);
    } else {
      textColumns.push(col);
    }
  }

  return {
    rows: rowCount,
    columns: colCount,
    columnNames,
    numericColumns,
    categoricalColumns,
    textColumns,
    dateColumns,
    missingValueCounts,
    uniqueValueCounts,
    sampleRows: rows.slice(0, 10),
    summaryStats,
  };
}

/**
 * Robust CSV String Parser handling different delimiters and formatting quirks
 */
export function parseAndProfileCSV(csvContent: string): ParseAndProfileResult {
  const errors: string[] = [];

  if (!csvContent || csvContent.trim().length === 0) {
    return {
      profile: {
        rows: 0,
        columns: 0,
        columnNames: [],
        numericColumns: [],
        categoricalColumns: [],
        textColumns: [],
        dateColumns: [],
        missingValueCounts: {},
        uniqueValueCounts: {},
        sampleRows: [],
      },
      rawRows: [],
      errors: ['The CSV content is empty.'],
    };
  }

  // Pre-sanitize comments (#, --, //) and notebook markers
  const lines = csvContent.split(/\r\n|\n|\r/);
  const sanitizedLines: string[] = [];
  let headerFound = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('--') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      /^#\s*table\s+from\s+cell/i.test(trimmed)
    ) {
      continue;
    }
    if (!headerFound) {
      if (/[a-zA-Z]/.test(trimmed)) {
        headerFound = true;
        sanitizedLines.push(trimmed);
      }
    } else {
      sanitizedLines.push(line);
    }
  }

  const cleanText = sanitizedLines.join('\n');

  const parsed = Papa.parse(cleanText, {
    header: true,
    comments: '#',
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach((e) => errors.push(`Row ${e.row}: ${e.message}`));
  }

  const rawHeaders = sanitizeHeaders(parsed.meta.fields || []);
  const rawRows = (parsed.data as Record<string, any>[]).filter((row) => {
    // Keep rows that have at least one non-empty value
    return Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '');
  });

  const profile = profileDataset(rawRows, rawHeaders);

  return {
    profile,
    rawRows,
    errors,
  };
}

/**
 * Dynamically extract visual fields from ANY dataset row without hardcoded column names
 */
export function mapRowToCreativeInput(
  row: Record<string, any>,
  profile: DatasetProfile,
  rowIndex = 0,
  existingBrandColors: string[] = ['#0F172A', '#3B82F6']
): CreativeInput {
  const { columnNames, numericColumns, categoricalColumns, textColumns, dateColumns } = profile;

  // 1. Determine Title/Headline:
  // Prefer first text column, or first categorical column, or first column overall
  let titleCol = textColumns[0] || categoricalColumns[0] || dateColumns[0] || columnNames[0];
  let headline = row[titleCol] ? String(row[titleCol]).trim() : `Record #${rowIndex + 1}`;

  // 2. Determine Key Value / Metric:
  // Prefer first numeric column
  let metricCol = numericColumns[0];
  let metricText = '';
  if (metricCol && row[metricCol] !== undefined && row[metricCol] !== '') {
    const num = parseNumericValue(row[metricCol]);
    metricText = num !== null ? `${metricCol}: ${num.toLocaleString()}` : `${metricCol}: ${row[metricCol]}`;
  }

  // 3. Determine Category / Badge:
  // Prefer first categorical column, or second numeric, or date
  let badgeCol = categoricalColumns[0] !== titleCol ? categoricalColumns[0] : categoricalColumns[1];
  if (!badgeCol && dateColumns.length > 0 && titleCol !== dateColumns[0]) {
    badgeCol = dateColumns[0];
  }
  let badgeText = '';
  if (badgeCol && row[badgeCol] !== undefined && row[badgeCol] !== '') {
    badgeText = String(row[badgeCol]).trim();
  } else if (metricText) {
    badgeText = metricText;
  }

  // 4. Determine Description:
  // Formulate a structured natural sentence using remaining available columns
  const detailParts: string[] = [];
  columnNames.forEach((col) => {
    if (col !== titleCol && row[col] !== undefined && row[col] !== '') {
      detailParts.push(`${col}: ${row[col]}`);
    }
  });

  const description = detailParts.length > 0
    ? detailParts.slice(0, 4).join(' • ')
    : `Detailed metrics for ${headline} across ${profile.columns} dataset fields.`;

  // 5. Determine Contextual CTA:
  let cta = 'View Details';
  if (categoricalColumns.length > 0 && badgeText) {
    cta = `Explore ${badgeText}`;
  } else if (numericColumns.length > 0) {
    cta = `Inspect Metrics`;
  }

  // If a column specifically hints at an image URL, use it
  const imageCandidateCol = columnNames.find((col) => /image|img|photo|picture|thumbnail|url/i.test(col));
  const imageUrl = imageCandidateCol && typeof row[imageCandidateCol] === 'string' && /^https?:\/\//i.test(row[imageCandidateCol])
    ? row[imageCandidateCol]
    : undefined;

  return {
    productName: headline,
    headline,
    description,
    cta,
    brandName: profile.categoricalColumns[0] ? `${row[profile.categoricalColumns[0]] || 'Overview'}` : 'Data Insight',
    brandColors: existingBrandColors,
    badgeText,
    imageUrl,
    datasetProfile: profile,
    activeRowData: row,
    activeRowIndex: rowIndex,
  };
}

/**
 * Pre-defined Benchmark Datasets for Instant 1-Click Testing
 */
export const BENCHMARK_DATASETS = {
  datasetA: {
    id: 'dataset-a',
    title: 'Dataset A: HR / Employee Directory',
    description: 'Columns: Name, Age, Salary, Department',
    csv: `Name,Age,Salary,Department
Alex Chen,23,45000,IT
Beatriz Santos,25,60000,HR
Carlos Mendez,31,78000,Engineering
Diana Vance,29,65000,Marketing
Evan Ross,35,92000,Finance`,
  },
  datasetB: {
    id: 'dataset-b',
    title: 'Dataset B: E-Commerce Product Catalog',
    description: 'Columns: Product, Category, Price, Rating',
    csv: `Product,Category,Price,Rating
Smartphone X,Electronics,500,4.5
Architecture Textbook,Education,20,4.2
Ergonomic Mesh Chair,Furniture,240,4.8
Wireless Earbuds Pro,Electronics,89,4.1
Mechanical Keyboard,Electronics,120,4.7`,
  },
  datasetC: {
    id: 'dataset-c',
    title: 'Dataset C: IoT Sensor & Weather Log',
    description: 'Columns: Date, Temperature, Humidity (Includes missing values)',
    csv: `Date,Temperature,Humidity
2026-01-01,24.5,61
2026-01-02,23.8,64
2026-01-03,25.1,
2026-01-04,22.0,70
2026-01-05,,58`,
  },
};
