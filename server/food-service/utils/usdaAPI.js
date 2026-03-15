/**
 * USDA FoodData Central API Integration
 * 100% FREE - No registration required!
 * Uses DEMO_KEY with built-in https module (no axios needed)
 */

const https = require('https');

// USDA API Configuration - DEMO_KEY works forever!
const USDA_API_KEY = process.env.USDA_API_KEY || 'hdAvJKUlvnIDCCVfCWfUnHJezpOGbpHZYEyGPgAn';
const USDA_BASE_URL = 'api.nal.usda.gov';

/**
 * Make HTTPS GET request
 * @param {string} path - API path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Response data
 */
function httpsGet(path, params) {
  return new Promise((resolve, reject) => {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${path}?${queryString}`;
    
    const options = {
      hostname: USDA_BASE_URL,
      path: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Search food in USDA FoodData Central
 * @param {string} query - Food name to search
 * @param {number} pageSize - Number of results (default: 5)
 * @returns {Promise<Array>} - Array of food items
 */
async function searchUSDAFood(query, pageSize = 5) {
  try {
    console.log(`🔍 [USDA] Searching for: "${query}"`);
    
    const data = await httpsGet('/fdc/v1/foods/search', {
      api_key: USDA_API_KEY,
      query: query,
      pageSize: pageSize,
      dataType: 'Foundation,SR Legacy', // High quality data sources
    });

    if (data && data.foods && data.foods.length > 0) {
      console.log(`[USDA] Found ${data.foods.length} results`);
      return data.foods;
    }

    console.log(`[USDA] No results found for "${query}"`);
    return [];
  } catch (error) {
    console.error('[USDA] API Error:', error.message);
    throw new Error('USDA API request failed');
  }
}

/**
 * Get nutrition data for a food item
 * @param {number} fdcId - USDA Food Data Central ID
 * @returns {Promise<Object>} - Nutrition data
 */
async function getFoodDetails(fdcId) {
  try {
    const data = await httpsGet(`/fdc/v1/food/${fdcId}`, {
      api_key: USDA_API_KEY
    });

    return data;
  } catch (error) {
    console.error('[USDA] Error getting food details:', error.message);
    throw new Error('Failed to get food details');
  }
}

/**
 * Extract nutrition values from USDA food item (simplified - 4 fields)
 * @param {Object} foodItem - USDA food object
 * @returns {Object} - Simplified nutrition data
 */
function extractNutrition(foodItem) {
  const nutrients = {};
  
  // Map USDA nutrient IDs to our fields
  const nutrientMap = {
    1008: 'calories',    // Energy (kcal)
    1003: 'protein',     // Protein (g)
    1004: 'fat',         // Total lipid (fat) (g)
    2000: 'sugar',       // Total sugars (g)
  };

  if (foodItem.foodNutrients) {
    foodItem.foodNutrients.forEach(nutrient => {
      const fieldName = nutrientMap[nutrient.nutrientId];
      if (fieldName && nutrient.value !== undefined) {
        nutrients[fieldName] = parseFloat(nutrient.value.toFixed(2));
      }
    });
  }

  return {
    food_name: foodItem.description || 'Unknown',
    fdcId: foodItem.fdcId,
    serving_size: '100g', // USDA data is per 100g by default
    calories: nutrients.calories || 0,
    protein: nutrients.protein || 0,
    fat: nutrients.fat || 0,
    sugar: nutrients.sugar || 0,
    dataSource: foodItem.dataType || 'USDA',
  };
}

/**
 * Search and get nutrition for a food (main function)
 * @param {string} foodName - Name of food to search
 * @returns {Promise<Object|null>} - Nutrition data or null if not found
 */
async function getNutritionFromUSDA(foodName) {
  try {
    // Step 1: Search for food
    const searchResults = await searchUSDAFood(foodName, 1);
    
    if (searchResults.length === 0) {
      return null;
    }

    // Step 2: Get first result and extract nutrition
    const bestMatch = searchResults[0];
    const nutrition = extractNutrition(bestMatch);

    console.log(` [USDA] Extracted nutrition for "${nutrition.food_name}"`);
    console.log(` Calories: ${nutrition.calories} kcal`);
    console.log(` Protein: ${nutrition.protein}g`);
    console.log(` Fat: ${nutrition.fat}g`);
    console.log(` Sugar: ${nutrition.sugar}g`);

    return nutrition;
  } catch (error) {
    console.error('[USDA] Failed to get nutrition:', error.message);
    return null;
  }
}

module.exports = {
  searchUSDAFood,
  getFoodDetails,
  extractNutrition,
  getNutritionFromUSDA
};
