import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const DEFAULT_GENRES: string[] = [
  'Tất cả thể loại mùa hè',
  'Ngôn tình',
  'Thanh xuân',
  'Ngọt sủng',
  'Học đường',
  'Hiện đại',
  'Ấm áp',
  'Song hướng thầm mến',
  'Vườn trường đại học',
  'Hài hước',
  'Nhẹ nhàng',
  'Gương vỡ lại lành',
  '1v1',
  'HE',
  'Chữa lành',
  'Cưới trước yêu sau',
  'Đô thị tình duyên',
  'Trọng sinh',
];

const STORAGE_KEY = 'mel_dynamic_genres_v2';
const MIGRATION_KEY = 'mel_has_added_summer_all_genre_v1';
type Listener = (genres: string[]) => void;
const listeners = new Set<Listener>();

let cachedGenres: string[] = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // One-time migration to ensure 'Tất cả thể loại mùa hè' is included initially
        const hasMigrated = localStorage.getItem(MIGRATION_KEY);
        if (!hasMigrated) {
          localStorage.setItem(MIGRATION_KEY, 'true');
          if (!parsed.includes('Tất cả thể loại mùa hè')) {
            parsed.unshift('Tất cả thể loại mùa hè');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    }
  } catch {}
  return [...DEFAULT_GENRES];
})();

function notify() {
  const current = [...cachedGenres];
  listeners.forEach((fn) => fn(current));
}

function saveLocal(genres: string[]) {
  cachedGenres = [...genres];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedGenres));
  } catch {}
  notify();
}

// Initial Firestore sync
if (db) {
  try {
    const settingsDoc = doc(db, 'settings', 'genres');
    onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data?.list) && data.list.length > 0) {
          cachedGenres = data.list;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedGenres));
          } catch {}
          notify();
        }
      }
    }, () => {});
  } catch {}
}

export const getAvailableGenres = (): string[] => {
  return [...cachedGenres];
};

export const getCustomGenres = getAvailableGenres;

export const addGenre = async (newGenre: string): Promise<{ success: boolean; message: string }> => {
  const trimmed = newGenre.trim();
  if (!trimmed) {
    return { success: false, message: 'Vui lòng nhập tên thể loại/chuyên mục!' };
  }
  if (cachedGenres.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, message: 'Thể loại này đã tồn tại trong danh sách!' };
  }

  const updated = [...cachedGenres, trimmed];
  saveLocal(updated);

  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'genres'), { list: updated }, { merge: true });
    } catch {}
  }

  return { success: true, message: `Đã thêm thể loại "${trimmed}" thành công!` };
};

export const deleteGenre = async (genreToDelete: string): Promise<{ success: boolean; message: string }> => {
  const updated = cachedGenres.filter((g) => g.toLowerCase() !== genreToDelete.trim().toLowerCase());
  if (updated.length === cachedGenres.length) {
    return { success: false, message: 'Không tìm thấy thể loại cần xóa!' };
  }

  saveLocal(updated);

  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'genres'), { list: updated }, { merge: true });
    } catch {}
  }

  return { success: true, message: `Đã xóa thể loại "${genreToDelete}"!` };
};

export const resetGenresToDefault = async (): Promise<void> => {
  const reset = [...DEFAULT_GENRES];
  saveLocal(reset);
  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'genres'), { list: reset }, { merge: true });
    } catch {}
  }
};

export const subscribeGenres = (callback: Listener): (() => void) => {
  listeners.add(callback);
  callback([...cachedGenres]);
  return () => {
    listeners.delete(callback);
  };
};

export const subscribeToCustomGenres = subscribeGenres;
