/**
 * Data sharing utilities for form templates and instances
 * Provides compression, encoding, and validation for shareable strings
 */

import { deflate, inflate } from 'fflate';
import { compress, decompress } from 'lz-string';
import DOMPurify from 'dompurify';
import * as CRC32 from 'crc-32';
import { FormTemplate, FormInstance, FormSubmission } from '../types/form';
import { ProgrammaticTemplate } from '../programmatic/types';

// Supported data types for sharing
export type ShareableData = FormTemplate | ProgrammaticTemplate | FormInstance | FormSubmission;

// Compression strategies
interface CompressionStrategy {
  name: string;
  compress: (data: string) => Promise<Uint8Array>;
  decompress: (data: Uint8Array) => Promise<string>;
  identifier: string;
}

// Encoded data metadata
interface EncodedMetadata {
  version: number;
  compression: string;
  encoding: string;
  checksum: string;
  dataType: 'template' | 'programmatic' | 'instance' | 'submission';
  timestamp: number;
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: ShareableData;
}

// Error types
export enum ShareDataError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  SIZE_LIMIT_EXCEEDED = 'SIZE_LIMIT_EXCEEDED',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  DECOMPRESSION_FAILED = 'DECOMPRESSION_FAILED',
  ENCODING_FAILED = 'ENCODING_FAILED'
}

export class DataSharingError extends Error {
  constructor(public type: ShareDataError, message: string, public details?: any) {
    super(message);
    this.name = 'DataSharingError';
  }
}

/**
 * Core data sharing engine with compression and validation
 */
export class FormDataSharing {
  private static readonly FORMAT_VERSION = 1;
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
  private static readonly CHECKSUM_LENGTH = 8;
  
  private compressionStrategies: CompressionStrategy[] = [
    {
      name: 'deflate',
      identifier: 'df',
      compress: async (data: string): Promise<Uint8Array> => {
        return new Promise((resolve, reject) => {
          deflate(new TextEncoder().encode(data), { level: 9 }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      },
      decompress: async (data: Uint8Array): Promise<string> => {
        return new Promise((resolve, reject) => {
          inflate(data, (err, result) => {
            if (err) reject(err);
            else resolve(new TextDecoder().decode(result));
          });
        });
      }
    },
    {
      name: 'lz-string',
      identifier: 'lz',
      compress: async (data: string): Promise<Uint8Array> => {
        const compressed = compress(data);
        return new TextEncoder().encode(compressed);
      },
      decompress: async (data: Uint8Array): Promise<string> => {
        const compressed = new TextDecoder().decode(data);
        const decompressed = decompress(compressed);
        if (decompressed === null) {
          throw new Error('Decompression failed');
        }
        return decompressed;
      }
    }
  ];

  /**
   * Encode data for sharing
   */
  async encode(data: ShareableData): Promise<string> {
    try {
      // Validate and sanitize input data
      const validationResult = this.validateData(data);
      if (!validationResult.valid) {
        throw new DataSharingError(
          ShareDataError.SCHEMA_VALIDATION_FAILED,
          `Validation failed: ${validationResult.errors.join(', ')}`
        );
      }

      const sanitizedData = validationResult.sanitized || data;
      
      // Determine data type
      const dataType = this.getDataType(sanitizedData);
      
      // Serialize data
      const jsonData = JSON.stringify(sanitizedData, this.dateReplacer);
      
      // Check size limit
      if (jsonData.length > FormDataSharing.MAX_SIZE_BYTES) {
        throw new DataSharingError(
          ShareDataError.SIZE_LIMIT_EXCEEDED,
          `Data size ${jsonData.length} exceeds limit of ${FormDataSharing.MAX_SIZE_BYTES} bytes`
        );
      }

      // Find best compression strategy
      const compressionResults = await Promise.all(
        this.compressionStrategies.map(async (strategy) => {
          try {
            const compressed = await strategy.compress(jsonData);
            return {
              strategy,
              compressed,
              ratio: compressed.length / jsonData.length
            };
          } catch (error) {
            return null;
          }
        })
      );

      const validResults = compressionResults.filter(r => r !== null);
      if (validResults.length === 0) {
        throw new DataSharingError(
          ShareDataError.COMPRESSION_FAILED,
          'All compression strategies failed'
        );
      }

      // Select best compression ratio
      const bestResult = validResults.reduce((best, current) => 
        current!.ratio < best!.ratio ? current : best
      )!;

      // Encode to base64url
      const encodedData = this.base64UrlEncode(bestResult.compressed);
      
      // Calculate checksum
      const checksum = this.calculateChecksum(encodedData);

      // Create metadata
      const metadata: EncodedMetadata = {
        version: FormDataSharing.FORMAT_VERSION,
        compression: bestResult.strategy.identifier,
        encoding: 'b64u',
        checksum: checksum.toString(16).padStart(FormDataSharing.CHECKSUM_LENGTH, '0'),
        dataType,
        timestamp: Date.now()
      };

      // Create final format: fm:version:compression:encoding:checksum:data
      return `fm:${metadata.version}:${metadata.compression}:${metadata.encoding}:${metadata.checksum}:${encodedData}`;

    } catch (error) {
      if (error instanceof DataSharingError) {
        throw error;
      }
      throw new DataSharingError(
        ShareDataError.ENCODING_FAILED,
        `Encoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Decode shared data
   */
  async decode(encodedString: string): Promise<ShareableData> {
    try {
      // Parse format
      const parts = encodedString.split(':');
      if (parts.length !== 6 || parts[0] !== 'fm') {
        throw new DataSharingError(
          ShareDataError.INVALID_FORMAT,
          'Invalid format: Expected fm:version:compression:encoding:checksum:data'
        );
      }

      const [, version, compression, encoding, checksum, data] = parts;
      
      // Validate version
      if (parseInt(version) !== FormDataSharing.FORMAT_VERSION) {
        throw new DataSharingError(
          ShareDataError.UNSUPPORTED_VERSION,
          `Unsupported version: ${version}`
        );
      }

      // Validate checksum
      const expectedChecksum = this.calculateChecksum(data);
      if (checksum !== expectedChecksum.toString(16).padStart(FormDataSharing.CHECKSUM_LENGTH, '0')) {
        throw new DataSharingError(
          ShareDataError.CHECKSUM_MISMATCH,
          'Data integrity check failed'
        );
      }

      // Decode data
      let binaryData: Uint8Array;
      if (encoding === 'b64u') {
        binaryData = this.base64UrlDecode(data);
      } else {
        throw new DataSharingError(
          ShareDataError.INVALID_FORMAT,
          `Unsupported encoding: ${encoding}`
        );
      }

      // Find compression strategy
      const strategy = this.compressionStrategies.find(s => s.identifier === compression);
      if (!strategy) {
        throw new DataSharingError(
          ShareDataError.INVALID_FORMAT,
          `Unsupported compression: ${compression}`
        );
      }

      // Decompress
      const jsonData = await strategy.decompress(binaryData);
      
      // Parse JSON
      const parsedData = JSON.parse(jsonData, this.dateReviver);
      
      // Validate and sanitize
      const validationResult = this.validateData(parsedData);
      if (!validationResult.valid) {
        throw new DataSharingError(
          ShareDataError.SCHEMA_VALIDATION_FAILED,
          `Validation failed: ${validationResult.errors.join(', ')}`
        );
      }

      return validationResult.sanitized || parsedData;

    } catch (error) {
      if (error instanceof DataSharingError) {
        throw error;
      }
      throw new DataSharingError(
        ShareDataError.DECOMPRESSION_FAILED,
        `Decoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get sharing statistics
   */
  async getCompressionStats(data: ShareableData): Promise<{
    original: number;
    compressed: number;
    ratio: number;
    strategy: string;
  }> {
    const jsonData = JSON.stringify(data, this.dateReplacer);
    const encoded = await this.encode(data);
    
    return {
      original: jsonData.length,
      compressed: encoded.length,
      ratio: encoded.length / jsonData.length,
      strategy: encoded.split(':')[2]
    };
  }

  /**
   * Validate data structure and sanitize
   */
  private validateData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { valid: false, errors, warnings };
    }

    // Deep clone for sanitization
    const sanitized = JSON.parse(JSON.stringify(data));

    // Sanitize based on data type
    if (this.isFormTemplate(data) || this.isProgrammaticTemplate(data)) {
      this.sanitizeTemplate(sanitized, errors, warnings);
    } else if (this.isFormInstance(data)) {
      this.sanitizeFormInstance(sanitized, errors, warnings);
    } else if (this.isFormSubmission(data)) {
      this.sanitizeFormSubmission(sanitized, errors, warnings);
    } else {
      errors.push('Unknown data type');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }

  /**
   * Sanitize template data
   */
  private sanitizeTemplate(data: any, errors: string[], warnings: string[]): void {
    // Sanitize name and description
    if (typeof data.name === 'string') {
      data.name = DOMPurify.sanitize(data.name, { ALLOWED_TAGS: [] });
    }
    if (typeof data.description === 'string') {
      data.description = DOMPurify.sanitize(data.description, { ALLOWED_TAGS: [] });
    }

    // Sanitize sections
    if (Array.isArray(data.sections)) {
      data.sections.forEach((section: any) => {
        if (typeof section.title === 'string') {
          section.title = DOMPurify.sanitize(section.title, { ALLOWED_TAGS: [] });
        }
        
        if (Array.isArray(section.fields)) {
          section.fields.forEach((field: any) => {
            if (typeof field.label === 'string') {
              field.label = DOMPurify.sanitize(field.label, { ALLOWED_TAGS: [] });
            }
            if (typeof field.placeholder === 'string') {
              field.placeholder = DOMPurify.sanitize(field.placeholder, { ALLOWED_TAGS: [] });
            }
            if (typeof field.content === 'string') {
              field.content = DOMPurify.sanitize(field.content, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em'] });
            }
          });
        }
      });
    }

    // Validate required fields
    const requiredFields = ['id', 'name', 'sections'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Sanitize form instance data
   */
  private sanitizeFormInstance(data: any, errors: string[], warnings: string[]): void {
    // Sanitize form data values
    if (data.data && typeof data.data === 'object') {
      Object.keys(data.data).forEach(key => {
        const value = data.data[key];
        if (typeof value === 'string') {
          data.data[key] = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
        }
      });
    }

    // Validate required fields
    const requiredFields = ['id', 'templateId', 'data'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Sanitize form submission data
   */
  private sanitizeFormSubmission(data: any, errors: string[], warnings: string[]): void {
    // Similar to form instance sanitization
    this.sanitizeFormInstance(data, errors, warnings);
  }

  /**
   * Determine data type
   */
  private getDataType(data: any): 'template' | 'programmatic' | 'instance' | 'submission' {
    if (this.isProgrammaticTemplate(data)) return 'programmatic';
    if (this.isFormTemplate(data)) return 'template';
    if (this.isFormSubmission(data)) return 'submission';
    if (this.isFormInstance(data)) return 'instance';
    return 'template'; // Default fallback
  }

  /**
   * Type guards
   */
  private isFormTemplate(data: any): data is FormTemplate {
    return data && typeof data === 'object' && 
           'sections' in data && 
           'createdAt' in data && 
           !('metadata' in data);
  }

  private isProgrammaticTemplate(data: any): data is ProgrammaticTemplate {
    return data && typeof data === 'object' && 
           'metadata' in data && 
           'sections' in data && 
           'schema' in data;
  }

  private isFormInstance(data: any): data is FormInstance {
    return data && typeof data === 'object' && 
           'templateId' in data && 
           'data' in data && 
           'progress' in data;
  }

  private isFormSubmission(data: any): data is FormSubmission {
    return data && typeof data === 'object' && 
           'formInstanceId' in data && 
           'submittedAt' in data;
  }

  /**
   * Base64URL encoding (URL-safe)
   */
  private base64UrlEncode(data: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...data));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64URL decoding
   */
  private base64UrlDecode(data: string): Uint8Array {
    // Add padding if needed
    const padded = data + '='.repeat((4 - data.length % 4) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
  }

  /**
   * Calculate CRC32 checksum
   */
  private calculateChecksum(data: string): number {
    return CRC32.str(data);
  }

  /**
   * Date serialization helper
   */
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  /**
   * Date deserialization helper
   */
  private dateReviver(key: string, value: any): any {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  }
}

// Export singleton instance
export const formDataSharing = new FormDataSharing();

// Utility functions for easier use
export const encodeForSharing = (data: ShareableData): Promise<string> => 
  formDataSharing.encode(data);

export const decodeFromSharing = (encodedString: string): Promise<ShareableData> => 
  formDataSharing.decode(encodedString);

export const getCompressionStats = (data: ShareableData) => 
  formDataSharing.getCompressionStats(data);