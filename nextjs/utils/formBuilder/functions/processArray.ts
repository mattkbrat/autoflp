import formatDate from '@/utils/date/format';

function processArray(input: any): string[] {
  const result: string[] = [];

  if (typeof input === 'string') {
    input = [input];
  } else if (input === null) {
    return [''];
  }

  for (const item of input) {
    if (item instanceof Date) {
      result.push(formatDate(item, 'yyyy-MM-dd'));
    } else if (Array.isArray(item)) {
      result.push(...processArray(item));
    } else {
      switch (typeof item) {
        case 'string':
          if (['null', 'undefined'].includes(item.toLowerCase())) {
            result.push('');
          } else {
            result.push(item.toUpperCase());
          }
          break;
        case 'object':
          result.push(...processArray(item));
          break;
        case 'undefined':
          result.push('');
          break;
        case 'number':
          result.push(item.toString());
          break;
        default:
          result.push('');
      }
    }
  }

  return result;
}

export default processArray;
