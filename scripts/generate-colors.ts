#!/usr/bin/env tsx

/**
 * Color Generation Script
 * 
 * Generates CSS custom properties for all theme color variations.
 * Run this script to see the generated CSS output that can be used in globals.css
 */

import { generateColorCSS, generateDarkModeCSS, generateSemanticMappings } from '../lib/color-utils';
import { themeColors } from '../lib/color-config';

function main() {
    console.log('=== THEME COLOR CONFIGURATION ===\n');
    console.log('Main Colors:');
    for (const [name, color] of Object.entries(themeColors)) {
        console.log(`  ${name}: ${color}`);
    }
    console.log('\n');

    console.log('=== LIGHT MODE (:root) ===\n');
    console.log(':root {');
    console.log(generateColorCSS());
    console.log(generateSemanticMappings('light'));
    console.log('}\n');

    console.log('=== DARK MODE (.dark) ===\n');
    console.log('.dark {');
    console.log(generateDarkModeCSS());
    console.log(generateSemanticMappings('dark'));
    console.log('}\n');
}

main();
