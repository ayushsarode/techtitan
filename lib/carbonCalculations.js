// lib/carbonCalculations.js

/**
 * Calculate carbon footprint based on activity category, type and details
 * @param {string} category - Activity category (Transportation, Food, Home Energy, Shopping)
 * @param {string} activityType - Type of activity within the category
 * @param {object} details - Activity specific details
 * @returns {number} Carbon footprint in kg CO2e
 */
export function calculateCarbonFootprint(category, activityType, details) {
    let carbonAmount = 0;
  
    switch (category) {
      case 'Transportation':
        carbonAmount = calculateTransportationFootprint(details);
        break;
      case 'Food':
        carbonAmount = calculateFoodFootprint(details);
        break;
      case 'Home Energy':
        carbonAmount = calculateEnergyFootprint(details);
        break;
      case 'Shopping':
        carbonAmount = calculateShoppingFootprint(details);
        break;
      default:
        // For any custom categories
        carbonAmount = details.amount ? parseFloat(details.amount) : 0;
    }
  
    // Round to 2 decimal places
    return Math.round(carbonAmount * 100) / 100;
  }
  
  /**
   * Calculate points based on carbon savings or sustainable actions
   * @param {string} category - Activity category
   * @param {string} activityType - Type of activity
   * @param {object} details - Activity specific details
   * @param {number} carbonAmount - Carbon footprint calculated
   * @returns {number} Points earned
   */
  export function calculatePoints(category, activityType, details, carbonAmount) {
    let points = 0;
  
    switch (category) {
      case 'Transportation':
        points = calculateTransportationPoints(details, carbonAmount);
        break;
      case 'Food':
        points = calculateFoodPoints(details);
        break;
      case 'Home Energy':
        points = calculateEnergyPoints(details, carbonAmount);
        break;
      case 'Shopping':
        points = calculateShoppingPoints(details);
        break;
      default:
        // Base points for custom categories
        points = 5;
    }
  
    // Ensure points are always positive integers
    return Math.max(1, Math.round(points));
  }
  
  /**
   * Calculate carbon footprint for transportation activities
   * @param {object} details - Transportation details
   * @returns {number} Carbon footprint in kg CO2e
   */
  function calculateTransportationFootprint(details) {
    const distance = parseFloat(details.distance) || 0;
    const passengers = parseInt(details.passengers) || 1;
    
    // CO2e emissions in kg per kilometer
    const emissionFactors = {
      car: 0.192,
      bus: 0.105,
      train: 0.041,
      plane: 0.255,
      bike: 0,
      walk: 0
    };
    
    const mode = details.mode || 'car';
    let emissions = distance * emissionFactors[mode];
    
    // For car travel, divide by number of passengers for carpooling benefit
    if (mode === 'car' && passengers > 1) {
      emissions = emissions / passengers;
    }
    
    return emissions;
  }
  
  /**
   * Calculate points for transportation activities
   * @param {object} details - Transportation details
   * @param {number} carbonAmount - Carbon footprint
   * @returns {number} Points earned
   */
  function calculateTransportationPoints(details, carbonAmount) {
    const mode = details.mode || 'car';
    const distance = parseFloat(details.distance) || 0;
    let points = 10;
    
    // Reward zero-carbon transport options
    if (mode === 'bike' || mode === 'walk') {
      points = distance * 2; // 2 points per km for walking/cycling
    } 
    // Reward public transport
    else if (mode === 'bus' || mode === 'train') {
      points = 15;
    }
    // Points for carpooling
    else if (mode === 'car' && parseInt(details.passengers) > 1) {
      points = 10 + (parseInt(details.passengers) - 1) * 5;
    }
    // Fewer points for carbon-intensive options
    else if (mode === 'plane') {
      points = 5;
    }
    
    return points;
  }
  
  /**
   * Calculate carbon footprint for food activities
   * @param {object} details - Food details
   * @returns {number} Carbon footprint in kg CO2e
   */
  function calculateFoodFootprint(details) {
    const servings = parseInt(details.servings) || 1;
    
    // Base emissions per meal type in kg CO2e
    const mealEmissions = {
      vegan: 0.5,
      vegetarian: 1.2,
      pescatarian: 2.0,
      meat_low: 3.5,
      meat_high: 7.0
    };
    
    const mealType = details.meal_type || 'meat_low';
    let emissions = mealEmissions[mealType] * servings;
    
    // Reductions for sustainable choices
    if (details.local_sourced) {
      emissions *= 0.9; // 10% reduction for locally sourced
    }
    
    if (details.organic) {
      emissions *= 0.95; // 5% reduction for organic
    }
    
    return emissions;
  }
  
  /**
   * Calculate points for food activities
   * @param {object} details - Food details
   * @returns {number} Points earned
   */
  function calculateFoodPoints(details) {
    const mealType = details.meal_type || 'meat_low';
    let points = 10;
    
    // Points based on meal type
    const mealPoints = {
      vegan: 25,
      vegetarian: 20,
      pescatarian: 15,
      meat_low: 10,
      meat_high: 5
    };
    
    points = mealPoints[mealType];
    
    // Bonus points for sustainable choices
    if (details.local_sourced) {
      points += 5;
    }
    
    if (details.organic) {
      points += 5;
    }
    
    return points;
  }
  
  /**
   * Calculate carbon footprint for home energy activities
   * @param {object} details - Energy details
   * @returns {number} Carbon footprint in kg CO2e
   */
  function calculateEnergyFootprint(details) {
    const amount = parseFloat(details.amount) || 0;
    
    // Emission factors for different energy types (kg CO2e per unit)
    const emissionFactors = {
      electricity: 0.233, // kg CO2e per kWh (average grid mix)
      natural_gas: 0.184, // kg CO2e per kWh equivalent
      heating_oil: 0.268, // kg CO2e per kWh equivalent
      renewable: 0.025  // kg CO2e per kWh (some lifecycle emissions)
    };
    
    const energyType = details.energy_type || 'electricity';
    let emissions = amount * emissionFactors[energyType];
    
    // Reduction for green energy source
    if (details.green_energy) {
      emissions *= 0.2; // 80% reduction for green energy
    }
    
    return emissions;
  }
  
  /**
   * Calculate points for home energy activities
   * @param {object} details - Energy details
   * @param {number} carbonAmount - Carbon footprint
   * @returns {number} Points earned
   */
  function calculateEnergyPoints(details, carbonAmount) {
    const energyType = details.energy_type || 'electricity';
    let points = 10;
    
    // Points based on energy type
    if (energyType === 'renewable') {
      points = 25;
    } else if (details.green_energy) {
      points = 20;
    }
    
    return points;
  }
  
  /**
   * Calculate carbon footprint for shopping activities
   * @param {object} details - Shopping details
   * @returns {number} Carbon footprint in kg CO2e
   */
  function calculateShoppingFootprint(details) {
    const amountSpent = parseFloat(details.amount_spent) || 0;
    
    // Emission factors per dollar spent
    const emissionFactors = {
      clothing: 0.5,
      electronics: 0.7,
      household: 0.3,
      secondhand: 0.1
    };
    
    const productType = details.product_type || 'household';
    let emissions = amountSpent * emissionFactors[productType];
    
    // Reduction for sustainable products
    if (details.sustainable) {
      emissions *= 0.7; // 30% reduction for sustainable products
    }
    
    return emissions;
  }
  
  /**
   * Calculate points for shopping activities
   * @param {object} details - Shopping details
   * @returns {number} Points earned
   */
  function calculateShoppingPoints(details) {
    const productType = details.product_type || 'household';
    let points = 5;
    
    // Reward sustainable shopping choices
    if (productType === 'secondhand') {
      points = 20;
    } else if (details.sustainable) {
      points = 15;
    }
    
    return points;
  }