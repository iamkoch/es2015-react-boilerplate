import Cookie from '../index';

describe('Cookie specifications', () => {
  const cookie = new Cookie();

  describe('#save', () => {
    it('should save a base 64 encoded stringified version of an object', () => {
      const valueToSave = { a: 1, b: 2 };
      const valueToSaveStringifiedAndEncoded = 'eyJhIjoxLCJiIjoyfQ';

      cookie.save('one', valueToSave);

      expect(document.cookie).toContain(valueToSaveStringifiedAndEncoded);
    });
  });

  describe('#get', () => {
    it('should decode the cookie into an object when true is passed', () => {
      document.cookie = 'one=eyJhIjoxLCJiIjoyfQ==; path=/';

      const result = cookie.get('one', true);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });

    it('should return the cookie contents as a string if false or nothing is passed', () => {
      document.cookie = 'one=eyJhIjoxLCJiIjoyfQ==; path=/';

      const result = cookie.get('one', false);

      expect(result).toBe('{"a":1,"b":2}');
    });
  });

  describe('#remove', () => {
    it('should delete the cookie', () => {
      const originalCookieValue = 'one=eyJhIjoxLCJiIjoyfQ==; path=/';

      document.cookie = originalCookieValue;

      cookie.remove('one');
      expect(document.cookie).not.toBe(originalCookieValue);
      expect(document.cookie).toBe('');
    });
  });
});
