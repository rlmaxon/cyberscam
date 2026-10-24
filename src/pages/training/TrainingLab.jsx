import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '../../routes.js';
import { Mail, MessageSquare, Monitor, ShoppingCart } from 'lucide-react';
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
  const [examples, setExamples] = useState({ email: [], text: [], marketplace: [], popup: [] });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const categories = [
    { key: 'email', label: 'Email Scams', icon: <Mail className="w-8 h-8" />, color: 'from-blue-500 to-blue-600', description: 'Phishing emails that try to steal your personal information', file: 'email-scams.json' },
    { key: 'text', label: 'Text Message Scams', icon: <MessageSquare className="w-8 h-8" />, color: 'from-green-500 to-emerald-600', description: 'Smishing attacks that arrive as text messages on your phone', file: 'text-scams.json' },
    { key: 'marketplace', label: 'Marketplace Scams', icon: <ShoppingCart className="w-8 h-8" />, color: 'from-purple-500 to-violet-600', description: 'Fraud on Facebook Marketplace, Craigslist, and online stores', file: 'marketplace-scams.json' },
    { key: 'popup', label: 'Pop-up Scams', icon: <Monitor className="w-8 h-8" />, color: 'from-red-500 to-rose-600', description: 'Fake warnings and alerts that appear in your browser', file: 'popup-scams.json' }
  ];

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const [emailRes, textRes, marketRes, popupRes, quizRes] = await Promise.all([
          fetch('/training-data/email-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/text-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/marketplace-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/popup-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/quiz.json').then(r => r.json()).catch(() => [])
        ]);
        setExamples({ email: emailRes, text: textRes, marketplace: marketRes, popup: popupRes });
        setQuizQuestions(quizRes);
      } catch (err) {
        console.error('Failed to load training data:', err);
      }
      setLoading(false);
    }
    loadContent();
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
            questions={quizQuestions}
            navigateTo={navigateTo}
          />
        )}
      </div>
    </div>
  );
}
