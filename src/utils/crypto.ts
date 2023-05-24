import * as bcrypt from 'bcrypt';

export function hash(text: string): Promise<string> {
  return new Promise((resolve) => {
    bcrypt.hash(text, 10, (err, hash) => {
      resolve(hash);
    });
  });
}

export function compare(text: string, hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    bcrypt.compare(text, hash, (err, result) => {
      resolve(result);
    });
  });
}
