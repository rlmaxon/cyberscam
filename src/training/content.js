import { useEffect, useState } from 'react';

// Training content lives in public/training-data/*.json so it can be edited without
// touching code. Each file is fetched once and cached for the rest of the visit.
const cache = new Map();

function load(file) {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(`/training-data/${file}`).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${file}`);
        return r.json();
      }).catch((err) => {
        cache.delete(file); // allow a retry on the next visit
        throw err;
      }),
    );
  }
  return cache.get(file);
}

export const loadModules = () => load('modules.json');
export const loadExamples = (file) => load(file);
export const loadQuiz = () => load('quiz.json');
export const loadFinalExam = () => load('final-exam.json');
export const loadFamilyPlan = () => load('family-plan.json');
export const loadScamOfTheWeek = () => load('scam-of-the-week.json');

// Loads modules plus anything else a page needs, with simple loading/error state.
export function useTrainingData(extra = {}) {
  const [state, setState] = useState({ loading: true, error: null, modules: [], quiz: [], finalExam: [], examples: {} });
  const key = JSON.stringify(extra);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const modules = await loadModules();
        const [quiz, finalExam, exampleSets] = await Promise.all([
          extra.quiz ? loadQuiz() : [],
          extra.finalExam ? loadFinalExam() : [],
          Promise.all(
            (extra.examplesFor === 'all' ? modules : modules.filter((m) => m.key === extra.examplesFor))
              .filter((m) => m.examplesFile)
              .map((m) => loadExamples(m.examplesFile).then((list) => [m.key, list]).catch(() => [m.key, []])),
          ),
        ]);
        if (!cancelled) setState({ loading: false, error: null, modules, quiz, finalExam, examples: Object.fromEntries(exampleSets) });
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  return state;
}
