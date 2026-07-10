import { useCallback, useEffect, useState } from 'react';
import { fetchProfile, saveProfile, uploadAvatar, type ProfileData, type UpdatableProfileFields } from '../api/profile';

interface UseProfileResult {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  refetch: () => void;
  save: (fields: UpdatableProfileFields) => Promise<boolean>;
  changeAvatar: (file: File) => Promise<boolean>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProfile();
        if (!cancelled) setProfile(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const save = useCallback(async (fields: UpdatableProfileFields) => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await saveProfile(fields);
      setProfile(updated);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const changeAvatar = useCallback(async (file: File) => {
    setSaving(true);
    setSaveError(null);
    try {
      const avatarUrl = await uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, saveError, refetch, save, changeAvatar };
}