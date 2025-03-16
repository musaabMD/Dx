"use client"
"use client"
import React, { useState } from 'react';
import { Search, Brain, Filter, Eye, Book, Check, X, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuestionBank = () => {
  const questions = [
    {
      id: 1,
      question: "A 65-year-old patient presents with orthopnea and peripheral edema. What is the most likely diagnosis?",
      choices: [
        "Heart Failure",
        "Pneumonia",
        "Pulmonary Embolism",
        "Chronic Bronchitis"
      ],
      correctAnswer: 0,
      explanation: "The combination of orthopnea and peripheral edema strongly suggests heart failure. These are classic symptoms of left and right heart failure respectively.",
      subject: "Medicine",
      topic: "Heart Failure",
      repeatedIn: ["Aug 2024", "Sep 2024", "Oct 2024"],
      predictionScore: 85
    },
    {
      id: 2,
      question: "Which of the following is NOT a typical finding in acute cholecystitis?",
      choices: [
        "Murphy's sign",
        "Right upper quadrant pain",
        "Left lower quadrant tenderness",
        "Fever"
      ],
      correctAnswer: 2,
      explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
      subject: "Surgery",
      topic: "Gallbladder",
      repeatedIn: ["Aug 2024", "Oct 2024"],
      predictionScore: 65
    },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      },  {
        id: 2,
        question: "Which of the following is NOT a typical finding in acute cholecystitis?",
        choices: [
          "Murphy's sign",
          "Right upper quadrant pain",
          "Left lower quadrant tenderness",
          "Fever"
        ],
        correctAnswer: 2,
        explanation: "Left lower quadrant tenderness is not associated with acute cholecystitis. The condition typically presents with right upper quadrant pain, Murphy's sign, and fever.",
        subject: "Surgery",
        topic: "Gallbladder",
        repeatedIn: ["Aug 2024", "Oct 2024"],
        predictionScore: 65
      }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedRepetition, setSelectedRepetition] = useState("");
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [showAllExplanations, setShowAllExplanations] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isPremium] = useState(false); // Add state for premium status

  const subjects = [...new Set(questions.map(q => q.subject))];
  const topics = [...new Set(questions.map(q => q.topic))];
  
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const repetitionRanges = [
    { label: "Once", value: 1 },
    { label: "Twice", value: 2 },
    { label: "Three times", value: 3 },
    { label: "Four+ times", value: 4 }
  ];

  const handleAnswerClick = (questionId, choiceIndex) => {
    if (!userAnswers[questionId]) {
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: choiceIndex
      }));
    }
  };

  const checkConsecutiveMonths = (dates) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedDates = dates.sort((a, b) => {
      const [aMonth] = a.split(' ');
      const [bMonth] = b.split(' ');
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });

    let consecutiveCount = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const [prevMonth] = sortedDates[i-1].split(' ');
      const [currMonth] = sortedDates[i].split(' ');
      if (months.indexOf(currMonth) - months.indexOf(prevMonth) === 1) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
    }
    
    return {
      isConsecutive: consecutiveCount >= 3,
      text: consecutiveCount >= 3 ? `🔥 ${consecutiveCount} months streak!` : `${dates.length} times`
    };
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || question.subject === selectedSubject;
    const matchesTopic = !selectedTopic || question.topic === selectedTopic;
    const matchesRepetition = !selectedRepetition || question.repeatedIn.length === selectedRepetition;
    return matchesSearch && matchesSubject && matchesTopic && matchesRepetition;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const aConsecutive = checkConsecutiveMonths(a.repeatedIn).isConsecutive;
    const bConsecutive = checkConsecutiveMonths(b.repeatedIn).isConsecutive;
    if (aConsecutive && !bConsecutive) return -1;
    if (!aConsecutive && bConsecutive) return 1;
    return b.predictionScore - a.predictionScore;
  });

  return (
    <div className="min-h-screen w-full bg-[#FBFAF8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 bg-white border-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              SMLE Predicted Questions
            </CardTitle>
            <p className="text-lg text-gray-600 mt-2">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10 h-12 text-lg rounded-full border-gray-200 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline"
                className="h-12 px-6 rounded-full border-gray-200 hover:border-gray-300 bg-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {(selectedSubject || selectedTopic || selectedRepetition) && '•'}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 p-6 bg-white rounded-xl border border-gray-200">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Filter sections remain the same */}
                  {/* ... existing filter code ... */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {sortedQuestions.slice(0, isPremium ? sortedQuestions.length : 5).map((question, index) => {
            const repetitionInfo = checkConsecutiveMonths(question.repeatedIn);
            const userAnswer = userAnswers[question.id];
            const hasAnswered = userAnswer !== undefined;
            
            return (
              <Card key={question.id} className="w-full hover:shadow-lg transition-shadow duration-200 bg-white border-gray-100">
                <CardContent className="p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                      {question.subject}
                    </Badge>
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
                      {question.topic}
                    </Badge>
                    <Badge className={`${
                      repetitionInfo.isConsecutive 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    } text-white`}>
                      {repetitionInfo.text}
                    </Badge>
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      {question.predictionScore}% Dec 2024
                    </Badge>
                  </div>
                  
                  <div className="text-lg mb-6 font-medium">
                    {`${index + 1}. ${question.question}`}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {question.choices.map((choice, choiceIndex) => {
                      let choiceStyle = 'border border-gray-200 hover:bg-gray-50';
                      let icon = null;
                      
                      if (hasAnswered) {
                        if (choiceIndex === question.correctAnswer) {
                          choiceStyle = 'bg-green-100 border-green-500 text-green-900';
                          icon = <Check className="h-4 w-4 text-green-600" />;
                        } else if (choiceIndex === userAnswer) {
                          choiceStyle = 'bg-red-100 border-red-500 text-red-900';
                          icon = <X className="h-4 w-4 text-red-600" />;
                        }
                      }

                      return (
                        <div
                          key={choiceIndex}
                          className={`p-4 rounded-lg transition-colors duration-200 cursor-pointer ${choiceStyle}`}
                          onClick={() => handleAnswerClick(question.id, choiceIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{`${String.fromCharCode(65 + choiceIndex)}. ${choice}`}</span>
                            {icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(hasAnswered || showAllExplanations) && (
                    <div className="p-4 bg-gray-50 rounded-lg mt-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
                      <p className="text-gray-700">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {!isPremium && sortedQuestions.length > 5 && (
            <Card className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-8 text-center">
                <Lock className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Unlock All Questions</h3>
                <p className="text-lg mb-6">
                  Get access to {sortedQuestions.length - 5} more predicted questions and enhance your SMLE preparation
                </p>
                <Button 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;