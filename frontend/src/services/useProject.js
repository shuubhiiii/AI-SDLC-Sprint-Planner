import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listProjects, getProject } from './api.js';

/**
 * Hook: load a single project either by `:id` route param or
 * fall back to the most recent one. Used by the result-style pages.
 */
export default function useProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        let p;
        if (id) {
          p = await getProject(id);
        } else {
          const list = await listProjects();
          p = list[0] ? await getProject(list[0].id) : null;
        }
        if (!cancelled) setProject(p);
      } catch (e) {
        if (!cancelled) setError('Could not load project.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { project, loading, error };
}
