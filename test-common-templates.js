// Test CommonTemplates import
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testCommonTemplates() {
    console.log('🔍 Testing CommonTemplates compilation...');
    
    // Test TypeScript compilation
    try {
        console.log('1. Testing TypeScript compilation...');
        const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck src/programmatic/library/CommonTemplates.ts');
        if (stderr) {
            console.log('❌ TypeScript errors:', stderr);
        } else {
            console.log('✅ TypeScript compilation successful');
        }
    } catch (error) {
        console.log('❌ TypeScript compilation failed:', error.message);
    }
    
    // Test the actual file contents
    console.log('\n2. Checking file structure...');
    
    const fs = await import('fs');
    const commonTemplatesContent = fs.readFileSync('src/programmatic/library/CommonTemplates.ts', 'utf8');
    
    // Check if JCC2 import exists
    const hasJCC2Import = commonTemplatesContent.includes('JCC2UserQuestionnaireV2');
    console.log(`JCC2 import found: ${hasJCC2Import ? '✅' : '❌'}`);
    
    // Check if JCC2 method exists
    const hasJCC2Method = commonTemplatesContent.includes('createJCC2QuestionnaireV2');
    console.log(`JCC2 method found: ${hasJCC2Method ? '✅' : '❌'}`);
    
    // Check if JCC2 is in template list
    const hasJCC2InList = commonTemplatesContent.includes('jcc2-questionnaire');
    console.log(`JCC2 in template list: ${hasJCC2InList ? '✅' : '❌'}`);
    
    // Test the JCC2 template file
    console.log('\n3. Testing JCC2 template file...');
    try {
        const jcc2Content = fs.readFileSync('templates/jcc2_questionnaire_v2.ts', 'utf8');
        const hasCorrectImport = jcc2Content.includes('from "../src/programmatic/index"');
        console.log(`Correct import path: ${hasCorrectImport ? '✅' : '❌'}`);
        
        const hasExportClass = jcc2Content.includes('export class JCC2UserQuestionnaireV2');
        console.log(`Export class found: ${hasExportClass ? '✅' : '❌'}`);
        
        const hasCreateMethod = jcc2Content.includes('static create()');
        console.log(`Create method found: ${hasCreateMethod ? '✅' : '❌'}`);
        
    } catch (error) {
        console.log('❌ Error reading JCC2 template:', error.message);
    }
    
    console.log('\n✅ Test completed');
}

testCommonTemplates().catch(console.error);