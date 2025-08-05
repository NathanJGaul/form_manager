import Papa from "papaparse";

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  columnCount: number;
  rowCount: number;
}

export interface ParsedCSV {
  headers: string[];
  schema: string[];
  data: string[][];
}

/**
 * Parse CSV content into structured data
 * ISSUE: Current implementation splits by newlines first, breaking RFC 4180 multi-line quoted fields
 * TEST FAILURE: Multi-line quoted field gets split into multiple rows instead of preserving as single field
 */
export function parseCSV(content: string): ParsedCSV {
  const result = Papa.parse(content.trim(), {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  const rows = result.data as string[][];

  if (rows.length < 2) {
    throw new Error("CSV must have at least header and schema rows");
  }

  const headers = rows[0].map((h) => h.trim());
  const schema = rows[1].map((s) => s.trim());
  const data = rows.slice(2);

  return { headers, schema, data };
}

/**
 * Validate CSV structure and data against schema
 */
export function validateCSV(content: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { headers, schema, data } = parseCSV(content);

    // Check header/schema alignment
    if (headers.length !== schema.length) {
      errors.push(
        `Header columns (${headers.length}) don't match schema columns (${schema.length})`
      );
    }

    // Validate each data row
    data.forEach((row, rowIndex) => {
      if (row.length !== headers.length) {
        errors.push(
          `Row ${rowIndex + 3} has ${row.length} fields, expected ${
            headers.length
          }`
        );
        return;
      }

      // Validate each field against schema
      row.forEach((value, colIndex) => {
        if (colIndex >= schema.length) return;

        const fieldName = headers[colIndex];
        const fieldSchema = schema[colIndex];
        const lineNum = rowIndex + 3;

        // Parse schema rules
        const schemaParts = fieldSchema.split("|");
        const fieldType = schemaParts[0];
        const rules = schemaParts.slice(1);

        // Type validation
        if (fieldType === "system|identifier" && value) {
          if (
            !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
              value
            )
          ) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid UUID format`
            );
          }
        } else if (fieldType === "system|datetime" && value) {
          if (
            !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)
          ) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid datetime format`
            );
          }
        } else if (fieldType === "system|number" && value) {
          if (!/^-?\d+(\.\d+)?$/.test(value)) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid number format`
            );
          }
        } else if (fieldType === "email" && value) {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid email format`
            );
          }
        } else if (fieldType === "date" && value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid date format`
            );
          }
        } else if (fieldType === "tel" && value) {
          // Very lenient phone validation - just check for basic phone characters
          // Allow digits, spaces, dashes, parentheses, plus, dots, and extensions
          if (!/^[\+0-9\-\(\)\ \.\,ext\#]+$/i.test(value)) {
            warnings.push(
              `Line ${lineNum}, field '${fieldName}': Invalid phone format`
            );
          }
        }

        // Check required fields
        // Note: 'null' as a string value indicates the field was hidden by conditional logic
        if (rules.includes("required") && !value && value !== "null") {
          errors.push(
            `Line ${lineNum}, field '${fieldName}': Required field is empty`
          );
        }

        // Check enum values
        const optionsRule = rules.find((r) => r.startsWith("options:"));
        if (optionsRule && value && value !== "null") {
          // Skip validation for 'null' values as they indicate hidden fields
          const options = optionsRule.replace("options:", "").split(",");
          const isMultiple = rules.includes("multiple");

          if (isMultiple) {
            // For multiple values, split by semicolon and check each value
            const values = value.split(";").map((v) => v.trim());
            for (const val of values) {
              if (val && val !== "null" && !options.includes(val)) {
                warnings.push(
                  `Line ${lineNum}, field '${fieldName}': Value '${val}' not in allowed options`
                );
              }
            }
          } else {
            // Single value check
            if (!options.includes(value)) {
              warnings.push(
                `Line ${lineNum}, field '${fieldName}': Value '${value}' not in allowed options`
              );
            }
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      columnCount: headers.length,
      rowCount: data.length,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        error instanceof Error ? error.message : "Unknown parsing error",
      ],
      warnings: [],
      columnCount: 0,
      rowCount: 0,
    };
  }
}

/**
 * Combine multiple CSV files with the same structure
 */
export function combineCSVs(
  csvContents: string[],
  fileNames?: string[]
): string {
  if (csvContents.length === 0) {
    throw new Error("No CSV files to combine");
  }

  let referenceHeaders: string[] | null = null;
  let referenceSchema: string[] | null = null;
  const allData: string[][] = [];
  const fileInfos: Array<{
    headers: string[];
    schema: string[];
    index: number;
  }> = [];

  for (let i = 0; i < csvContents.length; i++) {
    const { headers, schema, data } = parseCSV(csvContents[i]);
    fileInfos.push({ headers, schema, index: i + 1 });

    const fileName = fileNames?.[i] || `File ${i + 1}`;
    const referenceFileName = fileNames?.[0] || `File 1`;

    if (!referenceHeaders) {
      referenceHeaders = headers;
      referenceSchema = schema;
    } else {
      // Check structure matches with detailed error information
      // First check if headers match when trimmed (more forgiving)
      const headersTrimmed = headers.map((h) => h.trim());
      const referenceHeadersTrimmed = referenceHeaders.map((h) => h.trim());

      if (headersTrimmed.join(",") === referenceHeadersTrimmed.join(",")) {
        // Headers match when trimmed - just show a warning and continue
        console.warn(
          `Headers in "${fileName}" have extra whitespace but match when trimmed. Continuing with combination.`
        );
      } else if (headers.join(",") !== referenceHeaders.join(",")) {
        // Find differences
        const missing = referenceHeaders.filter((h) => !headers.includes(h));
        const extra = headers.filter((h) => !referenceHeaders.includes(h));
        const wrongOrder =
          headers.length === referenceHeaders.length &&
          headers.some((h, idx) => h !== referenceHeaders[idx]);

        // Check if trimming would fix the issue
        const missingTrimmed = referenceHeadersTrimmed.filter(
          (h) => !headersTrimmed.includes(h)
        );
        const extraTrimmed = headersTrimmed.filter(
          (h) => !referenceHeadersTrimmed.includes(h)
        );
        const wouldTrimFix =
          missingTrimmed.length === 0 && extraTrimmed.length === 0;

        let errorDetails = `Header mismatch in "${fileName}":\n`;
        errorDetails += `Expected ${referenceHeaders.length} headers (from "${referenceFileName}"), found ${headers.length}.\n\n`;

        if (wouldTrimFix) {
          errorDetails += `⚠️ NOTE: Headers would match if whitespace were trimmed!\n`;
          errorDetails += `The CSV files have headers with extra spaces. The system now automatically trims headers during import.\n`;
          errorDetails += `Please re-upload your CSV files to apply automatic trimming.\n\n`;
        }

        // Check for headers that look similar but have subtle differences
        const similarHeaders: string[] = [];
        if (missing.length > 0 && extra.length > 0) {
          missing.forEach((missingHeader) => {
            extra.forEach((extraHeader) => {
              // Check if headers are similar (case-insensitive or with trimmed spaces)
              if (
                missingHeader.toLowerCase() === extraHeader.toLowerCase() ||
                missingHeader.trim() === extraHeader.trim() ||
                missingHeader.replace(/\s+/g, " ").trim() ===
                  extraHeader.replace(/\s+/g, " ").trim()
              ) {
                similarHeaders.push(
                  `  - Expected: "${missingHeader}" (length: ${missingHeader.length})`
                );
                similarHeaders.push(
                  `    Found:    "${extraHeader}" (length: ${extraHeader.length})`
                );

                // Detailed character analysis
                if (
                  missingHeader.toLowerCase() === extraHeader.toLowerCase() &&
                  missingHeader !== extraHeader
                ) {
                  similarHeaders.push(`    Difference: Case mismatch`);
                } else if (
                  missingHeader.trim() !== missingHeader ||
                  extraHeader.trim() !== extraHeader
                ) {
                  similarHeaders.push(
                    `    Difference: Extra whitespace (leading/trailing spaces)`
                  );
                } else if (
                  missingHeader.replace(/\s+/g, " ") !== missingHeader ||
                  extraHeader.replace(/\s+/g, " ") !== extraHeader
                ) {
                  similarHeaders.push(
                    `    Difference: Multiple consecutive spaces`
                  );
                } else {
                  // Check for invisible or special characters
                  const missingChars = Array.from(missingHeader);
                  const extraChars = Array.from(extraHeader);
                  for (
                    let i = 0;
                    i < Math.max(missingChars.length, extraChars.length);
                    i++
                  ) {
                    if (missingChars[i] !== extraChars[i]) {
                      const missingCode = missingChars[i]
                        ? missingChars[i].charCodeAt(0)
                        : "missing";
                      const extraCode = extraChars[i]
                        ? extraChars[i].charCodeAt(0)
                        : "missing";
                      similarHeaders.push(
                        `    Difference at position ${i}: char code ${missingCode} vs ${extraCode}`
                      );
                      break;
                    }
                  }
                }
              }
            });
          });
        }

        // Also check if the issue is just wrong order with same header appearing twice
        const duplicateCheck = new Set();
        const duplicates: string[] = [];
        headers.forEach((h, idx) => {
          if (duplicateCheck.has(h)) {
            duplicates.push(`Duplicate header "${h}" at position ${idx}`);
          }
          duplicateCheck.add(h);
        });

        if (duplicates.length > 0) {
          errorDetails += `Duplicate headers found:\n${duplicates.join(
            "\n"
          )}\n\n`;
        }

        if (similarHeaders.length > 0) {
          errorDetails += `Headers with subtle differences (check for extra spaces, special characters):\n`;
          errorDetails += similarHeaders.join("\n") + "\n\n";
        }

        if (missing.length > 0) {
          errorDetails += `Missing headers: ${missing.join(", ")}\n`;
        }
        if (extra.length > 0) {
          errorDetails += `Extra headers: ${extra.join(", ")}\n`;
        }
        if (wrongOrder && missing.length === 0 && extra.length === 0) {
          errorDetails += `Headers are in wrong order.\n`;
          errorDetails += `Expected: ${referenceHeaders
            .slice(0, 5)
            .join(", ")}${referenceHeaders.length > 5 ? "..." : ""}\n`;
          errorDetails += `Found: ${headers.slice(0, 5).join(", ")}${
            headers.length > 5 ? "..." : ""
          }\n`;
        }

        // If same count but different content, find exact position of first difference
        if (
          headers.length === referenceHeaders.length &&
          (missing.length > 0 || extra.length > 0)
        ) {
          for (let i = 0; i < headers.length; i++) {
            if (headers[i] !== referenceHeaders[i]) {
              errorDetails += `\nFirst difference at position ${
                i + 1
              } (column ${i + 1}):\n`;
              errorDetails += `  Expected: "${referenceHeaders[i]}"\n`;
              errorDetails += `  Found:    "${headers[i]}"\n`;

              // Show surrounding context
              if (i > 0) {
                errorDetails += `  Previous header (${i}): "${
                  headers[i - 1]
                }" ✓\n`;
              }
              if (i < headers.length - 1) {
                errorDetails += `  Next header (${i + 2}): "${
                  headers[i + 1]
                }" ${headers[i + 1] === referenceHeaders[i + 1] ? "✓" : "✗"}\n`;
              }
              break;
            }
          }
        }

        errorDetails += `\nFirst file: "${referenceFileName}"`;
        errorDetails += `\nCurrent file: "${fileName}"`;

        throw new Error(errorDetails);
      }

      if (schema.join(",") !== referenceSchema!.join(",")) {
        const schemaDiffs: string[] = [];
        for (
          let j = 0;
          j < Math.max(schema.length, referenceSchema!.length);
          j++
        ) {
          if (schema[j] !== referenceSchema![j]) {
            const headerName = headers[j] || `Column ${j + 1}`;
            schemaDiffs.push(
              `${headerName}: expected '${
                referenceSchema![j] || "missing"
              }', found '${schema[j] || "missing"}'`
            );
          }
        }

        let errorDetails = `Schema mismatch in "${fileName}":\n`;
        errorDetails += schemaDiffs.slice(0, 5).join("\n");
        if (schemaDiffs.length > 5) {
          errorDetails += `\n... and ${
            schemaDiffs.length - 5
          } more differences`;
        }

        errorDetails += `\n\nFirst file: "${referenceFileName}"`;
        errorDetails += `\nCurrent file: "${fileName}"`;

        throw new Error(errorDetails);
      }
    }

    allData.push(...data);
  }

  // Build combined CSV
  const formatRow = (row: string[]): string => {
    return row
      .map((field) => {
        // Quote fields that contain commas, quotes, or newlines
        if (
          field.includes(",") ||
          field.includes('"') ||
          field.includes("\n")
        ) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      })
      .join(",");
  };

  const lines = [
    formatRow(referenceHeaders!),
    formatRow(referenceSchema!),
    ...allData.map((row) => formatRow(row)),
  ];

  return lines.join("\n");
}
