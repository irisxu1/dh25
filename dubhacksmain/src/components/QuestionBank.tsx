import React from 'react';

const QuestionBank: React.FC = () => {
  const questionCategories = {
    'Behavioral': [
      "Tell me about a time when you had to work under pressure.",
      "Describe a situation where you had to resolve a conflict with a team member.",
      "Give me an example of a goal you reached and how you achieved it.",
      "Tell me about a time you failed and what you learned from it.",
      "Describe a situation where you had to adapt to a significant change."
    ],
    'Technical': [
      "Explain a complex technical concept to a non-technical person.",
      "How do you stay updated with the latest technology trends?",
      "Describe your experience with version control systems.",
      "What's your approach to debugging a difficult problem?",
      "How do you ensure code quality in your projects?"
    ],
    'Situational': [
      "How would you handle a situation where you disagree with your manager?",
      "What would you do if you were assigned a project you know nothing about?",
      "How do you prioritize tasks when everything seems urgent?",
      "Describe how you would handle a difficult client or customer.",
      "What would you do if you made a mistake that affected the team?"
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Interview Question Bank</h2>
      
      <div className="space-y-6">
        {Object.entries(questionCategories).map(([category, questions]) => (
          <div key={category} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">{category}</h3>
            <ul className="space-y-2">
              {questions.map((question, index) => (
                <li key={index} className="text-gray-700 text-sm">
                  {question}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Tips for Success:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
          <li>• Be specific and provide concrete examples</li>
          <li>• Practice your answers out loud</li>
          <li>• Prepare questions to ask the interviewer</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionBank;
