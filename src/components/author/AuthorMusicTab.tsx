import React, { useState, useEffect } from 'react';
import {
  Music,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Link,
  Edit2,
  Save,
  X,
  Volume2,
} from 'lucide-react';
import { bgmEngine, AudioTrack, DEFAULT_TRACK_LIST } from '../../utils/audioPlayer';

interface AuthorMusicTabProps {
  onFeedback: (type: 'success' | 'error', text: string) => void;
}

export const AuthorMusicTab: React.FC<AuthorMusicTabProps> = ({ onFeedback }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>(() => bgmEngine.getTracks());
  const [isPlaying, setIsPlaying] = useState<boolean>(() => bgmEngine.getPlaybackState());
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(() => bgmEngine.getCurrentTrack());

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [mood, setMood] = useState('');
  const [duration, setDuration] = useState('03:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [editMood, setEditMood] = useState('');

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe((state) => {
      setTracks(state.tracks);
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.track);
    });
    return unsubscribe;
  }, []);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onFeedback('error', 'Vui lòng nhập tên bài hát / tác phẩm.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bgmEngine.addTrack({
        title: title.trim(),
        artist: artist.trim() || 'Mellifluous Chill',
        audioUrl: audioUrl.trim() || undefined,
        mood: mood.trim() || (audioUrl.trim() ? 'Nhạc phát trực tuyến' : 'Giai điệu thư giãn'),
        duration: duration.trim() || '03:30',
        addedBy: 'Tác giả / BQT',
      });

      onFeedback('success', `Đã thêm bài hát "${title.trim()}" vào playlist thành công!`);
      setTitle('');
      setArtist('');
      setAudioUrl('');
      setMood('');
      setDuration('03:30');
    } catch {
      onFeedback('error', 'Không thể thêm bài hát. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (t: AudioTrack) => {
    setEditingTrackId(t.id);
    setEditTitle(t.title);
    setEditArtist(t.artist);
    setEditAudioUrl(t.audioUrl || '');
    setEditMood(t.mood || '');
  };

  const handleSaveEdit = async (trackId: string) => {
    if (!editTitle.trim()) {
      onFeedback('error', 'Tên bài hát không được để trống.');
      return;
    }

    try {
      await bgmEngine.updateTrack(trackId, {
        title: editTitle.trim(),
        artist: editArtist.trim() || 'Mellifluous',
        audioUrl: editAudioUrl.trim() || undefined,
        mood: editMood.trim() || undefined,
      });
      setEditingTrackId(null);
      onFeedback('success', 'Đã cập nhật thông tin bài hát thành công!');
    } catch {
      onFeedback('error', 'Lỗi khi cập nhật bài hát.');
    }
  };

  const handleRemoveTrack = async (trackId: string, trackTitle: string) => {
    if (tracks.length <= 1) {
      onFeedback('error', 'Playlist cần giữ lại tối thiểu 1 tác phẩm nhạc.');
      return;
    }

    try {
      const ok = await bgmEngine.removeTrack(trackId);
      if (ok) {
        onFeedback('success', `Đã xóa bài hát "${trackTitle}" khỏi playlist.`);
      }
    } catch {
      onFeedback('error', 'Không thể xóa bài hát này.');
    }
  };

  const handleResetTracks = async () => {
    try {
      await bgmEngine.resetToDefaultTracks();
      onFeedback('success', 'Đã khôi phục danh sách nhạc nền mặc định.');
    } catch {
      onFeedback('error', 'Không thể đặt lại danh sách nhạc.');
    }
  };

  const handlePlayTrack = (trackIndex: number) => {
    bgmEngine.play(trackIndex);
  };

  const handleTogglePlay = () => {
    bgmEngine.togglePlay();
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-amber-50 dark:from-stone-800 dark:to-stone-800/80 border border-pink-200/70 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100">
              Quản lý Playlist Nhạc Nền Website
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Gắn link trực tiếp (MP3/WAV/Stream) hoặc tùy biến danh sách phát cho toàn bộ độc giả.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetTracks}
          className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          title="Khôi phục danh sách nhạc gốc của Mellifluous"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại mặc định</span>
        </button>
      </div>

      {/* Add New Track Form */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-850 border border-pink-200/80 dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold text-xs sm:text-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm tác phẩm nhạc mới / Gắn link phát</span>
        </div>

        <form onSubmit={handleAddTrack} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                Tên bài hát / Giai điệu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Gió Thổi Mùa Hạ (夏天的风)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                Nghệ sĩ / Thể loại
              </label>
              <input
                type="text"
                placeholder="VD: Piano Acoustic / Lofi Chill"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-pink-500" />
              <span>Link nhạc phát trực tiếp (Tùy chọn: URL .mp3, .m4a, .wav hoặc link stream)</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/audio/my-song.mp3 (Để trống nếu muốn dùng bộ tổng hợp nhạc êm dịu có sẵn)"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden font-mono"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              * Hỗ trợ mọi link tệp âm thanh trực tiếp (.mp3, .wav, .aac, .m4a, soundcloud raw stream hoặc google drive direct stream).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                Ghi chú cảm xúc / Mood
              </label>
              <input
                type="text"
                placeholder="VD: Giai điệu nhẹ nhàng ngọt ngào đọc truyện mùa hè"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                Thời lượng ước tính
              </label>
              <input
                type="text"
                placeholder="03:45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang thêm...' : 'Thêm vào Playlist'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
            Danh sách bài hát hiện tại ({tracks.length})
          </h4>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Đang phát: <strong className="text-pink-600 dark:text-pink-400 font-serif">{currentTrack?.title}</strong>
          </span>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden bg-white dark:bg-stone-850">
          {tracks.map((t, idx) => {
            const isThisTrackPlaying = isPlaying && currentTrack?.id === t.id;
            const isEditing = editingTrackId === t.id;

            return (
              <div
                key={t.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  currentTrack?.id === t.id
                    ? 'bg-pink-50/60 dark:bg-pink-950/30'
                    : 'hover:bg-stone-50/60 dark:hover:bg-stone-800/50'
                }`}
              >
                {isEditing ? (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Tên bài hát"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs"
                      />
                      <input
                        type="text"
                        value={editArtist}
                        onChange={(e) => setEditArtist(e.target.value)}
                        placeholder="Nghệ sĩ"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        value={editAudioUrl}
                        onChange={(e) => setEditAudioUrl(e.target.value)}
                        placeholder="Link âm thanh (MP3 URL)"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={editMood}
                        onChange={(e) => setEditMood(e.target.value)}
                        placeholder="Mood / Ghi chú"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(t.id)}
                        className="px-3 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Lưu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTrackId(null)}
                        className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentTrack?.id === t.id) {
                            handleTogglePlay();
                          } else {
                            handlePlayTrack(idx);
                          }
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          isThisTrackPlaying
                            ? 'bg-pink-500 text-white shadow-xs animate-pulse'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-pink-100 dark:hover:bg-pink-900'
                        }`}
                        title={isThisTrackPlaying ? 'Tạm dừng' : 'Phát bài này'}
                      >
                        {isThisTrackPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                            {t.title}
                          </h5>
                          {t.audioUrl ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-0.5 shrink-0 font-medium">
                              <Link className="w-2.5 h-2.5" />
                              <span>Link ngoài</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-sans shrink-0 font-medium">
                              Ambient Preset
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                          <span>{t.artist}</span>
                          <span>•</span>
                          <span className="italic">{t.mood || 'Thư giãn'}</span>
                          {t.duration && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{t.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin bài hát"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveTrack(t.id, t.title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Xóa bài hát khỏi playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
