/**
 * Tests for CSV processing utilities
 */

import { parseCSV } from '../../../utils/csvProcessing';

describe('parseCSV', () => {
  // This test is currently FAILING because the parseCSV function splits by newlines first,
  // which breaks multi-line quoted fields. The test expects RFC 4180 compliant behavior
  // where quoted fields can contain newlines.
  it('should handle multi-line fields within quotes (RFC 4180)', () => {
    const csvContent = `Name,Comment,Status
text,textarea,text
John,"This is a long comment
that spans multiple
lines with detailed feedback",Active`;

    const result = parseCSV(csvContent);
    
    expect(result.headers).toEqual(['Name', 'Comment', 'Status']);
    // EXPECTED: One data row with the multi-line comment preserved
    // ACTUAL: Multiple broken rows because of splitting by \n first
    expect(result.data).toEqual([
      ['John', 'This is a long comment\nthat spans multiple\nlines with detailed feedback', 'Active']
    ]);
  });
});