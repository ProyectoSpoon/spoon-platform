// src/config/reviewsConfig.ts

export const REVIEWS_CONFIG = {
  // Límites
  MAX_COMMENT_LENGTH: 500,
  MIN_RATING: 1,
  MAX_RATING: 5,
  REVIEWS_PER_PAGE: 10,
  MAX_REVIEWS_PER_REQUEST: 50,
  
  // Cache
  CACHE_TTL: {
    REVIEWS: 2 * 60 * 1000,      // 2 minutos
    STATS: 5 * 60 * 1000,        // 5 minutos
    MY_REVIEW: 1 * 60 * 1000,    // 1 minuto
  },
  
  // Textos
  MESSAGES: {
    SUBMIT_SUCCESS: 'Reseña enviada correctamente',
    SUBMIT_ERROR: 'No se pudo enviar la reseña',
    DELETE_SUCCESS: 'Reseña eliminada correctamente',
    DELETE_ERROR: 'No se pudo eliminar la reseña',
    DELETE_CONFIRM: '¿Estás seguro de que quieres eliminar tu reseña?',
    LOGIN_REQUIRED: 'Debes iniciar sesión para dejar una reseña',
    LOADING_REVIEWS: 'Cargando reseñas...',
    NO_REVIEWS: 'Sin reseñas aún',
    NO_REVIEWS_SUBTITLE: 'Sé el primero en compartir tu experiencia en este restaurante',
  },
  
  // Ordenamiento
  SORT_OPTIONS: [
    { key: 'created_at_desc', label: 'Más recientes', icon: '↓' },
    { key: 'created_at_asc', label: 'Más antiguos', icon: '↑' },
    { key: 'rating_desc', label: 'Mayor rating', icon: '★' },
    { key: 'rating_asc', label: 'Menor rating', icon: '☆' },
  ] as const,
  
  // Validaciones
  VALIDATION: {
    RATING_REQUIRED: 'Selecciona un rating',
    RATING_RANGE: 'Rating debe estar entre 1 y 5',
    COMMENT_TOO_LONG: `Comentario no puede exceder ${500} caracteres`,
  },
} as const;

// Utils para reviews
export class ReviewsUtils {
  
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  static formatRating(rating: number): string {
    return rating.toFixed(1);
  }
  
  static getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4.0) return 'Muy bueno';
    if (rating >= 3.5) return 'Bueno';
    if (rating >= 3.0) return 'Regular';
    if (rating >= 2.0) return 'Malo';
    return 'Muy malo';
  }
  
  static getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4CAF50'; // Verde
    if (rating >= 4.0) return '#8BC34A'; // Verde claro
    if (rating >= 3.5) return '#CDDC39'; // Lima
    if (rating >= 3.0) return '#FFC107'; // Amarillo
    if (rating >= 2.0) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  }
  
  static validateReviewData(data: {
    rating: number;
    foodRating?: number;
    serviceRating?: number;
    ambianceRating?: number;
    comment?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Rating principal requerido
    if (!data.rating || data.rating < REVIEWS_CONFIG.MIN_RATING || data.rating > REVIEWS_CONFIG.MAX_RATING) {
      errors.push(REVIEWS_CONFIG.VALIDATION.RATING_RANGE);
    }
    
    // Validar ratings específicos
    const ratingsToCheck = [
      { value: data.foodRating, name: 'comida' },
      { value: data.serviceRating, name: 'servicio' },
      { value: data.ambianceRating, name: 'ambiente' }
    ];
    
    ratingsToCheck.forEach(({ value, name }) => {
      if (value && (value < REVIEWS_CONFIG.MIN_RATING || value > REVIEWS_CONFIG.MAX_RATING)) {
        errors.push(`Rating de ${name} debe estar entre ${REVIEWS_CONFIG.MIN_RATING} y ${REVIEWS_CONFIG.MAX_RATING}`);
      }
    });
    
    // Validar comentario
    if (data.comment && data.comment.length > REVIEWS_CONFIG.MAX_COMMENT_LENGTH) {
      errors.push(REVIEWS_CONFIG.VALIDATION.COMMENT_TOO_LONG);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static getAverageFromRatings(ratings: number[]): number {
    const validRatings = ratings.filter(r => r > 0);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
  }
  
  static getStarEmoji(filled: boolean, half = false): string {
    if (filled) return '★';
    if (half) return '☆'; // Podrías usar ⭐ para half
    return '☆';
  }
  
  static generateStarsArray(rating: number, maxStars = 5): Array<{ filled: boolean; half: boolean }> {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < maxStars; i++) {
      if (i < fullStars) {
        stars.push({ filled: true, half: false });
      } else if (i === fullStars && hasHalfStar) {
        stars.push({ filled: false, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }
    
    return stars;
  }
  
  static getDistributionPercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }
  
  static sortReviews(
    reviews: any[], 
    sortBy: typeof REVIEWS_CONFIG.SORT_OPTIONS[number]['key']
  ): any[] {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'created_at_desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'created_at_asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rating_desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating_asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }
  
  static getUserInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() || '?';
  }
  
  static truncateComment(comment: string, maxLength = 150): string {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength).trim() + '...';
  }
  
  static getReviewSummary(stats: {
    totalReviews: number;
    averageRating: number;
  }): string {
    if (stats.totalReviews === 0) return 'Sin reseñas';
    if (stats.totalReviews === 1) return '1 reseña';
    return `${stats.totalReviews} reseñas`;
  }
  
  static canUserReview(userId: string | null, existingReview: any): boolean {
    return Boolean(userId && !existingReview);
  }
  
  static shouldShowEditButton(currentUserId: string | null, reviewUserId: string): boolean {
    return currentUserId === reviewUserId;
  }
  
  // Función para debug/testing
  static generateMockReview(restaurantId: string, userId: string): any {
    const ratings = [1, 2, 3, 4, 5];
    const comments = [
      'Excelente comida y servicio',
      'Muy buena experiencia, lo recomiendo',
      'Regular, nada especial',
      'No me gustó para nada',
      'Increíble ambiente y sabores auténticos'
    ];
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    return {
      rating,
      foodRating: rating + (Math.random() > 0.5 ? 1 : -1),
      serviceRating: rating,
      ambianceRating: rating + (Math.random() > 0.5 ? 1 : 0),
      comment: comments[rating - 1]
    };
  }
}

// Tipos helper
export type SortOption = typeof REVIEWS_CONFIG.SORT_OPTIONS[number]['key'];

// Constantes de colores para reviews
export const REVIEW_COLORS = {
  RATING: {
    EXCELLENT: '#4CAF50',
    GOOD: '#8BC34A', 
    AVERAGE: '#FFC107',
    POOR: '#FF9800',
    TERRIBLE: '#F44336'
  },
  STAR: {
    FILLED: '#FFC107',
    EMPTY: '#E0E0E0'
  }
} as const;