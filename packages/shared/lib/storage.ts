// Utility functions for Supabase Storage operations
import { supabase } from './supabase';

// Ingredient images storage utilities
export const ingredientImageUtils = {
  // Get the full public URL for an ingredient image
  getIngredientImageUrl: (imageName: string): string => {
    const { data } = supabase.storage
      .from('images-ingredients')
      .getPublicUrl(imageName);
    return data?.publicUrl || '';
  },

  // Check if an ingredient image exists
  ingredientImageExists: async (imageName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from('images-ingredients')
        .list('', {
          search: imageName,
          limit: 1
        });
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  },

  // Get multiple possible ingredient image filenames for flexible matching
  getIngredientImageVariations: (productName: string): string[] => {
    const variations: string[] = [];

    // First priority: Remove common conjunctions and culinary descriptors, normalize text
    // "Crema de espinaca" -> "Crema-Espinaca"
    // "Costilla de cerdo BBQ con salsa" -> "Costilla-Cerdo"
    const words = productName.split(/\s+/);
    const filteredWords = words
      .filter(word => !/\b(de|del|la|el|y|con|a|por|para|en|bbq|salsa|picante|dulce|light|clasico|tradicional|especial)\b/gi.test(word))
      .map(word => {
        // Normalize: remove accents and lower case, then apply title case
        const normalized = word
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .toLowerCase();
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      });

    const noConjunctions = filteredWords
      .join('-') // Join with dashes
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

    if (noConjunctions) {
      variations.push(noConjunctions);
    }

    // Second priority: Just first and last words (for complex names)
    const allWords = productName.split(/\s+/);
    if (allWords.length >= 2) {
      const firstLast = `${allWords[0]}-${allWords[allWords.length - 1]}`;
      if (!variations.includes(firstLast)) {
        variations.push(firstLast);
      }
    }

    // Third priority: Original with spaces to dashes
    const basic = productName
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!variations.includes(basic)) {
      variations.push(basic);
    }

    return variations;
  },

  // Get ingredient image path for a specific product (main variation)
  getIngredientImagePath: (productName: string): string => {
    return `${ingredientImageUtils.getIngredientImageVariations(productName)[0]}.png`;
  },

  // Special rule mappings for ingredients with multiple variations
  getSpecialImageName: (productName: string): string | null => {
    const lowerName = productName.toLowerCase();

    // Special rules: if product contains these words, use specific image
    if (lowerName.includes('lenteja')) {
      return 'Lentejas.png';
    }
    if (lowerName.includes('garbanzo')) {
      return 'Garbanzos.png';
    }
    if (lowerName.includes('frijoles') || lowerName.includes('frijol')) {
      return 'Frijoles.png';
    }
    if (lowerName.includes('arverjas') || lowerName.includes('arvejas') || lowerName.includes('arveja')) {
      return 'arberjas.png';
    }
    if (lowerName.includes('mojarra')) {
      return 'mojarra-frita.png';
    }
    if (lowerName.includes('pollo')) {
      return 'pollo-asado.png';
    }
    if (lowerName.includes('ensalada')) {
      return 'ensalada.png';
    }

    return null; // No special rule applies
  },

  // Resolve image URL for a product with fallback logic
  resolveProductImageUrl: (product: { name: string; image_url?: string }): string | null => {
    // First priority: direct image_url from database
    if (product.image_url) {
      return product.image_url;
    }

    // Second priority: check for special rules
    const specialImage = ingredientImageUtils.getSpecialImageName(product.name);
    if (specialImage) {
      return ingredientImageUtils.getIngredientImageUrl(specialImage);
    }

    // Third priority: try multiple variations of the storage filename
    const variations = ingredientImageUtils.getIngredientImageVariations(product.name);

    // Return the first variation (we assume the image exists if uploaded)
    const firstVariation = variations[0];
    if (firstVariation) {
      return ingredientImageUtils.getIngredientImageUrl(`${firstVariation}.png`);
    }

    return null;
  }
};

export default ingredientImageUtils;
