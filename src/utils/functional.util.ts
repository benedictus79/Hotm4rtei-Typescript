export const withRetry = <T>(func: (...args: any[]) => Promise<T>, retries = 5) => {
  return async (...args: any[]): Promise<T | undefined> => {
    try {
      return await func(...args);
    } catch (error) {
      console.log('Error:', (error as Error).message);
      if (retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        return await withRetry(func, retries - 1)(...args);
      } else {
        console.log('Max retries reached. Unable to execute function.');
        throw error;
      }
    }
  };
};