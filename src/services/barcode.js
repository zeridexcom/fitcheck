// Barcode lookup service using Open Food Facts API

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

export async function lookupBarcode(barcode) {
    try {
        const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);

        if (!response.ok) {
            throw new Error('Product not found');
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            throw new Error('Product not found in database');
        }

        const product = data.product;
        const nutriments = product.nutriments || {};

        // Extract nutritional info per 100g/serving
        const servingSize = product.serving_size || '100g';
        const servingGrams = parseServingSize(servingSize);

        return {
            name: product.product_name || product.product_name_en || 'Unknown Product',
            brand: product.brands || '',
            image: product.image_front_url || product.image_url || null,
            servingSize: servingSize,
            barcode: barcode,

            // Per serving (or per 100g if no serving)
            calories: Math.round(nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(nutriments.proteins_serving || nutriments.proteins_100g || 0),
            carbs: Math.round(nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0),
            fat: Math.round(nutriments.fat_serving || nutriments.fat_100g || 0),
            fiber: Math.round(nutriments.fiber_serving || nutriments.fiber_100g || 0),
            sugar: Math.round(nutriments.sugars_serving || nutriments.sugars_100g || 0),
            sodium: Math.round((nutriments.sodium_serving || nutriments.sodium_100g || 0) * 1000), // Convert to mg

            // Raw data for 100g reference
            per100g: {
                calories: Math.round(nutriments['energy-kcal_100g'] || 0),
                protein: Math.round(nutriments.proteins_100g || 0),
                carbs: Math.round(nutriments.carbohydrates_100g || 0),
                fat: Math.round(nutriments.fat_100g || 0),
            },

            // Additional info
            ingredients: product.ingredients_text || '',
            nutriscore: product.nutriscore_grade || null,
            novaGroup: product.nova_group || null,
        };
    } catch (error) {
        console.error('Barcode lookup error:', error);
        throw error;
    }
}

function parseServingSize(servingSize) {
    // Extract numeric value from serving size
    const match = servingSize.match(/(\d+(?:\.\d+)?)\s*g/i);
    return match ? parseFloat(match[1]) : 100;
}

// Popular barcode formats
export function isValidBarcode(code) {
    // EAN-13, EAN-8, UPC-A, UPC-E
    return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code);
}
