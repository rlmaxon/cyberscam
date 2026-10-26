import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '../../routes.js';
import { loadModules, loadExamples, loadQuiz } from '../../training/content.js';
import { ModuleIcon, MODULE_COLORS } from '../../training/exampleTypes.jsx';
import TrainingLabHome from './TrainingLabHome.jsx';
import TrainingLabCategory from './TrainingLabCategory.jsx';
import TrainingLabDetail from './TrainingLabDetail.jsx';
import TrainingLabQuiz from './TrainingLabQuiz.jsx';

// Each Training Lab view has its own URL:
//   /training                      home
//   /training/quiz                 quiz
//   /training/:categoryKey         browse one category
//   /training/:categoryKey/:id     one example
export default function TrainingLab({ view: forcedView }) {
  const navigate = useNavigate();
  const { categoryKey: selectedCategory = null, exampleId = null } = useParams();
  const view = forcedView || (exampleId ? 'detail' : selectedCategory ? 'category' : 'home');
  const [examples, setExamples] = useState({});
  const [categories, setCategories] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Topics and examples come from public/training-data/modules.json, the same
  // file that drives the lessons, so the library always matches the training.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mods, quiz] = await Promise.all([loadModules(), loadQuiz().catch(() => [])]);
        const sets = await Promise.all(mods.map((m) => loadExamples(m.examplesFile).catch(() => [])));
        if (cancelled) return;
        setCategories(mods.map((m) => ({
          key: m.key,
          label: m.title,
          description: m.summary,
          icon: <ModuleIcon iconKey={m.iconKey} className="w-8 h-8" />,
          color: MODULE_COLORS[m.key] ?? 'from-blue-500 to-blue-600',
        })));
        setExamples(Object.fromEntries(mods.map((m, i) => [m.key, sets[i]])));
        setQuizQuestions(quiz);
      } catch (err) {
        console.error('Failed to load training data:', err);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Kept the same signature the views already use; it now changes the URL.
  const navigateTo = (newView, category = null, example = null) => {
    if (newView === 'quiz') navigate(`${PATHS.training}/quiz`);
    else if (newView === 'category' && category) navigate(`${PATHS.training}/${category}`);
    else if (newView === 'detail' && category && example) navigate(`${PATHS.training}/${category}/${example.id}`);
    else navigate(PATHS.training);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Training Lab...</p>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.key === selectedCategory);
  const selectedExample = exampleId ? (examples[selectedCategory] || []).find(e => e.id === exampleId) : null;

  // Unknown category or example (old or mistyped link): go back to the Training Lab home
  if ((selectedCategory && !category) || (exampleId && !selectedExample)) {
    return <Navigate to={category ? `${PATHS.training}/${category.key}` : PATHS.training} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {view === 'home' && (
          <TrainingLabHome
            categories={categories}
            examples={examples}
            quizQuestions={quizQuestions}
            navigateTo={navigateTo}
          />
        )}
        {view === 'category' && selectedCategory && (
          <TrainingLabCategory
            category={category}
            examples={examples[selectedCategory] || []}
            navigateTo={navigateTo}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
          />
        )}
        {view === 'detail' && selectedExample && (
          <TrainingLabDetail
            example={selectedExample}
            navigateTo={navigateTo}
            categoryKey={selectedCategory}
          />
        )}
        {view === 'quiz' && (
          <TrainingLabQuiz
            categories={categories}
            questions={quizQuestions}
            navigateTo={navigateTo}
          />
        )}
      </div>
    </div>
  );
}
