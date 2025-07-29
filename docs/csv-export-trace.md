# CSV Export Flow Trace - Missing Response Data Issue

## Issue Description
When exporting a filled form to CSV, the response data is not appearing in the CSV file. This issue is related to the recent implementation of section-scoped field keys.

## Root Cause
The form data is stored with section-scoped keys (e.g., `section1.field1`) but the CSV export logic was looking for just the field ID without the section prefix.

## Complete Export Flow Trace

### 1. UI Trigger
- **Location**: `/src/routes/DashboardRoute.tsx:727`
- **Action**: User clicks export button on form instance
- **Handler**: `handleExportInstance(instance.id)`

### 2. Export Handler
- **Location**: `/src/routes/DashboardRoute.tsx:172-187`
- **Function**: `handleExportInstance`
- **Action**: Calls `storageManager.exportInstanceToCSV(instanceId)`

### 3. Storage Manager Export
- **Location**: `/src/utils/storage.ts:637-689`
- **Function**: `exportInstanceToCSV`
- **Process**:
  1. Searches for instance in submissions or instances
  2. Gets the associated template
  3. Applies conditional field nullification (unless preserveOriginalData=true)
  4. Creates rowData object with system fields and spread form data
  5. Calls `formatSingleRowCSV`

### 4. CSV Formatting
- **Location**: `/src/utils/storage.ts:697-763`
- **Function**: `formatSingleRowCSV`
- **Issue Location**: Lines 714-722
- **Problem**: 
  ```typescript
  // OLD CODE (BROKEN):
  const fieldKey = parts[1]; // Extract field ID from section.field format
  const value = rowData[fieldKey]; // Looking for "field1" but data has "section1.field1"
  ```

### 5. Data Storage Format
- **FormRenderer**: `/src/components/FormRenderer.tsx:719-724`
- **Function**: `handleFieldChange`
- **Storage**: Uses `setFieldValue` which creates keys like `sectionId.fieldId`
- **Utility**: `/src/utils/field-keys.ts:74-96`

## Fix Applied

### Storage.ts - formatSingleRowCSV (Lines 714-722)
```typescript
// FIXED CODE:
const fieldKey = parts[1]; // Extract field ID from section.field format
// First try the scoped key (section.field)
let value = rowData[header];
// If not found, try just the field ID for backward compatibility
if (value === undefined) {
  value = rowData[fieldKey];
}
mappedRow[header] = value !== undefined ? value : "";
```

### Storage.ts - exportToCSV (Lines 563-572)
Applied same fix to handle batch exports.

## How Section-Scoped Keys Work

1. **Storage**: When a field value is saved, it's stored as `sectionId.fieldId`
2. **Headers**: CSV headers are generated as `sectionId.fieldId` format
3. **Mapping**: The fix ensures we look for data using the full scoped key first

## Testing
To verify the fix:
1. Create a form instance with filled data
2. Export to CSV
3. Check that all field values appear in the correct columns
4. Verify both section-scoped and legacy flat fields work

## Related Files
- `/src/utils/field-keys.ts` - Field key management utilities
- `/src/utils/formLogic.ts` - Form logic including conditional nullification
- `/src/components/FormRenderer.tsx` - Form rendering and data collection
- `/src/routes/DashboardRoute.tsx` - Dashboard and export triggers
- `/src/utils/storage.ts` - Storage and CSV export implementation