import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import problemService from '@/services/problemService';
import CodeEditor from '@/features/submissions/CodeEditor';
import SubmissionForm from '@/features/submissions/SubmissionForm';
import SubmissionDetail from '@/features/submissions/SubmissionDetail';
import { LANGUAGES } from '@/constants/languages';
import { Badge } from '@/components/ui/badge';
import submissionService from '@/services/submissionService';

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [lastSubmission, setLastSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await problemService.getProblemById(id);
        setProblem(data);
      } catch (err) {
        console.error('Error fetching problem:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await submissionService.getSubmissionsByProblem(id);
        setSubmissions(res);
        const accepted = res.some((s) => s.verdict?.includes('Accepted'));
        setHasAccepted(accepted);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };

    fetchProblem();
    fetchSubmissions();
  }, [id]);

  useEffect(() => {
    const defaultCode =
      LANGUAGES.find((l) => l.id === selectedLanguage)?.defaultCode || '';
    setCode(defaultCode);
  }, [selectedLanguage]);

  const handleLanguageChange = (langId) => setSelectedLanguage(langId);
  const handleCodeChange = (newCode) => setCode(newCode);
  const handleSubmissionResponse = (res) => {
    setLastSubmission(res);
    setSubmissions((prev) => [res, ...prev]);
    if (res.verdict?.toLowerCase().includes('accepted')) setHasAccepted(true);
  };

  if (loading) return <p className="text-center mt-8">Loading problem...</p>;
  if (!problem) return <p className="text-center mt-8 text-red-500">Problem not found.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-6 py-10 px-6 max-w-screen-xl mx-auto">
      {/* Left Column: Problem Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold mb-2">{problem.name}</h1>
          {hasAccepted && (
            <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium border border-green-300">
              Accepted
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <span className="mr-4">
            Author: <span className="text-gray-700 font-medium">{problem.author}</span>
          </span>
          <span>
            Difficulty:{' '}
            <span className="uppercase font-semibold text-green-600">
              {problem.difficulty}
            </span>
          </span>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Problem Statement</h2>
          <p>{problem.statement}</p>
          {problem.explanation && (
            <>
              <h2>Explanation</h2>
              <p>{problem.explanation}</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag, idx) => (
            <Badge key={idx} className="bg-blue-100 text-blue-800">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div>
            <strong>Time Limit:</strong> {problem.time} sec
          </div>
          <div>
            <strong>Memory Limit:</strong> {problem.memory} MB
          </div>
        </div>

        {/* Sample Testcases */}
        {problem.sampleTestcases.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">Sample Testcases</h2>
            {problem.sampleTestcases.map((tc, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded mb-2">
                <p className="text-sm font-medium">Input:</p>
                <pre className="bg-white p-2 rounded">{tc.input}</pre>
                <p className="text-sm font-medium mt-2">Output:</p>
                <pre className="bg-white p-2 rounded">{tc.output}</pre>
              </div>
            ))}
          </div>
        )}

        {/* System Testcases */}
        {Array.isArray(problem.systemTestcases) && problem.systemTestcases.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:underline">
              System Testcases (hidden in real contests)
            </summary>
            <div className="mt-2 space-y-2">
              {problem.systemTestcases.map((tc, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Input:</p>
                  <pre className="bg-white p-2 rounded">{tc.input}</pre>
                  <p className="text-sm font-medium mt-2">Output:</p>
                  <pre className="bg-white p-2 rounded">{tc.output}</pre>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Right Column: Editor + Submit + Submission History */}
      <div className="space-y-6">
        {/* Language Selector */}
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-3 py-1 border rounded transition ${
                selectedLanguage === lang.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Editor — allows horizontal scrolling now */}
        <div className="h-[400px] overflow-x-auto">
          <CodeEditor
            language={LANGUAGES.find((l) => l.id === selectedLanguage)?.editorLanguage || 'cpp'}
            value={code}
            onChange={handleCodeChange}
          />
        </div>

        {/* Submit Button */}
        <SubmissionForm
          problemId={problem.id}
          code={code}
          language={selectedLanguage}
          onSubmit={handleSubmissionResponse}
        />

        {/* Last Submission Result */}
        {lastSubmission && <SubmissionDetail submission={lastSubmission} />}

        {/* All Submissions */}
        {submissions.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowSubmissions((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showSubmissions ? 'Hide' : 'Show'} All Submissions ({submissions.length})
            </button>

            {showSubmissions && (
              <div className="mt-2 space-y-2">
                {submissions.map((s) => (
                  <Link
                    key={s.id}
                    to={`/submissions/${s.id}`}
                    className="block p-3 bg-gray-50 rounded border text-sm hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div>
                          <strong>Verdict:</strong>{' '}
                          <span
                            className={`font-semibold ${
                              s.verdict === 'Accepted'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {s.verdict}
                          </span>
                        </div>
                        <div>
                          <strong>Language:</strong> {s.language}
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs text-right">
                        {new Date(s.date || s.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetailPage;
