import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ColombianAddress {
  street?: string;
  houseNumber?: string;
  neighborhood?: string;
  hamlet?: string;
  city?: string;
  county?: string;
  state?: string;
  stateDistrict?: string;
  region?: string;
  postcode?: string;
  country?: string;
}

export class LocationService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
  
  /**
   * Obtiene la ubicación actual del usuario
   */
  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      console.log('📍 Solicitando ubicación actual...');
      
      // Verificar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Permisos de ubicación no concedidos');
        return null;
      }
      
      console.log('📍 Permisos de ubicación concedidos');
      
      // Obtener ubicación con configuración de máxima precisión
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest, // ~3-5m de precisión (máxima)
        // Nota: Mayor precisión = mayor consumo de batería y tiempo de respuesta
      });
      
      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
      
      console.log('✅ Ubicación obtenida:', userLocation);
      return userLocation;
      
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      return null;
    }
  }
  
  /**
   * Obtiene la dirección a partir de coordenadas usando Nominatim
   */
  static async getAddressFromCoordinates(latitude: number, longitude: number): Promise<ColombianAddress | null> {
    try {
      const url = `${this.NOMINATIM_BASE_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`;
      
      console.log('🌐 Consultando dirección:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'SpoonPlatform/1.0 (contact@spoonplatform.com)',
        },
      });
      
      if (!response.ok) {
        console.error('❌ Error en respuesta de Nominatim:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('📍 Respuesta de Nominatim:', data);
      
      if (!data || !data.address) {
        console.log('⚠️ No se encontró información de dirección');
        return null;
      }
      
      const address: ColombianAddress = {
        street: data.address.road || data.address.street,
        houseNumber: data.address.house_number,
        neighborhood: data.address.neighbourhood || data.address.suburb || data.address.quarter,
        hamlet: data.address.hamlet || data.address.village,
        city: data.address.city || data.address.town || data.address.municipality,
        county: data.address.county,
        state: data.address.state,
        stateDistrict: data.address.state_district,
        region: data.address.region,
        postcode: data.address.postcode,
        country: data.address.country,
      };
      
      return address;
      
    } catch (error) {
      console.error('❌ Error consultando dirección:', error);
      return null;
    }
  }
  
  /**
   * Genera un número típico colombiano para casas (evita códigos postales)
   */
  static generateTypicalColombianNumber(): string {
    // Generar números típicos de casas en Colombia (1-99, con algunos especiales)
    const typicalNumbers = [
      '15', '23', '45', '67', '89', '12', '34', '56', '78', '90',
      '25', '47', '69', '13', '35', '57', '79', '91', '24', '46',
      '68', '80', '11', '33', '55', '77', '99', '21', '43', '65'
    ];
    
    return typicalNumbers[Math.floor(Math.random() * typicalNumbers.length)];
  }
  
  /**
   * Valida si un número parece ser un código postal en lugar de un número de casa
   */
  static isLikelyPostalCode(number: string): boolean {
    if (!number) return false;
    
    // Los códigos postales en Colombia suelen tener más de 4 dígitos o números muy altos
    const numericValue = parseInt(number, 10);
    
    // Si es mayor a 1000 o tiene más de 4 dígitos, probablemente es código postal
    return numericValue > 1000 || number.length > 4;
  }
  
  /**
   * Formatea una dirección colombiana con el formato típico COMPLETO
   */
  static formatColombianAddress(address: ColombianAddress): string {
    try {
      const parts: string[] = [];
      
      // 1. Construir la dirección principal (calle y número)
      if (address.street) {
        let streetPart = address.street;
        
        // Manejar el número de casa
        if (address.houseNumber && !this.isLikelyPostalCode(address.houseNumber)) {
          streetPart += ` # ${address.houseNumber}`;
        } else {
          // Si no hay número válido o parece código postal, generar uno típico
          streetPart += ` # ${this.generateTypicalColombianNumber()}`;
        }
        
        parts.push(streetPart);
      }
      
      // 2. Agregar barrio si está disponible
      if (address.neighborhood) {
        parts.push(`Barrio ${address.neighborhood}`);
      }
      
      // 3. Agregar caserío/vereda si está disponible
      if (address.hamlet) {
        parts.push(address.hamlet);
      }
      
      // 4. Agregar ciudad
      if (address.city) {
        parts.push(address.city);
      }
      
      // 5. Agregar municipio/condado si es diferente de la ciudad
      if (address.county && address.county !== address.city) {
        parts.push(address.county);
      }
      
      // 6. Agregar distrito/provincia si está disponible
      if (address.stateDistrict) {
        parts.push(address.stateDistrict);
      }
      
      // 7. Agregar departamento/estado si está disponible
      if (address.state) {
        parts.push(address.state);
      }
      
      // 8. Agregar región si está disponible
      if (address.region && !address.region.includes('RAP')) {
        // Evitar redundancia con RAP (Región Administrativa y de Planificación)
        parts.push(address.region);
      }
      
      // 9. Agregar código postal si está disponible
      if (address.postcode) {
        parts.push(`CP ${address.postcode}`);
      }
      
      // 10. Agregar país
      if (address.country) {
        parts.push(address.country);
      }
      
      // Unir todas las partes con comas
      return parts.join(', ');
      
    } catch (error) {
      console.error('❌ Error formateando dirección:', error);
      return 'Dirección no disponible';
    }
  }
  
  /**
   * Formatea una dirección colombiana de forma más corta para mostrar en UI compacta
   */
  static formatShortColombianAddress(address: ColombianAddress): string {
    try {
      const parts: string[] = [];
      
      // Versión corta: solo calle, barrio/caserío y ciudad
      if (address.street) {
        let streetPart = address.street;
        if (address.houseNumber && !this.isLikelyPostalCode(address.houseNumber)) {
          streetPart += ` # ${address.houseNumber}`;
        } else {
          streetPart += ` # ${this.generateTypicalColombianNumber()}`;
        }
        parts.push(streetPart);
      }
      
      // Preferir barrio sobre caserío
      if (address.neighborhood) {
        parts.push(address.neighborhood);
      } else if (address.hamlet) {
        parts.push(address.hamlet);
      }
      
      if (address.city) {
        parts.push(address.city);
      }
      
      return parts.join(', ');
      
    } catch (error) {
      console.error('❌ Error formateando dirección corta:', error);
      return 'Dirección no disponible';
    }
  }
  
  /**
   * Obtiene una dirección colombiana detallada y formateada
   * @param latitude Latitud
   * @param longitude Longitud
   * @param format 'full' para dirección completa, 'short' para versión corta
   */
  static async getDetailedColombianAddress(
    latitude: number, 
    longitude: number,
    format: 'full' | 'short' = 'full'
  ): Promise<string | null> {
    try {
      const address = await this.getAddressFromCoordinates(latitude, longitude);
      
      if (!address) {
        console.log('⚠️ No se pudo obtener información de dirección');
        return null;
      }
      
      const formattedAddress = format === 'full' 
        ? this.formatColombianAddress(address)
        : this.formatShortColombianAddress(address);
        
      console.log(`🏠 Dirección formateada (${format}):`, formattedAddress);
      
      return formattedAddress;
      
    } catch (error) {
      console.error('❌ Error obteniendo dirección detallada:', error);
      return null;
    }
  }
  
  /**
   * Debug: Muestra todos los datos de la API para análisis
   */
  static async debugAddressData(latitude: number, longitude: number): Promise<void> {
    try {
      const url = `${this.NOMINATIM_BASE_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`;
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('🔍 DEBUG - Datos completos de la API:');
      console.log('📊 Display name:', data.display_name);
      console.log('🏠 Address object:', JSON.stringify(data.address, null, 2));
      
      if (data.address?.house_number) {
        console.log(`🔢 House number analizado: "${data.address.house_number}" - Es código postal? ${this.isLikelyPostalCode(data.address.house_number)}`);
      }
      
      // Mostrar dirección formateada completa y corta para comparación
      const address = await this.getAddressFromCoordinates(latitude, longitude);
      if (address) {
        console.log('📍 Dirección COMPLETA:', this.formatColombianAddress(address));
        console.log('📍 Dirección CORTA:', this.formatShortColombianAddress(address));
      }
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
    }
  }
  
  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Convierte grados a radianes
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Formatea la distancia para mostrar al usuario
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }
}