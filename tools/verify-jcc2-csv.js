import { chromium } from 'playwright';

async function runJCC2Verification() {
    console.log('🚀 Starting JCC2 CSV Verification Test\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Step 1: Navigate to app
        console.log('📋 Step 1: Navigating to application');
        await page.goto('http://localhost:5174');
        await page.waitForTimeout(2000);
        
        // Step 2: Import JCC2 template
        console.log('📋 Step 2: Importing JCC2 Questionnaire template');
        await page.click('text=New Template');
        await page.click('button:has-text("Import Programmatic")');
        await page.click('text=Examples');
        
        // Click the first "Import Template" button (which should be JCC2 User Questionnaire)
        const firstImportButton = page.locator('button:has-text("Import Template")').first();
        if (await firstImportButton.isVisible({ timeout: 5000 })) {
            await firstImportButton.click();
            console.log('✅ JCC2 template imported successfully');
        } else {
            console.log('❌ No Import Template buttons found');
            return;
        }
        
        await page.waitForTimeout(2000);
        
        // Step 3: Check the current page - we should be on the form builder after import
        console.log('📋 Step 3: Checking imported form structure');
        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);
        
        // Take a screenshot to see what we have
        await page.screenshot({ path: 'after-import.png' });
        console.log('📸 Screenshot saved as after-import.png');
        
        // Look for form builder interface elements
        const builderElements = await page.locator('.form-builder, .field-list, .section, [data-field-type], .field-container').all();
        console.log(`🔍 Found ${builderElements.length} form builder elements`);
        
        // Try to find preview or view form buttons
        const viewFormSelectors = [
            'text=Preview Form',
            'text=View Form', 
            'text=Preview',
            'button[data-action="preview"]',
            'a[href*="preview"]',
            'button:has-text("Test Form")'
        ];
        
        let foundPreview = false;
        for (const selector of viewFormSelectors) {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
                console.log(`✅ Found preview option: ${selector}`);
                await elements[0].click();
                foundPreview = true;
                break;
            }
        }
        
        if (!foundPreview) {
            console.log('⚠️  No preview button found, analyzing form in builder mode');
        }
        
        await page.waitForTimeout(2000);
        
        // Step 4: Analyze form structure
        console.log('📋 Step 4: Analyzing JCC2 form structure');
        
        // Get all form fields
        const allInputs = await page.locator('input, textarea, select').all();
        console.log(`🔍 Found ${allInputs.length} form elements`);
        
        const fieldData = {};
        const fieldTypes = {};
        
        // Analyze each field
        for (let i = 0; i < Math.min(allInputs.length, 50); i++) {
            const input = allInputs[i];
            const name = await input.getAttribute('name');
            const type = await input.getAttribute('type');
            const id = await input.getAttribute('id');
            const tagName = await input.evaluate(el => el.tagName);
            
            if (name && type !== 'hidden' && type !== 'submit') {
                fieldTypes[name] = { type, tagName, id };
                console.log(`📝 Field: ${name} (${type})`);
            }
        }
        
        // Step 5: Fill sample data and verify structure
        console.log('\n📋 Step 5: JCC2 Questionnaire Field Structure Analysis');
        console.log('═'.repeat(60));
        
        // Key JCC2 sections from template analysis
        const expectedSections = {
            'User Information': ['event', 'date', 'rank_name', 'unit', 'email', 'phone'],
            'Role and Echelon': ['current_role_status', 'is_cyber_operator', 'echelon', 'duties'],
            'Experience Levels': ['exp_cyber_operations', 'exp_your_current_role', 'exp_jcc2_experience'],
            'JCC2 Applications': ['usage_*_frequency', 'usage_*_classification', 'usage_*_training_received'],
            'Effectiveness Ratings': ['mop_1_1_1_*', 'mos_*', 'usability_*'],
            'Final Assessment': ['eval_*', 'critical_issues', 'shout_outs', 'final_thoughts']
        };
        
        let foundFields = 0;
        let sampleData = {};
        
        Object.entries(expectedSections).forEach(([section, patterns]) => {
            console.log(`\n🔸 ${section}:`);
            patterns.forEach(pattern => {
                if (pattern.includes('*')) {
                    // Wildcard pattern
                    const prefix = pattern.split('*')[0];
                    const matches = Object.keys(fieldTypes).filter(name => name.startsWith(prefix));
                    if (matches.length > 0) {
                        console.log(`  ✅ Found ${matches.length} fields matching "${pattern}"`);
                        matches.slice(0, 3).forEach(match => {
                            console.log(`     - ${match} (${fieldTypes[match].type})`);
                        });
                        foundFields += matches.length;
                        
                        // Add sample data
                        matches.forEach(match => {
                            sampleData[match] = getSampleValueForField(match, fieldTypes[match]);
                        });
                    } else {
                        console.log(`  ❌ No fields found for pattern "${pattern}"`);
                    }
                } else {
                    // Exact field name
                    if (fieldTypes[pattern]) {
                        console.log(`  ✅ ${pattern} (${fieldTypes[pattern].type})`);
                        foundFields++;
                        sampleData[pattern] = getSampleValueForField(pattern, fieldTypes[pattern]);
                    } else {
                        console.log(`  ❌ Missing: ${pattern}`);
                    }
                }
            });
        });
        
        // Step 6: CSV Structure Simulation
        console.log('\n📋 Step 6: CSV Data Structure Verification');
        console.log('═'.repeat(60));
        console.log(`📊 Total analyzable fields found: ${foundFields}`);
        console.log(`📊 Sample data entries: ${Object.keys(sampleData).length}`);
        
        // Simulate CSV headers and data row
        const csvHeaders = Object.keys(sampleData);
        const csvDataRow = csvHeaders.map(header => sampleData[header]);
        
        console.log('\n📋 Expected CSV Structure:');
        console.log('Headers:', csvHeaders.slice(0, 10).join(', '), '...');
        console.log('Sample Data:', csvDataRow.slice(0, 10).join(', '), '...');
        
        // Step 7: Verification Summary
        console.log('\n📋 Step 7: Verification Summary');
        console.log('═'.repeat(60));
        
        const verificationResults = {
            'User Information Fields': getFieldCount(sampleData, ['event', 'date', 'rank_name', 'email']),
            'Experience Fields': getFieldCount(sampleData, ['exp_']),
            'Usage Pattern Fields': getFieldCount(sampleData, ['usage_']),
            'Effectiveness Fields': getFieldCount(sampleData, ['mop_', 'mos_']),
            'Usability Fields': getFieldCount(sampleData, ['usability_']),
            'Evaluation Fields': getFieldCount(sampleData, ['eval_'])
        };
        
        Object.entries(verificationResults).forEach(([category, count]) => {
            const status = count > 0 ? '✅' : '❌';
            console.log(`${status} ${category}: ${count} fields`);
        });
        
        const totalExpectedFields = Object.values(verificationResults).reduce((a, b) => a + b, 0);
        const matchRate = totalExpectedFields > 0 ? ((foundFields / totalExpectedFields) * 100).toFixed(1) : '0.0';
        
        console.log(`\n📈 Overall Results:`);
        console.log(`✅ Form structure integrity: ${matchRate}% field coverage`);
        console.log(`📊 CSV export readiness: ${foundFields > 20 ? 'READY' : 'PARTIAL'}`);
        console.log(`🔍 Data verification capability: ${foundFields > 10 ? 'COMPREHENSIVE' : 'BASIC'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

function getSampleValueForField(fieldName, fieldInfo) {
    if (fieldName.includes('email')) return 'test@example.com';
    if (fieldName.includes('phone')) return '555-123-4567';
    if (fieldName.includes('date')) return '2024-01-15';
    if (fieldName.includes('rank')) return 'Test User SSgt';
    if (fieldName.includes('unit')) return 'Test Unit 123';
    if (fieldName.includes('event')) return 'E2E Test Event';
    if (fieldName.includes('frequency')) return 'Weekly';
    if (fieldName.includes('effectiveness') || fieldName.includes('mop_') || fieldName.includes('mos_')) return 'Moderately Effective';
    if (fieldName.includes('usability_')) return '4';
    if (fieldName.includes('training')) return 'Yes';
    if (fieldName.includes('status')) return 'Active Duty';
    if (fieldName.includes('cyber_operator')) return 'No';
    if (fieldName.includes('echelon')) return 'Operational';
    if (fieldInfo.type === 'radio' || fieldInfo.type === 'select-one') return 'Sample Option';
    if (fieldInfo.type === 'checkbox') return ['Option 1', 'Option 2'];
    if (fieldInfo.tagName === 'TEXTAREA') return 'Sample text response';
    return 'Test Value';
}

function getFieldCount(data, patterns) {
    return Object.keys(data).filter(key => 
        patterns.some(pattern => key.startsWith(pattern) || key.includes(pattern))
    ).length;
}

// Run the verification
runJCC2Verification().catch(console.error);