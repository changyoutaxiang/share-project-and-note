// Helper functions for converting between camelCase (app) and snake_case (database)

export function toSnakeCase(obj: any): any {
  if (!obj) return obj;

  const converted: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = obj[key];
    }
  }

  return converted;
}

export function toCamelCase(obj: any): any {
  if (!obj) return obj;

  const converted: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      converted[camelKey] = obj[key];
    }
  }

  return converted;
}

export function arrayToCamelCase(arr: any[]): any[] {
  return arr.map(item => toCamelCase(item));
}

export function arrayToSnakeCase(arr: any[]): any[] {
  return arr.map(item => toSnakeCase(item));
}